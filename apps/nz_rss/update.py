import json
import os
import sys
import html
import urllib.request
from datetime import datetime, timezone, timedelta
from xml.etree import ElementTree as ET

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FEEDS_PATH = os.path.join(SCRIPT_DIR, "feeds.json")
HERALD_DIR = os.path.join(SCRIPT_DIR, "nzherald")
DATA_DIR = os.path.join(HERALD_DIR, "data")
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
        else:
            article["firstSeen"] = now
            by_link[article["link"]] = article

    return list(by_link.values())


def prune_articles(articles):
    cutoff = datetime.now(timezone.utc) - timedelta(days=RETENTION_DAYS)
    kept = []
    for a in articles:
        first_seen = a.get("firstSeen")
        if first_seen:
            try:
                seen_dt = datetime.fromisoformat(first_seen)
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


def generate_feed_html(feed, articles):
    e = html.escape
    cards = []
    for a in articles:
        pub = a.get("pubDate", "")
        try:
            dt = datetime.strptime(pub, "%a, %d %b %Y %H:%M:%S %z")
            date_str = dt.strftime("%-d %b %Y") if sys.platform != "win32" else dt.strftime("%#d %b %Y")
        except ValueError:
            date_str = ""

        img = ""
        if a["imageUrl"]:
            img = f'<img class="card-img" src="{e(a["imageUrl"])}" alt="{e(a["title"])}" loading="lazy">'

        author = ""
        if a["author"]:
            author = f'<div class="card-meta">{e(a["author"])}</div>'

        desc = ""
        if a["description"]:
            desc = f'<p class="card-desc">{e(a["description"])}</p>'

        cards.append(f"""      <a class="card" href="{e(a['link'])}" target="_blank" rel="noopener">
        {img}
        <div class="card-body">
          {author}
          <h2 class="card-title">{e(a['title'])}</h2>
          {desc}
          <div class="card-footer">
            {f'<time>{date_str}</time>' if date_str else '<span></span>'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
          </div>
        </div>
      </a>""")

    now = datetime.now().strftime("%A, %#d %B %Y" if sys.platform == "win32" else "%A, %-d %B %Y")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="shortcut icon" href="../../../favicon.ico">
  <title>Herald &middot; {e(feed['title'])} &mdash; LMarx</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../nzherald.css">
</head>
<body class="nz-feed">
  <nav class="brutal-nav">
    <a class="nav-back" href="../index.html">&larr; All Feeds</a>
    <a class="nav-brand" href="../index.html">HERALD <span class="brand-source">&middot; {e(feed['title'])}</span></a>
  </nav>
  <header class="page-head">
    <h1>{e(feed['title'])}</h1>
    <p>{e(feed['subtitle'])}</p>
    <div class="updated">Updated {now}</div>
  </header>
  <main>
    <div class="grid">
{chr(10).join(cards)}
    </div>
  </main>
  <footer class="brutal-foot">
    <span>HERALD<span class="dot">.</span></span>
    <a href="../../../newsly/index.html">&larr; Newsly</a>
  </footer>
</body>
</html>"""


def generate_index(feeds):
    e = html.escape
    items = []
    for feed in feeds:
        items.append(f"""        <a class="drop-item" href="nzherald/{e(feed['id'])}.html">{e(feed['title'])}<span class="drop-arrow">&rarr;</span></a>""")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="shortcut icon" href="../../favicon.ico">
  <title>NZ News &mdash; LMarx</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;700;900&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="nzherald.css">
</head>
<body class="nz-hub">
  <nav class="brutal-nav">
    <a class="nav-back" href="../../newsly/index.html">&larr; Newsly</a>
    <a class="nav-brand" href="index.html">HERALD <span class="brand-source">&middot; RSS</span></a>
  </nav>
  <header class="page-head">
    <h1>NZ News</h1>
    <p>New Zealand Herald &mdash; RSS Feeds</p>
  </header>
  <main>
    <details class="drop">
      <summary class="drop-head">
        <span>NZ Herald</span>
        <span class="drop-caret">+</span>
      </summary>
      <div class="drop-body">
{chr(10).join(items)}
      </div>
    </details>
  </main>
  <footer class="brutal-foot">
    <span>HERALD<span class="dot">.</span></span>
    <a href="../../newsly/index.html">&larr; Newsly</a>
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

        html_content = generate_feed_html(feed, pruned)
        out_path = os.path.join(HERALD_DIR, f"{fid}.html")
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
