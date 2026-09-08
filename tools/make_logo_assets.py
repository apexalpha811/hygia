"""Generate every HYGIA wordmark asset from the Ethnocentric Bold outlines.

    python tools/make_logo_assets.py

Writes SVG (vector) and transparent PNG (raster) into assets/logo/.
The mark is set type, not drawn artwork, so it is regenerated from the font
rather than traced. TRACKING is the one knob worth touching; the reference
mark sits at 0, the font default.
"""
import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import RecordingPen
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = os.path.join(ROOT, "fonts", "Ethnocentric", "Ethnocentric Bold.ttf")
OUT = os.path.join(ROOT, "assets", "logo")

TEXT = "HYGIA"
TRACKING = 0  # extra letterspacing in font units

# Every color the mark ships in. Deck builders read these PNGs by name, so the
# keys here are the filename suffixes.
COLORS = {
    "black": "#000000",
    "white": "#FFFFFF",
    "accent-bright": "#0CA0DC",
    "accent-deep": "#055C7F",
}

MASTER_PX = 4000
RASTER_WIDTHS = {"1x": 400, "2x": 800, "3x": 1200}


def outline():
    """Return (svg path data, bounding box) for the wordmark, Y-flipped for SVG."""
    font = TTFont(FONT)
    cmap, glyphset, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]

    rec, x = RecordingPen(), 0
    for ch in TEXT:
        name = cmap[ord(ch)]
        # font coords are Y-up, SVG is Y-down
        glyphset[name].draw(TransformPen(rec, (1, 0, 0, -1, x, 0)))
        x += hmtx[name][0] + TRACKING

    bounds = BoundsPen(glyphset)
    rec.replay(bounds)

    pen = SVGPathPen(glyphset, ntos=lambda v: f"{v:.1f}")
    rec.replay(pen)
    return pen.getCommands(), bounds.bounds


def write_svgs(path, box):
    x0, y0, x1, y1 = box
    variants = [("hygia-wordmark.svg", "currentColor")]
    variants += [(f"hygia-wordmark-{n}.svg", c) for n, c in COLORS.items()]
    for name, fill in variants:
        doc = (
            f'<svg xmlns="http://www.w3.org/2000/svg" '
            f'viewBox="{x0:.1f} {y0:.1f} {x1 - x0:.1f} {y1 - y0:.1f}" '
            f'role="img" aria-label="HYGIA">\n  <title>HYGIA</title>\n'
            f'  <path fill="{fill}" d="{path}"/>\n</svg>\n'
        )
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
            f.write(doc)
    return len(variants)


def write_pngs():
    """Render once per color at high resolution, then downsample for cleaner edges."""
    size = 900
    font = ImageFont.truetype(FONT, size)
    count = 0
    for name, hexval in COLORS.items():
        rgb = tuple(int(hexval[i:i + 2], 16) for i in (1, 3, 5))
        canvas = Image.new("RGBA", (size * len(TEXT) * 2, size * 3), (0, 0, 0, 0))
        ImageDraw.Draw(canvas).text((size, size), TEXT, font=font, fill=rgb + (255,))
        art = canvas.crop(canvas.getbbox())

        master = art.resize(
            (MASTER_PX, round(art.height * MASTER_PX / art.width)), Image.LANCZOS
        )
        master.save(os.path.join(OUT, f"hygia-wordmark-{name}@master.png"))
        count += 1
        for label, w in RASTER_WIDTHS.items():
            master.resize(
                (w, round(master.height * w / master.width)), Image.LANCZOS
            ).save(os.path.join(OUT, f"hygia-wordmark-{name}@{label}.png"))
            count += 1
    return count


def main():
    os.makedirs(OUT, exist_ok=True)
    path, box = outline()
    n_svg = write_svgs(path, box)
    n_png = write_pngs()
    x0, y0, x1, y1 = box
    print(f"viewBox {x0:.0f} {y0:.0f} {x1 - x0:.0f} {y1 - y0:.0f}"
          f"  ratio {(x1 - x0) / (y1 - y0):.3f}:1")
    print(f"wrote {n_svg} svg + {n_png} png to assets/logo/")


if __name__ == "__main__":
    main()
