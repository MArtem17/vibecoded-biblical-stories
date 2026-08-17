# -*- coding: utf-8 -*-
"""Convert generated feed 181-200 PNGs to portrait WebP ~820x1230."""
from __future__ import print_function
import os
from PIL import Image

SRC_DIR = r"C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets"
OUT_DIR = r"d:\OSPanel5\domains\biblejskie-istorii\img"
TARGET = (820, 1230)

FILES = [
    "feed_b6_q_lions.png",
    "feed_b6_q_daniel.png",
    "feed_b6_q_esther.png",
    "feed_b6_10.png",
    "feed_b6_cnt3.png",
    "feed_b6_q_jonah.png",
    "feed_b6_q_fish.png",
    "feed_b6_q_elijah_tf.png",
    "feed_b6_q_elijah_check2.png",
    "feed_b6_q_daniel_tf.png",
    "feed_b6_q_daniel_order.png",
    "feed_b6_q_lions_tf.png",
    "feed_b6_q_lions_check2.png",
    "feed_b6_q_esther_tf.png",
    "feed_b6_q_esther_order.png",
    "feed_b6_q_jonah_tf.png",
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
ok = 0
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
    ok += 1
print("done", ok, "/", len(FILES))
