import curl_cffi
import dataclasses
from parsel import Selector
import pprint


@dataclasses.dataclass
class FromWord:
    text: str
    definition: str
    part_of_speech: str
    sense: str


@dataclasses.dataclass
class ToWord:
    text: str
    part_of_speech: str
    sense: str


@dataclasses.dataclass
class Expression:
    from_expression: str
    to_expression: str


@dataclasses.dataclass
class Translation:
    translation_id: int
    from_word: FromWord
    to_words: list[ToWord]
    expressions: list[Expression]


def _sanitize_string(text: str) -> str:
    text = text.strip()
    if text:
        if text[0] == "(":
            text = text[1:]
        if text[-1] == ")":
            text = text[:-1]
    return text


def make_translation_from_trs(trs: list[Selector], idx: int) -> Translation:
    from_word = None
    to_words = []
    from_expressions = []
    to_expressions = []
    for tr in trs:
        tds = tr.css("td")
        if len(tds) == 3:
            # translation row
            if tds[0].css(".FrWrd"):
                # first row (e.g. with from text + definition)
                from_text = tds[0].css("strong::text").get()  # e.g.hello
                if from_text is None:
                    raise ValueError("From Word should not be None")
                from_part_of_speech = tds[0].css("em::text").get() or ""
                # e.g. interj (interjection)
                # Definition can take a few forms including a definition
                # and optionally a fr2 and a dsense
                # fr2 qualifies the definitioin (sense)
                # dsense qualifiies the translation (sense)
                # definition iis not wrapped in a tag, and contains text in parantheses
                # fr2 is in <i class="Fr2">
                # dsense is in <span class="dsense">  => () => <span /> => Val
                definition = tds[1]  # e.g. greeting
                definition_td = tds[1]

                if fr2_i := definition_td.css("i::text"):
                    fr2_text = fr2_i.get() or ""  # e.g. informal
                else:
                    fr2_text = ""
                definition.css("i").drop()

                if (definition := definition_td.css("::text").get()) is None:
                    raise ValueError("Definition should not be None")
                else:
                    definition = definition.strip()
                from_word = FromWord(
                    text=from_text,
                    definition=_sanitize_string(definition),
                    part_of_speech=from_part_of_speech,
                    sense=fr2_text,
                )
            to_word = create_to_word(tds[1], tds[2])
            to_words.append(to_word)
        elif len(tds) == 2:
            if tooltip := tds[1].css("span.tooltip"):
                if tooltip.css("b::text").get() == "ⓘ":
                    # there is some tooltip, probably explaining that this expression
                    # is not a direct translation of other example expressions
                    print(
                        f"Skipping expression with tooltip: {tooltip.css('span::text').get()}"
                    )
                    continue
            if tds[1].css(".FrEx"):
                from_expressions.append(tds[1].css("span::text").get())
            if tds[1].css(".ToEx"):
                to_expressions.append(tds[1].css("td::text").get())
            # if tds[1]
            # phrase translation
            pass
        elif len(tds) == 1:
            # Notes (Uncommon)
            pass
        else:
            raise ValueError("Unrecognized tr")

    if from_word is None:
        raise ValueError("from_word should not be None")
    expressions = []
    if len(from_expressions) == 1 and len(to_expressions) == 1:
        expressions.append(
            Expression(
                from_expression=from_expressions[0],
                to_expression=to_expressions[0],
            )
        )
    return Translation(
        from_word=from_word,
        to_words=to_words,
        translation_id=idx,
        expressions=expressions,
    )


def create_to_word(td1, td2) -> ToWord:
    dsense_text = td1.css("span span::text").get() or ""
    to_td = td2
    if not to_td.attrib.get("class") == "ToWrd":
        raise ValueError("Third td should have ToWrd class")
    to_part_of_speech = td2.css(".POS2")
    if to_part_of_speech := td2.css(".POS2"):
        to_part_of_speech_text = to_part_of_speech.css("::text").get() or ""
        to_part_of_speech.drop()  # to isolate the to text
    else:
        to_part_of_speech_text = ""
    to_text = to_td.css("::text").get()
    if not to_text:
        raise ValueError("To Text should not be None")
    to_word = ToWord(
        text=_sanitize_string(to_text),
        part_of_speech=_sanitize_string(to_part_of_speech_text),
        sense=_sanitize_string(dsense_text),
    )
    return to_word


def translate_word(word: str, direction: str) -> bytes:
    if direction == "enes":
        url = (
            f"https://www.wordreference.com/es/translation.asp?tranword={word}"
        )
    elif direction == "esen":
        url = f"https://www.wordreference.com/es/en/translation.asp?spen={word}"
    else:
        raise ValueError(f"Invalid value for direction: {direction}")
    print(url)
    response = curl_cffi.get(url, impersonate="chrome")
    return response.content


def make_translations(html_content: str) -> list[Translation]:
    selector = Selector(html_content)
    tables = selector.css("table .WRD")
    # table ids can be regular, phrasal, additional, compounds
    # I've found an example where there can be two regular tables

    # ONLY PARSING "REGULAR" TABLE FOR NOW
    translation_trs = {"regular": []}
    for table in tables:
        if not table.css("td#regular"):
            continue
        print("Processing 'regular' table.")

        cur_translation: list[Selector] = []
        trs = table.css("tr")
        for tr in trs:
            if tr.css(".langHeader") or tr.css(".wrtopsection"):
                continue
            tr_id = tr.attrib.get("id")
            # the first row of a translation always has an id
            if tr_id and (tr_id.startswith("enes") or tr_id.startswith("esen")):
                if cur_translation:
                    translation_trs["regular"].append(cur_translation)
                    cur_translation = []
            cur_translation.append(tr)
        translation_trs["regular"].append(cur_translation)
    print(
        f"    There are {len(translation_trs['regular'])} regular translations"
    )
    translation_objs = []
    for idx, translation in enumerate(translation_trs["regular"]):
        print(f"Processing translation {idx}")
        translation_obj = make_translation_from_trs(translation, idx)
        pprint.pprint(dataclasses.asdict(translation_obj))
        translation_objs.append(make_translation_from_trs(translation, idx))
        print("----")
    return translation_objs
