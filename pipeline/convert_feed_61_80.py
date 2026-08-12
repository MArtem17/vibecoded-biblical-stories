# -*- coding: utf-8 -*-
"""Convert generated feed 61-80 PNGs to portrait WebP ~820x1230."""
from __future__ import print_function
import os
from PIL import Image

SRC_DIR = r"C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-ptitsy-mira\assets"
OUT_DIR = r"d:\OSPanel5\domains\biblejskie-istorii\img"
TARGET = (820, 1230)

FILES = [
    "feed_b2_q_coat_check.png",
    "feed_b2_q_joseph_tf.png",
    "feed_b2_q_joseph_order.png",
    "feed_b2_q_abraham_check.png",
    "feed_b2_q_sarah_order.png",
    "feed_b2_q_joseph_check2.png",
    "feed_b2_q_ladder_check.png",
    "feed_b2_end.png",
    "feed_b3_q_basket.png",
    "feed_b3_q_moses.png",
    "feed_b3_06.png",
    "feed_b3_q_bush.png",
    "feed_b3_08.png",
    "feed_b3_q_sea.png",
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
    print("OK", out, im.size)
