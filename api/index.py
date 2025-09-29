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


@app.route("/")
def home():
    return "Hello, World!"


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


@app.route("/api/upload", methods=["POST"])
def upload():
    data = request.get_json()
    deck_id = "CjkJfr88"
    template_id = "y0aI44dC"
    api_key = "424fdcb0088abe05a1bede5c"

    for translation_dict in data:
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
        resp = requests.post(
            "https://app.mochi.cards/api/cards",
            auth=(api_key, ""),
            json=card_data,
            timeout=10,
        )
        resp.raise_for_status()
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
            "value": translation.from_word.text,
        },
        "rO9TxZAt": {  # from_text
            "id": "rO9TxZAt",
            "value": translation.from_word.text,
        },
        "yFwrtZsR": {  # from_definition
            "id": "yFwrtZsR",
            "value": translation.from_word.definition,
        },
        "pUfmNiwj": {  # from_part_of_speech
            "id": "pUfmNiwj",
            "value": translation.from_word.part_of_speech,
        },
        "kkCnoBnQ": {  # from_sense
            "id": "kkCnoBnQ",
            "value": translation.from_word.sense,
        },
        "ltjpE7Br": {  # to_text
            "id": "ltjpE7Br",
            "value": translation.to_words[0].text,
        },
        "DLAEgyqd": {  # to_part_of_speech
            "id": "DLAEgyqd",
            "value": translation.to_words[0].part_of_speech,
        },
        "jLEjCQU5": {  # to_sense
            "id": "jLEjCQU5",
            "value": translation.to_words[0].sense,
        },
    }
