"use client";
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Translation } from "@/services/mochiApi";
import { X, RotateCcw } from "lucide-react";

const DeletablePart = ({
  children,
  onDelete,
  className = "inline-block",
}: {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()} // Done to prevent dragging
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full flex items-center justify-center shadow-md transition-all"
          aria-label="Delete"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

const Expression = ({
  children,
  isEditable,
  onDelete,
}: {
  children: React.ReactNode;
  isEditable: boolean;
  onDelete: () => void;
}) => {
  return (
    <>
      {isEditable ? (
        <DeletablePart onDelete={onDelete}>
          <div className="mb-2 text-sm text-muted-foreground italic">
            {children}
          </div>
        </DeletablePart>
      ) : (
        <div className="mb-2 text-sm text-muted-foreground italic">
          {children}
        </div>
      )}
    </>
  );
};

export const TranslationCard = ({
  translation,
  isEditable,
  onUpdate,
  onReset,
  hasChanges,
  onMove,
}: {
  translation: Translation;
  isEditable: boolean;
  onUpdate?: (updater: (t: Translation) => Translation) => void;
  onReset?: () => void;
  hasChanges?: boolean;
  onMove?: () => void;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: translation.translation_id,
  });

  const refocusAfterMove = () => {
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          `[data-translation-id="${translation.translation_id}"]`,
        )
        ?.focus();
    });
  };

  return (
    <li
      ref={setNodeRef}
      style={{ listStyle: "None" }}
      data-translation-id={translation.translation_id}
      {...listeners}
      {...attributes}
      onKeyDown={(e) => {
        if (!isEditable && e.key === "ArrowRight") {
          e.preventDefault();
          onMove?.();
          refocusAfterMove();
        } else if (isEditable && e.key === "ArrowLeft") {
          e.preventDefault();
          onMove?.();
          refocusAfterMove();
        }
      }}
    >
      <Card className={`cursor-move ${isDragging ? "opacity-50" : ""}`}>
        <CardContent className="p-4 border-border">
          <div className="flex gap-2 mb-2 justify-between">
            <div className="flex gap-2">
              <span className="text-card-foreground font-medium">
                {translation.from_word.text}
              </span>
              <div className="flex gap-1 flex-wrap">
                {translation.from_word.part_of_speech &&
                  (isEditable ? (
                    <DeletablePart
                      onDelete={() =>
                        onUpdate?.((t) => ({
                          ...t,
                          from_word: { ...t.from_word, part_of_speech: "" },
                        }))
                      }
                    >
                      <Badge
                        variant="outline"
                        className="text-xs border-border text-muted-foreground"
                      >
                        {translation.from_word.part_of_speech}
                      </Badge>
                    </DeletablePart>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {translation.from_word.part_of_speech}
                    </Badge>
                  ))}
                {translation.from_word.sense &&
                  (isEditable ? (
                    <DeletablePart
                      onDelete={() =>
                        onUpdate?.((t) => ({
                          ...t,
                          from_word: { ...t.from_word, sense: "" },
                        }))
                      }
                    >
                      <Badge
                        variant="outline"
                        className="text-xs border-border text-muted-foreground"
                      >
                        {translation.from_word.sense}
                      </Badge>
                    </DeletablePart>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {translation.from_word.sense}
                    </Badge>
                  ))}
              </div>
            </div>
            {isEditable && hasChanges && onReset && (
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()} // Done to prevent dragging
                onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }}
                className="w-6 h-6 text-muted-foreground hover:text-foreground rounded flex items-center justify-center transition-colors"
                aria-label="Reset card"
                title="Reset to original"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>

          {translation.from_word.definition &&
            (isEditable ? (
              <DeletablePart
                className="block w-fit"
                onDelete={() =>
                  onUpdate?.((t) => ({
                    ...t,
                    from_word: { ...t.from_word, definition: "" },
                  }))
                }
              >
                <div className="mb-2 text-sm text-muted-foreground">
                  {translation.from_word.definition}
                </div>
              </DeletablePart>
            ) : (
              <div className="mb-2 text-sm text-muted-foreground">
                {translation.from_word.definition}
              </div>
            ))}

          {translation.from_expressions.map((expr, i) => (
            <Expression
              key={i}
              isEditable={isEditable}
              onDelete={() =>
                onUpdate?.((t) => ({
                  ...t,
                  from_expressions: t.from_expressions.filter((_, j) => j !== i),
                }))
              }
            >
              {expr}
            </Expression>
          ))}

          <div className="mb-2 space-y-1">
            <span className="text-primary font-medium">→ </span>
            <div className="flex flex-wrap gap-2">
              {translation.to_words.map((to_word, index) => {
                const wordContent = (
                  <>
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
                  </>
                );

                return isEditable ? (
                  <DeletablePart
                    key={to_word.text}
                    onDelete={() =>
                      onUpdate?.((t) => ({
                        ...t,
                        to_words: t.to_words.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    {wordContent}
                  </DeletablePart>
                ) : (
                  <div key={to_word.text}>{wordContent}</div>
                );
              })}
            </div>
            {translation.to_expressions.map((expr, i) => (
              <Expression
                key={i}
                isEditable={isEditable}
                onDelete={() =>
                  onUpdate?.((t) => ({
                    ...t,
                    to_expressions: t.to_expressions.filter((_, j) => j !== i),
                  }))
                }
              >
                {expr}
              </Expression>
            ))}
          </div>
        </CardContent>
      </Card>
    </li>
  );
};
