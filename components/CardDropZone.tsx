"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
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
    <Card ref={setNodeRef}>
      <CardHeader className="flex items-center justify-between">
        {header}
        {id == "to" ? (
          <Button
            disabled={uploadIsDisabled}
            onClick={uploadCards}
          >
            Upload
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <ScrollArea type="auto" className="h-[500px]  px-4">
          <ul>{children}</ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
