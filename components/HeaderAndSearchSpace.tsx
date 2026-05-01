import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ArrowLeftRight } from "lucide-react";
import Image from "next/image";

interface SearchSectionProps {
  searchAction: (formData: FormData) => void;
  loading: boolean;
  translationDirection: string;
  setTranslationDirection: (value: string) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchAction,
  loading,
  translationDirection,
  setTranslationDirection,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Card className="border-border bg-card">
      <CardContent className="px-6 py-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-between gap-3">
            <Image src="/tradu_icon.svg" alt="Logo" width={50} height={50} />
            <h1 className="text-card-foreground text-5xl">Tradu</h1>
          </div>
        </div>

        <form className="space-y-4">
          <div className="flex items-center gap-2"></div>

          <div className="flex gap-2">
            <Input
              type="text"
              name="term"
              placeholder="Enter word to translate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border-border bg-input-background text-card-foreground placeholder:text-muted-foreground"
            />
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
