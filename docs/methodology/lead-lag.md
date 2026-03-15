# Lead-Lag

How the platform identifies which asset moves first and which follows, using cross-correlation analysis across time shifts.

***

### Concept

Standard correlation asks: _"Do A and B move together?"_

Lead-lag asks: _"Does A at time T predict B at time T+k?"_

The answer is found by computing Pearson correlation between the two return series at every possible **time shift** (lag).

***

### Input: Percent Returns

Like all analytics on the platform, lead-lag operates on **percent returns**:

```
r(t) = (price(t) - price(t-1)) / price(t-1) × 100
```

***

### Cross-Correlation at a Single Lag

For lag `k`, one series is shifted relative to the other and Pearson correlation is computed:

```javascript
function crossCorrAtLag(ra, rb, k) {
  if (k === 0) return pearson(ra, rb);
  if (k > 0)   return pearson(ra.slice(0, ra.length-k), rb.slice(k));
  return               pearson(ra.slice(-k), rb.slice(0, rb.length+k));
}
```

| Lag k | What it measures                                  |
| ----- | ------------------------------------------------- |
| k = 0 | Simultaneous correlation (same as Pearson)        |
| k > 0 | Does A at time t predict B at time t+k? → A leads |
| k < 0 | Does B at time t predict A at time t+k? → B leads |

***

### Full Cross-Correlation Function

The platform sweeps lags from `-maxLag` to `+maxLag` and collects correlation at each step:

```javascript
function crossCorrFull(ra, rb, maxLag) {
  const out = [];
  for (let k = -maxLag; k <= maxLag; k++) {
    const v = crossCorrAtLag(ra, rb, k);
    if (v !== null) out.push({ lag: k, corr: v });
  }
  return out;
}
```

The result is the **Cross-Correlation Function (CCF)** chart.

***

### Finding the Lead-Lag Relationship

The dominant lead-lag is the lag `k` where `|correlation|` is **maximum**:

```javascript
function findLeadLag(symA, symB, ra, rb, maxLag) {
  const pts = crossCorrFull(ra, rb, maxLag);
  const best = pts.reduce((a,b) => Math.abs(b.corr) > Math.abs(a.corr) ? b : a);
  return {
    leader:    best.lag >= 0 ? symA : symB,
    follower:  best.lag >= 0 ? symB : symA,
    lagBars:   Math.abs(best.lag),
    corrAtLag: best.corr,
    corrAt0:   pts.find(p => p.lag === 0)?.corr ?? null,
    pts,
  };
}
```

#### Reading the Result

| best.lag | Interpretation               |
| -------- | ---------------------------- |
| +5       | A leads B by 5 ticks         |
| -3       | B leads A by 3 ticks         |
| 0        | Simultaneous — neither leads |

***

### Lag Windows

| Window | Tick range | 1 tick ≈     |
| ------ | ---------- | ------------ |
| 1m     | ±20 ticks  | \~3 seconds  |
| 5m     | ±20 ticks  | \~15 seconds |
| 15m    | ±20 ticks  | \~45 seconds |
| 1h     | ±20 ticks  | \~3 minutes  |

***

### Reading the CCF Chart

The chart plots correlation at every lag from -20 to +20:

* **Peak position** → direction and magnitude of lead-lag
* **Peak height** → strength of the predictive relationship
* **Flat curve** → no lead-lag, assets react independently
* **Multiple peaks** → noisy or unstable relationship

***

### corrAt0 vs corrAtLag

| Metric    | Description                                            |
| --------- | ------------------------------------------------------ |
| corrAt0   | Standard Pearson at zero lag — same as Matrix          |
| corrAtLag | Correlation at the optimal lag — the predictive signal |

If `corrAtLag >> corrAt0`, the relationship is primarily predictive (one leads the other) rather than simultaneous.

***

### Oracle Timing Note

Pyth Hermes pushes updates per asset independently. A lag of **1–2 ticks** may reflect oracle update timing rather than true price discovery. Lags of **3+ ticks** are more likely to reflect genuine market microstructure.
