#!/usr/bin/env python3
"""
Fetch the latest Instagram posts via the Meta Graph API and download
full-size images locally so the events page can render them without
relying on Instagram's expiring CDN URLs.

Usage:
    # PowerShell
    $env:INSTAGRAM_TOKEN = "IGAA..."
    python insta/fetch.py

    # or just have INSTAGRAM_TOKEN in the repo-root .env and run:
    python insta/fetch.py

Output:
    insta/insta.json          metadata for each post (used by events.html)
    assets/insta/<id>.jpg     full-size image, one per post

The token is a long-lived (60-day) token from the Instagram Business
Login flow. Refresh it before it expires with refresh_token.py.
"""
import json
import os
import sys
import time
from pathlib import Path

import requests

GRAPH = "https://graph.instagram.com"
FIELDS = "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp"
LIMIT = 12
TIMEOUT = 30

REPO_ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = REPO_ROOT / "assets" / "insta"
JSON_PATH = Path(__file__).resolve().parent / "insta.json"


def load_dotenv() -> None:
    """Load KEY=VALUE pairs from the repo-root .env if present."""
    env_path = REPO_ROOT / ".env"
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def graph_get(path: str, params: dict) -> dict:
    r = requests.get(f"{GRAPH}/{path}", params=params, timeout=TIMEOUT)
    if not r.ok:
        try:
            err = r.json().get("error", {})
            msg = err.get("message", r.text)
        except Exception:
            msg = r.text
        sys.exit(f"Graph API error ({r.status_code}) on {path}: {msg}")
    return r.json()


def download(url: str, dest: Path) -> None:
    r = requests.get(url, timeout=TIMEOUT, stream=True)
    r.raise_for_status()
    dest.write_bytes(r.content)


def main() -> int:
    load_dotenv()
    token = os.environ.get("INSTAGRAM_TOKEN")
    if not token:
        print("ERROR: INSTAGRAM_TOKEN not set (no env var and no .env at repo root).", file=sys.stderr)
        return 1

    IMG_DIR.mkdir(parents=True, exist_ok=True)

    me = graph_get("me", {"fields": "id,username", "access_token": token})
    user_id = me["id"]
    username = me.get("username", "")
    print(f"Authenticated as @{username} (id={user_id})")

    media = graph_get(
        f"{user_id}/media",
        {"fields": FIELDS, "limit": str(LIMIT), "access_token": token},
    )

    posts = []
    for item in media.get("data", []):
        mtype = item.get("media_type")
        if mtype not in ("IMAGE", "CAROUSEL_ALBUM"):
            continue
        img_url = item.get("media_url") or item.get("thumbnail_url")
        if not img_url:
            continue

        post_id = item["id"]
        local = IMG_DIR / f"{post_id}.jpg"
        if local.exists():
            status = "have"
        else:
            try:
                download(img_url, local)
                status = "got "
            except Exception as exc:
                print(f"  FAIL {post_id}: {exc}")
                continue
        print(f"  {status} {post_id}")

        posts.append({
            "id": post_id,
            "src": f"../assets/insta/{post_id}.jpg",
            "permalink": item.get("permalink", ""),
            "caption": (item.get("caption") or "").strip(),
            "timestamp": item.get("timestamp", ""),
            "media_type": mtype,
        })

    payload = {
        "username": username,
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(posts),
        "posts": posts,
    }
    JSON_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nWrote {len(posts)} posts to {JSON_PATH.relative_to(REPO_ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
