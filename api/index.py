from flask import Flask, request
from translate.word_reference import translate_word, make_translations
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
    wr_content = translate_word(word, direction).decode()
    translation_strings = [
        asdict(translation) for translation in make_translations(wr_content)
    ]
    print(translation_strings)
    return {"translations": translation_strings}


if __name__ == "__main__":
    app.run(debug=True)
