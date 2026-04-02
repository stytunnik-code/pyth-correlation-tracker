# Pearson Correlation

The foundation of the Matrix: how it is computed, what it means, and what changed in the current version.

---

## Formula

$$r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum(x_i-\bar{x})^2 \cdot \sum(y_i-\bar{y})^2}}$$

Pearson measures linear dependence on the range **[-1, +1]**.

---

## Current Implementation

The live implementation now:

- filters non-finite aligned pairs;
- returns `null` for degenerate zero-variance series;
- works on **aligned percent returns**, not raw price levels;
- aligns live series by timestamp before computing correlation.

---

## Rolling Window

Correlations are computed on the **last 200 aligned return ticks**, where each tick is a timestamp-aligned live price update from Pyth Hermes at roughly 3-second intervals.

That gives about **10 minutes** of short-horizon market context.

---

## Minimum Sample

The function returns `null` until at least **4 valid aligned points** are available for both assets. The UI shows `Computing…` during warmup.

In practice, more stable short-term correlations usually appear after **~60 ticks**.

---

## Why Returns Instead of Raw Price Levels

The tracker now uses **aligned percent returns** rather than raw price levels:

- this reduces false correlation caused by shared drift in price levels;
- it is more statistically defensible across assets with different scales;
- it is less vulnerable to random-walk style spurious correlation.

---

## Limitations

| Limitation | Description |
| --- | --- |
| Linear only | Misses nonlinear dependencies |
| Sensitive to outliers | Spikes can distort the estimate |
| Short-horizon only | The Matrix is a live short-window measure |
| No causation | Correlation never proves causality |
