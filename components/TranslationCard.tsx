"use client";
import { DndContext } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Translation } from "@/services/mochiApi";

export const TranslationCard = ({
  translation,
}: {
  translation: Translation;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: translation.translation_id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ listStyle: "None" }}
      {...listeners}
      {...attributes}
    >
      <Card className={`cursor-move ${isDragging ? "opacity-50" : ""}`}>
        <CardContent className="p-4 border-border">
          <div className="flex gap-2 mb-2">
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
          {translation.expressions.length > 0 && (
            <div className="mb-2 text-sm text-muted-foreground italic">
              {translation.expressions[0].from_expression}
            </div>
          )}

          <div className="mb-2 space-y-1">
            <span className="text-primary font-medium">→ </span>
            <div className="flex flex-wrap gap-2">
              {translation.to_words.map((to_word, index) => (
                <div key={index}>
                  <span className="text-primary font-medium">
                    {to_word.text + " "}
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
            {translation.expressions.length > 0 && (
              <div className="mb-2 text-sm text-muted-foreground italic">
                {translation.expressions[0].to_expression}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
};
