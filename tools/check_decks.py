"""Assert every deck renders the HYGIA wordmark as art, not as typed Ethnocentric.

    python tools/check_decks.py

Why this exists: python-pptx cannot embed fonts. Any run typed in Ethnocentric
silently substitutes to a fallback on a machine without the font installed, so the
brand mark shows up wrong on the prospect's screen and nobody finds out.

"HYGIA" set in a *heading* font is fine and is left alone. That is a word in a
sentence or a table label, not the wordmark.
"""
import glob
import os

from pptx import Presentation

WORDMARK_FONT = "ethnocentric"


def audit(path):
    prs = Presentation(path)
    W, H = prs.slide_width, prs.slide_height
    pictures, typed, offslide = 0, [], []

    for n, slide in enumerate(prs.slides, 1):
        for shape in slide.shapes:
            if shape.shape_type == 13:  # PICTURE
                pictures += 1
                if (shape.left < 0 or shape.top < 0
                        or shape.left + shape.width > W
                        or shape.top + shape.height > H):
                    offslide.append((n, shape.left, shape.top))
            if shape.has_text_frame:
                for para in shape.text_frame.paragraphs:
                    for run in para.runs:
                        if (run.font.name or "").lower() == WORDMARK_FONT:
                            typed.append((n, run.text.strip()))
    return len(prs.slides), pictures, typed, offslide


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    decks = sorted(glob.glob(os.path.join(root, "*", "*.pptx")))
    assert decks, "no .pptx found; run each build_deck.py first"

    failures = []
    for path in decks:
        slides, pictures, typed, offslide = audit(path)
        print(f"{os.path.basename(path):45s} slides={slides:3d} wordmark-art={pictures:3d} "
              f"typed-in-{WORDMARK_FONT}={typed or 'none'} off-slide={offslide or 'none'}")
        if typed:
            failures.append(f"{path}: still types the wordmark: {typed}")
        if offslide:
            failures.append(f"{path}: art hangs off the slide: {offslide}")

    if failures:
        raise SystemExit("FAIL\n" + "\n".join(failures))
    print("OK: every wordmark is art, nothing hangs off-slide")


if __name__ == "__main__":
    main()
