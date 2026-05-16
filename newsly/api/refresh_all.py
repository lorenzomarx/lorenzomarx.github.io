#!/usr/bin/env python3
"""
Refresh every Newsly source JSON in one go.

Usage:
    # PowerShell:
    $env:NEWSAPI_KEY = "your-key"
    python newsly/api/refresh_all.py

    # Git Bash / WSL / Linux / Mac:
    NEWSAPI_KEY=your-key python3 newsly/api/refresh_all.py

After this finishes, run `.\\push.bat "Refresh news"` (or your usual git workflow)
to publish the updated JSONs.

This is the replacement for the Pi's cron job while the Pi is offline. Same
logic — it just runs each source's individual .py script in turn.
"""
import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

# (folder name, script filename) — keep in alphabetical order to match strip
SOURCES = [
    ('aljazApi',     'aljaz.py'),
    ('ap',           'ap.py'),
    ('bbcApi',       'bbc.py'),
    ('bbcSport',     'bbcsport.py'),
    ('bloomberg',    'bloomberg.py'),
    ('breaking_us',  'breaking_us.py'),
    ('cnn',          'cnn.py'),
    ('huffington',   'huffington.py'),
    ('techradar',    'techradar.py'),
    ('vice',         'vice.py'),
    ('washpost',     'washpost.py'),
    ('wired',        'wired.py'),
    ('wsj',          'wsj.py'),
]


def load_dotenv() -> None:
    """Load KEY=VALUE pairs from the repo-root .env if present.

    Real environment variables take precedence (setdefault), so the Pi's
    exported NEWSAPI_KEY still wins when this runs there. No dependency.
    """
    env_path = Path(__file__).resolve().parents[2] / '.env'
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding='utf-8').splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, _, val = line.partition('=')
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def main() -> int:
    load_dotenv()

    if not os.environ.get('NEWSAPI_KEY'):
        print('ERROR: NEWSAPI_KEY not set (no env var and no .env at repo root).', file=sys.stderr)
        print('  Create a .env file at the repo root containing:', file=sys.stderr)
        print('      NEWSAPI_KEY=your-key', file=sys.stderr)
        print('  ...or set it for the session:', file=sys.stderr)
        print('      PowerShell: $env:NEWSAPI_KEY = "your-key"', file=sys.stderr)
        print('      Bash:        export NEWSAPI_KEY=your-key', file=sys.stderr)
        return 1

    base = Path(__file__).resolve().parent
    print(f'Refreshing {len(SOURCES)} sources — {datetime.now().isoformat(timespec="seconds")}')
    print()

    ok = 0
    failures = []

    for folder, script in SOURCES:
        src_dir = base / folder
        script_path = src_dir / script
        label = f'  {folder:<14}'

        if not script_path.exists():
            print(f'{label} SKIP — {script_path.relative_to(base)} not found')
            failures.append(folder)
            continue

        try:
            result = subprocess.run(
                [sys.executable, script],
                cwd=src_dir,
                capture_output=True,
                text=True,
                timeout=45,
            )
        except subprocess.TimeoutExpired:
            print(f'{label} FAIL — timed out after 45s')
            failures.append(folder)
            continue
        except Exception as exc:
            print(f'{label} FAIL — {exc}')
            failures.append(folder)
            continue

        if result.returncode == 0:
            print(f'{label} OK')
            ok += 1
        else:
            err = (result.stderr or result.stdout or '').strip().splitlines()
            msg = err[-1] if err else f'exit {result.returncode}'
            print(f'{label} FAIL — {msg}')
            failures.append(folder)

    print()
    print(f'Refreshed: {ok}/{len(SOURCES)}')
    if failures:
        print(f'Failures: {", ".join(failures)}')
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())
