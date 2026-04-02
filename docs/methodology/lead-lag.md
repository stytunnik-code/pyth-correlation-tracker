# Lead-Lag

How the platform identifies which asset moves first and which follows, using cross-correlation across time shifts.

***

### Concept

Standard correlation asks:

_Do A and B move together?_

Lead-lag asks:

_Does A at time T help explain B at time T+k?_

The platform answers this by computing Pearson correlation on return series across many candidate lags.

***

### Input: Percent Returns

Like the rest of the analytics stack, lead-lag operates on **percent returns**:

```
r(t) = (price(t) - price(t-1)) / price(t-1) × 100
```

***

### Cross-Correlation

For lag `k`, one return series is shifted relative to the other:

```javascript
function crossCorrAtLag(ra, rb, k) {
  if (k === 0) return pearson(ra, rb);
  if (k > 0) return pearson(ra.slice(0, ra.length - k), rb.slice(k));
  return pearson(ra.slice(-k), rb.slice(0, rb.length + k));
}
```

Interpretation:

- `k > 0` means A leads B
- `k < 0` means B leads A
- `k = 0` means no lag, only simultaneous movement

***

### Train / Out-of-Sample Validation

The current version does **not** rely only on the maximum in-sample lag anymore.

It now:

1. splits the data into a train segment and an out-of-sample segment;
2. finds the strongest lag on the train segment;
3. checks the same lag on the out-of-sample segment;
4. computes a conservative validated score.

That makes obvious overfit lags less likely to dominate the ranking.

***

### Output Fields

| Metric | Meaning |
| --- | --- |
| `leader` | asset that tends to move first |
| `follower` | asset that tends to move after |
| `lagBars` | lag distance in bars |
| `corrAtLag` | best in-sample correlation |
| `corrAt0` | zero-lag Pearson |
| `testCorrAtLag` | out-of-sample check on trained lag |
| `validatedCorr` | conservative train/test validated score |

***

### Oracle Timing Note

Pyth Hermes updates assets independently. Very short lags may still reflect oracle timing or update sequencing rather than real market structure.

That is why the OOS check matters: it helps reject some unstable or accidental lags.
