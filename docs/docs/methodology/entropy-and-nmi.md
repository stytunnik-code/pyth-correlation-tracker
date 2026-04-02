# Entropy & NMI

How the Entropy Lab measures predictability and detects hidden nonlinear dependencies between assets.

***

### Why Entropy?

Pearson correlation captures only **linear** relationships. Two assets can have `r ≈ 0` and still be connected in a nonlinear way.

Entropy-based methods help answer two different questions:

- how chaotic is a single asset's return stream;
- how much nonlinear dependence exists between two assets.

***

### Step 1 — Percent Returns

All entropy calculations operate on **percent returns**, not raw prices:

```
r(t) = (price(t) - price(t-1)) / price(t-1) × 100
```

This removes price-level bias and makes assets more comparable.

***

### Step 2 — Gaussian Differential Entropy

For each asset's return series, the platform computes **Gaussian differential entropy**:

```
H(X) = 0.5 * ln(2π * e * σ²)
```

where `σ²` is the variance of percent returns.

Lower entropy means more compressed and stable return behavior.
Higher entropy means more chaotic and volatile behavior.

***

### Step 3 — Bootstrap Confidence

To measure the reliability of each entropy estimate, the platform uses bootstrap resampling:

1. sample returns with replacement;
2. compute gaussian entropy on each resample;
3. report the full-sample estimate plus uncertainty statistics.

The current product uses deterministic seeding from live Pyth prices, so the same state is reproducible.

***

### Step 4 — Mutual Information and NMI

To detect nonlinear dependence between two return series, the platform computes:

```
MI(X,Y) = H(X) + H(Y) - H(X,Y)
NMI(X,Y) = MI(X,Y) / sqrt(H(X) * H(Y))
```

Returns are discretized with **quantile binning** before Shannon and joint entropy are computed.

***

### Step 5 — Adjusted NMI

Raw NMI on finite samples can be noisy.

The current version improves this by running shuffled baselines:

1. compute observed NMI;
2. shuffle one series multiple times;
3. compute baseline NMI on shuffled samples;
4. subtract the baseline mean from observed NMI.

The UI uses this **adjusted NMI**, not raw NMI.

This makes hidden nonlinear signals less likely to be pure noise.

***

### Step 6 — Hidden Connections

A pair is treated as a stronger hidden connection when:

- Pearson is weak or not very informative;
- adjusted NMI still remains above baseline.

These pairs may represent:

- volatility coupling;
- regime-conditional links;
- lagged nonlinear dependence.

***

### Minimum Sample

NMI requires a minimum amount of data to be meaningful. The Entropy Lab header shows how many assets are currently ready.

***

### References

- Shannon, C.E. (1948). _A Mathematical Theory of Communication_.
- standard mutual information and entropy identities from information theory.
