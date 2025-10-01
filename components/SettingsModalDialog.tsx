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
export interface MochiDeck {
  id: string;
  name: string;
}

export interface MochiTemplate {
  id: string;
  name: string;
  fields: string[];
}
const LOAD_DECKS_URL = "http://localhost:3000/api/get-decks";
const LOAD_TEMPLATES_URL = "http://localhost:3000/api/get-templates";

const requiredTemplateFields = ["Word", "Translation", "Example", "Word Type"];
const getMochiDecks = async (mochiApiKey: string): Promise<MochiDeck[]> => {
  const body = new URLSearchParams({ mochiApiKey });
  console.log("Body:", body.toString());
  const url = `${LOAD_DECKS_URL}?${body.toString()}`;
  return fetch(url)
    .then((response) => response.json())
    .then((json) => json.decks);
};
const getMochiTemplates = async (
  mochiApiKey: string
): Promise<MochiTemplate[]> => {
  const body = new URLSearchParams({ mochiApiKey });
  console.log("Body:", body.toString());
  const url = `${LOAD_TEMPLATES_URL}?${body.toString()}`;
  return fetch(url)
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .then((json) => json.templates);
};
const createMochiTemplate = async () => {
  return {
    id: "new-temlpate",
    name: "New Template",
    fields: ["Word", "Translation", "Example", "Word Type"],
  };
};
export const SettingsModalDialog = ({
  isOpen,
  onClose,
  savedMochiApiKey,
  savedMochiDeckId,
  savedMochiTemplateId,
  onSaveSettings,
}: {
  isOpen: boolean;
  onClose: () => void;
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
  const [templates, setTemplates] = useState<MochiTemplate[]>([]);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const loadMochiData = async () => {
    const fetchedMochiDecks = await getMochiDecks(mochiApiKey);
    console.log(fetchedMochiDecks);
    setDecks(fetchedMochiDecks);
    const fetchedMochiTemplates = await getMochiTemplates(mochiApiKey);
    console.log(fetchedMochiTemplates);

    setTemplates(fetchedMochiTemplates);
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
  useEffect(() => {
    loadMochiData();
  }, [mochiApiKey]);
  // Filter templates that have all required fields
  const compatibleTemplates = templates.filter((template) =>
    requiredTemplateFields.every((field) => template.fields.includes(field))
  );

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
          {curError && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertDescription className="text-destructive-foreground">
                {curError}
              </AlertDescription>
            </Alert>
          )}

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
          </div>
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
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="template"
            className="flex items-center gap-2 text-card-foreground"
          >
            Template Status
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
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {!hasCompatibleTemplates && (
              <div className="text-xs text-muted-foreground">
                Templates must contain: {requiredTemplateFields.join(", ")}
              </div>
            )}
          </div>

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
