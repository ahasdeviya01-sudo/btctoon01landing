# btctoon.com - Crypto Battleground

Real-time animated bulls vs bears battle driven by live Binance WebSocket data.

**Live:** https://btctoon.com

## Features

- Live Price Feed - Binance WebSocket + Coinbase fallback
- Animated Battleground - Canvas-rendered bulls vs bears
- Serious Mode - Premium trading terminal with TradingView chart
- 8 Coins - BTC, ETH, SOL, XRP, DOGE, ADA, AVAX, LINK
- Coin vs Coin - Side-by-side battle comparison
- Toon of the Day - Daily illustrated market commentary
- Full SEO - OG tags, Twitter cards, JSON-LD, sitemap

## Run Locally

```bash
npm install
npm run dev
```

Opens on http://localhost:3000

## Deploy to GitHub Pages

```bash
npm run deploy
```

It will ask you:
1. **Repo URL** - press Enter to use default
2. **PAT token** - paste your GitHub Personal Access Token (hidden input)

Source code goes to `main`, built site goes to `gh-pages`. Done.

### Custom commit message:

```bash
bash scripts/deploy.sh "fix: updated chart colors"
```

## Branch Structure

| Branch | Contents | Purpose |
|---|---|---|
| `main` | Source code | Edit and develop here |
| `gh-pages` | Built production files | Served by GitHub Pages |
