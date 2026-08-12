# -*- coding: utf-8 -*-
"""Rebuild star-mark.webp: gold star only, bbox-centered (no shine arcs)."""
from __future__ import print_function
import math
import os
from PIL import Image, ImageDraw, ImageFilter

ICONS = r"d:\OSPanel5\domains\biblejskie-istorii\img\icons"
OUT_SIZE = 128
CREAM = (253, 246, 236, 255)
INK = (40, 30, 24, 255)
WHITE = (255, 255, 255, 255)


def is_cream(r, g, b, a, thr=28):
    if a < 20:
        return True
    return r > 220 and g > 210 and b > 190 and abs(r - g) < 40 and abs(g - b) < 45


def is_dark_ring(r, g, b, a):
    if a < 40:
        return False
    return r < 90 and g < 80 and b < 70 and (r + g + b) < 200


def is_goldish(r, g, b, a):
    if a < 180:
        return False
    if is_cream(r, g, b, a):
        return False
    if is_dark_ring(r, g, b, a):
        return False
    if r > 175 and g > 110 and b < 145 and (r - b) > 45 and (g - b) > 15:
        return True
    if r > 150 and g > 95 and b < 110 and (r - b) > 55 and r >= g:
        return True
    return False


def find_circle(px):
    w, h = px.size
    ring = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px.getpixel((x, y))
            if is_dark_ring(r, g, b, a):
                ring.append((x, y))
    if len(ring) >= 40:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        cx = (min(xs) + max(xs)) / 2.0
        cy = (min(ys) + max(ys)) / 2.0
        dists = sorted(math.hypot(x - cx, y - cy) for x, y in ring)
        return cx, cy, dists[len(dists) // 2], "ring"
    return w / 2.0, h / 2.0, min(w, h) / 2.0 * 0.9, "fallback"


def extract_disk(px, cx, cy, rad, pad=2):
    r_in = max(8, rad - pad)
    left = int(math.floor(cx - r_in))
    top = int(math.floor(cy - r_in))
    w, h = px.size
    canvas = Image.new("RGBA", (w + int(2 * r_in) + 4, h + int(2 * r_in) + 4), (0, 0, 0, 0))
    ox, oy = int(r_in) + 2, int(r_in) + 2
    canvas.paste(px, (ox, oy))
    left2, top2 = left + ox, top + oy
    size = int(math.ceil(2 * r_in))
    disk = canvas.crop((left2, top2, left2 + size, top2 + size)).convert("RGBA")
    mask = Image.new("L", disk.size, 0)
    ImageDraw.Draw(mask).ellipse((1, 1, disk.size[0] - 2, disk.size[1] - 2), fill=255)
    out = Image.new("RGBA", disk.size, CREAM)
    out.paste(disk, (0, 0), disk)
    clear = Image.new("RGBA", disk.size, (0, 0, 0, 0))
    clear.paste(out, (0, 0), mask)
    return clear


def gold_mask(disk):
    w, h = disk.size
    m = Image.new("L", (w, h), 0)
    mp = m.load()
    px = disk.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_goldish(r, g, b, a):
                mp[x, y] = 255
    return m


def dilate(mask, radius=2):
    return mask.filter(ImageFilter.MaxFilter(radius * 2 + 1))


def star_glyph(disk, dilate_r=2):
    gm = gold_mask(disk)
    keep = dilate(gm, dilate_r)
    px = disk.load()
    kp = keep.load()
    w, h = disk.size
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    op = out.load()
    xs, ys = [], []
    sx = sy = n = 0
    for y in range(h):
        for x in range(w):
            if kp[x, y] < 128:
                continue
            r, g, b, a = px[x, y]
            if a < 40:
                continue
            if is_cream(r, g, b, a, thr=35):
                continue
            if is_goldish(r, g, b, a) or is_dark_ring(r, g, b, a) or (
                r < 140 and g < 130 and b < 120 and a > 100
            ):
                op[x, y] = (r, g, b, a)
                if is_goldish(r, g, b, a):
                    sx += x
                    sy += y
                    n += 1
                    xs.append(x)
                    ys.append(y)
    if not n:
        raise SystemExit("no gold pixels found")
    return out, sx / float(n), sy / float(n), min(xs), min(ys), max(xs) + 1, max(ys) + 1, n


def make_star_mark(glyph_scale=0.72, optical_dy=0.0):
    """Center by opaque glyph bbox; larger scale so chip (≈18px) still reads the star."""
    src = Image.open(os.path.join(ICONS, "star.webp")).convert("RGBA")
    cx, cy, rad, how = find_circle(src)
    print("circle", round(cx, 1), round(cy, 1), round(rad, 1), how)
    disk = extract_disk(src, cx, cy, rad, pad=max(2, int(rad * 0.06)))
    glyph_full, gcx, gcy, bx0, by0, bx1, by1, n = star_glyph(disk, dilate_r=2)
    print("gold", "n", n, "c", round(gcx, 1), round(gcy, 1), "bbox", bx0, by0, bx1, by1)

    pad = 3
    bx0 = max(0, bx0 - pad)
    by0 = max(0, by0 - pad)
    bx1 = min(glyph_full.size[0], bx1 + pad)
    by1 = min(glyph_full.size[1], by1 + pad)
    glyph = glyph_full.crop((bx0, by0, bx1, by1))
    gw, gh = glyph.size

    out = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    margin = 4
    outer = [margin, margin, OUT_SIZE - 1 - margin, OUT_SIZE - 1 - margin]
    draw.ellipse(outer, fill=WHITE)
    inner_m = margin + 7
    inner = [inner_m, inner_m, OUT_SIZE - 1 - inner_m, OUT_SIZE - 1 - inner_m]
    draw.ellipse(inner, fill=CREAM, outline=INK, width=2)

    inner_d = OUT_SIZE - 2 * inner_m - 4
    max_side = int(inner_d * glyph_scale)
    scale = min(max_side / float(gw), max_side / float(gh))
    nw, nh = max(1, int(gw * scale)), max(1, int(gh * scale))
    glyph_r = glyph.resize((nw, nh), Image.Resampling.LANCZOS)

    gp = glyph_r.load()
    xs, ys = [], []
    for y in range(nh):
        for x in range(nw):
            r, g, b, a = gp[x, y]
            if a > 40 and not is_cream(r, g, b, a, thr=35):
                xs.append(x)
                ys.append(y)
    bcx = (min(xs) + max(xs)) / 2.0
    bcy = (min(ys) + max(ys)) / 2.0
    px_ = int(round(OUT_SIZE / 2.0 - bcx))
    py_ = int(round(OUT_SIZE / 2.0 - bcy + optical_dy))
    print("paste", px_, py_, "glyph", nw, nh, "optical_dy", optical_dy)
    out.paste(glyph_r, (px_, py_), glyph_r)

    mask = Image.new("L", (OUT_SIZE, OUT_SIZE), 0)
    ImageDraw.Draw(mask).ellipse(outer, fill=255)
    final = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
    final.paste(out, (0, 0), mask)
    final = final.filter(ImageFilter.UnsharpMask(radius=0.6, percent=80, threshold=2))

    out_path = os.path.join(ICONS, "star-mark.webp")
    final.save(out_path, "WEBP", quality=92, method=6)

    fp = final.load()
    xs, ys = [], []
    for y in range(OUT_SIZE):
        for x in range(OUT_SIZE):
            r, g, b, a = fp[x, y]
            if is_goldish(r, g, b, a):
                xs.append(x)
                ys.append(y)
    print(
        "margins LRTB",
        min(xs) - 11,
        (OUT_SIZE - 1 - 11) - max(xs),
        min(ys) - 11,
        (OUT_SIZE - 1 - 11) - max(ys),
    )
    return out_path


if __name__ == "__main__":
    make_star_mark(0.72, optical_dy=0.0)
    print("wrote", os.path.join(ICONS, "star-mark.webp"))
