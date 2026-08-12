"""
Обложка колоды (cover.webp) для главного навигатора и заставки.

Название колоды — статический текст, поэтому надпись рисуем прямо в картинке
(современным генераторам текст доверяем — CLAUDE.md «Промпты»).

  export OPENAI_API_KEY=...
  python pipeline/gen_cover.py
"""

from openai import OpenAI

from common import ROOT, STYLE, IMG_MODEL, IMG_SIZE, save_webp_from_b64, tone_ok, anchor_path

PROMPT = (
    "Обложка детской образовательной карточной колоды. Крупная надпись "
    "«БИБЛЕЙСКИЕ ИСТОРИИ» аккуратными тёплыми буквами в верхней трети. "
    "Композиция-коллаж вокруг надписи: Ноев ковчег на волнах с жирафами и "
    "слонами, над ним семицветная радуга; сбоку юный пастушок с пращой и арфой; "
    "внизу корзинка в камышах у реки и две каменные скрижали; в небе большая "
    "восьмилучевая Вифлеемская звезда и белый голубь с оливковой веточкой. "
    + STYLE +
    " Входное изображение — только образец стиля: человека с него НЕ изображай."
)


def main():
    oai = OpenAI()
    out = ROOT / "cover.webp"
    for att in range(1, 4):
        with open(anchor_path("noah"), "rb") as f:
            res = oai.images.edit(model=IMG_MODEL, image=[f], prompt=PROMPT,
                                  size=IMG_SIZE, quality="high")
        save_webp_from_b64(res.data[0].b64_json, out)
        ok, (ml, dk, pp) = tone_ok(out)
        print("cover попытка %d: L=%.0f тени=%.1f%% бумага=%.0f%% → %s"
              % (att, ml, dk, pp, "OK" if ok else "перегенерация"))
        if ok:
            break
    print("cover.webp готов — проверить надпись глазами")


if __name__ == "__main__":
    main()
