"use client";
import { useActionState, useState } from "react";
import { SearchSection } from "@/components/HeaderAndSearchSpace";
import { ResultsSpace } from "@/components/ResultsSpace";
import { Translation } from "@/components/TranslationCard";
import { UniqueIdentifier } from "@dnd-kit/core";
import Cookies from "js-cookie";
import { SettingsModalDialog } from "./SettingsModalDialog";
const TRANSLATE_URL = "http://localhost:3000/api/translate";

const getTranslations = async (
  direction: string,
  word: string
): Promise<Translation[]> => {
  const body = new URLSearchParams({ direction, word });
  console.log("Body:", body.toString());
  const url = `${TRANSLATE_URL}?${body.toString()}`;
  return fetch(url)
    .then((response) => response.json())
    .then((json) => json.translations);
};

export const Tradu = () => {
  const savedMochiApiKey = Cookies.get("mochi-api-key") || "";
  const savedMochiDeckId = Cookies.get("mochi-deck-id") || "";
  const savedMochiTemplateId = Cookies.get("mochi-template-id") || "";
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedTranslationIds, setSelectedTranslationIds] = useState<
    Set<UniqueIdentifier>
  >(() => new Set());
  const [translationDirection, setTranslationDirection] = useState("esen");
  const [translationResponse, searchAction, searchIsPending] = useActionState(
    async (_previousState: Translation[], formData: FormData) => {
      const term = formData.get("term");
      if (typeof term !== "string") {
        return [];
      } else {
        const translationResults = await getTranslations(
          translationDirection,
          term
        );
        setSelectedTranslationIds(new Set());
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
    Cookies.set("mochi-api-key", newMochiApiKey);
    Cookies.set("mochi-deck-id", newMochiDeckId);
    Cookies.set("mochi-template-id", newMochiTemplateId);
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
          translations={translationResponse}
          selectedTranslationIds={selectedTranslationIds}
          setSelectedTranslationIds={setSelectedTranslationIds}
        />
      </div>
      <SettingsModalDialog
        isOpen={settingsOpen}
        onClose={() => {
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
