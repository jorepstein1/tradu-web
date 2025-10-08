"use client";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { CardDropZone } from "./CardDropZone";
import { TranslationCard } from "./TranslationCard";
import { useState } from "react";
import { Translation } from "@/services/mochiApi";

export const ResultsSpace = ({
  translations,
  selectedTranslationIds,
  setSelectedTranslationIds,
  uploadSelectedTranslations,
}: {
  translations: Translation[];
  selectedTranslationIds: Set<UniqueIdentifier>;
  setSelectedTranslationIds: (value: Set<UniqueIdentifier>) => void;
  uploadSelectedTranslations: (translations: Translation[]) => void;
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const onDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over !== null) {
      const resultsCopy = new Set(selectedTranslationIds);
      if (over.id == "from") {
        resultsCopy.delete(event.active.id);
      } else {
        resultsCopy.add(event.active.id);
      }
      setSelectedTranslationIds(resultsCopy);
    }
    setActiveId(null);
  };
  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
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
              return !selectedTranslationIds.has(translation.translation_id);
            })
            .map((translation) => (
              <TranslationCard
                translation={translation}
                key={translation.translation_id}
              />
            ))}
        </CardDropZone>

        <CardDropZone
          id="to"
          header="Cards to Make"
          uploadCards={() =>
            uploadSelectedTranslations(
              translations.filter((translation) =>
                selectedTranslationIds.has(translation.translation_id)
              )
            )
          }
        >
          {translations
            .filter((translation) =>
              selectedTranslationIds.has(translation.translation_id)
            )
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
