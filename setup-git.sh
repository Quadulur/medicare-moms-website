#!/bin/bash
# Medicare Moms Website - One-Time Git Setup Script
# Run this once to connect your local folder to GitHub.
# After this, you can push updates anytime with: git add -A && git commit -m "your message" && git push

set -e

echo ""
echo "======================================"
echo "  Medicare Moms - Git Setup"
echo "======================================"
echo ""

# Navigate to the script's directory (the website folder)
cd "$(dirname "$0")"
echo "Working in: $(pwd)"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Git is not installed. Installing via Xcode Command Line Tools..."
    xcode-select --install
    echo "Please re-run this script after the installation completes."
    exit 1
fi

# Check if already a git repo
if [ -d ".git" ]; then
    echo "Git repo already exists. Skipping init."
else
    echo "Initializing git repository..."
    git init
    git branch -m main
fi

# Configure git user
git config user.name "Brendan Murton"
git config user.email "brendan@itswildcat.com"
echo "Git user configured: Brendan Murton <brendan@itswildcat.com>"

# Check if gh CLI is available for easy auth
if command -v gh &> /dev/null; then
    echo ""
    echo "GitHub CLI detected! Checking authentication..."
    if gh auth status &> /dev/null; then
        echo "Already authenticated with GitHub CLI."
    else
        echo "Let's log you into GitHub..."
        gh auth login
    fi

    # Set remote
    git remote remove origin 2>/dev/null || true
    git remote add origin https://github.com/Quadulur/medicare-moms-website.git

    # Configure credential helper via gh
    gh auth setup-git
else
    echo ""
    echo "GitHub CLI not found. Installing it (recommended for easy auth)..."

    if command -v brew &> /dev/null; then
        brew install gh
        echo ""
        echo "GitHub CLI installed! Logging in..."
        gh auth login

        # Set remote
        git remote remove origin 2>/dev/null || true
        git remote add origin https://github.com/Quadulur/medicare-moms-website.git

        # Configure credential helper
        gh auth setup-git
    else
        echo ""
        echo "Homebrew not found. Setting up git with HTTPS..."
        echo "You may be prompted for your GitHub username and a Personal Access Token."
        echo "(Create a token at: https://github.com/settings/tokens)"
        echo ""

        # Set remote
        git remote remove origin 2>/dev/null || true
        git remote add origin https://github.com/Quadulur/medicare-moms-website.git

        # Use macOS Keychain to remember credentials
        git config credential.helper osxkeychain
    fi
fi

echo ""
echo "Adding all files..."
git add -A

echo "Creating initial commit..."
git commit -m "Initial commit - Medicare Moms website" || echo "Nothing new to commit."

echo ""
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "======================================"
echo "  Setup Complete!"
echo "======================================"
echo ""
echo "Your site is now on GitHub at:"
echo "  https://github.com/Quadulur/medicare-moms-website"
echo ""
echo "To push future updates, just run:"
echo "  cd $(pwd)"
echo "  git add -A"
echo "  git commit -m \"describe your changes\""
echo "  git push"
echo ""
echo "Or use the quick-push script: ./push.sh"
echo ""

# Remove this setup script from tracking (it's a one-time thing)
echo "setup-git.sh" >> .gitignore
echo "push.sh" >> .gitignore
