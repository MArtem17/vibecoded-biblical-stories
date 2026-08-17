# -*- coding: utf-8 -*-
"""Build ark-flap game sprite + centered boat-mark hub icon."""
from __future__ import print_function
import os
from PIL import Image, ImageDraw

ASSETS = r"C:\Users\egoro\.cursor\projects\d-OSPanel5-domains-biblejskie-istorii\assets"
ICONS = r"D:\OSPanel5\domains\biblejskie-istorii\img\icons"
GAME = r"D:\OSPanel5\domains\biblejskie-istorii\img\games"
CREAM = (253, 246, 236, 255)
INK = (40, 30, 24, 255)


def main():
    os.makedirs(GAME, exist_ok=True)

    sp = Image.open(os.path.join(ASSETS, "ark-flap-sprite.png")).convert("RGBA")
    px = sp.load()
    w, h = sp.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                px[x, y] = (0, 0, 0, 0)
                continue
            if r > 235 and g > 235 and b > 235:
                px[x, y] = (0, 0, 0, 0)
                continue
            if abs(r - g) < 12 and abs(g - b) < 12 and r > 210:
                px[x, y] = (0, 0, 0, 0)

    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] > 20:
                xs.append(x)
                ys.append(y)
    if not xs:
        raise SystemExit("empty sprite")
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    pad = 12
    sp2 = sp.crop((max(0, minx - pad), max(0, miny - pad), min(w, maxx + pad + 1), min(h, maxy + pad + 1)))
    sp2 = sp2.transpose(Image.FLIP_LEFT_RIGHT)
    side = max(sp2.size)
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    sq.paste(sp2, ((side - sp2.size[0]) // 2, (side - sp2.size[1]) // 2), sp2)
    out_sprite = os.path.join(GAME, "ark-flap.webp")
    sq.save(out_sprite, "WEBP", quality=92, method=6)
    print("sprite", sq.size, out_sprite)

    mk = Image.open(os.path.join(ASSETS, "ark-flap-mark.png")).convert("RGBA")
    mw, mh = mk.size
    mp = mk.load()
    glyph = Image.new("RGBA", mk.size, (0, 0, 0, 0))
    gp = glyph.load()
    for y in range(mh):
        for x in range(mw):
            r, g, b, a = mp[x, y]
            if a < 20:
                continue
            if r > 230 and g > 220 and b > 200 and abs(r - g) < 35:
                continue
            gp[x, y] = (r, g, b, a)

    gxs, gys = [], []
    for y in range(mh):
        for x in range(mw):
            if gp[x, y][3] > 20:
                gxs.append(x)
                gys.append(y)
    if not gxs:
        raise SystemExit("no glyph")
    gminx, gmaxx, gminy, gmaxy = min(gxs), max(gxs), min(gys), max(gys)
    for y in range(gminy, gmaxy + 1):
        for x in range(gminx, gmaxx + 1):
            r, g, b, a = gp[x, y]
            if a and r < 55 and g < 50 and b < 45:
                gp[x, y] = (0, 0, 0, 0)

    gxs, gys = [], []
    for y in range(mh):
        for x in range(mw):
            if gp[x, y][3] > 20:
                gxs.append(x)
                gys.append(y)
    gminx, gmaxx, gminy, gmaxy = min(gxs), max(gxs), min(gys), max(gys)
    glyph_crop = glyph.crop((gminx, gminy, gmaxx + 1, gmaxy + 1))

    OUT = 128
    margin = 4
    R = OUT // 2 - margin
    cx = cy = OUT // 2
    badge = Image.new("RGBA", (OUT, OUT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(badge)
    bbox = [cx - R, cy - R, cx + R, cy + R]
    draw.ellipse(bbox, fill=CREAM)
    draw.ellipse(bbox, outline=INK, width=3)

    inner = int(R * 2 * 0.58)
    gw, gh = glyph_crop.size
    scale = min(inner / float(gw), inner / float(gh))
    nw, nh = max(1, int(gw * scale)), max(1, int(gh * scale))
    glyph_r = glyph_crop.resize((nw, nh), Image.LANCZOS)
    ox = (OUT - nw) // 2
    oy = (OUT - nh) // 2 + 2
    badge.paste(glyph_r, (ox, oy), glyph_r)

    out_mark = os.path.join(ICONS, "boat-mark.webp")
    badge.save(out_mark, "WEBP", quality=92, method=6)
    badge.save(os.path.join(ICONS, "ark-mark.webp"), "WEBP", quality=92, method=6)
    print("mark", badge.size, out_mark)
    print("done")


if __name__ == "__main__":
    main()
