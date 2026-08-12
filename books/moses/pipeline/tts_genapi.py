"""
ШАГ 6 (вариант gen-api) — озвучка через gen-api.ru, модель gemini-3-1-tts.

Один голос (Kore) на все языки — единый «диктор» во всех изданиях. Текст берём
ДОСЛОВНО из translations/<lang>.json (движок-энциклопедия строит караоке по длине
слов, поэтому озвучка обязана слово-в-слово повторять text[lang]).

Асинхронный API:
  POST https://api.gen-api.ru/api/v1/networks/gemini-3-1-tts  -> {request_id}
  GET  https://api.gen-api.ru/api/v1/request/get/<id>          -> status/result[url]
Скачиваем mp3 -> audio/<lang>/NN.mp3, подрезаем тишину ffmpeg. Резюмируемо:
готовые файлы пропускаем.

  export GENAPI_KEY=...
  python pipeline/tts_genapi.py            # все языки
  python pipeline/tts_genapi.py ru en      # только выбранные
"""

import os
import sys
import json
import time
import subprocess
import tempfile
from pathlib import Path

from common import CONFIG, BOOK, ROOT, page_audio_path

API = "https://api.gen-api.ru/api/v1/networks/gemini-3-1-tts"
GET = "https://api.gen-api.ru/api/v1/request/get/"
KEY = os.environ["GENAPI_KEY"]
VOICE = os.environ.get("GENAPI_VOICE", "Kore")
# ВАЖНО: инструкция стиля должна быть НА ЯЗЫКЕ ОЗВУЧКИ. Русская инструкция
# заставляла gemini-3-1-tts читать любой текст по-русски (даже переводя его на
# лету). Язык инструкции = язык вывода — так модель не «сваливается» в русский.
STYLE_BY_LANG = {
    "ru": "Читай тёпло, неспешно и по-доброму, как добрый рассказчик читает детям сказку на ночь.",
    "en": "Read warmly, slowly and kindly, like a gentle narrator reading a bedtime story to young children.",
    "de": "Lies warm, langsam und liebevoll, wie ein sanfter Erzähler, der Kindern eine Gutenachtgeschichte vorliest.",
    "es": "Lee con calidez, despacio y con ternura, como un narrador amable que lee un cuento a los niños antes de dormir.",
    "pt": "Leia com carinho, devagar e com doçura, como um narrador gentil lendo uma história de ninar para crianças.",
    "fr": "Lis avec chaleur, lentement et avec douceur, comme un conteur bienveillant qui lit une histoire du soir aux enfants.",
    "ar": "اقرأ بدفء وهدوء ولطف، مثل راوٍ حنون يقرأ قصة ما قبل النوم للأطفال.",
}

# gen-api ждёт язык в формате «Language (Country)», не BCP-47 (проверено).
LANG_CODE = {
    "ru": "Russian (Russia)", "en": "English (US)", "de": "German (Germany)",
    "es": "Spanish (Spain)", "pt": "Portuguese (Brazil)",
    "fr": "French (France)", "ar": "Arabic (Egypt)",
}


def curl(args, timeout=60):
    r = subprocess.run(["curl", "-sS", "-m", str(timeout)] + args,
                       capture_output=True, text=True)
    return r.stdout


def submit(text, lang):
    body = json.dumps({
        "prompt": text,
        "voice": VOICE,
        "language_code": LANG_CODE[lang],
        "style_instructions": STYLE_BY_LANG.get(lang, STYLE_BY_LANG["en"]),
        "output_format": "mp3",
    }, ensure_ascii=False)
    out = curl(["-X", "POST", API,
                "-H", "Content-Type: application/json",
                "-H", f"Authorization: Bearer {KEY}",
                "-d", body])
    d = json.loads(out)
    if not d.get("request_id"):
        raise RuntimeError(f"submit failed [{lang}]: {out[:200]}")
    return d["request_id"]


def wait_url(rid, timeout=180):
    deadline = time.time() + timeout
    while time.time() < deadline:
        out = curl([GET + str(rid), "-H", f"Authorization: Bearer {KEY}"])
        try:
            d = json.loads(out)
        except Exception:
            time.sleep(4); continue
        st = d.get("status")
        if st == "success":
            res = d.get("result") or []
            if res:
                return res[0]
            raise RuntimeError(f"success but no result: {out[:200]}")
        if st == "error":
            raise RuntimeError(f"gen-api error: {out[:200]}")
        time.sleep(4)
    raise RuntimeError(f"timeout waiting for {rid}")


def trim_silence(path):
    """Убрать тишину ТОЛЬКО в начале и конце (двухпроходно через areverse).
    НЕ трогаем паузы внутри клипа — иначе речь с межфразовыми паузами
    обрезается по первой же паузе (был баг stop_periods=1)."""
    if not CONFIG["tts"].get("trim_silence", True):
        return
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tf:
        tmp = tf.name
    trim = "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB"
    cmd = ["ffmpeg", "-y", "-i", str(path), "-af",
           f"{trim},areverse,{trim},areverse", tmp]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode == 0 and os.path.getsize(tmp) > 0:
        os.replace(tmp, path)
    else:
        os.path.exists(tmp) and os.remove(tmp)


def synth_page(lang, n, text):
    out = ROOT / page_audio_path(lang, n)
    if out.exists() and out.stat().st_size > 0:
        print(f"    [{lang}] стр.{n:>2} — уже есть, пропуск")
        return True
    out.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(5):
        try:
            rid = submit(text, lang)
            url = wait_url(rid)
            curl(["-o", str(out), url], timeout=90)
            if out.exists() and out.stat().st_size > 0:
                trim_silence(out)
                print(f"    [{lang}] стр.{n:>2} → {out.relative_to(ROOT)}")
                return True
        except Exception as e:
            print(f"    [{lang}] стр.{n:>2} попытка {attempt+1}: {e}")
            time.sleep(3 * (attempt + 1))  # backoff, чтобы переждать сбои API
    # Не валим весь прогон из-за одной страницы: пропускаем (на ней будет
    # чтение голосом устройства), помечаем и идём дальше.
    print(f"    [{lang}] стр.{n:>2} ПРОПУЩЕНА после 5 попыток — доозвучить позже")
    return False


def main(langs=None):
    langs = langs or CONFIG["languages"]
    trans_dir = ROOT / "translations"
    skipped = []
    for lang in langs:
        tfile = trans_dir / f"{lang}.json"
        if not tfile.exists():
            print(f"  [{lang}] нет перевода — пропуск")
            continue
        texts = json.loads(tfile.read_text(encoding="utf-8"))
        print(f"  [{lang}] голос {VOICE} — {len(texts)} страниц")
        for i, text in enumerate(texts, start=1):
            n = BOOK["pages"][i - 1]["n"]
            if not synth_page(lang, n, text):
                skipped.append(f"{lang}/{n}")
    if skipped:
        print("ПРОПУЩЕНЫ (перезапусти скрипт — резюмируемо):", ", ".join(skipped))
    print("Готово. Пересобери данные: python pipeline/build_encyclopedia.py")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
