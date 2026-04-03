from flask import Flask, request
from word_reference_scraper.word_reference import (
    FromWord,
    ToWord,
    Translation,
    translate_word,
    make_translations,
)
from dataclasses import asdict
import logging
import requests

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.StreamHandler()],
)
log = logging.getLogger(__name__)
app = Flask(__name__)
MOCHI_BASE_URL = "https://app.mochi.cards/api"
TRADU_TEMPLATE_NAME = "Tradu"
TRADU_TEMPLATE_CONTENT = "<< Front >>\n---\n<< Back >>"
TRADU_TEMPLATE_FIELDS = {
    "tradu-front": {"id": "tradu-front", "name": "Front"},
    "tradu-back": {"id": "tradu-back", "name": "Back"},
}
TRADU_REQUIRED_FIELD_IDS = {"tradu-front", "tradu-back"}


@app.route("/api/translate")
def translate():
    direction = request.args.get("direction")
    word = request.args.get("word")
    if direction is None or word is None:
        return "Must provide direction and word", 400
    log.info(f"Translating word: {word} ({direction})")
    try:
        wr_content = translate_word(word, direction).decode()
        translation_strings = [
            asdict(translation) for translation in make_translations(wr_content)
        ]
    except Exception as e:
        log.error(f"Failed to translate '{word}': {e}")
        return {"error": "Translation failed"}, 500
    log.info(f"Got {len(translation_strings)} translation(s) for '{word}'")
    return {"translations": translation_strings}


@app.route("/api/get-decks")
def get_decks():
    log.info("Getting decks from Mochi")
    mochi_api_key = request.headers.get("Authorization")
    if mochi_api_key is None:
        return "Must provide Mochi API Key", 400

    response, code = mochi_get(f"{MOCHI_BASE_URL}/decks", mochi_api_key)
    if code != 200:
        log.error(f"Failed to get decks: {response} (status {code})")
        return response, code

    decks = []
    for deck_data in response.get("docs", []):
        deck = {
            "id": deck_data["id"],
            "name": deck_data["name"],
        }
        decks.append(deck)
    log.info(f"Returning {len(decks)} deck(s)")
    return {"decks": decks}



def find_or_create_tradu_template(mochi_api_key: str) -> tuple[str | None, int]:
    response, code = mochi_get(f"{MOCHI_BASE_URL}/templates", mochi_api_key)
    if code != 200:
        return None, code
    for template_data in response.get("docs", []):
        if template_data.get("name") == TRADU_TEMPLATE_NAME:
            existing_field_ids = set(template_data.get("fields", {}).keys())
            if TRADU_REQUIRED_FIELD_IDS <= existing_field_ids:
                log.info(f"Found existing Tradu template: {template_data['id']}")
                return template_data["id"], 200
    log.info("Tradu template not found, creating it")
    create_body = {
        "name": TRADU_TEMPLATE_NAME,
        "content": TRADU_TEMPLATE_CONTENT,
        "fields": TRADU_TEMPLATE_FIELDS,
    }
    response, code = mochi_post(
        f"{MOCHI_BASE_URL}/templates/", mochi_api_key, data=create_body
    )
    if code != 200:
        log.error(f"Failed to create Tradu template: {response} (status {code})")
        return None, code
    log.info(f"Created Tradu template: {response['id']}")
    return response["id"], 200


@app.route("/api/upload", methods=["POST"])
def upload():
    mochi_api_key = request.headers.get("Authorization")
    if mochi_api_key is None:
        return "Must provide Mochi API Key", 400
    data = request.get_json()

    deck_id = data.get("deckId")
    if not deck_id:
        return "Must provide deckId", 400

    translations = data.get("translations", [])
    log.info(f"Uploading {len(translations)} card(s) to deck {deck_id}")

    template_id, code = find_or_create_tradu_template(mochi_api_key)
    if code != 200:
        log.error(f"Could not get Tradu template (status {code})")
        return {"errors": "Failed to find or create Tradu template"}, 400

    for translation_dict in translations:
        from_word = FromWord(**translation_dict["from_word"])
        to_words = [
            ToWord(**to_word) for to_word in translation_dict["to_words"]
        ]
        translation = Translation(
            translation_id=translation_dict["translation_id"],
            from_word=from_word,
            to_words=to_words,
            from_expressions=translation_dict["from_expressions"],
            to_expressions=translation_dict["to_expressions"],
        )
        card_data = {
            "content": "",
            "deck-id": deck_id,
            "template-id": template_id,
            "fields": make_fields(translation),
            "review-reverse?": True,
        }
        log.debug(f"Creating card for '{translation.from_word.text}'")
        response, code = mochi_post(
            f"{MOCHI_BASE_URL}/cards", mochi_api_key, data=card_data
        )
        if code != 200:
            log.error(f"Failed to create card for '{translation.from_word.text}': {response} (status {code})")
            return response, code
        log.info(f"Created card for '{translation.from_word.text}'")

    log.info("Upload complete")
    return {}


def make_fields(translation: Translation):
    """
    Turn a translation into a dictionary of fields needed for Mochi to render a
    card.

    :param translation: the translation object
    :return: a dictionary with the mochi fields
    """
    return {
        "tradu-front": {
            "id": "tradu-front",
            "value": make_card_url_front(
                translation.from_word, translation.from_expressions
            ),
        },
        "tradu-back": {
            "id": "tradu-back",
            "value": make_card_url_back(
                translation.to_words, translation.to_expressions
            ),
        },
    }


primary_style = "font-size: 1.5rem"
secondary_style = "color: lab(47.7841 -0.393182 -10.0268); font-size: .8rem"
expression_style = "font-style: italic; font-size: .85rem"


def sanitize_markdown(text: str) -> str:
    return text.replace("- ", "\\- ")


def make_card_url_front(word: FromWord, from_expressions: list[str]) -> str:
    secondary_html = " "
    if word.sense:
        secondary_html += word.sense
        if word.part_of_speech:
            secondary_html += ", " + word.part_of_speech
    elif word.part_of_speech:
        secondary_html += word.part_of_speech
    text_div = f'<div>{word.text}<span style="{secondary_style}">{secondary_html}</span></div>'

    expression_div = "".join(
        f'<div><span style="{expression_style}">{sanitize_markdown(expr)}</span></div>'
        for expr in from_expressions
    )

    return f'<div style="{primary_style}">{text_div}{expression_div}</div>'


def make_card_url_back(
    words: list[ToWord], to_expressions: list[str]
) -> str:
    translation_htmls = []
    for word in words:
        secondary_html = ""
        if word.sense:
            secondary_html += word.sense
            if word.part_of_speech:
                secondary_html += ", " + word.part_of_speech
        elif word.part_of_speech:
            secondary_html += word.part_of_speech
        if secondary_html:
            secondary_html = (
                f' <span style="{secondary_style}">{secondary_html}</span>'
            )
        translation_htmls.append(f"{word.text}{secondary_html}")
    text_div = f"<div>{', '.join(translation_htmls)}</div>"

    expression_div = "".join(
        f'<div><span style="{expression_style}">{sanitize_markdown(expr)}</span></div>'
        for expr in to_expressions
    )
    return f'<div style="font-size: 1.2rem;">{text_div}{expression_div}</div>'


def mochi_get(url: str, mochi_api_key: str) -> tuple[dict, int]:
    def make_request():
        return requests.get(url, auth=(mochi_api_key, ""), timeout=10)

    return make_mochi_request(make_request)


def mochi_post(url: str, mochi_api_key: str, data: dict) -> tuple[dict, int]:
    def make_request():
        return requests.post(
            url,
            auth=(mochi_api_key, ""),
            json=data,
            timeout=10,
        )

    return make_mochi_request(make_request)


def make_mochi_request(request_fn) -> tuple[dict, int]:
    try:
        response = request_fn()
    except requests.exceptions.RequestException as e:
        log.error(f"Request failed: {e}")
        return {"errors": str(e)}, 400

    decks_data = response.json()
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        if decks_data.get("errors"):
            return decks_data, 400
        else:
            return {"errors": str(e)}, 400
    return decks_data, 200
