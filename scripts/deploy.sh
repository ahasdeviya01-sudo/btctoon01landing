#!/usr/bin/env bash
# deploy.sh — Build & deploy btctoon.com to GitHub Pages
# Usage: ./scripts/deploy.sh [commit message]
#
# It will ask you for:
#   1. GitHub repo URL  (default: https://github.com/ahasdeviya01-sudo/btctoon01landing.git)
#   2. GitHub PAT token (paste it, won't show on screen)
#
# Workflow:
#   1. Builds production bundle
#   2. Commits source changes → main branch
#   3. Pushes built dist/ → gh-pages branch
#   GitHub Pages serves from gh-pages

set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# ── Ask for repo URL ──
echo ""
echo "==> GitHub Deploy for btctoon.com"
echo "    ─────────────────────────────"
read -r -p "  Repo URL [https://github.com/ahasdeviya01-sudo/btctoon01landing.git]: " INPUT_REPO
REPO="${INPUT_REPO:-https://github.com/ahasdeviya01-sudo/btctoon01landing.git}"

# Strip https:// prefix to build authenticated URL
REPO_PATH="${REPO#https://}"

# ── Ask for PAT ──
read -r -s -p "  PAT token (hidden): " PAT
echo ""

if [ -z "$PAT" ]; then
  echo "ERROR: PAT token cannot be empty."
  exit 1
fi

REMOTE_URL="https://${PAT}@${REPO_PATH}"
MSG="${1:-deploy: btctoon.com update $(date -u +%Y-%m-%dT%H:%M:%SZ)}"

echo ""
echo "==> Building production bundle..."
npm run build

echo ""
echo "==> Committing source code to main..."
git remote set-url origin "$REMOTE_URL" 2>/dev/null || git remote add origin "$REMOTE_URL"
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

rm -rf .git
git init
git checkout -b gh-pages
git add -A
git config user.email "deploy@btctoon.com"
git config user.name "btctoon-deploy"
git commit -m "$MSG"
git remote add origin "$REMOTE_URL"
git push origin gh-pages --force

# Cleanup
rm -rf "$ROOT_DIR/dist/.git"

echo ""
echo "==> Done! Deployed to gh-pages."
echo "    Site: https://btctoon.com"
echo "    Repo: $REPO"
