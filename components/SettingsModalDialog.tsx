import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Label } from "./ui/label";
import { Check, Key, Loader2, Plus, X } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  getMochiDecks,
  getMochiTemplates,
  MochiDeck,
  MochiTemplate,
  REQUIRED_TEMPLATE_FIELDS,
} from "@/services/mochiApi";

const createMochiTemplate = async () => {
  return {
    id: "new-temlpate",
    name: "New Template",
    fields: ["Word", "Translation", "Example", "Word Type"],
  };
};
export const SettingsModalDialog = ({
  isOpen,
  setDialogClosed,
  savedMochiApiKey,
  savedMochiDeckId,
  savedMochiTemplateId,
  onSaveSettings,
}: {
  isOpen: boolean;
  setDialogClosed: () => void;
  savedMochiApiKey: string;
  savedMochiDeckId: string;
  savedMochiTemplateId: string;
  onSaveSettings: (
    newMochiApiKey: string,
    newMochiDeckId: string,
    newMochiTemplateId: string
  ) => void;
}) => {
  const [mochiApiKey, setMochiApiKey] = useState(savedMochiApiKey);
  const [mochiDeckId, setMochiDeckId] = useState(savedMochiDeckId);
  const [mochiTemplateId, setMochiTemplateId] = useState(savedMochiTemplateId);
  const [curError, setCurError] = useState("");
  const [decks, setDecks] = useState<MochiDeck[]>([]);
  const [compatibleTemplates, setCompatibleTemplates] = useState<
    MochiTemplate[]
  >([]);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  useEffect(() => {
    loadMochiData();
  }, [savedMochiApiKey, isOpen]);
  const loadMochiData = async () => {
    if (mochiApiKey) {
      let err = "";
      const [fetchedMochiDecks, fetchedMochiTemplates] = await Promise.all([
        getMochiDecks(mochiApiKey),
        getMochiTemplates(mochiApiKey, 500),
      ]).catch((error) => {
        err = String(error);
        return [[], []];
      });

      if (err) {
        setCurError(err);
        setDecks([]);
        setCompatibleTemplates([]);
        return;
      }
      setDecks(fetchedMochiDecks);
      if (fetchedMochiDecks.length) {
        // If the current deck still exists in the fetched decks, do
        // not change the current value
        if (!fetchedMochiDecks.map((deck) => deck.id).includes(mochiDeckId)) {
          setMochiDeckId(fetchedMochiDecks[0].id);
        }
      }

      setCompatibleTemplates(fetchedMochiTemplates);
      if (fetchedMochiTemplates.length) {
        // If the current template still exists in the fetched templates, do
        // not change the current value
        if (
          !fetchedMochiTemplates
            .map((template) => template.id)
            .includes(mochiTemplateId)
        ) {
          setMochiTemplateId(fetchedMochiTemplates[0].id);
        }
      }
      setCurError("");
    }
  };
  const handleCreateTemplate = async () => {
    setCreatingTemplate(true);
    setCurError("");
    try {
      const newTemplate = await createMochiTemplate();
      setMochiTemplateId(newTemplate.id);
      await loadMochiData();
    } catch {
      setCurError("Failed to create template");
    } finally {
      setCreatingTemplate(false);
    }
  };
  const onClose = () => {
    // Reset dialog to saved settings
    setMochiApiKey(savedMochiApiKey);
    setMochiDeckId(savedMochiDeckId);
    setMochiTemplateId(savedMochiTemplateId);
    setCurError("");
    setDialogClosed();
  };
  const hasLoadedApiKey = decks.length > 0;
  const hasCompatibleTemplates = compatibleTemplates.length > 0;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure mochi.cards connection</DialogTitle>
          <DialogDescription>
            Enter your Mochi Cards API Key to configure Tradu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="apiKey"
              className="flex items-center gap-2 text-card-foreground"
            >
              <Key className="w-4 h-4" />
              Mochi API Key
            </Label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Mochi API key"
                value={mochiApiKey}
                onChange={(e) => setMochiApiKey(e.target.value)}
                className="flex-1 border-border bg-input-background text-card-foreground placeholder:text-muted-foreground"
              />
              <Button
                onClick={loadMochiData}
                disabled={!mochiApiKey.trim()}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Connect
              </Button>
            </div>
            {curError && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertDescription className="text-destructive-foreground">
                  {curError}
                </AlertDescription>
              </Alert>
            )}
          </div>
          {hasLoadedApiKey ? (
            <div className="space-y-4 border border-border rounded-md p-3 bg-input-background">
              <div className="space-y-2">
                <Label
                  htmlFor="deck"
                  className="flex items-center gap-2 text-card-foreground"
                >
                  Select Deck
                </Label>
                <Select value={mochiDeckId} onValueChange={setMochiDeckId}>
                  <SelectTrigger className="border-border bg-input-background text-card-foreground">
                    <SelectValue placeholder="Choose a deck..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border w-full max-w-[400px]">
                    {decks.map((deck) => (
                      <SelectItem
                        key={deck.id}
                        value={deck.id}
                        className="text-popover-foreground whitespace-normal py-2 h-auto"
                      >
                        <div className="w-full">{deck.name}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="template"
                  className="flex items-center gap-2 text-card-foreground"
                >
                  Select Template
                </Label>

                <div className="border border-border rounded-md p-3 bg-input-background">
                  <div className="flex items-center gap-2 mb-2">
                    {hasCompatibleTemplates ? (
                      <>
                        <Check className="w-4 h-4 text-accent" />
                        <span className="text-card-foreground">
                          Suitable template found
                        </span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-destructive" />
                        <span className="text-card-foreground">
                          No suitable template found
                        </span>
                      </>
                    )}
                  </div>

                  {hasCompatibleTemplates && (
                    <Select
                      value={mochiTemplateId}
                      onValueChange={setMochiTemplateId}
                    >
                      <SelectTrigger className="border-border bg-background text-card-foreground">
                        <SelectValue placeholder="Choose a template..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border w-full max-w-[400px]">
                        {compatibleTemplates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id}
                            className="text-popover-foreground"
                          >
                            <div className="w-full">{template.name}</div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {!hasCompatibleTemplates && (
                    <div className="text-xs text-muted-foreground">
                      Templates must contain:{" "}
                      {REQUIRED_TEMPLATE_FIELDS.join(", ")}
                      <Button
                        onClick={handleCreateTemplate}
                        disabled={creatingTemplate}
                        size="sm"
                        variant="outline"
                        className="w-full border-border text-card-foreground hover:bg-sidebar-accent"
                      >
                        {creatingTemplate ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        {creatingTemplate ? "Creating..." : "Create Template"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              onSaveSettings(mochiApiKey, mochiDeckId, mochiTemplateId)
            }
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
