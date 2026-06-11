"use client";
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from "react";
import { authClient } from "@/lib/auth/client";
import { toast } from "sonner";
import { SearchSection } from "@/components/HeaderAndSearchSpace";
import { ResultsSpace } from "@/components/ResultsSpace";
import { UniqueIdentifier } from "@dnd-kit/core";
import Cookies from "js-cookie";
import { SettingsModalDialog } from "./SettingsModalDialog";
import {
  Translation,
  RateLimitError,
  getTranslations,
  uploadSelectedTranslations,
} from "@/services/mochiApi";
import {
  getMochiSettings,
  getSearchHistory,
  recordSearch,
  SearchHistoryEntry,
} from "@/services/userApi";

const useCookie = (
  cookieName: string,
): [string, (newValue: string) => void] => {
  // Currently setting cookie to an empty string is a no-op
  const [cookieValue, setCookie] = useState(Cookies.get(cookieName) || "");
  return [
    cookieValue,
    (newValue: string) => {
      setCookie(newValue);
      Cookies.set(cookieName, newValue, { expires: 365 });
    },
  ];
};

export const Tradu = () => {
  const { data: session } = authClient.useSession();
  const isSignedIn = !!session?.user;
  const [savedMochiApiKey, setSavedMochiApiKey] = useState("");
  const [savedMochiDeckId, setSavedMochiDeckId] = useCookie("mochi-deck-id");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTranslationIds, setSelectedTranslationIds] = useState<
    Set<UniqueIdentifier>
  >(() => new Set());
  const [modifiedTranslations, setModifiedTranslations] = useState<
    Translation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [translationDirection, setTranslationDirection] = useState("esen");
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([]);

  const refreshHistory = useCallback(() => {
    if (!isSignedIn) {
      setSearchHistory([]);
      return;
    }
    getSearchHistory()
      .then(setSearchHistory)
      .catch(() => {
        // Best-effort; leave the existing list in place on failure.
      });
  }, [isSignedIn]);

  // When the user signs in, hydrate persisted Mochi credentials and load
  // their recent search history. Anonymous users keep the cookie/state-only
  // behaviour.
  useEffect(() => {
    if (!isSignedIn) return;
    getMochiSettings()
      .then((settings) => {
        if (!settings) return;
        if (settings.mochiApiKey) setSavedMochiApiKey(settings.mochiApiKey);
        if (settings.mochiDeckId) setSavedMochiDeckId(settings.mochiDeckId);
      })
      .catch(() => {
        // Non-fatal: user can still enter credentials manually.
      });
    refreshHistory();
  }, [isSignedIn, refreshHistory]);
  const [, uploadAction, uploadIsPending] = useActionState(
    async (_: undefined, selectedTranslationsToUpload: Translation[]) => {
      try {
        await uploadSelectedTranslations(
          savedMochiApiKey,
          savedMochiDeckId,
          selectedTranslationsToUpload,
        );
        const uploadedIds = new Set(
          selectedTranslationsToUpload.map((t) => t.translation_id),
        );
        setModifiedTranslations(
          modifiedTranslations.map((t) =>
            uploadedIds.has(t.translation_id)
              ? (translationResponse.find(
                  (orig) => orig.translation_id === t.translation_id,
                ) ?? t)
              : t,
          ),
        );
        setSelectedTranslationIds(new Set());
        toast.success(
          `${selectedTranslationsToUpload.length} card(s) uploaded successfully`,
        );
      } catch (err) {
        if (err instanceof RateLimitError) {
          toast.warning("Too fast! Slow down!");
        } else {
          toast.error("Upload failed", {
            description: err instanceof Error ? err.message : undefined,
          });
        }
      }
      return undefined;
    },
    undefined,
  );
  const [translationResponse, searchAction, searchIsPending] = useActionState(
    async (_previousState: Translation[], formData: FormData) => {
      const term = formData.get("term");
      // Direction is submitted with the form so programmatic searches (e.g.
      // re-running a history entry) use the right direction without relying
      // on the latest render's `translationDirection` closure.
      const formDirection = formData.get("direction");
      const direction =
        typeof formDirection === "string" ? formDirection : translationDirection;
      if (typeof term !== "string") {
        return [];
      } else {
        setSearchTerm(term);
        let translationResults: Translation[];
        try {
          translationResults = await getTranslations(direction, term);
        } catch (err) {
          if (err instanceof RateLimitError) {
            toast.warning("Too fast! Slow down!");
          } else {
            toast.error("Search failed", {
              description: err instanceof Error ? err.message : undefined,
            });
          }
          return _previousState;
        }
        setSelectedTranslationIds(new Set());
        setModifiedTranslations(translationResults);
        if (isSignedIn) {
          recordSearch(term, direction).then(refreshHistory);
        }
        return translationResults;
      }
    },
    [],
  ); // The Action to perform the Search
  const onSaveSettings = (newMochiApiKey: string, newMochiDeckId: string) => {
    setSavedMochiApiKey(newMochiApiKey);
    setSavedMochiDeckId(newMochiDeckId);
    setSettingsOpen(false);
  };
  const onSelectHistory = (word: string, direction: string) => {
    setTranslationDirection(direction);
    const formData = new FormData();
    formData.set("term", word);
    formData.set("direction", direction);
    // searchAction is a useActionState dispatch; must run inside a transition
    // when invoked directly (rather than via a form action prop).
    startTransition(() => searchAction(formData));
  };
  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col gap-4 flex-1 min-h-0">
      <div className="shrink-0">
        <SearchSection
          searchAction={searchAction}
          loading={searchIsPending}
          translationDirection={translationDirection}
          setTranslationDirection={setTranslationDirection}
          user={session?.user ?? null}
          searchHistory={searchHistory}
          onSelectHistory={onSelectHistory}
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ResultsSpace
          searchTerm={searchTerm}
          translations={translationResponse}
          modifiedTranslations={modifiedTranslations}
          setModifiedTranslations={setModifiedTranslations}
          selectedTranslationIds={selectedTranslationIds}
          setSelectedTranslationIds={setSelectedTranslationIds}
          openSettings={() => setSettingsOpen(true)}
          configIsComplete={!!savedMochiDeckId && !!savedMochiApiKey}
          uploadAction={uploadAction}
          uploadIsPending={uploadIsPending}
        />
      </div>
      <SettingsModalDialog
        isOpen={settingsOpen}
        setDialogClosed={() => {
          setSettingsOpen(false);
        }}
        savedMochiApiKey={savedMochiApiKey}
        savedMochiDeckId={savedMochiDeckId}
        onSaveSettings={onSaveSettings}
      />
    </div>
  );
};
