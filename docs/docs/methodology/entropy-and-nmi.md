# Entropy & NMI

How the Entropy Lab measures market predictability and detects hidden nonlinear dependencies between assets.

---

## Why Entropy?

Pearson correlation captures only **linear** relationships. Two assets can have `r ≈ 0` and still be deeply connected — just in a nonlinear way (volatility coupling, regime-conditional, lagged nonlinear).

Entropy-based methods detect **any** statistical dependency, regardless of shape.

---

## Step 1 — Percent Returns

All entropy calculations operate on **percent returns**, not raw prices:

```
r(t) = (price(t) - price(t-1)) / price(t-1) × 100
```

This removes price-level bias and makes assets comparable regardless of their absolute price.

---

## Step 2 — Gaussian Differential Entropy

For each asset's return series, the platform computes **Gaussian differential entropy**:

```
H(X) = 0.5 * ln(2π·e·σ²)
```

where `σ²` is the variance of percent returns.

```javascript
function gaussianEntropy(arr) {
  const mean = arr.reduce((s,v) => s+v, 0) / arr.length;
  const variance = arr.reduce((s,v) => s+(v-mean)**2, 0) / arr.length;
  if (variance <= 0) return 0;
  return 0.5 * Math.log(2 * Math.PI * Math.E * variance);
}
```

### Interpretation

| Asset | Typical σ | Entropy | Meaning |
|-------|-----------|---------|---------|
| USDC | ~0.001% | Very low | Near-zero volatility → highly predictable |
| Gold | ~0.3% | Medium | Moderate spread → some predictability |
| BTC | ~2–3% | High | Wide spread → chaotic |
| DOGE | ~3–5% | Very high | Extreme volatility → most chaotic |

**Lower entropy = more predictable. Higher entropy = more chaotic.**

---

## Step 3 — Bootstrap Confidence Interval

To measure the **reliability** of each entropy estimate, the platform uses bootstrap resampling:

1. From the full returns series, draw N random samples with replacement
2. Compute `gaussianEntropy` for each resample (60 iterations)
3. Report the **mean** and **±1σ confidence band**

This tells you: is the entropy estimate stable, or noisy due to small sample size?

```
BTC  → H = 2.34 ± 0.12  (stable — large sample)
HYPE → H = 2.81 ± 0.44  (wider CI — newer asset, less history)
```

---

## Step 4 — Mutual Information and NMI

To detect nonlinear dependencies between pairs, the platform computes **Normalized Mutual Information (NMI)**.

### Discretization

Continuous returns are binned using **quantile binning** (equal-frequency bins, 8 bins by default):

```javascript
function quantileBins(arr, nBins = 8) {
  const sorted = [...arr].sort((a,b) => a-b);
  const edges = [];
  for (let i=1; i<nBins; i++)
    edges.push(sorted[Math.floor(i/nBins * arr.length)]);
  return arr.map(v => { let b=0; for(const e of edges){if(v>e)b++;} return b; });
}
```

Quantile binning ensures each bin has equal occupancy — avoiding the sparse-bin problem of fixed-width histograms.

### Shannon Entropy of Bins

```
H(X) = -Σ p_i · log₂(p_i)
```

### Joint Entropy

```
H(X,Y) = -Σ p_ij · log₂(p_ij)
```

### Mutual Information

```
I(X;Y) = H(X) + H(Y) - H(X,Y)
```

### Normalization

```
NMI(X,Y) = I(X;Y) / sqrt(H(X) · H(Y))   ∈ [0, 1]
```

```javascript
const nmi = Math.sqrt(hA * hB) > 0 ? mi / Math.sqrt(hA * hB) : 0;
```

Normalization makes NMI **scale-invariant** and comparable across different assets.

---

## Step 5 — Hidden Connections

A pair is flagged as a **Hidden Connection** when:

```
|Pearson r| < 0.35   AND   NMI > 0.30
```

These pairs appear linearly uncorrelated but share significant nonlinear dependence — often representing:

- **Volatility coupling** — similar variance patterns, opposite directions
- **Regime-conditional** correlation — related only during stress events
- **Lagged nonlinear** relationships outside Pearson's detection range

---

## NMI Heatmap Color Scale

| Color | NMI Value | Meaning |
|-------|-----------|---------|
| Dark purple | 0.0 | Completely independent |
| Violet | 0.5 | Moderate dependence |
| Green | 1.0 | Perfectly dependent |

---

## Minimum Sample

NMI requires at least **20 ticks** to compute. The **Assets Ready** counter in the Entropy Lab header shows how many assets have sufficient history.

---

## References

- Shannon, C.E. (1948). *A Mathematical Theory of Communication*. Bell System Technical Journal.
- Bandt, C. & Pompe, B. (2002). *Permutation Entropy*. Physical Review Letters.
