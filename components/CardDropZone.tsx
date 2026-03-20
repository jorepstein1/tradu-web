"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useDroppable } from "@dnd-kit/core";
import { Settings } from "lucide-react";
export const CardDropZone = ({
  id,
  children,
  header,
  uploadCards,
  uploadIsDisabled,
  openSettings,
}: {
  id: string;
  header: string;
  children: React.ReactNode;
  uploadCards?: () => void;
  uploadIsDisabled?: boolean;
  openSettings?: () => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });
  return (
    <Card ref={setNodeRef}>
      <CardHeader className="flex items-center justify-between">
        {header}
        {id == "to" ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={openSettings}>
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button disabled={uploadIsDisabled} onClick={uploadCards}>
              Upload
            </Button>
          </div>
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
