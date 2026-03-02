"use client";
import { useActionState, useState } from "react";
import { SearchSection } from "@/components/HeaderAndSearchSpace";
import { ResultsSpace } from "@/components/ResultsSpace";
import { UniqueIdentifier } from "@dnd-kit/core";
import Cookies from "js-cookie";
import { SettingsModalDialog } from "./SettingsModalDialog";
import {
  Translation,
  getTranslations,
  uploadSelectedTranslations,
} from "@/services/mochiApi";

const useCookie = (
  cookieName: string
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
  const [savedMochiApiKey, setSavedMochiApiKey] = useCookie("mochi-api-key");
  const [savedMochiDeckId, setSavedMochiDeckId] = useCookie("mochi-deck-id");
  const [savedMochiTemplateId, setSavedMochiTemplateId] =
    useCookie("mochi-template-id");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTranslationIds, setSelectedTranslationIds] = useState<
    Set<UniqueIdentifier>
  >(() => new Set());
  const [modifiedTranslations, setModifiedTranslations] = useState<
    Translation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [translationDirection, setTranslationDirection] = useState("esen");
  const [translationResponse, searchAction, searchIsPending] = useActionState(
    async (_previousState: Translation[], formData: FormData) => {
      const term = formData.get("term");
      if (typeof term !== "string") {
        return [];
      } else {
        setSearchTerm(term);
        const translationResults = await getTranslations(
          translationDirection,
          term
        );
        setSelectedTranslationIds(new Set());
        setModifiedTranslations(translationResults);
        return translationResults;
      }
    },
    []
  ); // The Action to perform the Search
  const onSaveSettings = (
    newMochiApiKey: string,
    newMochiDeckId: string,
    newMochiTemplateId: string
  ) => {
    setSavedMochiApiKey(newMochiApiKey);
    setSavedMochiDeckId(newMochiDeckId);
    setSavedMochiTemplateId(newMochiTemplateId);
    setSettingsOpen(false);
  };
  return (
    <div className="max-w-7xl mx-auto space-y-6 h-screen max-h-screen">
      <div>
        <SearchSection
          searchAction={searchAction}
          loading={searchIsPending}
          translationDirection={translationDirection}
          setTranslationDirection={setTranslationDirection}
          openSettings={() => {
            setSettingsOpen(true);
          }}
        />
      </div>
      <div>
        <ResultsSpace
          searchTerm={searchTerm}
          translations={translationResponse}
          modifiedTranslations={modifiedTranslations}
          setModifiedTranslations={setModifiedTranslations}
          selectedTranslationIds={selectedTranslationIds}
          setSelectedTranslationIds={setSelectedTranslationIds}
          uploadSelectedTranslations={(selectedTranslationsToUpload) =>
            uploadSelectedTranslations(
              savedMochiApiKey,
              selectedTranslationsToUpload
            ).then(() => {
              // Reset modified translations back to originals for uploaded cards
              const uploadedIds = new Set(
                selectedTranslationsToUpload.map((t) => t.translation_id)
              );
              setModifiedTranslations(
                modifiedTranslations.map((t) =>
                  uploadedIds.has(t.translation_id)
                    ? (translationResponse.find(
                        (orig) => orig.translation_id === t.translation_id
                      ) ?? t)
                    : t
                )
              );
              setSelectedTranslationIds(new Set());
            })
          }
        />
      </div>
      <SettingsModalDialog
        isOpen={settingsOpen}
        setDialogClosed={() => {
          setSettingsOpen(false);
        }}
        savedMochiApiKey={savedMochiApiKey}
        savedMochiDeckId={savedMochiDeckId}
        savedMochiTemplateId={savedMochiTemplateId}
        onSaveSettings={onSaveSettings}
      />
    </div>
  );
};
