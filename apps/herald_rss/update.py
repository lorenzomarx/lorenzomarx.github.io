import json
import os
import sys
import html
import urllib.request
from datetime import datetime, timezone, timedelta
from xml.etree import ElementTree as ET

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FEEDS_PATH = os.path.join(SCRIPT_DIR, "feeds.json")
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
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
  <title>Herald RSS — {e(feed['title'])}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    :root {{
      --bg: #FFFBE6; --surface: #FFFFFF; --text: #000000;
      --text-muted: #333333; --text-light: #555555;
      --red: #FF0000; --blue: #0000FF; --yellow: #FFEB3B; --green: #4ADE80;
      --border: #000000; --shadow: 5px 5px 0 #000;
      --font-heading: 'Syncopate', system-ui, sans-serif;
      --font-body: 'Space Mono', monospace;
    }}
    body {{ font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.6; }}
    header {{ max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 2rem; border-bottom: 4px solid var(--border); }}
    header h1 {{ font-family: var(--font-heading); font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; letter-spacing: 0.05em; line-height: 1.1; text-transform: uppercase; }}
    header p {{ margin-top: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }}
    .updated {{ margin-top: 0.25rem; font-size: 0.75rem; color: var(--text-light); font-weight: 400; }}
    .back {{ display: inline-block; margin-top: 0.75rem; font-size: 0.8rem; font-weight: 700; color: var(--blue); text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid var(--blue); }}
    .back:hover {{ color: var(--red); border-color: var(--red); }}
    main {{ max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem 4rem; }}
    .grid {{ display: grid; grid-template-columns: 1fr; gap: 1.5rem; }}
    @media (min-width: 640px) {{ .grid {{ grid-template-columns: repeat(2, 1fr); }} }}
    @media (min-width: 1024px) {{
      .grid {{ grid-template-columns: repeat(3, 1fr); }}
      .grid .card:first-child {{ grid-column: 1 / -1; display: grid; grid-template-columns: 1fr 1fr; gap: 0; }}
      .grid .card:first-child .card-img {{ height: 100%; min-height: 360px; }}
      .grid .card:first-child .card-body {{ padding: 2rem; display: flex; flex-direction: column; justify-content: center; }}
      .grid .card:first-child .card-title {{ font-size: 1.4rem; }}
    }}
    .card {{ background: var(--surface); border: 3px solid var(--border); box-shadow: var(--shadow); cursor: pointer; display: flex; flex-direction: column; color: inherit; text-decoration: none; opacity: 0; transform: translateY(20px); animation: reveal 0.4s ease forwards; }}
    .card:hover {{ box-shadow: 8px 8px 0 var(--green); transform: translate(-3px, -3px); }}
    .card:focus {{ outline: 3px solid var(--blue); outline-offset: 2px; }}
    .card-img {{ width: 100%; height: 220px; object-fit: cover; display: block; background: #E4E4E7; border-bottom: 3px solid var(--border); }}
    .card-body {{ padding: 1.25rem; flex: 1; display: flex; flex-direction: column; }}
    .card-meta {{ font-size: 0.7rem; font-weight: 700; color: var(--red); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }}
    .card-title {{ font-family: var(--font-heading); font-size: 1rem; font-weight: 700; line-height: 1.3; letter-spacing: 0.02em; margin-bottom: 0.5rem; text-transform: uppercase; }}
    .card-desc {{ font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; flex: 1; }}
    .card-footer {{ margin-top: 1rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.05em; }}
    @keyframes reveal {{ to {{ opacity: 1; transform: translateY(0); }} }}
    .card:nth-child(1) {{ animation-delay: 0s; }}
    .card:nth-child(2) {{ animation-delay: 0.05s; }}
    .card:nth-child(3) {{ animation-delay: 0.1s; }}
    .card:nth-child(4) {{ animation-delay: 0.15s; }}
    .card:nth-child(5) {{ animation-delay: 0.2s; }}
    .card:nth-child(6) {{ animation-delay: 0.25s; }}
    .card:nth-child(7) {{ animation-delay: 0.3s; }}
    .card:nth-child(8) {{ animation-delay: 0.35s; }}
    .card:nth-child(9) {{ animation-delay: 0.4s; }}
    .card:nth-child(10) {{ animation-delay: 0.45s; }}
    @media (max-width: 639px) {{ header {{ padding: 1.5rem 1rem 1.25rem; }} main {{ padding: 1.25rem 1rem 3rem; }} .card-img {{ height: 180px; }} }}
    @media (prefers-reduced-motion: reduce) {{ .card {{ animation: none; opacity: 1; transform: none; }} .card:hover {{ transform: none; }} }}
  </style>
</head>
<body>
  <header>
    <h1>Herald RSS</h1>
    <p>{e(feed['subtitle'])}</p>
    <div class="updated">Updated {now}</div>
    <a class="back" href="index.html">&larr; All feeds</a>
  </header>
  <main>
    <div class="grid">
{chr(10).join(cards)}
    </div>
  </main>
</body>
</html>"""


def generate_index(feeds):
    e = html.escape
    cards = []
    for feed in feeds:
        cards.append(f"""      <a href="{e(feed['id'])}.html" class="feed-card">
        <h2>{e(feed['title'])}</h2>
        <p>{e(feed['description'])}</p>
        <span class="arrow">
          Read feed
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17l9.2-9.2M17 17V8H8"/></svg>
        </span>
      </a>""")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Herald RSS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Syncopate:wght@400;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    :root {{
      --bg: #FFFBE6; --surface: #FFFFFF; --text: #000000;
      --text-muted: #333333; --text-light: #555555;
      --red: #FF0000; --blue: #0000FF; --yellow: #FFEB3B; --green: #4ADE80;
      --border: #000000; --shadow: 5px 5px 0 #000;
      --font-heading: 'Syncopate', system-ui, sans-serif;
      --font-body: 'Space Mono', monospace;
    }}
    body {{ font-family: var(--font-body); background: var(--bg); color: var(--text); line-height: 1.6; min-height: 100vh; display: flex; flex-direction: column; }}
    header {{ max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem 2rem; border-bottom: 4px solid var(--border); width: 100%; }}
    header h1 {{ font-family: var(--font-heading); font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 700; letter-spacing: 0.05em; line-height: 1.1; text-transform: uppercase; }}
    header p {{ margin-top: 0.5rem; font-size: 0.8rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }}
    main {{ max-width: 1200px; margin: 0 auto; padding: 3rem 1.5rem 4rem; width: 100%; flex: 1; }}
    .feeds {{ display: grid; grid-template-columns: 1fr; gap: 1.5rem; }}
    @media (min-width: 640px) {{ .feeds {{ grid-template-columns: repeat(2, 1fr); }} }}
    .feed-card {{ background: var(--surface); border: 3px solid var(--border); box-shadow: var(--shadow); padding: 2.5rem 2rem; text-decoration: none; color: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 0.75rem; opacity: 0; transform: translateY(20px); animation: reveal 0.4s ease forwards; }}
    .feed-card:nth-child(1) {{ animation-delay: 0s; }}
    .feed-card:nth-child(2) {{ animation-delay: 0.1s; }}
    .feed-card:nth-child(3) {{ animation-delay: 0.2s; }}
    .feed-card:nth-child(4) {{ animation-delay: 0.3s; }}
    .feed-card:hover {{ box-shadow: 8px 8px 0 var(--green); transform: translate(-3px, -3px); }}
    .feed-card:focus {{ outline: 3px solid var(--red); outline-offset: 2px; }}
    .feed-card h2 {{ font-family: var(--font-heading); font-size: 1.2rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }}
    .feed-card p {{ color: var(--text-muted); font-size: 0.85rem; }}
    .feed-card .arrow {{ margin-top: auto; color: var(--red); display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; }}
    @keyframes reveal {{ to {{ opacity: 1; transform: translateY(0); }} }}
    @media (max-width: 639px) {{ header {{ padding: 1.5rem 1rem 1.25rem; }} main {{ padding: 2rem 1rem 3rem; }} }}
    @media (prefers-reduced-motion: reduce) {{ .feed-card {{ animation: none; opacity: 1; transform: none; }} .feed-card:hover {{ transform: none; }} }}
  </style>
</head>
<body>
  <header>
    <h1>Herald RSS</h1>
    <p>New Zealand Herald — RSS Feed Reader</p>
  </header>
  <main>
    <div class="feeds">
{chr(10).join(cards)}
    </div>
  </main>
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
        out_path = os.path.join(SCRIPT_DIR, f"{fid}.html")
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
