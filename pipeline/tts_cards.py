"""
Озвучка карт (ru): gen-api gemini-3-1-tts, голос Kore — тот же диктор, что в
книгах Моисея и Ноя. 40 треков: герои = имя + эпитет + 3 факта, сюжеты =
название + пересказ. Аудиоблок на карте — без длительности (инвариант).

Подводные камни учтены по docs/audiobook-pipeline.md §6: style_instructions
на языке озвучки; тишина режется только по краям (двухпроходно areverse);
язык каждого клипа проверяется транскрипцией whisper-1. Резюмируемо.

  export GENAPI_KEY=... OPENAI_API_KEY=...
  python pipeline/tts_cards.py               # ru, все 40
  python pipeline/tts_cards.py en            # английский целиком
  python pipeline/tts_cards.py en heroes_01  # выборочно
"""

import json
import os
import subprocess
import sys
import tempfile
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent

API = "https://api.gen-api.ru/api/v1/networks/gemini-3-1-tts"
GET = "https://api.gen-api.ru/api/v1/request/get/"
KEY = os.environ["GENAPI_KEY"]
VOICE = os.environ.get("GENAPI_VOICE", "Kore")
STYLE_BY_LANG = {
    "ru": "Читай тёпло, неспешно и по-доброму, как добрый рассказчик читает детям сказку. Между предложениями делай небольшие паузы.",
    "en": "Read warmly, unhurriedly and kindly, like a gentle storyteller reading to children. Make short pauses between sentences.",
    "de": "Lies warm, gemächlich und liebevoll, wie ein sanfter Erzähler für Kinder. Mache kurze Pausen zwischen den Sätzen.",
    "es": "Lee con calidez, sin prisa y con ternura, como un narrador amable para niños. Haz pausas breves entre frases.",
    "fr": "Lis avec chaleur, sans hâte et avec douceur, comme un conteur bienveillant pour les enfants. Fais de courtes pauses entre les phrases.",
    "pt": "Leia com carinho, sem pressa e com doçura, como um narrador gentil para crianças. Faça pausas curtas entre as frases.",
    "ar": "اقرأ بدفء وتمهُّل ولطف، مثل راوٍ حنون يقرأ للأطفال. اترك وقفات قصيرة بين الجمل.",
}
LANG_CODE = {
    "ru": "Russian (Russia)", "en": "English (US)", "de": "German (Germany)",
    "es": "Spanish (Spain)", "pt": "Portuguese (Brazil)",
    "fr": "French (France)", "ar": "Arabic (Egypt)",
}
WHISPER_NAME = {"ru": "russian", "en": "english", "de": "german", "es": "spanish",
                "pt": "portuguese", "fr": "french", "ar": "arabic"}


def curl(args, timeout=90):
    r = subprocess.run(["curl", "-sS", "-m", str(timeout)] + args,
                       capture_output=True, text=True)
    return r.stdout


def submit(text, lang="ru"):
    body = json.dumps({
        "prompt": text, "voice": VOICE,
        "language_code": LANG_CODE[lang],
        "style_instructions": STYLE_BY_LANG[lang],
        "output_format": "mp3",
    }, ensure_ascii=False)
    out = curl(["-X", "POST", API, "-H", "Content-Type: application/json",
                "-H", "Authorization: Bearer " + KEY, "-d", body])
    d = json.loads(out)
    if not d.get("request_id"):
        raise RuntimeError("submit failed: " + out[:200])
    return d["request_id"]


def wait_url(rid, timeout=240):
    deadline = time.time() + timeout
    while time.time() < deadline:
        out = curl([GET + str(rid), "-H", "Authorization: Bearer " + KEY])
        try:
            d = json.loads(out)
        except Exception:
            time.sleep(4); continue
        st = d.get("status")
        if st == "success":
            res = d.get("result") or []
            if res:
                return res[0]
            raise RuntimeError("success but no result: " + out[:200])
        if st == "error":
            raise RuntimeError("gen-api error: " + out[:200])
        time.sleep(4)
    raise RuntimeError("timeout " + str(rid))


def trim_silence(path):
    """Тишина ТОЛЬКО по краям (двухпроходно через areverse) — не трогаем паузы внутри."""
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tf:
        tmp = tf.name
    trim = "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB"
    r = subprocess.run(["ffmpeg", "-y", "-i", str(path), "-af",
                        trim + ",areverse," + trim + ",areverse", tmp],
                       capture_output=True)
    if r.returncode == 0 and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
    elif os.path.exists(tmp):
        os.remove(tmp)


def whisper_lang(path):
    """Язык клипа по whisper-1 (verbose_json → language)."""
    from openai import OpenAI
    with open(path, "rb") as f:
        tr = OpenAI().audio.transcriptions.create(
            model="whisper-1", file=f, response_format="verbose_json")
    return getattr(tr, "language", None)


def tracks(lang="ru"):
    volume = json.loads((HERE / "volume.master.json").read_text(encoding="utf-8"))
    def L(o):
        return o.get(lang) or o["ru"]
    out = []
    for h in volume["heroes"]:
        ep = L(h["epithet"])
        text = "%s — %s.\n\n%s" % (L(h["name"]), ep[0].lower() + ep[1:],
                                   "\n\n".join(L(h["facts"])))
        out.append((h["id"], h["slug"], text))
    for p in volume["plots"]:
        out.append((p["id"], p["slug"], "%s.\n\n%s" % (L(p["name"]), L(p["story"]))))
    return out


def synth(lang, card_id, slug, text):
    out = ROOT / "audio" / lang / ("%s_%s.mp3" % (card_id, slug))
    if out.exists() and out.stat().st_size > 0:
        print("  %s — уже есть, пропуск" % card_id)
        return True
    out.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(5):
        try:
            url = wait_url(submit(text, lang))
            curl(["-o", str(out), url], timeout=120)
            if out.exists() and out.stat().st_size > 0:
                trim_silence(out)
                got = whisper_lang(out)
                if got and got.lower() not in (WHISPER_NAME[lang], lang):
                    print("  [%s] %s: язык «%s» — перегенерация" % (lang, card_id, got))
                    out.unlink()
                    continue
                print("  [%s] %s → %s (%s)" % (lang, card_id, out.name, got))
                return True
        except Exception as e:
            print("  %s попытка %d: %s" % (card_id, attempt + 1, e))
            time.sleep(3 * (attempt + 1))
    print("  %s ПРОПУЩЕН после 5 попыток — доозвучить позже" % card_id)
    return False


def main(args=None):
    args = list(args or [])
    langs = [a for a in args if a in LANG_CODE] or ["ru"]
    only = set(a for a in args if a not in LANG_CODE)
    for lang in langs:
        todo = [(i, s, t) for i, s, t in tracks(lang) if not only or i in only]
        print("Озвучиваю %d карт [%s] (Kore)…" % (len(todo), lang))
        fails = [i for i, s, t in todo if not synth(lang, i, s, t)]
        print("Готово [%s]." % lang + (" Пропущены: " + ", ".join(fails) if fails else ""))


if __name__ == "__main__":
    main(sys.argv[1:] or None)
