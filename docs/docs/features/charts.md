# Charts

The **Charts** module provides OHLCV candlestick charts for all 28 tracked assets, powered by Pyth Benchmarks historical data.

---

## Timeframes

| Label | Resolution | Bars Loaded |
|-------|-----------|-------------|
| 1m | 1 minute | 300 bars |
| 5m | 5 minutes | 300 bars |
| 15m | 15 minutes | 300 bars |
| 1h | 1 hour | 300 bars |
| 4h | 4 hours | 300 bars |
| 1d | Daily | 300 bars |

---

## Chart Types

Switch between three rendering modes:

- **Candles** — classic OHLC candlestick view
- **Line** — close price line chart
- **Area** — filled area chart for trend visualization

---

## Asset Selector

Use the asset picker at the top to switch between any of the 28 tracked assets. The chart reloads immediately from Pyth Benchmarks.

---

## Live Overlay

When the app is in **LIVE** mode (connected to Pyth Hermes), the latest tick price is overlaid as a real-time marker on the rightmost candle.

---

## Data Source

Charts pull from the **Pyth Benchmarks** API — a TradingView-compatible REST endpoint that serves OHLCV bars reconstructed from Pyth oracle price history.

```
Endpoint: https://benchmarks.pyth.network/v1/shims/tradingview/history
```

See [Pyth Benchmarks](../data/benchmarks.md) for full API details.

---

{% hint style="info" %}
Equity charts (AAPL, SPY, etc.) will show flat candles outside US market hours. This is expected — equity oracles pause when markets are closed.
{% endhint %}
