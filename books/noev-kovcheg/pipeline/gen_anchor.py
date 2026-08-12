"""
ШАГ 2 (ручной гейт) — эталон персонажа.

Генерим N вариантов одного промпта (gpt-image-2, n=...). Это единственное место,
где нужен твой вкус: смотришь кандидатов и выбираешь лучшего. Выбранного
переименовываешь в img/_anchor.png — дальше пайплайн гонит всё от него.

  export OPENAI_API_KEY=...
  python pipeline/gen_anchor.py
  # → img/_anchor_1.png ... _anchor_4.png  → выбери и переименуй в _anchor.png
"""

import os
from pathlib import Path
from openai import OpenAI

from common import CONFIG, ROOT, build_anchor_prompt, save_webp_from_b64

oai = OpenAI()


def main():
    img = CONFIG["image"]
    prompt = build_anchor_prompt()
    n = img["anchor_candidates"]
    print(f"Генерю {n} кандидатов эталона ({img['model']}, quality={img['quality']})…")

    res = oai.images.generate(
        model=img["model"],
        prompt=prompt,
        size=img["size"],
        quality=img["quality"],
        n=n,
    )

    out_dir = ROOT / CONFIG["paths"]["images_dir"]
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, item in enumerate(res.data, start=1):
        # Кандидатов кладём в полном разрешении PNG (для оценки), эталон потом
        # используется как вход edit — ширина не критична, но оставим как есть.
        p = out_dir / f"_anchor_{i}.png"
        import base64
        p.write_bytes(base64.b64decode(item.b64_json))
        print("  →", p)

    print("\nГотово. Выбери лучший и переименуй в _anchor.png:")
    print(f"  mv {out_dir}/_anchor_2.png {out_dir}/_anchor.png")


if __name__ == "__main__":
    main()
