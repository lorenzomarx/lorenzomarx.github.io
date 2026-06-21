import json
import os
import random
import sys
import html
import urllib.request
from datetime import datetime, timezone, timedelta
from xml.etree import ElementTree as ET

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FEEDS_PATH = os.path.join(SCRIPT_DIR, "feeds.json")
NYT_DIR = os.path.join(SCRIPT_DIR, "nytimes")
DATA_DIR = os.path.join(NYT_DIR, "data")
MAX_ARTICLES = 20
RETENTION_DAYS = 3

NS = {
    "dc": "http://purl.org/dc/elements/1.1/",
    "media": "http://search.yahoo.com/mrss/",
}


def fetch_rss(url):
    req = urllib.request.Request(url, headers={"User-Agent": "HeraldRSS/1.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read()


def parse_feed(xml_bytes):
    root = ET.fromstring(xml_bytes)
    articles = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        desc = (item.findtext("description") or "").strip()
        pub_date = (item.findtext("pubDate") or "").strip()
        author = (item.findtext("dc:creator", namespaces=NS) or "").strip()

        image_url = ""
        for mc in item.findall("media:content", NS):
            url = mc.get("url", "")
            w = int(mc.get("width", "0"))
            if url and w >= 600:
                image_url = url
                break
        if not image_url:
            first = item.find("media:content", NS)
            if first is not None:
                image_url = first.get("url", "")

        if not link:
            continue

        articles.append({
            "title": title,
            "link": link,
            "description": desc,
            "author": author,
            "pubDate": pub_date,
            "imageUrl": image_url,
        })
    return articles


def load_existing(feed_id):
    path = os.path.join(DATA_DIR, f"{feed_id}.json")
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def merge_articles(existing, fresh):
    by_link = {a["link"]: a for a in existing}
    now = datetime.now(timezone.utc).isoformat()

    for article in fresh:
        if article["link"] in by_link:
            old = by_link[article["link"]]
            old["title"] = article["title"]
            old["description"] = article["description"]
            old["author"] = article["author"]
            old["imageUrl"] = article["imageUrl"]
            old["lastSeen"] = now
        else:
            article["firstSeen"] = now
            article["lastSeen"] = now
            by_link[article["link"]] = article

    return list(by_link.values())


def prune_articles(articles):
    cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)
    kept = []
    for a in articles:
        stamp = a.get("lastSeen") or a.get("firstSeen")
        if stamp:
            try:
                seen_dt = datetime.fromisoformat(stamp)
                if seen_dt < cutoff:
                    continue
            except ValueError:
                pass
        kept.append(a)

    def parse_pub(a):
        try:
            return datetime.strptime(a.get("pubDate", ""), "%a, %d %b %Y %H:%M:%S %z")
        except ValueError:
            return datetime.min.replace(tzinfo=timezone.utc)
    kept.sort(key=parse_pub, reverse=True)
    return kept[:MAX_ARTICLES]


def save_data(feed_id, articles):
    path = os.path.join(DATA_DIR, f"{feed_id}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)


def generate_feed_html(feed, articles, all_feeds):
    e = html.escape

    cards = []
    for a in articles:
        parts = []
        if a.get("author"):
            parts.append(f'            <span class="author">{e(a["author"])}</span>')
        if a.get("title"):
            parts.append(f'            <h2 class="title">{e(a["title"])}</h2>')
        if a.get("imageUrl"):
            parts.append(f'            <img class="news-img" src="{e(a["imageUrl"])}" alt="{e(a.get("title", ""))}">')
        if a.get("description"):
            parts.append(f'            <p class="description">{e(a["description"])}</p>')
        if a.get("link"):
            parts.append(f'            <a class="read-btn" href="{e(a["link"])}" target="_blank" rel="noopener">Read &rarr;</a>')
        cards.append('          <div class="article-card">\n'
                     + "\n".join(parts)
                     + '\n          </div>')
    cards_html = "\n".join(cards)

    strip = []
    for f in all_feeds:
        active = ' class="active"' if f["id"] == feed["id"] else ""
        strip.append(f'        <a href="{e(f["id"])}.html"{active}>{e(f["title"]).upper()}</a>')
    strip_html = "\n".join(strip)

    top_btn = """    <button type="button" class="top-btn" id="top-btn" aria-label="Back to top">&uarr;</button>

    <script>
        (() => {
            const btn = document.getElementById('top-btn');
            const toggle = () => btn.classList.toggle('show', window.scrollY > 220);
            window.addEventListener('scroll', toggle, { passive: true });
            toggle();
            btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        })();
    </script>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="shortcut icon" href="../../../../favicon.ico">
    <title>NY Times &middot; {e(feed['title'])} &mdash; LMarx</title>

    <link href="../../../../newsly/news.css" rel="stylesheet">
</head>
<body>

    <nav class="brutal-nav">
        <a class="nav-back" href="../index.html">&larr; NY TIMES</a>
        <a class="nav-brand" href="../index.html">NY TIMES <span class="brand-source">&middot; {e(feed['title'])}</span></a>
    </nav>

    <nav class="source-strip">
{strip_html}
    </nav>

    <section class="articles">
        <div id="result">
{cards_html}
        </div>
    </section>

    <footer class="brutal-foot">
        <div class="foot-mark">NY TIMES<span class="dot">.</span></div>
        <a href="../index.html">&larr; All feeds</a>
    </footer>

{top_btn}
</body>
</html>"""


def generate_index(feeds):
    e = html.escape

    # Bucket feeds by their "group" (default "NY Times"), first-seen order.
    grouped = {}
    for feed in feeds:
        grouped.setdefault(feed.get("group", "NY Times"), []).append(feed)

    dropdowns = []
    for gname, gfeeds in grouped.items():
        links = "\n".join(
            f"""        <a class="drop-item" href="nytimes/{e(f['id'])}.html">{e(f['title'])}<span class="drop-arrow">&rarr;</span></a>"""
            for f in gfeeds
        )
        dropdowns.append(f"""    <details class="drop">
      <summary class="drop-head">
        <span>{e(gname)}</span>
        <span class="drop-caret">+</span>
      </summary>
      <div class="drop-body">
{links}
      </div>
    </details>""")
    dropdowns_html = "\n".join(dropdowns)

    # Featured image: a random photo from the Photos feed data, baked in at
    # generate time (rotates each refresh). Degrades to nothing if absent.
    featured = ""
    try:
        with open(os.path.join(DATA_DIR, "photos.json"), "r", encoding="utf-8") as pf:
            pics = [p for p in json.load(pf) if p.get("imageUrl")]
        if pics:
            pic = random.choice(pics)
            featured = f"""    <a class="feature" href="{e(pic.get('link', '#'))}" target="_blank" rel="noopener">
      <img src="{e(pic['imageUrl'])}" alt="{e(pic.get('title', ''))}" loading="lazy">
      <span class="feature-label">Featured &middot; Random</span>
    </a>
"""
    except (OSError, ValueError):
        featured = ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="shortcut icon" href="../../../favicon.ico">
  <title>NY Times &mdash; LMarx</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="nytimes.css">
</head>
<body class="nz-hub">
  <nav class="brutal-nav">
    <a class="nav-back" href="../../../newsly/index.html">&larr; Newsly</a>
    <a class="nav-brand" href="index.html">NY TIMES <span class="brand-source">&middot; RSS</span></a>
  </nav>
  <header class="page-head">
    <h1>NY Times</h1>
    <p>The New York Times &mdash; RSS Feeds</p>
  </header>
  <main>
{featured}{dropdowns_html}
  </main>
  <footer class="brutal-foot">
    <span>NY TIMES<span class="dot">.</span></span>
    <a href="../../../newsly/index.html">&larr; Newsly</a>
  </footer>
</body>
</html>"""


def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    with open(FEEDS_PATH, "r", encoding="utf-8") as f:
        feeds = json.load(f)

    for feed in feeds:
        fid = feed["id"]
        print(f"[{fid}] Fetching {feed['url'][:60]}...")

        try:
            xml_bytes = fetch_rss(feed["url"])
        except Exception as exc:
            print(f"[{fid}] Fetch failed: {exc}")
            continue

        fresh = parse_feed(xml_bytes)
        print(f"[{fid}] Parsed {len(fresh)} articles from feed")

        existing = load_existing(fid)
        merged = merge_articles(existing, fresh)
        pruned = prune_articles(merged)
        print(f"[{fid}] {len(existing)} existing + {len(fresh)} fetched -> {len(pruned)} after merge/prune")

        save_data(fid, pruned)

        html_content = generate_feed_html(feed, pruned, feeds)
        out_path = os.path.join(NYT_DIR, f"{fid}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"[{fid}] Wrote {out_path}")

    index_html = generate_index(feeds)
    index_path = os.path.join(SCRIPT_DIR, "index.html")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_html)
    print(f"Wrote {index_path}")
    print("Done.")


if __name__ == "__main__":
    main()
