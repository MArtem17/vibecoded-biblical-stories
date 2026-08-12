"""
Озвучка книги тома: assets/audio/<lang>/page-NN.mp3 (обложка + развороты).

ВАЖНО (инвариант движка): озвучка ДОСЛОВНО повторяет text[lang] разворота —
караоке оценивает тайминги по длине слов. Голос Kore (gen-api) один на все
языки; style_instructions строго НА ЯЗЫКЕ озвучки (грабля из
docs/audiobook-pipeline.md §6); тишина по краям; язык клипа проверяется
whisper-1.

  export GENAPI_KEY=... OPENAI_API_KEY=...
  python pipeline/tts_book.py                # ru, все страницы
  python pipeline/tts_book.py ru 01          # обложка
  python pipeline/tts_book.py de fr es       # эти языки целиком
"""

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

sys.path.insert(0, str(HERE))
import tts_cards
from tts_cards import wait_url, trim_silence, whisper_lang, curl  # noqa: E402

STYLE_BY_LANG = {
    "ru": "Читай тёпло, неспешно и по-доброму, как добрый рассказчик читает детям сказку.",
    "en": "Read warmly, slowly and kindly, like a gentle narrator reading a story to young children.",
    "de": "Lies warm, langsam und liebevoll, wie ein sanfter Erzähler, der Kindern eine Geschichte vorliest.",
    "es": "Lee con calidez, despacio y con ternura, como un narrador amable que lee un cuento a los niños.",
    "pt": "Leia com carinho, devagar e com doçura, como um narrador gentil lendo uma história para crianças.",
    "fr": "Lis avec chaleur, lentement et avec douceur, comme un conteur bienveillant qui lit une histoire aux enfants.",
    "ar": "اقرأ بدفء وهدوء ولطف، مثل راوٍ حنون يقرأ قصة للأطفال.",
}
LANG_CODE = {
    "ru": "Russian (Russia)", "en": "English (US)", "de": "German (Germany)",
    "es": "Spanish (Spain)", "pt": "Portuguese (Brazil)",
    "fr": "French (France)", "ar": "Arabic (Egypt)",
}
WHISPER_NAME = {"ru": "russian", "en": "english", "de": "german", "es": "spanish",
                "pt": "portuguese", "fr": "french", "ar": "arabic"}

def submit(text, lang="ru"):
    import json as _json, subprocess as _sp
    body = _json.dumps({
        "prompt": text, "voice": tts_cards.VOICE,
        "language_code": LANG_CODE[lang],
        "style_instructions": STYLE_BY_LANG[lang],
        "output_format": "mp3",
    }, ensure_ascii=False)
    out = curl(["-X", "POST", tts_cards.API, "-H", "Content-Type: application/json",
                "-H", "Authorization: Bearer " + tts_cards.KEY, "-d", body])
    d = _json.loads(out)
    if not d.get("request_id"):
        raise RuntimeError("submit failed: " + out[:200])
    return d["request_id"]


def pages(lang):
    volume = json.loads((HERE / "volume.master.json").read_text(encoding="utf-8"))
    out = [("01", volume["title"].get(lang) or volume["title"]["ru"])]
    for i, p in enumerate(volume["plots"]):
        n = i + 2
        out.append(("%02d" % n, p["story"].get(lang) or p["story"]["ru"]))
    for i, p in enumerate(volume.get("ntPages") or []):
        n = len(volume["plots"]) + 2 + i
        out.append(("%02d" % n, p["story"].get(lang) or p["story"]["ru"]))
    return out


def synth(lang, nn, text):
    out = ROOT / "assets" / "audio" / lang / ("page-%s.mp3" % nn)
    if out.exists() and out.stat().st_size > 0:
        print("  page-%s — уже есть, пропуск" % nn)
        return True
    out.parent.mkdir(parents=True, exist_ok=True)
    import time
    for attempt in range(5):
        try:
            url = wait_url(submit(text, lang))
            curl(["-o", str(out), url], timeout=120)
            if out.exists() and out.stat().st_size > 0:
                trim_silence(out)
                got = whisper_lang(out)
                want = WHISPER_NAME[lang]
                if got and got.lower() not in (want, lang):
                    print("  [%s] page-%s: язык «%s» — перегенерация" % (lang, nn, got))
                    out.unlink()
                    continue
                print("  [%s] page-%s → OK (%s)" % (lang, nn, got))
                return True
        except Exception as e:
            print("  page-%s попытка %d: %s" % (nn, attempt + 1, e))
            time.sleep(3 * (attempt + 1))
    print("  page-%s ПРОПУЩЕНА — доозвучить позже (движок дочитает синтезом)" % nn)
    return False


def main(args=None):
    args = list(args or [])
    langs = [a for a in args if a in LANG_CODE] or ["ru"]
    only = set(a for a in args if a not in LANG_CODE)
    for lang in langs:
        todo = [(nn, t) for nn, t in pages(lang) if not only or nn in only]
        print("Озвучиваю %d стр. книги [%s] (Kore, дословно по text.%s)…" % (len(todo), lang, lang))
        fails = [nn for nn, t in todo if not synth(lang, nn, t)]
        print("Готово [%s]." % lang + (" Пропущены: " + ", ".join(fails) if fails else ""))


if __name__ == "__main__":
    main(sys.argv[1:] or None)
