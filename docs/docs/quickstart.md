# Quick Start

Get up and running with Pyth Correlation Tracker in under a minute.

---

## Step 1 — Open the App

Navigate to [pythcorrelation.com](https://pythcorrelation.com).

The loading screen initializes live feeds and prefetches historical benchmark data.

---

## Step 2 — Choose Assets

Use the selector in the header to choose which assets appear in the Matrix.

You can filter by category:

- Crypto
- FX Pairs
- Commodities
- Equities
- Indices

---

## Step 3 — Read the Matrix

The heatmap shows **Pearson correlation on aligned returns** on a scale from -1 to +1.

Click any cell to open a pair analysis panel.

---

## Step 4 — Explore Modules

- **MATRIX** — live cross-asset heatmap
- **CHARTS** — OHLCV charts from Pyth Benchmarks
- **CORR** — rolling pair correlation
- **LEAD-LAG** — lag structure with OOS check
- **ENTROPY** — Gaussian entropy and adjusted NMI

---

## Step 5 — Check Feed Health

Look at the header badge:

- `FEED OK`
- `FEED WARN`
- `FEED DEGRADED`

If the feed is not healthy, open the diagnostics popover before trusting short-term live analytics.

---

## Tips

- The correlation window is **200 aligned ticks** at roughly 3 seconds each
- Patterns usually stabilize after **~60 ticks**
- Equity feeds may be flat or stale outside US market hours
