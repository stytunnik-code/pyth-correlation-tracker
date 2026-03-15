# Lead-Lag Analysis

The **Lead-Lag** module identifies which asset in a pair **leads** (moves first) and which **lags** (follows), using cross-correlation analysis across time shifts.

---

## Concept

Standard correlation asks: *"Do A and B move together?"*

Lead-lag asks: *"Does A at time T predict B at time T+k?"*

This is computed by shifting one asset's price series by `k` ticks and measuring the correlation at each shift.

---

## Cross-Correlation Function

For a pair (A, B), the module computes:

```
CCF(k) = Pearson(A[t], B[t+k])   for k = -20 ... +20
```

- **Positive k** → A leads B by k ticks
- **Negative k** → B leads A by |k| ticks
- **Peak at k=0** → simultaneous movement, no lead-lag

---

## Reading the Chart

The lead-lag chart plots the cross-correlation value for each shift:

- The **peak** of the curve tells you the optimal lag
- A peak at **k = +3** means: asset A tends to move ~9 seconds before asset B
- A sharp peak indicates a **strong, consistent** lead-lag relationship
- A flat curve means **no clear directional relationship**

---

## Practical Applications

| Signal | Interpretation |
|--------|---------------|
| BTC leads ETH by 2-3 ticks | ETH price moves tend to follow BTC with ~6-9s delay |
| EUR/USD leads Gold | Macro FX signal precedes metals reaction |
| Flat CCF across all lags | Assets react independently to different catalysts |

---

## Limitations

- Lead-lag relationships are **not stable** — they shift with market regimes
- Short lags (1-3 ticks) may reflect **oracle update timing** rather than true price discovery
- Always combine with directional Pearson correlation for full picture

---

{% hint style="warning" %}
Lead-lag results are computed on the same 200-tick rolling window. Relationships outside this window are not captured.
{% endhint %}
