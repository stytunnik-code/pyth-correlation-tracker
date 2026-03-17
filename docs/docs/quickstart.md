# Quick Start

Get up and running with Pyth Correlation Tracker in 30 seconds.

---

## Step 1 — Open the App

Navigate to [pythcorrelation.com](https://pythcorrelation.com).

The loading screen will initialize the oracle feeds and prefetch 60 hours of historical data for all 28 assets.

---

## Step 2 — Choose Your Assets

By default, 10 core crypto assets are selected. Click the **⊞ selector** in the top-right header to customize which assets appear in the matrix.

You can filter by category:
- **Crypto** — 18 assets
- **FX Pairs** — EUR/USD, GBP/USD
- **Commodities** — Gold, Oil
- **Equities** — AAPL
- **Indices** — SPY, QQQ, DIA, IWM

---

## Step 3 — Read the Correlation Matrix

The heatmap shows every pair's **Pearson correlation** on a -1 to +1 scale:

| Color | Value | Meaning |
|-------|-------|---------|
| 🟢 Green | +0.65 to +1.0 | Strong positive — move together |
| 🟡 Yellow | +0.30 to +0.65 | Moderate positive |
| 🟣 Purple | -0.30 to +0.30 | Uncorrelated |
| 🟠 Orange | -0.65 to -0.30 | Moderate negative |
| 🔴 Red | -1.0 to -0.65 | Strong negative — move opposite |

Click any cell to open the **Correlation Deep-Dive** for that pair.

---

## Step 4 — Explore the Modules

Use the **tab bar** at the top to switch between modules:

- **MATRIX** — main live heatmap dashboard
- **CHARTS** — candlestick charts with multiple timeframes
- **CORR** — pair correlation deep-dive with rolling history
- **ENTROPY** — nonlinear dependency analysis
- **LEAD-LAG** — who leads, who follows

---

## Step 5 — Share Insights

Each correlation pair has a **Share** button that generates a 1200×1200 image card with the correlation value, bar, and Pyth branding — ready to post on X/Twitter.

---

## Tips

{% hint style="info" %}
The correlation window is **200 ticks at ~3 seconds each** ≈ 10 minutes of live data. Patterns stabilize after ~60 ticks.
{% endhint %}

{% hint style="warning" %}
Equity data (AAPL, SPY, QQQ, DIA, IWM) may show flat or stale prices outside US market hours (9:30 AM – 4:00 PM ET, Mon–Fri).
{% endhint %}
