#!/usr/bin/env python3
"""
Wire up three new agent photos in meet-our-team.html.
Replaces the initials placeholder for Aidyl, Elizabeth, and Michelle Dennison
with <img> tags pointing at the jpg files already sitting in the repo root.
"""
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).parent
HTML = REPO / "meet-our-team.html"

# (full name, image filename)
AGENTS = [
    ("Aidyl Semidey",      "aidyl.jpg"),
    ("Elizabeth Perez",    "elizabeth.jpg"),
    ("Michelle Dennison",  "michelled.jpg"),
]

IMG_STYLE = (
    "width:100%;height:100%;object-fit:cover;"
    "object-position:center 25%;border-radius:50%;"
)

def replace_initials(html: str, name: str, filename: str) -> tuple[str, bool]:
    """Replace the initials span for `name` with an <img> tag."""
    # Match a team-photo block with initials, immediately followed (with any whitespace)
    # by the <h3 class="team-name">NAME</h3> line.
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
        print(f"ERROR: {HTML} not found. Run this script from the repo root.")
        sys.exit(1)

    html = HTML.read_text()
    results = []
    for name, filename in AGENTS:
        img_path = REPO / filename
        if not img_path.exists():
            print(f"SKIP: {filename} not found in repo root.")
            results.append((name, False, "missing file"))
            continue
        html, ok = replace_initials(html, name, filename)
        results.append((name, ok, "" if ok else "no initials block matched"))
        print(f"{'OK  ' if ok else 'MISS'}: {name} → {filename}")

    HTML.write_text(html)
    print(f"\nWrote {HTML.name}")

    # Commit + push
    print("\nStaging, committing, and pushing...")
    subprocess.run(["git", "add", "-A"], cwd=REPO, check=True)
    changed = subprocess.run(
        ["git", "diff", "--cached", "--quiet"], cwd=REPO
    ).returncode
    if changed == 0:
        print("No changes to commit.")
        return
    subprocess.run(
        ["git", "commit", "-m",
         "Add profile photos for Aidyl, Elizabeth, and Michelle Dennison"],
        cwd=REPO, check=True,
    )
    subprocess.run(["git", "push"], cwd=REPO, check=True)
    print("Pushed.")

if __name__ == "__main__":
    main()
