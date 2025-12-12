"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { useDroppable } from "@dnd-kit/core";
export const CardDropZone = ({
  id,
  children,
  header,
  uploadCards,
  uploadIsDisabled,
}: {
  id: string;
  header: string;
  children: React.ReactNode;
  uploadCards?: () => void;
  uploadIsDisabled?: boolean;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });
  return (
    <Card className="border-border bg-card max-h-200" ref={setNodeRef}>
      <CardHeader className="flex items-center justify-between">
        {header}
        {id == "to" ? (
          <Button disabled={uploadIsDisabled} onClick={uploadCards}>
            Upload
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="overflow-y-auto">
        <ul>{children}</ul>
      </CardContent>
    </Card>
  );
};
