# -*- coding: utf-8 -*-
"""Convert feed 341-360 PNGs to WebP 820x1230. Run after images are generated."""
from __future__ import print_function
import os
from PIL import Image

SRC_DIR = r"C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets"
OUT_DIR = r"d:\OSPanel5\domains\biblejskie-istorii\img"
TARGET = (820, 1230)

FILES = [
    "feed_b8_w2_jonah.png",
    "feed_b8_w2_nativity.png",
    "feed_b8_w2_magi.png",
    "feed_b8_w2_ruth.png",
    "feed_b8_w2_manna.png",
    "feed_b8_w2_miriam.png",
    "feed_b8_w2_bush.png",
    "feed_b8_w2_coat.png",
    "feed_b8_w2_ladder.png",
    "feed_b8_w2_temple.png",
    "feed_b8_end.png",
    "feed_b9_x01.png",
    "feed_b9_x02.png",
    "feed_b9_x03.png",
    "feed_b9_x04.png",
    "feed_b9_x05.png",
    "feed_b9_x06.png",
    "feed_b9_x07.png",
    "feed_b9_x08.png",
]


def fit_cover(im, size):
    tw, th = size
    w, h = im.size
    scale = max(tw / float(w), th / float(h))
    nw, nh = int(round(w * scale)), int(round(h * scale))
    im = im.resize((nw, nh), Image.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


os.makedirs(OUT_DIR, exist_ok=True)
ok = miss = 0
for name in FILES:
    src = os.path.join(SRC_DIR, name)
    if not os.path.isfile(src):
        print("MISSING", src)
        miss += 1
        continue
    out = os.path.join(OUT_DIR, os.path.splitext(name)[0] + ".webp")
    im = Image.open(src).convert("RGB")
    im = fit_cover(im, TARGET)
    im.save(out, "WEBP", quality=82, method=6)
    print("OK", os.path.basename(out), im.size)
    ok += 1
print("done ok=%d miss=%d / %d" % (ok, miss, len(FILES)))
