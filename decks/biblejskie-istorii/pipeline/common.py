"""
Конвейер колоды «Библейские истории» — общие константы и помощники.

Канон визуала — handoff-документ владельца, раздел 2: формула стиля
(используется дословно) + автопроверка тона трёх метрик по уменьшенной
копии 200×300. Не прошло — перегенерация.

Якорная система: сцены с участием сквозного героя генерируются через
images.edit от его референс-портрета (anchors/<hero>_anchor.webp) с блоком
PRESERVE; сцены без якорного героя — от noah_anchor как чистого стиль-
референса с блоком NO_CHARACTER (приём книжного конвейера books/*/pipeline).
"""

import io
import os
import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Формула стиля — ДОСЛОВНО из handoff §2.
STYLE = (
    "Детская книжная акварель, мягкие размытые контуры, лёгкие прозрачные "
    "заливки, тёплая земляная палитра (охра, песочный, терракота, приглушённая "
    "бирюза), светлый кремовый фон акварельной бумаги. Настроение дружелюбное "
    "и сказочное. Пропорции персонажей — как в детской книжке-картинке. Мягкий "
    "ровный свет, без тёмных глухих теней: ночные сцены переданы прохладной "
    "сине-сиреневой акварелью по светлой бумаге, а не затемнением. Вертикальный "
    "формат 2:3. Без текста, без надписей, без рамок."
)

PRESERVE = (
    " Персонажа со входного изображения НЕ перерисовывай: сохрани то же лицо, "
    "ту же причёску, ту же одежду и аксессуары, те же пропорции и палитру, что "
    "на входном изображении. Можно менять только позу, ракурс и сцену вокруг."
)

NO_CHARACTER = (
    " Входное изображение — только образец стиля: человека с него НЕ изображай."
)

IMG_MODEL = "gpt-image-2"
IMG_SIZE = "1024x1536"          # 2:3, потом ресайз в 820×1230
WEB_W, WEB_H = 820, 1230
WEBP_QUALITY = 82


def save_webp_from_b64(b64_png, out_path):
    """Ответ модели (base64) → WebP 820×1230."""
    from PIL import Image
    im = Image.open(io.BytesIO(base64.b64decode(b64_png))).convert("RGB")
    im = im.resize((WEB_W, WEB_H), Image.LANCZOS)
    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    im.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6)
    return out_path


def tone_metrics(path):
    """Три метрики тона по копии 200×300 (handoff §2)."""
    from PIL import Image
    im = Image.open(path).convert("L").resize((200, 300))
    px = list(im.getdata())
    n = float(len(px))
    mean_l = sum(px) / n
    dark = sum(1 for v in px if v < 70) / n * 100.0
    paper = sum(1 for v in px if v > 200) / n * 100.0
    return mean_l, dark, paper


def tone_ok(path):
    """Коридор эталона: L̄ ≥ 150, глухие тени < 6%, «бумага» ≥ 25%."""
    mean_l, dark, paper = tone_metrics(path)
    ok = mean_l >= 150 and dark < 6.0 and paper >= 25.0
    return ok, (mean_l, dark, paper)


def anchor_path(name):
    return ROOT / "anchors" / (name + "_anchor.webp")
