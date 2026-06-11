import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { ArrowLeftRight, History, LogOut } from "lucide-react";
import Image from "next/image";
import type { SearchHistoryEntry } from "@/services/userApi";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface SearchSectionProps {
  searchAction: (formData: FormData) => void;
  loading: boolean;
  translationDirection: string;
  setTranslationDirection: (value: string) => void;
  user: SessionUser | null;
  searchHistory: SearchHistoryEntry[];
  onSelectHistory: (word: string, direction: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchAction,
  loading,
  translationDirection,
  setTranslationDirection,
  user,
  searchHistory,
  onSelectHistory,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <Card className="border-border bg-card">
      <CardContent className="px-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-between gap-3">
            <Image src="/tradu_icon.svg" alt="Logo" width={50} height={50} />
            <h1 className="text-card-foreground text-5xl">Tradu</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {user.image && (
                  <Image
                    src={user.image}
                    alt={user.name ?? "User avatar"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.name ?? user.email}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => authClient.signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  authClient.signIn.social({
                    provider: "google",
                    callbackURL: "/",
                  })
                }
              >
                Sign in with Google
              </Button>
            )}
          </div>
        </div>

        <form className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              name="term"
              placeholder="Enter word to translate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-border bg-input-background text-card-foreground placeholder:text-muted-foreground"
            />
            <input type="hidden" name="direction" value={translationDirection} />
            {user && (
              <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="default"
                    aria-label="Recent searches"
                    disabled={searchHistory.length === 0}
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-72 p-0">
                  <div className="px-3 py-2 text-sm font-medium border-b border-border">
                    Recent searches
                  </div>
                  <ScrollArea className="max-h-72">
                    <ul className="py-1">
                      {searchHistory.map((entry) => (
                        <li key={entry.id}>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground"
                            onClick={() => {
                              setSearchTerm(entry.word);
                              setHistoryOpen(false);
                              onSelectHistory(entry.word, entry.direction);
                            }}
                          >
                            <span className="truncate">{entry.word}</span>
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">
                              {entry.direction === "esen" ? "ES→EN" : "EN→ES"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
            <Button
              type="button"
              variant="outline"
              size="default"
              aria-label={`Toggle translation direction: currently ${translationDirection == "esen" ? "Spanish to English" : "English to Spanish"}`}
              onClick={() => {
                if (translationDirection == "esen") {
                  setTranslationDirection("enes");
                } else {
                  setTranslationDirection("esen");
                }
              }}
            >
              {translationDirection == "esen" ? "Spanish" : "English"}
              <ArrowLeftRight />
              {translationDirection == "esen" ? "English" : "Spanish"}
            </Button>
            <Button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              formAction={searchAction}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
