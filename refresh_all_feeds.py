#!/usr/bin/env python3
"""Refresh every feed on the site, in order:

  1. All Newsly newsapi sources  -> newsly/api/refresh_all.py
  2. Every RSS feed app          -> apps/*_rss/update.py  (auto-discovered)

Usage (from anywhere):
    python refresh_all_feeds.py

Notes:
- The newsapi step needs NEWSAPI_KEY (env var or the repo-root .env);
  refresh_all.py loads that itself.
- The RSS apps need no key (plain RSS over HTTP).
- Exit code is 0 only if every step succeeded, so it chains safely in a
  cron / push wrapper:  python refresh_all_feeds.py && push.bat "feeds"
"""
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent


def jobs():
    """(label, script) pairs: newsapi first, then each apps/*_rss app."""
    yield ("Newsly newsapi sources", REPO / "newsly" / "api" / "refresh_all.py")
    for update in sorted((REPO / "dev" / "rss").glob("*_rss/update.py")):
        yield (f"RSS · {update.parent.name}", update)


def main() -> int:
    failures = []
    for label, script in jobs():
        rel = script.relative_to(REPO)
        print(f"\n{'=' * 64}\n  {label}  —  {rel}\n{'=' * 64}", flush=True)

        if not script.exists():
            print(f"SKIP — {rel} not found", flush=True)
            failures.append(label)
            continue

        result = subprocess.run([sys.executable, str(script)], cwd=script.parent)
        if result.returncode == 0:
            print(f"--- {label}: OK ---", flush=True)
        else:
            print(f"--- {label}: FAILED (exit {result.returncode}) ---", flush=True)
            failures.append(label)

    print(f"\n{'=' * 64}", flush=True)
    if failures:
        print(f"DONE with failures: {', '.join(failures)}", flush=True)
        return 1
    print("DONE — all feeds refreshed.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
