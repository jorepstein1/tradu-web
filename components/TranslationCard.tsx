"use client";
import { DndContext } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface FromWord {
  text: string;
  definition: string;
  part_of_speech: string;
  sense: string;
}
interface ToWord {
  text: string;
  part_of_speech: string;
  sense: string;
}
export interface Translation {
  from_word: FromWord;
  to_words: ToWord[];
  translation_id: string;
}
export const TranslationCardList = ({
  translations,
}: {
  translations: Translation[];
}) => {
  return (
    <DndContext>
      <Card className="border-border bg-card">
        <CardHeader>Search Results</CardHeader>
        <CardContent>
          {translations.map((translation) => (
            <TranslationCard
              translation={translation}
              key={translation.translation_id}
            />
          ))}
        </CardContent>
      </Card>
    </DndContext>
  );
};

export const TranslationCard = ({
  translation,
}: {
  translation: Translation;
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: translation.translation_id,
  });
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  // className={`cursor-move transition-opacity ${
  //   isDragging ? "opacity-50" : ""
  //   }`}
  //   className={`border-border bg-card ${
  //   !isDragging ? "hover:bg-sidebar-accent" : ""
  // }`}
  return (
    <li
      ref={setNodeRef}
      style={{ ...style, listStyle: "None" }}
      {...listeners}
      {...attributes}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-card-foreground font-medium">
              {translation.from_word.text}
            </span>
            <div className="flex gap-1 flex-wrap">
              <Badge
                variant="outline"
                className="text-xs border-border text-muted-foreground"
              >
                {translation.from_word.part_of_speech}
              </Badge>
              {translation.from_word.sense && (
                <Badge
                  variant="outline"
                  className="text-xs border-border text-muted-foreground"
                >
                  {translation.from_word.sense}
                </Badge>
              )}
            </div>
          </div>

          <div className="mb-2 text-sm text-muted-foreground">
            {translation.from_word.definition}
          </div>

          <div className="mb-2 space-y-1">
            <span className="text-primary font-medium">→ </span>
            <div className="flex flex-wrap gap-2">
              {translation.to_words.map((to_word, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-primary font-medium">
                    {to_word.text}
                  </span>
                  {(to_word.part_of_speech || to_word.sense) && (
                    <span className="text-xs text-muted-foreground">
                      (
                      {[to_word.part_of_speech, to_word.sense]
                        .filter(Boolean)
                        .join(", ")}
                      )
                    </span>
                  )}
                  {index < translation.to_words.length - 1 && (
                    <span className="text-muted-foreground">,</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* {translation.example && (
            <div className="text-xs text-muted-foreground italic">
              {translation.example}
            </div>
          )} */}
        </CardContent>
      </Card>
    </li>
  );
};
