#!/usr/bin/env bash
# deploy.sh — Build & deploy btctoon.com to GitHub Pages
# Usage: ./scripts/deploy.sh [commit message]
#
# Workflow:
#   1. Builds production bundle (npm run build)
#   2. Commits source code changes to 'main' branch
#   3. Pushes built dist/ to 'gh-pages' branch
#   GitHub Pages serves from 'gh-pages'

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

MSG="${1:-deploy: btctoon.com update $(date -u +%Y-%m-%dT%H:%M:%SZ)}"

echo "==> Building production bundle..."
npm run build

echo ""
echo "==> Committing source code to main..."
git add -A
if git diff --cached --quiet; then
  echo "    (no source changes to commit)"
else
  git commit -m "$MSG"
fi
git push origin main

echo ""
echo "==> Deploying dist/ to gh-pages..."
cd "$ROOT_DIR/dist"

# Clean any old .git in dist
rm -rf .git

git init
git checkout -b gh-pages
git add -A
git config user.email "deploy@btctoon.com"
git config user.name "btctoon-deploy"
git commit -m "$MSG"
git remote add origin "$(cd "$ROOT_DIR" && git remote get-url origin)"
git push origin gh-pages --force

# Cleanup
rm -rf "$ROOT_DIR/dist/.git"

echo ""
echo "==> Done! Deployed to gh-pages."
echo "    Site: https://btctoon.com"
echo "    Repo: https://github.com/ahasdeviya01-sudo/btctoon01landing"
