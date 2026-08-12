# -*- coding: utf-8 -*-
from __future__ import print_function
import os
from PIL import Image

SRC_DIR = r"C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets"
OUT_DIR = r"d:\OSPanel5\domains\biblejskie-istorii\img"
TARGET = (820, 1230)

FILES = [
    "feed_vg_bush.png",
    "feed_vg_manna.png",
    "feed_vg_tablets.png",
    "feed_vg_jericho.png",
    "feed_vg_goliath.png",
    "feed_vg_temple.png",
    "feed_vg_judgment.png",
    "feed_vg_lions.png",
    "feed_vg_fish.png",
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
for name in FILES:
    src = os.path.join(SRC_DIR, name)
    if not os.path.isfile(src):
        print("MISSING", src)
        continue
    out = os.path.join(OUT_DIR, os.path.splitext(name)[0] + ".webp")
    im = Image.open(src).convert("RGB")
    im = fit_cover(im, TARGET)
    im.save(out, "WEBP", quality=82, method=6)
    print("OK", os.path.basename(out), im.size, os.path.getsize(out))
