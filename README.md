# Pyth Correlation Tracker

> Real-time multi-asset analytics dashboard powered by **Pyth Network** oracle data.
> 28 assets · 5 analytical modules · Pearson · Entropy · Lead-Lag · NMI

**Live:** [pythcorrelation.com](https://pythcorrelation.com)

---

## What Is This

A real-time financial analytics platform that streams live price data from Pyth Network and computes statistical relationships between 28 assets — crypto, forex, metals, equities, and indices.

Unlike traditional charting tools, this reveals hidden cross-asset connections: how BTC moves with Gold during risk-off events, whether ETH leads or lags SOL, or when EUR/USD diverges from crypto during macro shifts.

---

## Modules

### Matrix
Live Pearson correlation heatmap. All visible assets vs. all visible assets, updating every 3 seconds. Click any cell to open a Pair Analysis panel with a rolling correlation history chart. Filter by category, sort by price or correlation strength. Share any pair to X with a generated image card.

### Charts
Full OHLCV candlestick and line charts for any asset. Drag to pan, scroll to zoom, crosshair tooltip with O/H/L/C values positioned near the cursor. Inline rolling correlation sub-panel beneath the chart. Timeframes: `1m · 5m · 15m · 1h · 4h · 1d`. Data from Pyth Benchmarks API, live ticks merged in real time.

### Correlation
Deep-dive rolling Pearson correlation between any two assets. Free pair selection via dropdowns + quick-select chips for preset pairs. Windows: `1D · 7D · 30D · 90D`. Animated scrubber to replay the correlation history. Scatter plot of returns + regression line.

### Lead-Lag
Detects which asset moves first in a pair. Cross-correlation analysis scanned across all possible time lags. Identifies the leader, follower, lag duration, and strength at lag. Rankings panel lists all pairs by lead-lag strength. Windows: `1D (up to 60 min) · 7D (24h) · 30D / 90D (7 days)`.

### Entropy
Information-theoretic analysis of each asset's return distribution. Gaussian Differential Entropy `H = ½·ln(2πeσ²)` with 60-iteration bootstrap confidence intervals, seeded from live Pyth prices. Normalized Mutual Information (NMI) heatmap reveals non-linear dependencies that Pearson misses. Correlation Stability Alert: triggers when a pair's correlation is tight (range ≤ 0.04) and strong (|r| ≥ threshold) over the last 6 samples.

---

## Assets (28)

| Symbol | Name | Category |
|---|---|---|
| BTC | Bitcoin | Crypto |
| ETH | Ethereum | Crypto |
| SOL | Solana | Crypto |
| DOGE | Dogecoin | Crypto |
| USDC | USD Coin | Crypto |
| AVAX | Avalanche | Crypto |
| ADA | Cardano | Crypto |
| LINK | Chainlink | Crypto |
| UNI | Uniswap | Crypto |
| LTC | Litecoin | Crypto |
| DOT | Polkadot | Crypto |
| TRX | TRON | Crypto |
| APT | Aptos | Crypto |
| SUI | Sui | Crypto |
| PEPE | Pepe | Crypto |
| NEAR | NEAR Protocol | Crypto |
| ATOM | Cosmos | Crypto |
| POL | POL (MATIC) | Crypto |
| HYPE | Hyperliquid | Crypto |
| EUR/USD | Euro | FX |
| GBP/USD | Pound | FX |
| XAU/USD | Gold | Commodity |
| WTI | Oil (WTI) | Commodity |
| AAPL | Apple Inc | Equity |
| SPY | S&P 500 ETF | Index |
| QQQ | NASDAQ 100 | Index |
| DIA | Dow Jones ETF | Index |
| IWM | Russell 2000 | Index |

Default view: BTC · ETH · SOL · DOGE · AVAX · ADA · LINK · SUI · NEAR · HYPE
Customizable via the coin picker — saved to `localStorage`.

---

## Data Sources

**Pyth Hermes — live prices**
```
GET https://hermes.pyth.network/v2/updates/price/latest?ids[]=<feed_id>&parsed=true
```
Polled every 3 seconds. Prices parsed from `price × 10^expo`. Batched at 10 IDs per request.

**Pyth Benchmarks — historical OHLCV**
```
GET https://benchmarks.pyth.network/v1/shims/tradingview/history
    ?symbol=Crypto.BTC/USD&resolution=60&from=<ts>&to=<ts>&countback=300
```
TradingView-compatible format. Returns `{ t[], o[], h[], l[], c[], v[] }`. Used in Charts, Correlation, and Lead-Lag tabs.

If Hermes is unavailable the app falls back to demo mode with simulated price movement and shows an error banner.

---

## Methodology

**Pearson r (Matrix & Correlation tabs)**
```
r(X,Y) = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi-x̄)² · Σ(yi-ȶ)²]

Range:  −1.0 (perfect inverse) → 0 (no relation) → +1.0 (perfect positive)
Input:  percent returns, not raw prices
Window: rolling 200 ticks in Matrix (~10 min at 3s interval)
        configurable 1D / 7D / 30D / 90D in Correlation tab
```

**Percent Returns**
```
r_t = (P_t − P_{t−1}) / P_{t−1} × 100
```
Used for all correlation and entropy calculations to remove non-stationarity.

**Gaussian Differential Entropy (Entropy tab)**
```
H(X) = ½ · ln(2πe · σ²)   [nats]
```
Measures predictability of return distribution. USDC ≈ −9 nats (flat), BTC ≈ −1 nat (volatile).
95% confidence intervals from 60-iteration bootstrap, per-asset `mulberry32` PRNG seeded from live Pyth prices.

**Normalized Mutual Information (Entropy tab)**
```
MI(X,Y)  = H(X) + H(Y) − H(X,Y)
NMI(X,Y) = MI(X,Y) / √[H(X) · H(Y)]   ∈ [0, 1]
```
Joint entropy computed via 8-bin quantile binning of return series.
Hidden connections: |Pearson r| < 0.35 but NMI > 0.30 → non-linear dependency.

**Cross-Correlation / Lead-Lag**
```
ρ(k) = Pearson(X[0:n−k], Y[k:n])     k > 0  →  Y lags X
ρ(k) = Pearson(X[|k|:n], Y[0:n−|k|]) k < 0  →  X lags Y
```
Scans lags from `−MAX_LAG` to `+MAX_LAG`. Peak gives leader, follower, and lag duration.

---

## Architecture

```
Pyth Hermes REST (every 3s)
    ↓
/api/pyth.js  →  price map  →  React state
    ↓
Rolling 200-tick history buffer (per asset, in-memory)
    ↓
Pearson r matrix (N×N, recalculated on every tick)
    ↓
Matrix heatmap · Correlation charts · Entropy engine · Lead-lag detector

Pyth Benchmarks (on demand, cached per session)
    ↓
/api/benchmarks.js  →  OHLCV bars
    ↓
Charts tab · Correlation rolling · Lead-lag windows
```

---

## API Routes (Vercel Serverless)

| Route | Source | Purpose |
|---|---|---|
| `GET /api/pyth` | Pyth Hermes | Batch live prices for all 28 feeds |
| `GET /api/benchmarks` | Pyth Benchmarks | Historical OHLCV bars |
| `GET /api/klines` | Binance (fallback) | Crypto klines for Charts |
| `POST /api/feedback` | Telegram Bot | Sends user feedback to Telegram |
| `GET /api/share-image` | Vercel OG Edge | Generates 1200×630 share card image |
| `GET /share` | `/api/share.js` | OG meta page → redirects to app |

---

## Run Locally

```bash
# clone and install
git clone https://github.com/rustrell/pyth-correlation-tracker
cd pyth-correlation-tracker
npm install

# start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Optional** — for feedback via Telegram, add `.env`:
```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

---

## Tech Stack

| | |
|---|---|
| **React 18** | UI framework |
| **Vite 3** | Build tool, dev server |
| **Canvas API** | All charts (candles, correlation, scatter, entropy) — zero chart libraries |
| **@vercel/analytics** | Page analytics |
| **@vercel/og** | Edge OG image generation |
| **CSS-in-JS** | Inline styles + `<style>` tag — zero CSS dependencies |

All statistical algorithms (Pearson, entropy, NMI, lead-lag, bootstrap) are implemented from scratch in vanilla JS.

---

## Security

Production build has no source maps. Vercel deployment includes full security headers:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security` with preload
- `Content-Security-Policy` — restricts to Pyth origins, CoinGecko images, Google Fonts
- `Permissions-Policy` — disables camera, microphone, geolocation
- `Cross-Origin-Opener-Policy: same-origin`

---

## Authors

Built by [rustrell](https://x.com/xzolmoney) · [wladwtf](https://x.com/wladwtf)
Powered by [Pyth Network](https://pyth.network)
© 2025 rustrell. All rights reserved.
