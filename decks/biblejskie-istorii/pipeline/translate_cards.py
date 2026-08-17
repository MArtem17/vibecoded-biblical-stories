"""
Перевод контента карт на 6 языков (Claude, батчами через tool-схему).

Обходит pipeline/volume.master.json (сделать заранее: node pipeline/export_json.js),
собирает все мультиязычные узлы ({ru: строка | массив строк}), у которых НЕТ
целевого языка (ui уже на 7 языках — пропустится сам), переводит пачками по
BATCH юнитов и пишет pipeline/translations/<lang>.json — плоскую карту
"путь → значение". Слияние обратно — node pipeline/apply_translations.js.

Резюмируемо: готовые языки пропускаются; недостающие id в ответе — повторный
запрос только по ним.

  export ANTHROPIC_API_KEY=...
  python pipeline/translate_cards.py            # все языки
  python pipeline/translate_cards.py en de      # выборочно
"""

import json
import sys
import time
from pathlib import Path

import anthropic

HERE = Path(__file__).resolve().parent
MODEL = "claude-sonnet-5"
BATCH = 20
LANGS = ["en", "de", "es", "pt", "fr", "ar"]
LANG_NAMES = {"en": "английский", "de": "немецкий", "es": "испанский",
              "pt": "португальский (Бразилия)", "fr": "французский", "ar": "арабский"}

client = anthropic.Anthropic()

TOOL = {
    "name": "return_translations",
    "description": "Вернуть переводы пачки юнитов.",
    "input_schema": {
        "type": "object",
        "properties": {
            "items": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "value": {
                            "description": "Перевод: строка, либо массив строк той же длины, что оригинал.",
                            "anyOf": [
                                {"type": "string"},
                                {"type": "array", "items": {"type": "string"}}
                            ]
                        }
                    },
                    "required": ["id", "value"]
                }
            }
        },
        "required": ["items"],
    },
}


def collect_units(node, path, out):
    """Найти все узлы-словари с ключом ru (строка или массив строк)."""
    if isinstance(node, dict):
        if "ru" in node and isinstance(node["ru"], (str, list)):
            out.append((path, node))
            return
        for k, v in node.items():
            collect_units(v, path + "." + k if path else k, out)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            key = str(v.get("id")) if isinstance(v, dict) and v.get("id") is not None else str(i)
            collect_units(v, path + "." + key if path else key, out)


def translate_batch(lang, batch):
    src = [{"id": p, "value": node["ru"]} for p, node in batch]
    prompt = (
        "Переведи юниты детской образовательной карточной колоды «Библейские "
        "истории» (культурно-нейтральный пересказ библейских сюжетов) на "
        + LANG_NAMES[lang] + " язык.\n"
        "Аудитория: дети 5–9 лет. Тон тёплый, простой, естественный — как "
        "изначально написанная детская книга, не подстрочник. Имена героев — "
        "в устоявшейся форме целевого языка (Moses/Noah/…). Названия книг "
        "Библии — по принятой в языке традиции. Массивы переводи поэлементно, "
        "той же длины. Длина — примерно как у оригинала (тексты стоят на "
        "карточках). Прямая речь — типографскими кавычками целевого языка.\n"
        "Верни переводы ВСЕХ юнитов вызовом инструмента return_translations, "
        "id не менять.\n\n" + json.dumps(src, ensure_ascii=False, indent=1)
    )
    for attempt in range(4):
        try:
            msg = client.messages.create(
                model=MODEL, max_tokens=8000,
                tools=[TOOL], tool_choice={"type": "tool", "name": "return_translations"},
                messages=[{"role": "user", "content": prompt}],
            )
            block = next((b for b in msg.content if b.type == "tool_use"), None)
            items = (block.input or {}).get("items") if block else None
            if items:
                return {it["id"]: it["value"] for it in items
                        if isinstance(it, dict) and it.get("id") and it.get("value") is not None}
        except anthropic.APIError as e:
            print("    [%s] API error: %s — retry" % (lang, e))
            time.sleep(5 * (attempt + 1))
    raise SystemExit("[%s] батч не переведён после 4 попыток" % lang)


def valid(node, val):
    """Тип и длина массива обязаны совпасть с ru-оригиналом."""
    if isinstance(node["ru"], list):
        return isinstance(val, list) and len(val) == len(node["ru"]) and all(
            isinstance(x, str) and x.strip() for x in val)
    return isinstance(val, str) and val.strip()


def translate_lang(lang, units):
    todo = [(p, n) for p, n in units if lang not in n]
    print("  %s: юнитов к переводу %d" % (lang, len(todo)))
    result = {}
    i = 0
    while i < len(todo):
        batch = todo[i:i + BATCH]
        got = translate_batch(lang, batch)
        missing = []
        for p, n in batch:
            if p in got and valid(n, got[p]):
                result[p] = got[p]
            else:
                missing.append((p, n))
        for round2 in range(2):
            if not missing:
                break
            got2 = translate_batch(lang, missing)
            still = []
            for p, n in missing:
                if p in got2 and valid(n, got2[p]):
                    result[p] = got2[p]
                else:
                    still.append((p, n))
            missing = still
        if missing:
            raise SystemExit("[%s] не переведены: %s" % (lang, [p for p, _ in missing]))
        i += BATCH
        print("    [%s] %d/%d" % (lang, min(i, len(todo)), len(todo)))
    return result


def main(langs=None):
    volume = json.loads((HERE / "volume.master.json").read_text(encoding="utf-8"))
    units = []
    collect_units(volume, "", units)
    print("Мультиязычных юнитов всего: %d" % len(units))
    out_dir = HERE / "translations"
    out_dir.mkdir(exist_ok=True)
    for lang in (langs or LANGS):
        out = out_dir / (lang + ".json")
        # Инкрементально: юниты, у которых перевод уже есть в volume.js,
        # отфильтрует translate_lang (lang in node); свежие доливаем в файл.
        data = json.loads(out.read_text(encoding="utf-8")) if out.exists() else {}
        fresh = translate_lang(lang, units)
        data.update(fresh)
        out.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        print("  %s → %s (+%d, всего %d)" % (lang, out.name, len(fresh), len(data)))
    print("Готово. Дальше: node pipeline/apply_translations.js")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
