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

logging.basicConfig(filename="record.log", level=logging.DEBUG)
app = Flask(__name__)
MOCHI_BASE_URL = "https://app.mochi.cards/api"
# api_key = "424fdcb0088abe05a1bede5c"


@app.route("/api/translate")
def translate():
    direction = request.args.get("direction")
    word = request.args.get("word")
    if direction is None or word is None:
        return "Must provide direction and word", 400
    wr_content = translate_word(word, direction).decode()
    translation_strings = [
        asdict(translation) for translation in make_translations(wr_content)
    ]
    print(translation_strings)
    return {"translations": translation_strings}


@app.route("/api/get-decks")
def get_decks():
    print("Getting decks from Mochi")
    mochi_api_key = request.args.get("mochiApiKey")
    if mochi_api_key is None:
        return "Must provide Mochi API Key", 400

    response, code = mochi_get(f"{MOCHI_BASE_URL}/decks", mochi_api_key)
    if code == 400:
        print("returning", response, code)
        return response, code

    decks = []
    for deck_data in response.get("docs", []):
        deck = {
            "id": deck_data["id"],
            "name": deck_data["name"],
        }
        decks.append(deck)
    return {"decks": decks}


@app.route("/api/get-templates")
def get_templates():
    print("Getting Mochi templates")
    mochi_api_key = request.args.get("mochiApiKey")
    if mochi_api_key is None:
        return "Must provide Mochi API Key", 400

    response, code = mochi_get(f"{MOCHI_BASE_URL}/templates", mochi_api_key)
    if code == 400:
        print("returning", response, code)
        return response, code

    templates = []
    for template_data in response.get("docs", []):
        templates.append(
            {
                "id": template_data["id"],
                "name": template_data["name"],
                "fields": [
                    (field_dict["name"], field_dict["id"])
                    for field_dict in template_data["fields"].values()
                ],
            }
        )
    print(templates)
    return {"templates": templates}


@app.route("/api/upload", methods=["POST"])
def upload():
    data = request.get_json()

    mochi_api_key = data.get("mochiApiKey")
    if mochi_api_key is None:
        print("ÄSDFASDFASDFASDF")
        return "Must provide Mochi API Key", 400

    print(data)
    deck_id = "CjkJfr88"
    template_id = "y0aI44dC"
    template_id = "3ouJZnZR"

    for translation_dict in data.get("translations"):
        from_word = FromWord(**translation_dict["from_word"])
        to_words = [
            ToWord(**to_word) for to_word in translation_dict["to_words"]
        ]
        translation = Translation(
            translation_id=translation_dict["translation_id"],
            from_word=from_word,
            to_words=to_words,
        )
        card_data = {
            "content": "",
            "deck-id": deck_id,
            "template-id": template_id,
            "fields": make_fields(translation),
            "review-reverse?": True,
        }
        print(card_data)
        response, code = mochi_post(
            f"{MOCHI_BASE_URL}/cards", mochi_api_key, data=card_data
        )
        if code == 400:
            print("returning", response, code)
            return response, code
    return {}


def make_fields(translation: Translation):
    """
    Turn a translation into a dictionary of fields needed for Mochi to render a
    card.

    :param translation: the translation object
    :return: a dictionary with the mochi fields
    """
    return {
        "name": {
            "id": "name",
            "value": make_card_url_front(translation.from_word),
        },
        "V72yjxYh": {  # from_definition
            "id": "V72yjxYh",
            "value": make_card_url_back(translation.to_words),
        },
    }


primary_style = ""
secondary_style = "color: lab(47.7841 -0.393182 -10.0268); font-size: .75rem"


def make_card_url_front(word: FromWord) -> str:
    secondary_html = " "
    if word.sense:
        secondary_html += word.sense
        if word.part_of_speech:
            secondary_html += ", " + word.part_of_speech
    elif word.part_of_speech:
        secondary_html += word.part_of_speech
    html = f'{word.text}<span style="{secondary_style}">{secondary_html}</span>'
    return html


def make_card_url_back(words: list[ToWord]) -> str:
    translation_htmls = []
    for word in words:
        secondary_html = " "
        if word.sense:
            secondary_html += word.sense
            if word.part_of_speech:
                secondary_html += ", " + word.part_of_speech
        elif word.part_of_speech:
            secondary_html += word.part_of_speech
        if secondary_html:
            secondary_html = (
                f'<span style="{secondary_style}">{secondary_html}</span>'
            )
        translation_htmls.append(f"{word.text}{secondary_html}")
    return ", ".join(translation_htmls)


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
        print(f"Requests Exception: {e}")
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
