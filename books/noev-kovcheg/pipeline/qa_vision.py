"""
ШАГ 4 — авто-QA через зрение Claude (один раз на книгу, не на язык).

Каждую готовую страницу проверяем по двум критериям:
  (а) верхние ~40% достаточно пустые/светлые под текст;
  (б) если персонаж есть — совпадает ли он с эталоном.

Claude возвращает строгий JSON. Что не прошло — печатаем списком, чтобы ты
перегенерил точечно: python pipeline/gen_images.py 8 12

  export ANTHROPIC_API_KEY=...
  python pipeline/qa_vision.py
"""

import json
from pathlib import Path
import anthropic

from common import CONFIG, BOOK, ROOT, file_to_b64, page_image_path

client = anthropic.Anthropic()
MODEL = CONFIG["claude_model"]

QA_INSTRUCTIONS = (
    "Ты — контролёр качества детской книги. Тебе дают эталон персонажа (если есть) "
    "и иллюстрацию страницы. Проверь строго:\n"
    "1) top_clear: верхние примерно 40% страницы достаточно пустые и светлые, "
    "чтобы поверх лёг текст в 4–5 строк и остался читаемым? (true/false)\n"
    "2) character_ok: совпадает ли человек на странице с эталоном по лицу, волосам, "
    "бороде, одежде (хитон+накидка), посоху? Если на странице персонажа быть не "
    "должно — верни null.\n"
    "Ответь ТОЛЬКО JSON-объектом без пояснений: "
    '{"top_clear": bool, "character_ok": bool|null, "notes": "кратко по-русски"}'
)


def check(page, anchor_b64):
    content = []
    if page["character_present"] and anchor_b64:
        content.append({"type": "text", "text": "ЭТАЛОН персонажа:"})
        content.append({"type": "image", "source": {
            "type": "base64", "media_type": "image/png", "data": anchor_b64}})
    content.append({"type": "text", "text": f"Страница {page['n']}:"})
    content.append({"type": "image", "source": {
        "type": "base64", "media_type": "image/webp",
        "data": file_to_b64(ROOT / page_image_path(page["n"]))}})
    content.append({"type": "text", "text": QA_INSTRUCTIONS})

    msg = client.messages.create(
        model=MODEL, max_tokens=400,
        messages=[{"role": "user", "content": content}],
    )
    raw = msg.content[0].text.strip().strip("`")
    if raw.startswith("json"):
        raw = raw[4:]
    return json.loads(raw)


def main():
    anchor = ROOT / CONFIG["paths"]["anchor"]
    anchor_b64 = file_to_b64(anchor) if anchor.exists() else None

    failed = []
    for page in BOOK["pages"]:
        img = ROOT / page_image_path(page["n"])
        if not img.exists():
            print(f"  стр.{page['n']:>2}  — нет файла, пропуск")
            continue
        r = check(page, anchor_b64)
        ok = r["top_clear"] and (r["character_ok"] in (True, None))
        mark = "OK " if ok else "FAIL"
        print(f"  стр.{page['n']:>2}  [{mark}] top_clear={r['top_clear']} "
              f"character_ok={r['character_ok']}  {r.get('notes','')}")
        if not ok:
            failed.append(page["n"])

    print()
    if failed:
        print("Перегенерировать:  python pipeline/gen_images.py " + " ".join(map(str, failed)))
    else:
        print("Все страницы прошли. Дальше — перевод: python pipeline/translate.py")


if __name__ == "__main__":
    main()
