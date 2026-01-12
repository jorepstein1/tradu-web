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
import { BookOpen } from "lucide-react";

export const ResultsSpace = ({
  searchTerm,
  translations,
  modifiedTranslations,
  setModifiedTranslations,
  selectedTranslationIds,
  setSelectedTranslationIds,
  uploadSelectedTranslations,
}: {
  searchTerm: string;
  translations: Translation[];
  modifiedTranslations: Translation[];
  setModifiedTranslations: (translations: Translation[]) => void;
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
          <ul>
            {translations.length ? (
              translations
                .filter((translation) => {
                  return !selectedTranslationIds.has(
                    translation.translation_id
                  );
                })
                .map((translation) => (
                  <TranslationCard
                    translation={translation}
                    key={translation.translation_id}
                    isEditable={false}
                  />
                ))
            ) : (
              <div className="text-muted-foreground flex flex-col items-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-3" />
                <div>
                  {searchTerm
                    ? "No translations found"
                    : "Search for a word to see translations"}
                </div>
                {searchTerm && (
                  <div className="text-xs mt-1">
                    Try searching for a different word
                  </div>
                )}
              </div>
            )}
          </ul>
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
          uploadIsDisabled={selectedTranslationIds.size === 0}
        >
          {selectedTranslationIds.size ? (
            <ul>
              {modifiedTranslations
                .filter((translation) =>
                  selectedTranslationIds.has(translation.translation_id)
                )
                .map((translation) => (
                  <TranslationCard
                    translation={translation}
                    key={translation.translation_id}
                    isEditable={true}
                  />
                ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center py-12 text-muted-foreground ">
              <div className="mb-2">
                Drag translation cards here to create flashcards
              </div>
              <div className="text-xs">
                Cards will be uploaded to your selected Mochi deck
              </div>
            </div>
          )}
        </CardDropZone>
        <DragOverlay>
          {activeTranslation ? (
            <TranslationCard
              translation={activeTranslation}
              key={activeTranslation.translation_id}
              isEditable={false}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
