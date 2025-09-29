from flask import Flask, request
from word_reference_scraper.word_reference import (
    translate_word,
    make_translations,
)
from dataclasses import asdict
import logging

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
    if request.method == "POST":
        data = request.get_json()
        print(data)
    return {}
