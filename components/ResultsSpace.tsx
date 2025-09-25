"use client";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { CardDropZone } from "./CardDropZone";
import { Translation, TranslationCard } from "./TranslationCard";
import { useState } from "react";
export const ResultsSpace = ({
  translations,
}: {
  translations: Translation[];
}) => {
  const [toMake, setToMake] = useState<Set<string>>(() => new Set());
  console.log(`To make is ${[...toMake]}`);
  const onDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    if (over === null) {
      console.log("null");
    } else {
      const resultsCopy = new Set(toMake);
      if (over.id == "from") {
        resultsCopy.delete(event.active.id as string);
        console.log("from");
      } else {
        resultsCopy.add(event.active.id as string);
        console.log("to");
      }
      console.log(`copy:: ${[...resultsCopy]}`);
      setToMake(resultsCopy);
    }
  };
  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardDropZone id="from" header="Search Results">
          {translations
            .filter((translation) => {
              console.log(
                `has ${translation.translation_id} ${toMake.has(translation.translation_id)}`
              );
              return !toMake.has(translation.translation_id);
            })
            .map((translation) => (
              <TranslationCard
                translation={translation}
                key={translation.translation_id}
              />
            ))}
        </CardDropZone>

        <CardDropZone id="to" header="Cards to Make">
          {translations
            .filter((translation) => toMake.has(translation.translation_id))
            .map((translation) => (
              <TranslationCard
                translation={translation}
                key={translation.translation_id}
              />
            ))}
        </CardDropZone>
      </div>
    </DndContext>
  );
};
