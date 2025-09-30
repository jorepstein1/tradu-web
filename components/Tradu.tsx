"use client";
import { useActionState, useState } from "react";
import { SearchSection } from "@/components/HeaderAndSearchSpace";
import { ResultsSpace } from "@/components/ResultsSpace";
import { Translation } from "@/components/TranslationCard";
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
        return translationResults;
      }
    },
    []
  ); // The Action to perform the Search
  return (
    <div className="max-w-7xl mx-auto space-y-6 h-screen max-h-screen">
      <div>
        <SearchSection
          searchAction={searchAction}
          loading={searchIsPending}
          translationDirection={translationDirection}
          setTranslationDirection={setTranslationDirection}
        />
      </div>
      <div>
        <ResultsSpace translations={translationResponse} />
      </div>
    </div>
  );
};
