#!/usr/bin/env bash
# ─────────────────────────────────────────────────────
# scripts/update-seo.sh
# Run daily (cron / CI) to update meta tags with the current
# BTC price so Google's crawler sees fresh price data in the
# <title>, <meta description>, and JSON-LD structured data.
#
# USAGE:
#   chmod +x scripts/update-seo.sh
#   ./scripts/update-seo.sh
#
# CRON (run every day at 00:05 UTC):
#   5 0 * * * /path/to/btctoon01/scripts/update-seo.sh
# ─────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HTML="$ROOT/index.html"
SITEMAP="$ROOT/public/sitemap.xml"
TODAY=$(date -u +%Y-%m-%d)

echo "[update-seo] Fetching current BTC price from Binance..."

# Fetch live BTC price
PRICE_RAW=$(curl -fsSL 'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT' | grep -oP '"price":"\K[^"]+')

if [[ -z "$PRICE_RAW" ]]; then
  echo "[update-seo] ERROR: Could not fetch BTC price."
  exit 1
fi

# Format price nicely: 67994.28 -> $67,994.28
PRICE_INT="${PRICE_RAW%%.*}"
PRICE_DEC="${PRICE_RAW#*.}"
PRICE_DEC="${PRICE_DEC:0:2}"
PRICE_FMT=$(printf "%'d" "$PRICE_INT" 2>/dev/null || echo "$PRICE_INT")
# Use escaped dollar for sed safety
PRICE_DISPLAY="\$${PRICE_FMT}.${PRICE_DEC}"

echo "[update-seo] BTC = ${PRICE_DISPLAY} on ${TODAY}"

# ── Update index.html ──

# 1. <title>
sed -i "s|<title>.*</title>|<title>Bitcoin Price Today ${PRICE_DISPLAY} \| BTC to USD Live Price \\&amp; Battle – btctoon.com</title>|" "$HTML"

# 2. meta description
sed -i "s|<meta name=\"description\" content=\"[^\"]*\"|<meta name=\"description\" content=\"Bitcoin price today is ${PRICE_DISPLAY} USD. Live BTC/USDT real-time price, 24h volume, and animated bulls vs bears battleground on btctoon.com. Updated ${TODAY}.\"|" "$HTML"

# 3. og:title
sed -i "s|<meta property=\"og:title\" content=\"[^\"]*\"|<meta property=\"og:title\" content=\"Bitcoin Price Today ${PRICE_DISPLAY} \| BTC to USD Live – btctoon.com\"|" "$HTML"

# 4. og:description
sed -i "s|<meta property=\"og:description\" content=\"[^\"]*\"|<meta property=\"og:description\" content=\"Live Bitcoin price ${PRICE_DISPLAY} updated every second. Watch the epic bulls vs bears animated battleground.\"|" "$HTML"

# 5. twitter:title
sed -i "s|<meta name=\"twitter:title\" content=\"[^\"]*\"|<meta name=\"twitter:title\" content=\"Bitcoin Price Today ${PRICE_DISPLAY} \| BTC to USD Live – btctoon.com\"|" "$HTML"

# 6. JSON-LD price
sed -i "s|\"price\": \"[^\"]*\"|\"price\": \"${PRICE_RAW}\"|" "$HTML"

# ── Update sitemap.xml lastmod ──
sed -i "s|<lastmod>[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}</lastmod>|<lastmod>${TODAY}</lastmod>|g" "$SITEMAP"

echo "[update-seo] ✅ Done. index.html and sitemap.xml updated for ${TODAY}."
echo ""
echo "Next steps:"
echo "  1. git add index.html public/sitemap.xml"
echo "  2. git commit -m 'SEO: BTC ${PRICE_DISPLAY} ${TODAY}'"
echo "  3. git push  (or deploy)"
echo "  4. Go to Google Search Console → Sitemaps → submit https://btctoon.com/sitemap.xml"
