# HYGIA wordmark: source of truth

Every project that needs the HYGIA mark pulls from this folder. Nothing keeps its own copy.
That includes the pitch decks in `airbnb-str/`, `commercial-standard/`, and `wellness-medspa/`,
which stay out of the main repo and will each get their own repo later.

## How consumers find this folder

`build_deck.py` resolves it in this order, so a deck builds whether it still sits inside
`hygia/` or has been split out to its own repo elsewhere:

1. the parent of the script's own folder, for a deck still nested in `hygia/`
2. `$HYGIA_HOME`, if you set it
3. `~/hygia`, the default location

If none of those has an `assets/logo/`, the build stops with a message naming the fix
rather than producing a deck with a missing logo.

## What is here

The mark is Ethnocentric Bold converted to outlines. It is set type, not drawn artwork,
so it is regenerated from the font rather than traced.

| File | Use |
|---|---|
| `hygia-wordmark.svg` | web master, `fill="currentColor"`, inherits CSS `color` |
| `hygia-wordmark-<color>.svg` | fixed-fill vectors for tools that ignore currentColor |
| `hygia-wordmark-<color>@1x/2x/3x.png` | transparent raster at 400 / 800 / 1200 px wide |
| `hygia-wordmark-<color>@master.png` | transparent raster at 4000 px wide, what the decks place |

Colors: `black`, `white`, `accent-bright` (#0CA0DC), `accent-deep` (#055C7F).

Geometry: aspect ratio 6.514:1, cap height 0.681 per em. Those two numbers are what
`build_deck.py` uses to size the art against a point size, so if you change the letterspacing
you have to update them there too.

## Changing it

    python tools/make_logo_assets.py

`TRACKING` at the top of that script is the only knob worth touching. Adding a color means
adding one line to its `COLORS` dict, then adding the same hex to `LOGO_FILES` in each
`build_deck.py` that needs it.

The site does not read these files. `index.html` inlines the path directly as an SVG
`<symbol id="hygia-wordmark">` so CSS can recolor it. If you change the outline, update that
symbol too.
