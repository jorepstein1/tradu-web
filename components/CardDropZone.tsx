"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useDroppable } from "@dnd-kit/core";
export const CardDropZone = ({
  id,
  children,
  header,
}: {
  id: string;
  header: string;
  children: React.ReactNode;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });
  return (
    <Card className="border-border bg-card" ref={setNodeRef}>
      <CardHeader>{header}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
