#!/bin/bash
# Quick push script for HealthPlan Moms website
# Usage: ./push.sh "description of what you changed"

cd "$(dirname "$0")"

MESSAGE="${1:-Update website}"

echo "Pushing changes: $MESSAGE"
echo ""

# Rebuild the Meet Our Team cards from data/team.json before publishing.
if command -v node >/dev/null 2>&1; then
    node scripts/team/build-team.mjs || { echo "Fix data/team.json first."; exit 1; }
else
    echo "(Node not installed: team cards not rebuilt. The nightly sync will rebuild them.)"
fi

git add -A
git status --short

CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
    echo ""
    echo "No changes to push. Everything is up to date!"
    exit 0
fi

echo ""
git commit -m "$MESSAGE"
# The nightly team sync also publishes to main, so pick up its commits first.
git pull --rebase --autostash origin main
git push

echo ""
echo "Done! Changes are live in 1-2 minutes."
echo "View at: https://github.com/Quadulur/healthplanmoms-website"
