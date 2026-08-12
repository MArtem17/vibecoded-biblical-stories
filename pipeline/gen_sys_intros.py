# -*- coding: utf-8 -*-
"""
Фоны для трёх sys-intro карточек ленты (vg_intro / b8_intro / b9_intro).

Стиль — как у остальных feed-фонов: images.edit от noah_anchor + STYLE +
NO_CHARACTER, тон через tone_ok, WebP 820×1230.

  py -3 pipeline/gen_sys_intros.py
"""

from __future__ import print_function

from openai import OpenAI

from common import (
    ROOT, STYLE, NO_CHARACTER, IMG_MODEL, IMG_SIZE,
    save_webp_from_b64, tone_ok, anchor_path,
)

oai = OpenAI()

CARDS = [
    (
        "feed_vg_intro.webp",
        "Вступительная иллюстрация к игре «Угадай героя». "
        "Тёплый акварельный холм на фоне светлого неба: на переднем плане "
        "лежит большая открытая книга сказок, а над ней в воздухе мягко "
        "парят три овальных портретных медальона-окошка с размытыми "
        "добрыми лицами библейских героев (старец с бородой, юный пастух, "
        "девушка в голубом покрывале) — лица намеренно чуть нечёткие, "
        "как загадка. Рядом деревянная лупа на длинной ручке, чуть "
        "блестящая. Настроение любопытное и дружелюбное, без текста и "
        "надписей.",
    ),
    (
        "feed_b8_intro.webp",
        "Вступительная иллюстрация к главе «Секреты пути». "
        "Извилистая тёплая тропинка уходит вдаль между песчаными холмами "
        "и мягкими кустами; вдоль пути мерцают маленькие золотистые "
        "фонарики-окошки и один большой старинный ключ из тёплой латуни "
        "висит на ветке. Вдалеке виден лёгкий силуэт ковчега и тонкая "
        "Вифлеемская звезда в кремовом небе. Настроение: путь пройден, "
        "впереди тайны. Без текста и надписей.",
    ),
    (
        "feed_b9_intro.webp",
        "Вступительная иллюстрация к главе «Эксперт». "
        "Вершина холма на закате: на камне лежит мягко светящийся "
        "золотистый венок-корона (не спортивный кубок), вокруг разложены "
        "свиток, оливковая ветвь и маленький деревянный ковчег-кораблик "
        "как игрушка; в небе радуга и яркая восьмилучевая звезда. "
        "Внизу по склону видны крошечные фигурки героев пути — намёк на "
        "всю историю целиком. Торжественно, светло, по-детски. Без текста "
        "и надписей.",
    ),
]


def gen_one(filename, scene, attempts=3):
    out = ROOT / "img" / filename
    prompt = scene + " " + STYLE + NO_CHARACTER
    ref = anchor_path("noah")
    best = None
    for att in range(1, attempts + 1):
        with open(ref, "rb") as f:
            res = oai.images.edit(
                model=IMG_MODEL,
                image=[f],
                prompt=prompt,
                size=IMG_SIZE,
                quality="high",
            )
        b64 = res.data[0].b64_json
        save_webp_from_b64(b64, out)
        ok, (ml, dk, pp) = tone_ok(out)
        print(
            "  %s попытка %d: L=%.0f тени=%.1f%% бумага=%.0f%% → %s"
            % (filename, att, ml, dk, pp, "OK" if ok else "ПЕРЕГЕН")
        )
        if ok:
            return True
        score = max(0, 150 - ml) + max(0, dk - 6) * 10 + max(0, 25 - pp)
        if best is None or score < best[0]:
            best = (score, b64)
    save_webp_from_b64(best[1], out)
    print("  %s: тон вне коридора — оставлена лучшая" % filename)
    return False


def main():
    print("Генерю %d intro-фонов (%s, %s)…" % (len(CARDS), IMG_MODEL, IMG_SIZE))
    fails = []
    for filename, scene in CARDS:
        if not gen_one(filename, scene):
            fails.append(filename)
    print("Готово." + ((" Вне коридора: " + ", ".join(fails)) if fails else ""))


if __name__ == "__main__":
    main()
