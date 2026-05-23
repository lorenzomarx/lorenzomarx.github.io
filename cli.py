#!/usr/bin/env python3
"""LMarx interactive project CLI."""
import subprocess
import sys
import os
from pathlib import Path

REPO = Path(__file__).resolve().parent

COMMANDS = []


def cmd(key, label):
    def decorator(fn):
        COMMANDS.append((key, label, fn))
        return fn
    return decorator


@cmd("1", "Refresh all feeds")
def refresh():
    script = REPO / "refresh_all_feeds.py"
    subprocess.run([sys.executable, str(script)], cwd=REPO)


def banner():
    os.system("cls" if os.name == "nt" else "clear")
    print("=" * 40)
    print("  LMARX CLI")
    print("=" * 40)
    print()
    for key, label, _ in COMMANDS:
        print(f"  [{key}]  {label}")
    print(f"  [q]  Quit")
    print()


def main():
    while True:
        banner()
        choice = input("  > ").strip().lower()
        if choice == "q":
            break
        matched = next((c for c in COMMANDS if c[0] == choice), None)
        if not matched:
            input("  Invalid option. Press Enter...")
            continue
        print()
        matched[2]()
        print()
        input("  Press Enter to return to menu...")


if __name__ == "__main__":
    main()
