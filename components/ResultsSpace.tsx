"use client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { CardDropZone } from "./CardDropZone";
import { Translation, TranslationCard } from "./TranslationCard";
import { useState } from "react";

export const ResultsSpace = ({
  translations,
}: {
  translations: Translation[];
}) => {
  const [toMake, setToMake] = useState<Set<UniqueIdentifier>>(() => new Set());
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const onDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over !== null) {
      const resultsCopy = new Set(toMake);
      if (over.id == "from") {
        resultsCopy.delete(event.active.id);
      } else {
        resultsCopy.add(event.active.id);
      }
      setToMake(resultsCopy);
    }
    setActiveId(null);
  };
  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };
  const uploadCards = () => {
    const body = JSON.stringify(
      translations.filter((translation) =>
        toMake.has(translation.translation_id)
      )
    );
    console.log("body", body);
    const url = "http://localhost:3000/api/upload";
    const response = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: body,
    }).then((response) => response.json());
    console.log(response);
  };

  const activeTranslation = translations.find(
    (translation) => translation.translation_id == activeId
  );
  return (
    <DndContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardDropZone id="from" header="Search Results">
          {translations
            .filter((translation) => {
              return !toMake.has(translation.translation_id);
            })
            .map((translation) => (
              <TranslationCard
                translation={translation}
                key={translation.translation_id}
              />
            ))}
        </CardDropZone>

        <CardDropZone id="to" header="Cards to Make" uploadCards={uploadCards}>
          {translations
            .filter((translation) => toMake.has(translation.translation_id))
            .map((translation) => (
              <TranslationCard
                translation={translation}
                key={translation.translation_id}
              />
            ))}
        </CardDropZone>
        <DragOverlay>
          {activeTranslation ? (
            <TranslationCard
              translation={activeTranslation}
              key={activeTranslation.translation_id}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
