# -*- coding: utf-8 -*-
from __future__ import print_function
import os
from PIL import Image

SRC_DIR = r"C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets"
OUT_DIR = r"d:\OSPanel5\domains\biblejskie-istorii\img"
TARGET = (820, 1230)

FILES = [
    "feed_b4_q_samson.png",
    "feed_b4_07.png",
    "feed_b4_08.png",
    "feed_b4_q_ruth.png",
    "feed_b4_q_joshua_tf.png",
    "feed_b4_q_joshua_order.png",
    "feed_b4_q_jericho_tf.png",
    "feed_b4_q_jericho_check2.png",
    "feed_b4_q_samson_tf.png",
    "feed_b4_q_samson_order.png",
    "feed_b4_q_ruth_tf.png",
    "feed_b4_q_ruth_check2.png",
    "feed_b4_q_era_order.png",
    "feed_b4_q_jericho_order.png",
    "feed_b4_q_samson_check2.png",
    "feed_b4_q_joshua_check2.png",
    "feed_b4_q_ruth_order.png",
    "feed_b4_q_joshua_tf2.png",
    "feed_b4_q_samson_tf2.png",
    "feed_b4_q_jericho_tf2.png",
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
