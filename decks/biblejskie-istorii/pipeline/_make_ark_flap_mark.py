# -*- coding: utf-8 -*-
"""Rebuild boat-mark from clean ark-flap sprite (no checkerboard)."""
from __future__ import print_function
import os
from PIL import Image, ImageDraw

ICONS = r"D:\OSPanel5\domains\biblejskie-istorii\img\icons"
GAME = r"D:\OSPanel5\domains\biblejskie-istorii\img\games"
CREAM = (253, 246, 236, 255)
INK = (40, 30, 24, 255)


def main():
    sp = Image.open(os.path.join(GAME, "ark-flap.webp")).convert("RGBA")
    px = sp.load()
    w, h = sp.size
    # strip any residual pale / checker-like pixels
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 12:
                px[x, y] = (0, 0, 0, 0)
                continue
            # gray checker cells
            if abs(r - g) < 8 and abs(g - b) < 8 and 160 <= r <= 220 and a > 200:
                px[x, y] = (0, 0, 0, 0)
                continue
            if r > 240 and g > 240 and b > 240:
                px[x, y] = (0, 0, 0, 0)

    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 20:
                xs.append(x)
                ys.append(y)
    glyph = sp.crop((min(xs), min(ys), max(xs) + 1, max(ys) + 1))

    OUT = 128
    margin = 5
    R = OUT // 2 - margin
    cx = cy = OUT // 2
    badge = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    bbox = [cx - R, cy - R, cx + R, cy + R]
    draw.ellipse(bbox, fill=CREAM)
    draw.ellipse(bbox, outline=INK, width=3)

    # fit glyph inside ~56% of diameter so nothing clips
    inner = int(R * 2 * 0.56)
    gw, gh = glyph.size
    scale = min(inner / float(gw), inner / float(gh))
    nw, nh = max(1, int(gw * scale)), max(1, int(gh * scale))
    glyph_r = glyph.resize((nw, nh), Image.LANCZOS)
    ox = (OUT - nw) // 2
    oy = (OUT - nh) // 2 + 1
    badge.paste(glyph_r, (ox, oy), glyph_r)

    out_mark = os.path.join(ICONS, "boat-mark.webp")
    badge.save(out_mark, "WEBP", quality=92, method=6)
    badge.save(os.path.join(ICONS, "ark-mark.webp"), "WEBP", quality=92, method=6)
    print("mark ok", badge.size, out_mark)


if __name__ == "__main__":
    main()
