#!/usr/bin/env python3
"""
Wire up three more agent photos in meet-our-team.html:
Ally Valdez, Edmi Dominguez, Magarely Sanchez.
Idempotent — only touches cards that still show initials.
"""
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).parent
HTML = REPO / "meet-our-team.html"

# (full name, image filename — must match file on disk, case-sensitive)
AGENTS = [
    ("Ally Valdez",       "ally.jpg"),
    ("Edmi Dominguez",    "edmi.jpg"),
    ("Magarely Sanchez",  "Magarely.jpg"),
]

IMG_STYLE = (
    "width:100%;height:100%;object-fit:cover;"
    "object-position:center 25%;border-radius:50%;"
)

def replace_initials(html: str, name: str, filename: str) -> tuple[str, bool]:
    pattern = re.compile(
        r'<div class="team-photo">\s*'
        r'<span class="team-initials">[A-Za-z]+</span>\s*'
        r'</div>(\s*<h3 class="team-name">' + re.escape(name) + r'</h3>)',
        re.DOTALL,
    )
    new_block = (
        f'<div class="team-photo">'
        f'<img src="{filename}" alt="{name}" style="{IMG_STYLE}">'
        f'</div>\\1'
    )
    new_html, n = pattern.subn(new_block, html, count=1)
    return new_html, n == 1

def main():
    if not HTML.exists():
        print(f"ERROR: {HTML} not found. Run from repo root.")
        sys.exit(1)

    html = HTML.read_text()
    for name, filename in AGENTS:
        if not (REPO / filename).exists():
            print(f"SKIP: {filename} missing on disk")
            continue
        html, ok = replace_initials(html, name, filename)
        print(f"{'OK  ' if ok else 'MISS'}: {name} → {filename}")

    HTML.write_text(html)
    print(f"\nWrote {HTML.name}")

    subprocess.run(["git", "add", "-A"], cwd=REPO, check=True)
    if subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=REPO).returncode == 0:
        print("No changes to commit.")
        return
    subprocess.run(
        ["git", "commit", "-m",
         "Add profile photos for Ally, Edmi, and Magarely"],
        cwd=REPO, check=True,
    )
    subprocess.run(["git", "push"], cwd=REPO, check=True)
    print("Pushed.")

if __name__ == "__main__":
    main()
