const TRANSLATE_URL = "http://localhost:3000/api/translate";
const LOAD_DECKS_URL = "http://localhost:3000/api/get-decks";
const LOAD_TEMPLATES_URL = "http://localhost:3000/api/get-templates";

export const REQUIRED_TEMPLATE_FIELDS = ["to_sense"];
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
interface Expression {
  from_expression: string;
  to_expression: string;
}
export interface Translation {
  from_word: FromWord;
  to_words: ToWord[];
  translation_id: string;
  expressions: Expression[];
}
export interface MochiDeck {
  id: string;
  name: string;
}

export interface MochiTemplate {
  id: string;
  name: string;
  fields: string[];
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
  selectedTranslations: Translation[]
) => {
  const body = JSON.stringify({
    translations: selectedTranslations,
    mochiApiKey: mochiApiKey,
  });
  const url = "http://localhost:3000/api/upload";
  const response = fetch(url, {
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

export const getMochiTemplates = async (
  mochiApiKey: string,
  delayMs: number
): Promise<MochiTemplate[]> => {
  const body = new URLSearchParams({ mochiApiKey });
  console.log("Body:", body.toString());
  const url = `${LOAD_TEMPLATES_URL}?${body.toString()}`;
  return new Promise((resolve) => setTimeout(resolve, delayMs))
    .then(() => fetch(url))
    .then((response) => {
      if (!response.ok) {
        return response.json().then((json) => {
          throw new Error(json["errors"]);
        });
      }
      return response.json() as Promise<{ templates: MochiTemplate[] }>;
    })
    .then((json) =>
      json.templates.filter((template) =>
        REQUIRED_TEMPLATE_FIELDS.every((field) =>
          template.fields.includes(field)
        )
      )
    );
};
