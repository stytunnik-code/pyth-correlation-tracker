# Lead-Lag Methodology

The mathematical approach behind cross-correlation shift analysis.

---

## Cross-Correlation Function (CCF)

For two time series A and B with mean subtracted, the cross-correlation at lag `k` is:

$$\text{CCF}(k) = \frac{\sum_{t} (A_t - \bar{A})(B_{t+k} - \bar{B})}{\sqrt{\sum(A_t-\bar{A})^2 \cdot \sum(B_{t+k}-\bar{B})^2}}$$

We compute this for `k ∈ {−20, −19, ..., 0, ..., +19, +20}` — a range of ±20 ticks (±60 seconds).

---

## Interpreting the Peak

```
CCF(k)
  │
+1┤         ╭──╮
  │        ╱    ╲
  │    ───╱      ╲───
  │                 ╲
-1┤                  ───
  └────────────────────── k
   -20    -10    0   +10  +20
                ↑
            peak at k=+5
            → A leads B by 5 ticks (~15 seconds)
```

The **position** of the peak tells you the lead-lag direction and magnitude.  
The **height** of the peak tells you the strength of the relationship at that lag.

---

## Lag to Time Conversion

Since price updates occur every ~3 seconds:

| Lag (ticks) | Time |
|-------------|------|
| 1 | ~3 seconds |
| 5 | ~15 seconds |
| 10 | ~30 seconds |
| 20 | ~60 seconds |

---

## Edge Cases

| Scenario | Result |
|----------|--------|
| Flat CCF across all lags | No lead-lag — assets react simultaneously or independently |
| Multiple peaks | Noisy relationship — interpret with caution |
| Peak at k=0 | Simultaneous movement — same information source |
| Symmetric CCF | Bidirectional coupling — neither clearly leads |

---

## Oracle Timing Note

Pyth Hermes pushes updates for each asset independently as prices change on-chain. This means a lag of 1-2 ticks between two assets could reflect **oracle update timing** rather than true price discovery. Lags of 3+ ticks are more likely to reflect genuine market microstructure dynamics.
