"""
ШАГ 3 — иллюстрации страниц (ОБЩИЕ для всех языков, генерим ОДИН раз).

Цикл по страницам book.json:
  - есть персонаж  → images.edit(эталон) + блок PRESERVE («что сохранить»)
  - нет персонажа  → images.edit(эталон) как референс стиля + NO_CHARACTER

Каждый вызов API возвращает ОДИН файл — коллаж невозможен в принципе, поэтому
никакой анти-коллажной шапки в промпте не нужно. Результат → WebP 820.

Важно: НЕ используем input_fidelity — на gpt-image-2 он не работает (модель и так
high-fidelity), идентичность держит сам.

  export OPENAI_API_KEY=...
  python pipeline/gen_images.py            # все страницы
  python pipeline/gen_images.py 6 11       # только страницы 6 и 11 (перегенерация)
"""

import sys
from pathlib import Path
from openai import OpenAI

from common import CONFIG, BOOK, ROOT, build_page_prompt, save_webp_from_b64, page_image_path

oai = OpenAI()


def gen_one(page):
    img = CONFIG["image"]
    anchor = ROOT / CONFIG["paths"]["anchor"]
    if not anchor.exists():
        raise SystemExit(f"Нет эталона {anchor}. Сначала: python pipeline/gen_anchor.py")

    prompt = build_page_prompt(page)
    with open(anchor, "rb") as f:
        res = oai.images.edit(
            model=img["model"],
            image=[f],
            prompt=prompt,
            size=img["size"],
            quality=img["quality"],
        )
    out = ROOT / page_image_path(page["n"])
    save_webp_from_b64(res.data[0].b64_json, out)
    flag = "персонаж" if page["character_present"] else "без персонажа"
    print(f"  стр.{page['n']:>2} ({flag}) → {out.relative_to(ROOT)}")


def main(only=None):
    pages = BOOK["pages"]
    if only:
        only = set(int(x) for x in only)
        pages = [p for p in pages if p["n"] in only]
    print(f"Генерю {len(pages)} страниц(ы) ({CONFIG['image']['model']}, quality={CONFIG['image']['quality']})…")
    for p in pages:
        gen_one(p)
    print("Готово. Дальше — QA: python pipeline/qa_vision.py")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
