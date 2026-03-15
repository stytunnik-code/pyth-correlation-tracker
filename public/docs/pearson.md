# Pearson Correlation

The foundation of the Matrix — how it's computed, what it means, and its limitations.

---

## Formula

$$r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum(x_i-\bar{x})^2 \cdot \sum(y_i-\bar{y})^2}}$$

In plain terms: Pearson measures how linearly related two variables are, normalized to the range **[−1, +1]**.

---

## Implementation

```javascript
function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 4) return null; // need minimum 4 points

  const ax = a.slice(-n), bx = b.slice(-n);
  const ma = ax.reduce((s,v) => s+v, 0) / n;
  const mb = bx.reduce((s,v) => s+v, 0) / n;

  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const ai = ax[i] - ma, bi = bx[i] - mb;
    num += ai * bi;
    da  += ai * ai;
    db  += bi * bi;
  }
  const d = Math.sqrt(da * db);
  return d === 0 ? 0 : Math.max(-1, Math.min(1, num / d));
}
```

---

## Rolling Window

Correlations are computed on the **last 200 price ticks**, where each tick is the latest price from Pyth Hermes at the moment of the update (~3 second intervals).

This gives approximately **10 minutes** of market context — enough to capture intraday co-movement without overfitting to ultra-short noise.

---

## Minimum Sample

The function returns `null` until at least **4 ticks** are available for both assets. The UI shows `"Computing…"` during this warmup period.

In practice, meaningful correlations stabilize after **~60 ticks** (~3 minutes).

---

## Limitations

| Limitation | Description |
|-----------|-------------|
| **Linear only** | Misses nonlinear dependencies (use NMI for those) |
| **Sensitive to outliers** | A single price spike can distort the result |
| **Stationarity assumption** | Assumes the relationship is stable over the window |
| **No causation** | Correlation ≠ causation — always interpret with context |

---

## Why Price Levels (Not Returns)?

The tracker uses **raw price levels** rather than log returns for real-time correlation. This is intentional:

- At tick frequency (3s), price levels are nearly identical to returns in relative terms
- Using levels makes the sparklines and correlation charts more interpretable visually
- For longer-term analysis, log-return correlation would be more statistically sound
