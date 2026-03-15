# What is Pyth Correlation Tracker

## Overview

Pyth Correlation Tracker is an open-access, real-time financial analytics platform built on top of the [Pyth Network](https://pyth.network) decentralized oracle infrastructure.

The core insight is simple: **prices don't move in isolation**. When BTC dumps, ETH usually follows. When the dollar strengthens, gold often falls. These relationships — correlations — are the hidden architecture of financial markets.

This platform makes those relationships visible, live, as they happen.

---

## Why Correlations Matter

Traditional portfolio tools show you what happened. This platform shows you **how assets relate to each other right now**, which enables:

- **Risk management** — avoid holding two assets that move identically (concentrated risk)
- **Diversification** — find assets with low or negative correlations
- **Regime detection** — correlations shift during crises, identifying market regimes
- **Alpha discovery** — lead-lag relationships reveal predictive signals

---

## Architecture Overview

```
Pyth Hermes WebSocket
        │
        ▼
   Price Feed (28 assets, ~3s)
        │
        ▼
  Rolling History Buffer (200 ticks)
        │
   ┌────┴────────────────┐
   │                     │
   ▼                     ▼
Pearson Matrix      Entropy (NMI)
(linear corr)    (nonlinear corr)
   │                     │
   └─────────┬───────────┘
             │
             ▼
      Lead-Lag Analysis
      (cross-correlation)
             │
             ▼
        Live UI (React)
```

---

## Asset Classes Covered

- **Crypto** — BTC, ETH, SOL, DOGE, AVAX, ADA, LINK, SUI, NEAR, HYPE, and more
- **FX** — EUR/USD, GBP/USD
- **Metals** — XAU/USD (Gold)
- **Energy** — WTI Crude Oil
- **Equities** — AAPL
- **Indices** — SPY, QQQ, DIA, IWM

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Canvas API |
| Oracle (live) | Pyth Hermes WebSocket |
| Oracle (historical) | Pyth Benchmarks REST |
| Math | Custom Pearson, Shannon Entropy, NMI |
| Hosting | Vercel |
| Data | 100% on-chain oracle data |
