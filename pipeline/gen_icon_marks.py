# -*- coding: utf-8 -*-
"""Generate centered circular *-mark.webp badges from off-center icon sprites."""
from __future__ import print_function
import math
import os
from PIL import Image, ImageDraw, ImageFilter

ICONS = r"d:\OSPanel5\domains\biblejskie-istorii\img\icons"
OUT_SIZE = 128
CREAM = (253, 246, 236, 255)
INK = (40, 30, 24, 255)
WHITE = (255, 255, 255, 255)


def analyze(name):
    path = os.path.join(ICONS, name)
    im = Image.open(path)
    px = im.convert("RGBA")
    w, h = px.size
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, h // 2)]
    print(name, im.size, im.mode, [px.getpixel(c) for c in corners])


def is_cream(r, g, b, a, thr=28):
    if a < 20:
        return True
    # cream / near-white background of sprites
    return r > 220 and g > 210 and b > 190 and abs(r - g) < 40 and abs(g - b) < 45


def is_dark_ring(r, g, b, a):
    if a < 40:
        return False
    return r < 90 and g < 80 and b < 70 and (r + g + b) < 200


def find_circle(px):
    """Estimate circular frame from dark ring pixels; fallback to content bbox."""
    w, h = px.size
    ring = []
    content = []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px.getpixel((x, y))
            if is_dark_ring(r, g, b, a):
                ring.append((x, y))
            elif a > 40 and not is_cream(r, g, b, a):
                content.append((x, y))
    if len(ring) >= 40:
        xs = [p[0] for p in ring]
        ys = [p[1] for p in ring]
        cx = (min(xs) + max(xs)) / 2.0
        cy = (min(ys) + max(ys)) / 2.0
        # radius = median distance of ring points (robust to partial crop)
        dists = sorted(math.hypot(x - cx, y - cy) for x, y in ring)
        rad = dists[len(dists) // 2]
        return cx, cy, rad, "ring"
    if content:
        xs = [p[0] for p in content]
        ys = [p[1] for p in content]
        cx = (min(xs) + max(xs)) / 2.0
        cy = (min(ys) + max(ys)) / 2.0
        rad = max(max(xs) - min(xs), max(ys) - min(ys)) / 2.0 * 1.15
        return cx, cy, rad, "content"
    return w / 2.0, h / 2.0, min(w, h) / 2.0 * 0.9, "fallback"


def extract_disk(px, cx, cy, rad, pad=2):
    """Crop square around circle and keep only interior (slightly inside ring)."""
    r_in = max(8, rad - pad)
    left = int(math.floor(cx - r_in))
    top = int(math.floor(cy - r_in))
    right = int(math.ceil(cx + r_in))
    bottom = int(math.ceil(cy + r_in))
    # expand canvas so crop is valid
    w, h = px.size
    canvas = Image.new("RGBA", (w + int(2 * r_in) + 4, h + int(2 * r_in) + 4), (0, 0, 0, 0))
    ox, oy = int(r_in) + 2, int(r_in) + 2
    canvas.paste(px, (ox, oy))
    left2, top2 = left + ox, top + oy
    size = int(math.ceil(2 * r_in))
    disk = canvas.crop((left2, top2, left2 + size, top2 + size)).convert("RGBA")
    # mask to circle; fill cream outside glyph but inside circle
    mask = Image.new("L", disk.size, 0)
    ImageDraw.Draw(mask).ellipse((1, 1, disk.size[0] - 2, disk.size[1] - 2), fill=255)
    out = Image.new("RGBA", disk.size, CREAM)
    out.paste(disk, (0, 0), disk)
    # clear outside circle
    clear = Image.new("RGBA", disk.size, (0, 0, 0, 0))
    clear.paste(out, (0, 0), mask)
    return clear


def content_bbox(disk):
    px = disk.load()
    w, h = disk.size
    xs, ys = [], []
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 40:
                continue
            if is_cream(r, g, b, a, thr=35):
                continue
            # ignore near-black ring leftovers near edge
            if is_dark_ring(r, g, b, a):
                continue
            xs.append(x)
            ys.append(y)
    if not xs:
        return 0, 0, w, h
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def content_centroid(im):
    """Visual-weight center of non-cream glyph pixels (bbox can mis-center)."""
    px = im.load()
    w, h = im.size
    sx = sy = n = 0
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 40:
                continue
            if is_cream(r, g, b, a, thr=35):
                continue
            if is_dark_ring(r, g, b, a):
                continue
            if r > 245 and g > 245 and b > 245:
                continue
            sx += x
            sy += y
            n += 1
    if not n:
        return w / 2.0, h / 2.0
    return sx / float(n), sy / float(n)


def make_mark(src_name, out_name=None, glyph_scale=0.62):
    src = Image.open(os.path.join(ICONS, src_name)).convert("RGBA")
    cx, cy, rad, how = find_circle(src)
    print("  %s circle: cx=%.1f cy=%.1f r=%.1f (%s)" % (src_name, cx, cy, rad, how))
    disk = extract_disk(src, cx, cy, rad, pad=max(2, int(rad * 0.06)))
    bx0, by0, bx1, by1 = content_bbox(disk)
    glyph = disk.crop((bx0, by0, bx1, by1))
    gw, gh = glyph.size
    # build badge
    out = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    # white outer ring + cream fill + ink stroke (match scroll-mark / puzzle-mark)
    margin = 4
    outer = [margin, margin, OUT_SIZE - 1 - margin, OUT_SIZE - 1 - margin]
    draw.ellipse(outer, fill=WHITE)
    inner_m = margin + 7
    inner = [inner_m, inner_m, OUT_SIZE - 1 - inner_m, OUT_SIZE - 1 - inner_m]
    draw.ellipse(inner, fill=CREAM, outline=INK, width=2)

    # fit glyph into inner circle
    inner_d = OUT_SIZE - 2 * inner_m - 4
    max_side = int(inner_d * glyph_scale)
    scale = min(max_side / float(gw), max_side / float(gh))
    nw, nh = max(1, int(gw * scale)), max(1, int(gh * scale))
    glyph_r = glyph.resize((nw, nh), Image.Resampling.LANCZOS)
    # paste so visual centroid (not bbox) sits on badge center
    gcx, gcy = content_centroid(glyph_r)
    px_ = int(round(OUT_SIZE / 2.0 - gcx))
    py_ = int(round(OUT_SIZE / 2.0 - gcy))
    # soft paste: use glyph alpha
    out.paste(glyph_r, (px_, py_), glyph_r)

    # re-apply circular mask so corners stay transparent
    mask = Image.new("L", (OUT_SIZE, OUT_SIZE), 0)
    ImageDraw.Draw(mask).ellipse(outer, fill=255)
    final = Image.new("RGBA", (OUT_SIZE, OUT_SIZE), (0, 0, 0, 0))
    final.paste(out, (0, 0), mask)
    # slight sharpen
    final = final.filter(ImageFilter.UnsharpMask(radius=0.6, percent=80, threshold=2))

    out_name = out_name or (src_name.replace(".webp", "-mark.webp"))
    out_path = os.path.join(ICONS, out_name)
    final.save(out_path, "WEBP", quality=92, method=6)
    print("  wrote", out_name, final.size)
    return out_path


def main():
    print("=== analyze existing ===")
    for name in [
        "scroll-mark.webp",
        "scroll-mark-orig.webp",
        "scroll.webp",
        "puzzle-mark.webp",
        "puzzle.webp",
        "cards-mark.webp",
        "family-mark.webp",
    ]:
        analyze(name)

    # Game-hub icons that need marks (reuse existing marks where present)
    need = [
        "amphora.webp",
        "hourglass.webp",
        "magnifier.webp",
        "cloud.webp",
        "book.webp",
        "blocks.webp",
        "headphones.webp",
        "star.webp",
        # also regenerate from sprites for consistency if marks missing for these:
        # puzzle/cards/scroll already have hand-tuned marks — keep those
    ]
    # Per-icon glyph scale (taller icons need slightly smaller)
    scales = {
        "amphora.webp": 0.58,
        "hourglass.webp": 0.60,
        "magnifier.webp": 0.62,
        "cloud.webp": 0.64,
        "book.webp": 0.62,
        "blocks.webp": 0.62,
        "headphones.webp": 0.60,
        "star.webp": 0.62,
    }
    print("=== generate marks ===")
    for src in need:
        if src == "star.webp":
            # Star needs gold-only crop + bbox centering (shine arcs bias centroid).
            from fix_star_mark import make_star_mark
            make_star_mark(0.72, optical_dy=0.0)
            continue
        make_mark(src, glyph_scale=scales.get(src, 0.62))


if __name__ == "__main__":
    main()
