"""
ШАГ 5 — перевод текста на целевые языки (Claude).

Жёсткие правила перевода, чтобы продукт не разъехался:
  - строго 1:1 по страницам (не сливать и не дробить — иначе разойдётся с
    картинками и аудио);
  - детская интонация, коротко, естественно;
  - длина каждой строки не больше max_length_ratio от оригинала (чтобы влезала
    в тот же текстовый бокс на картинке).

Результат пишем в translations/<lang>.json (список строк в порядке страниц).
Мастер-язык не переводим — берём как есть.

  export ANTHROPIC_API_KEY=...
  python pipeline/translate.py
"""

import json
from pathlib import Path
import anthropic

from common import CONFIG, BOOK, ROOT

client = anthropic.Anthropic()
MODEL = CONFIG["claude_model"]

LANG_NAMES = {"ru": "русский", "en": "английский", "de": "немецкий",
              "es": "испанский", "pt": "португальский", "fr": "французский",
              "ar": "арабский", "it": "итальянский"}


# Переводим КАЖДУЮ страницу отдельным вызовом: одна страница на входе — одна
# строка на выходе. Так модель физически не может ни слить, ни раздробить
# страницы (на батче из 16 строк она это делает — путает границы на прямой речи),
# и результат всегда строго 1:1 с картинками и аудио. Строку возвращаем через
# инструмент со схемой — это снимает проблему кавычек прямой речи в JSON.
TRANSLATE_TOOL = {
    "name": "return_translation",
    "description": "Вернуть перевод ОДНОЙ страницы одной строкой.",
    "input_schema": {
        "type": "object",
        "properties": {
            "text": {"type": "string", "description": "Перевод страницы одной строкой."}
        },
        "required": ["text"],
    },
}


def translate_one(lang, text):
    ratio = CONFIG["translation"]["max_length_ratio"]
    audience = CONFIG["translation"]["audience"]
    prompt = (
        f"Переведи ОДНУ страницу детской книги на {LANG_NAMES.get(lang, lang)} язык.\n"
        f"Аудитория: {audience}. Тон тёплый, простой, естественный для этого языка "
        f"(не дословно, а как изначально написанная детская книга).\n"
        f"Верни РОВНО один перевод этой страницы одной строкой (не дробить на "
        f"несколько, ничего не добавлять). Длина не больше ~{int(ratio*100)}% "
        f"оригинала. Прямую речь оформляй типографскими кавычками целевого языка.\n"
        f"Верни результат вызовом инструмента return_translation.\n\n"
        f"Страница:\n{text}"
    )
    for attempt in range(3):
        msg = client.messages.create(
            model=MODEL, max_tokens=1000,
            tools=[TRANSLATE_TOOL],
            tool_choice={"type": "tool", "name": "return_translation"},
            messages=[{"role": "user", "content": prompt}],
        )
        block = next((b for b in msg.content if b.type == "tool_use"), None)
        out = block.input.get("text") if block else None
        if isinstance(out, str) and out.strip():
            return out.strip()
        print(f"    [{lang}] страница: пустой/некорректный ответ, попытка {attempt+2}…")
    raise SystemExit(f"[{lang}] не удалось перевести страницу после 3 попыток — проверь вручную")


def translate_lang(lang, texts):
    return [translate_one(lang, t) for t in texts]


def main():
    master = BOOK["master_language"]
    texts = [p["text"] for p in BOOK["pages"]]
    out_dir = ROOT / "translations"
    out_dir.mkdir(exist_ok=True)

    for lang in CONFIG["languages"]:
        if lang == master:
            data = texts
            print(f"  {lang}  (мастер, без перевода)")
        else:
            data = translate_lang(lang, texts)
            print(f"  {lang}  переведено {len(data)} строк")
        with open(out_dir / f"{lang}.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    print("Готово. Дальше — озвучка: python pipeline/tts.py")


if __name__ == "__main__":
    main()
