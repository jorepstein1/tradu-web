"use client";
import React, { useState } from 'react';
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Translation } from "@/services/mochiApi";
import { X } from 'lucide-react';

const DeletablePart = ({
  children,
  onDelete
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative inline-block`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <button
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
  onDelete
}: {
  children: React.ReactNode;
  isEditable: boolean;
  onDelete: () => void;
}) => {
  return (<>
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
  </> );

}

export const TranslationCard = ({
  translation,
  isEditable
}: {
    translation: Translation;
    isEditable: boolean;
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
            <Expression isEditable={isEditable} onDelete={() => { }}>
              {translation.expressions[0].from_expression}
            </Expression>
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
            <Expression isEditable={isEditable} onDelete={() => { }}>
              {translation.expressions[0].to_expression}
            </Expression>
            )}
          </div>
        </CardContent>
      </Card>
    </li>
  );
};
