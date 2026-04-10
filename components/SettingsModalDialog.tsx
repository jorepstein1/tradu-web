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
import { ExternalLink, Key, Loader2 } from "lucide-react";
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
  MochiDeck,
} from "@/services/mochiApi";

export const SettingsModalDialog = ({
  isOpen,
  setDialogClosed,
  savedMochiApiKey,
  savedMochiDeckId,
  onSaveSettings,
}: {
  isOpen: boolean;
  setDialogClosed: () => void;
  savedMochiApiKey: string;
  savedMochiDeckId: string;
  onSaveSettings: (
    newMochiApiKey: string,
    newMochiDeckId: string,
  ) => void;
}) => {
  const [mochiApiKey, setMochiApiKey] = useState(savedMochiApiKey);
  const [mochiDeckId, setMochiDeckId] = useState(savedMochiDeckId);
  const [curError, setCurError] = useState("");
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [decks, setDecks] = useState<MochiDeck[]>([]);
  useEffect(() => {
    loadMochiData();
  }, [savedMochiApiKey, isOpen]);
  const loadMochiData = async () => {
    if (mochiApiKey) {
      setIsLoadingDecks(true);
      let err = "";
      const fetchedMochiDecks = await getMochiDecks(mochiApiKey).catch(
        (error) => {
          err = String(error);
          return [];
        }
      );
      setIsLoadingDecks(false);

      if (err) {
        setCurError(err);
        setDecks([]);
        return;
      }
      setDecks(fetchedMochiDecks);
      if (fetchedMochiDecks.length) {
        if (!fetchedMochiDecks.map((deck) => deck.id).includes(mochiDeckId)) {
          setMochiDeckId(fetchedMochiDecks[0].id);
        }
      }
      setCurError("");
    }
  };
  const onClose = () => {
    setMochiApiKey(savedMochiApiKey);
    setMochiDeckId(savedMochiDeckId);
    setCurError("");
    setDialogClosed();
  };
  const hasLoadedApiKey = decks.length > 0;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure mochi.cards connection</DialogTitle>
          <DialogDescription>
            Enter your Mochi Cards API Key to configure Tradu
          </DialogDescription>
        </DialogHeader>
        <form
          id="mochi-settings-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSaveSettings(mochiApiKey, mochiDeckId);
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="apiKey"
                className="flex items-center gap-2 text-card-foreground"
              >
                <Key className="w-4 h-4" />
                Mochi API Key
                <a
                  href="https://mochi.cards/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-muted-foreground hover:text-foreground"
                  aria-label="Visit mochi.cards"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your Mochi API key"
                  value={mochiApiKey}
                  onChange={(e) => setMochiApiKey(e.target.value)}
                  className="flex-1 border-border bg-input-background text-card-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={loadMochiData}
                  type="button"
                  disabled={!mochiApiKey.trim() || isLoadingDecks}
                  size="sm"
                  variant="outline"
                >
                  {isLoadingDecks ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
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
              </div>
            ) : (
              <></>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="submit" form="mochi-settings-form">
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
