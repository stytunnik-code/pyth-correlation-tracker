# Entropy Lab

The **Entropy Lab** goes beyond linear correlation to detect how chaotic each asset is and where nonlinear dependencies exist between assets.

---

## Gaussian Entropy

The ranking in this module uses **Gaussian differential entropy** of returns:

```
H(X) = 1/2 · ln(2πeσ²)
```

- **Low entropy** means returns are more compressed and structurally stable
- **High entropy** means returns are more chaotic and volatile

This ranking is computed on **percent returns**, not raw prices.

---

## Entropy Ranking

The **Entropy Ranking** bar chart orders active assets from more predictable to more chaotic.

This answers the question:

`Which assets currently have more structured return behavior, and which are noisier?`

---

## Adjusted NMI Heatmap

The dependency map uses **Adjusted NMI**:

- raw NMI is computed from quantile-binned return series;
- shuffled baseline runs are used to estimate noise-floor dependence;
- the UI shows the adjusted value after subtracting that baseline.

This makes the nonlinear dependency map less noisy than the old version.

---

## Hidden Connections

The bottom panel highlights **Hidden Connections**:

- Pearson looks weak or uninformative;
- but adjusted NMI still remains above baseline.

These often represent:

- regime-conditional links;
- volatility coupling;
- lagged nonlinear structure.

---

## Live Run Mode

Toggle **Live Run** to continuously update entropy calculations as new price ticks arrive.

Historical benchmark bars are merged with timestamped live ticks on real 1-minute buckets.

---

## Sample Readiness

Entropy calculations require a minimum sample size. The **Assets Ready** counter in the header shows how many assets currently have enough data.
