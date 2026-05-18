# lorenzomarx.github.io

Personal site / creative portfolio for **LMarx** (Lorenz). Static site, deployed
via GitHub Pages from `main`. No build step — plain HTML/CSS/JS.

## Conventions (read before working)

### `apps/` is OFF-LIMITS
Do not read, edit, move, or commit anything inside `apps/` unless the current
request explicitly tells you to. The user reorganises that directory manually.
If a change in a root file references a path under `apps/`, point it out but
don't open files in there without permission.

### Testing — never the built-in preview panel
The Claude preview panel can't reliably serve images, `fetch`, or iframes.
The user runs the site locally at **http://192.168.1.117:8080**. To verify a
change, tell them to reload the specific URL, e.g.
`http://192.168.1.117:8080/pages/lorenz.html`. Don't say "visible in the
preview panel."

### House style — bold brutalist
- Palette: pink `#EC4899`, cyan `#06B6D4`, cream `#FDF2F8`, ink `#831843`,
  near-black `#0A0A0A`.
- Fonts: Archivo (900 weight, headings) + Space Grotesk (body), via Google Fonts.
- Sharp corners, 4px black borders, hard offset shadows, instant transitions,
  oversized uppercase headings.
- New pages should be self-contained (inline `<style>`) unless they're part of
  a multi-page cluster that already shares a CSS file (e.g. `pages/lorenz.css`,
  `newsly/news.css`).

### `<title>` in Title Case
Browser-tab titles are Title Case, e.g. `Newsly · Reuters — LMarx`. NOT all
caps. On-page UPPERCASE is done with CSS `text-transform`, never in the title
tag. The brand name is **LMarx**.

### Git / deploy
- `push.bat "msg"` (repo root, gitignored) stages all, commits, `pull --rebase`,
  pushes. The user runs this themselves — don't run it for them unless asked.
- A Raspberry Pi pushes `newsly/api/*.json` on a cron, so rebase conflicts on
  those data files are expected. Resolve by keeping the local copy
  (`git checkout --theirs <file>` mid-rebase, then `git add` + `--continue`) —
  the JSON is regenerated data, not precious.
- Never commit secrets. `.env` (gitignored) holds `NEWSAPI_KEY`;
  `.env.example` is the committed template.

## Newsly (`newsly/`)
Brutalist news aggregator. Each source lives in `newsly/api/<source>/` with
`index.html` + `weather.js` + `<src>.py` + `<src>.json`. The `.py` scripts read
`NEWSAPI_KEY` from env or the repo-root `.env`, hit newsapi.org
`/v2/top-headlines` (Vice uses `/v2/everything` — its top-headlines feed is
frozen). `/v1/` is dead — never use it.

- Refresh all sources without the Pi: `python newsly/api/refresh_all.py`
  (auto-loads `.env`), then `push.bat`.
- `newsly/api/SOURCES.md` — full catalog of newsapi sources by country/category.
- `newsly/api/README.md` — Pi setup + source table.
- Active sources = whatever's in `refresh_all.py` SOURCES (no manual count to keep in sync).

### Adding (or removing) a source — do ALL of these, every time
A "source" is more than a page. For source `<src>` in `newsly/api/<src>/`:
1. **Page**: copy an existing brutalist source page (e.g. `bbcApi/index.html`),
   never a legacy/old template. Update `<title>` (Title Case), the `· <SRC>`
   brand, and mark its own `.source-strip` entry `class="active"`.
2. **Data**: `<src>.py` fetches the correct newsapi source and writes
   `<src>.json`; `weather.js` loads `.../api/<src>/<src>.json`. Run it once
   (key set) so the JSON isn't stale.
3. **Refresh script**: add `('<src>', '<src>.py')` to `refresh_all.py` SOURCES.
4. **Nav rows**: add the source to the `.source-strip` on **every** source
   page, not just the new one.
5. **Homepage**: add a tile to `newsly/index.html`.
6. **Docs**: add a row to `newsly/api/README.md`.

`refresh_all.py` SOURCES, the homepage tiles, and every `.source-strip` stay in
the **same alphabetical order** (by folder name). Removing a source = the same
six places, in reverse.

## Structure
- `index.html` — brutalist home: work grid + collapsible "Bits" dropdown.
- `pages/` — standalone pages: `lorenz`/`bio`/`events` (DJ cluster, share
  `lorenz.css`), `drips`, `mixedup`, `contact`, `oosh`.
- `newsly/` — news aggregator (above).
- `apps/` — user-managed mini-apps (**OFF-LIMITS**).
- `assets/`, `css/`, `js/` — shared resources.
