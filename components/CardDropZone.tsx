"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useDroppable } from "@dnd-kit/core";
import { Loader2, Settings, TriangleAlert } from "lucide-react";
export const CardDropZone = ({
  id,
  children,
  header,
  uploadCards,
  uploadIsDisabled,
  uploadIsPending,
  openSettings,
  showConfigureWarning,
}: {
  id: string;
  header: string;
  children: React.ReactNode;
  uploadCards?: () => void;
  uploadIsDisabled?: boolean;
  uploadIsPending?: boolean;
  openSettings?: () => void;
  showConfigureWarning?: boolean;
}) => {
  const { setNodeRef } = useDroppable({
    id: id,
  });
  return (
    <Card ref={setNodeRef} aria-label={id == "to" ? "Cards to make drop zone" : "Search results drop zone"}>
      <CardHeader className="flex items-center justify-between">
        {header}
        {id == "to" ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={openSettings} aria-label={showConfigureWarning ? "Configure settings (action required)" : "Configure settings"}>
              {showConfigureWarning ? (
                <TriangleAlert className="w-4 h-4" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              Configure
            </Button>
            <Button disabled={uploadIsDisabled} onClick={uploadCards} aria-label={uploadIsPending ? "Uploading cards" : "Upload cards to Mochi"}>
              {uploadIsPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
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
