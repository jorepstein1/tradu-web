from word_reference_scraper import word_reference


def test_hola():
    with open("./tests/html_translation_samples/hola.html", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 2
    assert len(translations[0].to_words) == 3
    assert len(translations[0].expressions) == 1
    assert len(translations[1].to_words) == 1
    assert len(translations[1].expressions) == 1


def test_guau():
    with open("./tests/html_translation_samples/guau.html", "r", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 1
    assert len(translations[0].to_words) == 2
    assert len(translations[0].expressions) == 1


def test_ball():
    # TODO add support for compound forms
    with open("./tests/html_translation_samples/ball.html", "r", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 3
    assert len(translations[0].to_words) == 1
    assert len(translations[0].expressions) == 1
    assert len(translations[1].to_words) == 2
    assert len(translations[1].expressions) == 1
    assert len(translations[2].to_words) == 1
    assert len(translations[2].expressions) == 1


def test_tarada():
    with open("./tests/html_translation_samples/tarada.html", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    assert len(translations) == 6
    assert translations[0].from_word.text == "tarado"
    assert len(translations[0].to_words) == 1
    assert len(translations[0].expressions) == 1
    assert len(translations[1].to_words) == 3
    assert len(translations[1].expressions) == 1
    assert len(translations[2].to_words) == 4
    assert len(translations[2].expressions) == 1
    assert len(translations[3].to_words) == 2
    assert len(translations[3].expressions) == 1
    assert len(translations[4].to_words) == 2
    assert len(translations[4].expressions) == 1
    assert translations[5].from_word.text == "tarar"
    assert len(translations[5].to_words) == 1
    assert len(translations[5].expressions) == 1


def test_cool():
    with open("./tests/html_translation_samples/cool.html", "r", encoding="utf-8") as f:
        response_content = f.read()
    translations = word_reference.make_translations(response_content)
    # print(translations)
    for translation in translations:
        print(translation)
    assert len(translations) == 5
    assert len(translations[0].to_words) == 2
    assert len(translations[0].expressions) == 0  # really 2
    assert len(translations[1].to_words) == 2
    assert len(translations[1].expressions) == 0  # really 1 from, 2 to
    assert len(translations[2].to_words) == 2
    assert len(translations[2].expressions) == 1
    assert len(translations[3].to_words) == 4
    assert len(translations[3].expressions) == 1
    assert len(translations[4].to_words) == 1
    assert len(translations[4].expressions) == 0
