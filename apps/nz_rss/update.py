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
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    :root {{
      --pink:#EC4899; --cyan:#06B6D4; --cream:#FDF2F8; --ink:#831843; --black:#0A0A0A;
    }}
    html,body {{ background:var(--cream); color:var(--black); font-family:'Space Grotesk',sans-serif; line-height:1.5; }}
    a {{ color:inherit; text-decoration:none; }}
    .brutal-nav {{ position:sticky; top:0; z-index:100; display:flex; align-items:stretch; justify-content:space-between; background:var(--cream); border-bottom:4px solid var(--black); font-family:'Archivo',sans-serif; font-weight:900; }}
    .brutal-nav a {{ display:flex; align-items:center; padding:0 1.5rem; height:56px; }}
    .nav-back {{ border-right:4px solid var(--black); text-transform:uppercase; letter-spacing:0.05em; font-size:0.9rem; }}
    .nav-back:hover {{ background:var(--black); color:var(--cyan); }}
    .nav-brand {{ font-size:1.25rem; letter-spacing:-0.02em; text-transform:uppercase; }}
    .nav-brand .brand-source {{ color:var(--pink); margin-left:0.6rem; font-size:1rem; letter-spacing:0.12em; }}
    header.page-head {{ max-width:1200px; margin:0 auto; padding:2.5rem 1.5rem 2rem; border-bottom:4px solid var(--black); }}
    header.page-head h1 {{ font-family:'Archivo',sans-serif; font-weight:900; font-size:clamp(2.5rem,7vw,5rem); line-height:0.9; letter-spacing:-0.04em; text-transform:uppercase; }}
    header.page-head p {{ margin-top:0.75rem; font-family:'Archivo',sans-serif; font-size:0.8rem; font-weight:700; color:var(--ink); letter-spacing:0.2em; text-transform:uppercase; }}
    .updated {{ margin-top:0.4rem; font-size:0.8rem; color:var(--ink); }}
    main {{ max-width:1200px; margin:0 auto; padding:2.5rem 1.5rem 4rem; }}
    .grid {{ display:grid; grid-template-columns:1fr; gap:4px; background:var(--black); border:4px solid var(--black); }}
    @media (min-width:640px) {{ .grid {{ grid-template-columns:repeat(2,1fr); }} }}
    @media (min-width:1024px) {{ .grid {{ grid-template-columns:repeat(3,1fr); }} }}
    .card {{ background:var(--cream); cursor:pointer; display:flex; flex-direction:column; color:inherit; }}
    .card:hover {{ background:var(--pink); color:var(--cream); }}
    .card-img {{ width:100%; height:220px; object-fit:cover; display:block; border-bottom:4px solid var(--black); }}
    .card-body {{ padding:1.5rem; flex:1; display:flex; flex-direction:column; }}
    .card-meta {{ font-family:'Archivo',sans-serif; font-size:0.7rem; font-weight:900; color:var(--ink); text-transform:uppercase; letter-spacing:0.15em; margin-bottom:0.6rem; }}
    .card-title {{ font-family:'Archivo',sans-serif; font-size:1.1rem; font-weight:900; line-height:1.05; letter-spacing:-0.02em; margin-bottom:0.6rem; text-transform:uppercase; }}
    .card-desc {{ font-size:0.9rem; color:var(--ink); line-height:1.5; flex:1; }}
    .card-footer {{ margin-top:1.25rem; display:flex; align-items:center; justify-content:space-between; font-family:'Archivo',sans-serif; font-size:0.7rem; font-weight:900; color:var(--ink); text-transform:uppercase; letter-spacing:0.1em; }}
    .card:hover .card-meta, .card:hover .card-desc, .card:hover .card-footer {{ color:var(--cream); }}
    footer.brutal-foot {{ background:var(--black); color:var(--cream); font-family:'Archivo',sans-serif; font-weight:700; padding:1.5rem; display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; letter-spacing:0.1em; text-transform:uppercase; }}
    footer.brutal-foot .dot {{ color:var(--pink); }}
    footer.brutal-foot a:hover {{ color:var(--cyan); }}
    @media (max-width:639px) {{ header.page-head {{ padding:1.5rem 1rem 1.25rem; }} main {{ padding:1.25rem 1rem 3rem; }} .card-img {{ height:180px; }} }}
  </style>
</head>
<body>
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
  <style>
    *,*::before,*::after{{box-sizing:border-box;margin:0;padding:0}}
    :root {{
      --pink:#EC4899; --cyan:#06B6D4; --cream:#FDF2F8; --ink:#831843; --black:#0A0A0A;
    }}
    html,body {{ background:var(--cream); color:var(--black); font-family:'Space Grotesk',sans-serif; line-height:1.5; min-height:100vh; display:flex; flex-direction:column; }}
    a {{ color:inherit; text-decoration:none; }}
    .brutal-nav {{ position:sticky; top:0; z-index:100; display:flex; align-items:stretch; justify-content:space-between; background:var(--cream); border-bottom:4px solid var(--black); font-family:'Archivo',sans-serif; font-weight:900; }}
    .brutal-nav a {{ display:flex; align-items:center; padding:0 1.5rem; height:56px; }}
    .nav-back {{ border-right:4px solid var(--black); text-transform:uppercase; letter-spacing:0.05em; font-size:0.9rem; }}
    .nav-back:hover {{ background:var(--black); color:var(--cyan); }}
    .nav-brand {{ font-size:1.25rem; letter-spacing:-0.02em; text-transform:uppercase; }}
    .nav-brand .brand-source {{ color:var(--pink); margin-left:0.6rem; font-size:1rem; letter-spacing:0.12em; }}
    header.page-head {{ max-width:1200px; margin:0 auto; padding:2.5rem 1.5rem 2rem; border-bottom:4px solid var(--black); width:100%; }}
    header.page-head h1 {{ font-family:'Archivo',sans-serif; font-weight:900; font-size:clamp(2.5rem,8vw,6rem); line-height:0.85; letter-spacing:-0.04em; text-transform:uppercase; }}
    header.page-head p {{ margin-top:0.75rem; font-family:'Archivo',sans-serif; font-size:0.8rem; font-weight:700; color:var(--ink); letter-spacing:0.2em; text-transform:uppercase; }}
    main {{ max-width:760px; margin:0 auto; padding:3rem 1.5rem 4rem; width:100%; flex:1; }}
    .drop {{ border:4px solid var(--black); background:var(--cream); box-shadow:8px 8px 0 var(--black); }}
    .drop-head {{ list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1.75rem 2rem; font-family:'Archivo',sans-serif; font-weight:900; font-size:clamp(1.6rem,4vw,2.5rem); text-transform:uppercase; letter-spacing:-0.02em; }}
    .drop-head::-webkit-details-marker {{ display:none; }}
    .drop-caret {{ flex:none; width:44px; height:44px; border:3px solid var(--black); display:grid; place-items:center; font-size:1.5rem; background:var(--cream); }}
    .drop[open] .drop-caret, .drop-head:hover .drop-caret {{ background:var(--pink); color:var(--cream); }}
    .drop-body {{ display:flex; flex-direction:column; border-top:4px solid var(--black); }}
    .drop-item {{ display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1.25rem 2rem; font-family:'Archivo',sans-serif; font-weight:900; font-size:1.1rem; text-transform:uppercase; letter-spacing:0.02em; border-bottom:3px solid var(--black); }}
    .drop-item:last-child {{ border-bottom:0; }}
    .drop-item:hover {{ background:var(--pink); color:var(--cream); }}
    .drop-arrow {{ color:var(--ink); }}
    .drop-item:hover .drop-arrow {{ color:var(--cream); }}
    footer.brutal-foot {{ background:var(--black); color:var(--cream); font-family:'Archivo',sans-serif; font-weight:700; padding:1.5rem; display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; letter-spacing:0.1em; text-transform:uppercase; }}
    footer.brutal-foot .dot {{ color:var(--pink); }}
    footer.brutal-foot a:hover {{ color:var(--cyan); }}
    @media (max-width:639px) {{ header.page-head {{ padding:1.5rem 1rem 1.25rem; }} main {{ padding:2rem 1rem 3rem; }} }}
  </style>
</head>
<body>
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
