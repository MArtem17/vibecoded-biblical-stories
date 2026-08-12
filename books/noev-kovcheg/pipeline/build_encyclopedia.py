"""
ШАГ 7b — сборка book.data.js под ОБЩИЙ движок «Энциклопедия»
(core/engines/encyclopedia). Тот же движок, что в «Птицах мира», «Диких
животных», «Подводном мире» — 7 языков, караоке-озвучка, авто-переворот, RTL.

Формат (см. core/engines/encyclopedia/README.md):
  window.BOOK = { book_id, title, languages:[...], labels:{...}, pages:[...] }
  page = { n, layout:"top", img, text:{lang:...}, toc:{lang:...}, audio:{lang:path}? }

Текст берём из translations/<lang>.json (строго 1:1 со страницами). Картинки —
общие (img/page_NN.webp). audio подставляем только если файл уже есть
(озвучка — отдельный шаг tts.py); без mp3 движок читает голосом устройства.

  python pipeline/build_encyclopedia.py
"""

import json
from pathlib import Path

from common import CONFIG, BOOK, ROOT, page_image_path, page_audio_path

LABELS = {"ru": "RU", "en": "EN", "de": "DE", "es": "ES",
          "pt": "PT", "fr": "FR", "ar": "AR", "it": "IT"}


def load_translations():
    trans = {}
    for lang in CONFIG["languages"]:
        f = ROOT / "translations" / f"{lang}.json"
        if f.exists():
            trans[lang] = json.loads(f.read_text(encoding="utf-8"))
    master = BOOK["master_language"]
    trans.setdefault(master, [p["text"] for p in BOOK["pages"]])
    return trans


def toc_label(text):
    """Короткая метка для оглавления: первые слова первой фразы (без хвоста)."""
    first = text.replace("\n", " ").split(". ")[0].strip()
    if len(first) <= 32:
        return first.rstrip(".!?")
    cut = first[:32].rsplit(" ", 1)[0]
    return cut.rstrip(".!?,:;") + "…"


def main():
    trans = load_translations()
    langs = [l for l in CONFIG["languages"] if l in trans]

    pages = []
    for idx, p in enumerate(BOOK["pages"]):
        n = p["n"]
        text = {l: trans[l][idx] for l in langs}
        toc = {l: toc_label(trans[l][idx]) for l in langs}
        audio = {}
        for l in langs:
            ap = ROOT / page_audio_path(l, n)
            if ap.exists():
                audio[l] = page_audio_path(l, n)
        page = {
            "n": n,
            "layout": "top",          # текст в верхней (пустой) зоне поверх иллюстрации
            "img": page_image_path(n),
            "text": text,
            "toc": toc,
        }
        if audio:
            page["audio"] = audio
        pages.append(page)

    data = {
        "book_id": BOOK["book_id"],
        "title": BOOK["title"],
        "languages": langs,
        "labels": {l: LABELS.get(l, l.upper()) for l in langs},
        "pages": pages,
    }

    out = ROOT / "book.data.js"
    js = "window.BOOK = window.BOOK || " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    out.write_text(js, encoding="utf-8")
    have_audio = sum(1 for p in pages if p.get("audio"))
    print(f"Собрано (encyclopedia): {len(pages)} страниц, языки {langs}, с озвучкой {have_audio}.")
    print(f"→ {out.name}. Ридер: reader.html (движок core/engines/encyclopedia).")


if __name__ == "__main__":
    main()
