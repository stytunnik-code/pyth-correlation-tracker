# 🔥 Pyth Cross-Asset Correlation Matrix

> Real-time cross-asset correlation tracker powered by **Pyth Network** price feeds.
> Built for the **Pyth Playground Community Hackathon 2025**.

## 🌐 Live Demo
[https://pyth-correlation.vercel.app](https://pyth-correlation.vercel.app) *(deploy link here)*

---

## 💡 What Is This?

A real-time dashboard that tracks **statistical correlations** between crypto, equities, FX pairs, and commodities — all powered by Pyth Network's high-frequency oracle data.

### Why it matters
Traditional traders know that BTC often moves with Gold during risk-off events, or that EUR/USD can diverge from crypto during monetary policy shifts. This tool makes those relationships **visible in real-time**, updating every 3 seconds using Pyth's sub-second price feeds.

---

## 🛠 Features

| Feature | Description |
|---|---|
| **Live Correlation Heatmap** | 10×10 matrix with color-coded Pearson correlation coefficients |
| **Asset Sparklines** | Mini price charts on each ticker card |
| **Pair Deep-Dive** | Click any cell → rolling correlation history chart |
| **Category Filter** | Filter by Crypto / FX / Equity / Commodity |
| **Top Pairs Panel** | Strongest positive & negative correlations at a glance |
| **Category Matrix** | Average cross-category correlation summary |
| **Auto-reconnect** | Falls back to demo mode if API is unavailable |

---

## 📊 Assets Tracked

| Asset | Category | Pyth Feed |
|---|---|---|
| BTC/USD | Crypto | `e62df6c8...` |
| ETH/USD | Crypto | `ff61491a...` |
| SOL/USD | Crypto | `ef0d8b6f...` |
| DOGE/USD | Crypto | `dcef50dd...` |
| USDC/USD | Crypto | `eaa020c6...` |
| EUR/USD | FX | `8ac0c70f...` |
| GBP/USD | FX | `84c2dde9...` |
| XAU/USD | Commodity | `765d2ba9...` |
| WTI/USD | Commodity | `c9d8b075...` |
| AAPL/USD | Equity | `49f6b65c...` |

---

## 🔬 How It Works

```
Pyth Hermes REST API
        ↓  (every 3s)
Price History Buffer (rolling 200 ticks)
        ↓
Pearson Correlation Matrix (N×N)
        ↓
React UI — Heatmap + Charts + Rankings
```

### Correlation Algorithm
Uses **Pearson's r** computed over a rolling window of the last 200 price samples (~10 minutes at 3s intervals):

```
r(X,Y) = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi-x̄)² · Σ(yi-ȳ)²]
```

- `r = +1.0` → perfect positive correlation
- `r = 0.0` → no linear relationship  
- `r = -1.0` → perfect negative (inverse) correlation

---

## 🚀 Run Locally

```bash
git clone https://github.com/yourusername/pyth-correlation-tracker
cd pyth-correlation-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📦 Tech Stack

- **React 18** + **Vite** — frontend framework
- **Pyth Network Hermes API** — real-time price feeds (`hermes.pyth.network`)
- **Canvas API** — custom correlation history chart
- **CSS-in-JS** — zero dependencies for styling

---

## 🔮 What's Next

- [ ] WebSocket streaming for sub-second updates
- [ ] Confidence interval overlay (Pyth's unique feature)
- [ ] Export correlation data as CSV
- [ ] Alert system: notify when correlation crosses threshold
- [ ] More assets: indices, commodities, altcoins

---

## 📄 License

Apache 2.0 — matching Pyth's license.

---

*Built with ❤️ using [Pyth Network](https://pyth.network) oracle data.*
 
