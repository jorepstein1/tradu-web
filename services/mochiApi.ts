export class RateLimitError extends Error {
  constructor() {
    super("rate_limited");
  }
}

const checkRateLimit = (response: Response): Response => {
  if (response.status === 429) throw new RateLimitError();
  return response;
};

const TRANSLATE_URL = "/api/translation";
const LOAD_DECKS_URL = "/api/decks";
const UPLOAD_URL = "/api/cards";

interface FromWord {
  text: string;
  definition: string;
  part_of_speech: string;
  sense: string;
}
interface ToWord {
  text: string;
  part_of_speech: string;
  sense: string;
}
export interface Translation {
  from_word: FromWord;
  to_words: ToWord[];
  translation_id: string;
  from_expressions: string[];
  to_expressions: string[];
}
export interface MochiDeck {
  id: string;
  name: string;
}

export const getTranslations = async (
  direction: string,
  word: string
): Promise<Translation[]> => {
  const body = new URLSearchParams({ direction, word });
  console.log("Body:", body.toString());
  const url = `${TRANSLATE_URL}?${body.toString()}`;
  return fetch(url)
    .then(checkRateLimit)
    .then((response) => response.json())
    .then((json) => json.translations);
};

export const uploadSelectedTranslations = async (
  mochiApiKey: string,
  deckId: string,
  selectedTranslations: Translation[]
) => {
  const body = JSON.stringify({
    translations: selectedTranslations,
    deckId,
  });
  const response = fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: mochiApiKey,
    },
    body: body,
  })
    .then(checkRateLimit)
    .then((response) => response.json());
  return response;
};

export const getMochiDecks = async (
  mochiApiKey: string
): Promise<MochiDeck[]> => {
  return fetch(LOAD_DECKS_URL, {
    headers: { Authorization: mochiApiKey },
  })
    .then(checkRateLimit)
    .then((response) => {
      if (!response.ok) {
        return response.json().then((json) => {
          throw new Error(json["errors"]);
        });
      }
      return response.json();
    })
    .then((json) => json.decks);
};
