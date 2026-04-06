#!/bin/bash
# Quick push script for Medicare Moms website
# Usage: ./push.sh "description of what you changed"

cd "$(dirname "$0")"

MESSAGE="${1:-Update website}"

echo "Pushing changes: $MESSAGE"
echo ""

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
git push

echo ""
echo "Done! Changes are live in 1-2 minutes."
echo "View at: https://github.com/Quadulur/medicare-moms-website"
