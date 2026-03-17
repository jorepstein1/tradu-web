from word_reference_scraper import word_reference


def test_hola():
    """
    Test the es->en translation of "hola". "hola" has principal translations,
    additional translations, and compound forms. The "¡hola!" "from" word has a
    sense (informal).
    """
    with open("./tests/html_translation_samples/hola.html", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 2
    assert len(translations[0].to_words) == 3
    assert len(translations[0].from_expressions) == 1
    assert len(translations[0].to_expressions) == 1
    assert len(translations[1].to_words) == 1
    assert len(translations[1].from_expressions) == 1
    assert len(translations[1].to_expressions) == 1


def test_guau():
    """
    Test the es->en translation of "guau". "guau" has one principal translation
    and two additional translations.
    """
    with open("./tests/html_translation_samples/guau.html", "r", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 1
    assert len(translations[0].to_words) == 2
    assert len(translations[0].from_expressions) == 1
    assert len(translations[0].to_expressions) == 1


def test_ball():
    """
    Test the translation of "ball". "ball" has principal translations,
    additional translations, locuciones verbales, and many compound forms.
    """
    # TODO add support for compound forms
    with open("./tests/html_translation_samples/ball.html", "r", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 3
    assert len(translations[0].to_words) == 1
    assert len(translations[0].from_expressions) == 1
    assert len(translations[0].to_expressions) == 1
    assert len(translations[1].to_words) == 2
    assert len(translations[1].from_expressions) == 1
    assert len(translations[1].to_expressions) == 1
    assert len(translations[2].to_words) == 1
    assert len(translations[2].from_expressions) == 1
    assert len(translations[2].to_expressions) == 1


def test_tarada():
    """
    Test the translation of "tarada". "tarada" has principal translations,
    additional translations, and a second set of principal translations. The
    "to" word expressions has parantheses in it, which caused an issue with
    parsing.
    """
    with open("./tests/html_translation_samples/tarada.html", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 6
    assert translations[0].from_word.text == "tarado"
    assert len(translations[0].to_words) == 1
    assert len(translations[0].from_expressions) == 1
    assert len(translations[0].to_expressions) == 1
    assert len(translations[1].to_words) == 3
    assert len(translations[1].from_expressions) == 1
    assert len(translations[1].to_expressions) == 1
    assert len(translations[2].to_words) == 4
    assert len(translations[2].from_expressions) == 1
    assert len(translations[2].to_expressions) == 1
    assert len(translations[3].to_words) == 2
    assert len(translations[3].from_expressions) == 1
    assert len(translations[3].to_expressions) == 1
    assert translations[3].to_expressions[0] == "Only a jerk (or:  moron) goes out without an umbrella when it's raining."
    assert len(translations[4].to_words) == 2
    assert len(translations[4].from_expressions) == 1
    assert len(translations[4].to_expressions) == 1
    assert translations[5].from_word.text == "tarar"
    assert len(translations[5].to_words) == 1
    assert len(translations[5].from_expressions) == 1
    assert len(translations[5].to_expressions) == 1


def test_cool():
    """
    Test the translation of "cool". "cool" has principal translations,
    additional translations, locuciones verbales, and compound forms. 
    
    One of "cool"'s translations, the interjection, has multiple "to" words and
    these "to" words all have different "senses." E.g. informal, (AmC, CO, 
    EV, VE: coloquial), or (ES: coloquial).
    """
    with open("./tests/html_translation_samples/cool.html", "r", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    # print(translations)
    for translation in translations:
        print(translation)
    assert len(translations) == 5
    assert len(translations[0].to_words) == 2
    assert len(translations[0].from_expressions) == 2
    assert len(translations[0].to_expressions) == 2
    assert len(translations[1].to_words) == 2
    assert len(translations[1].from_expressions) == 1
    assert len(translations[1].to_expressions) == 2
    assert len(translations[2].to_words) == 2
    assert len(translations[2].from_expressions) == 1
    assert len(translations[2].to_expressions) == 1
    assert len(translations[3].to_words) == 4
    assert len(translations[3].from_expressions) == 1
    assert len(translations[3].to_expressions) == 1
    assert len(translations[4].to_words) == 1
    assert len(translations[4].from_expressions) == 0
    assert len(translations[4].to_expressions) == 0
