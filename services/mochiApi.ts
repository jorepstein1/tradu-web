const TRANSLATE_URL = "/api/translate";
const LOAD_DECKS_URL = "/api/get-decks";
const UPLOAD_URL = "/api/upload";

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
    mochiApiKey,
    deckId,
  });
  const response = fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: body,
  }).then((response) => response.json());
  return response;
};

export const getMochiDecks = async (
  mochiApiKey: string
): Promise<MochiDeck[]> => {
  const body = new URLSearchParams({ mochiApiKey });
  console.log("Body:", body.toString());
  const url = `${LOAD_DECKS_URL}?${body.toString()}`;
  return fetch(url)
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
