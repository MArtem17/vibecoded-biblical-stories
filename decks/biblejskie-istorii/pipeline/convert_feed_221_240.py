# -*- coding: utf-8 -*-
from __future__ import print_function
import os
from PIL import Image

SRC_DIR = r"C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets"
OUT_DIR = r"d:\OSPanel5\domains\biblejskie-istorii\img"
TARGET = (820, 1230)

FILES = [
    "feed_b7_07.png",
    "feed_b7_08.png",
    "feed_b7_cnt3.png",
    "feed_b7_q_magi.png",
    "feed_b7_order.png",
    "feed_b7_q_mary_tf.png",
    "feed_b7_q_mary_check2.png",
    "feed_b7_q_josephc_tf.png",
    "feed_b7_q_josephc_check2.png",
    "feed_b7_q_nativity_tf.png",
    "feed_b7_q_nativity_check2.png",
    "feed_b7_q_magi_tf.png",
    "feed_b7_q_magi_order.png",
    "feed_b7_q_mary_order.png",
    "feed_b7_q_nativity_order2.png",
    "feed_b7_q_josephc_order.png",
    "feed_b7_q_magi_check2.png",
    "feed_b7_q_mary_tf2.png",
    "feed_b7_q_nativity_tf2.png",
    "feed_b7_q_magi_tf2.png",
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
