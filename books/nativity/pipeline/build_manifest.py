"""
ШАГ 7 — сборка данных для ридера.

Складываем всё в один файл book_data.js (window.BOOK = {...}). Формат отражает
главный принцип: КАРТИНКА ОДНА на странице (общая для языков), а text и audio —
словари по языку. Ридер при переключении языка меняет только текст и аудио.

book_data.js подключается ридером как <script>, поэтому работает офлайн через
file:// без сервера и без CORS.

  python pipeline/build_manifest.py
"""

import json
from pathlib import Path

from common import CONFIG, BOOK, ROOT, page_image_path, page_audio_path

LABELS = {"ru": "RU", "en": "EN", "de": "DE", "es": "ES", "fr": "FR", "it": "IT"}


def load_translations():
    trans = {}
    for lang in CONFIG["languages"]:
        f = ROOT / "translations" / f"{lang}.json"
        if f.exists():
            trans[lang] = json.loads(f.read_text(encoding="utf-8"))
    # мастер всегда есть из book.json, даже если translate.py ещё не гоняли
    master = BOOK["master_language"]
    trans.setdefault(master, [p["text"] for p in BOOK["pages"]])
    return trans


def main():
    trans = load_translations()
    langs = [l for l in CONFIG["languages"] if l in trans]

    pages = []
    for i, p in enumerate(BOOK["pages"]):
        n = p["n"]
        img = page_image_path(n)
        text = {l: trans[l][i] for l in langs}
        audio = {}
        for l in langs:
            ap = ROOT / page_audio_path(l, n)
            if ap.exists():
                audio[l] = page_audio_path(l, n)  # есть готовая озвучка
        pages.append({"n": n, "img": img, "text": text, "audio": audio})

    data = {
        "book_id": BOOK["book_id"],
        "title": BOOK["title"],
        "languages": langs,
        "labels": {l: LABELS.get(l, l.upper()) for l in langs},
        "pages": pages,
    }

    out = ROOT / CONFIG["paths"]["out_data"]
    js = "window.BOOK = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    out.write_text(js, encoding="utf-8")
    have_audio = sum(1 for p in pages if p["audio"])
    print(f"Собрано: {len(pages)} страниц, языки {langs}, с озвучкой {have_audio}.")
    print(f"→ {out.name}.  Открой reader.html.")


if __name__ == "__main__":
    main()
