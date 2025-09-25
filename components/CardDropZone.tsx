"use client";
import { DndContext } from "@dnd-kit/core";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useDroppable } from "@dnd-kit/core";
export const CardDropZone = ({ id, children, header }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  return (
    <Card className="border-border bg-card" ref={setNodeRef}>
      <CardHeader>{header}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
