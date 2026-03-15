# Entropy & NMI

The mathematical foundation behind the Entropy Lab module.

---

## Shannon Entropy

Shannon entropy quantifies the **uncertainty** (or information content) in a random variable's distribution.

$$H(X) = -\sum_{x} p(x) \cdot \log_2 p(x)$$

For price returns, it measures how "spread out" or unpredictable the distribution of tick-to-tick changes is:

- **Low H** → returns cluster tightly → asset is **predictable**
- **High H** → returns spread widely → asset is **chaotic**

### Discretization

Continuous price returns are discretized into **bins** to estimate the probability distribution `p(x)`. The number of bins scales with sample size using Sturges' rule:

```
bins = ⌈log₂(n) + 1⌉
```

---

## Mutual Information

Mutual information measures the **shared information** between two variables — how much knowing one reduces uncertainty about the other:

$$I(X;Y) = \sum_{x,y} p(x,y) \cdot \log_2 \frac{p(x,y)}{p(x)p(y)}$$

- `I(X;Y) = 0` → completely independent
- `I(X;Y) > 0` → knowing X tells you something about Y

Unlike Pearson, mutual information captures **any** dependency — linear, quadratic, periodic, threshold-based.

---

## Normalized Mutual Information (NMI)

Raw MI values are hard to compare across different distributions, so we normalize:

$$\text{NMI}(X,Y) = \frac{I(X;Y)}{\sqrt{H(X) \cdot H(Y)}}$$

- Range: **0** (independent) to **1** (perfectly dependent)
- Symmetric: NMI(X,Y) = NMI(Y,X)
- Scale-invariant: unaffected by the magnitude of prices

---

## Hidden Connections Detection

A pair is flagged as a **Hidden Connection** when:

```
|Pearson(A,B)| < 0.30   AND   NMI(A,B) > 0.40
```

This means:
- The linear signal is **weak** (Pearson can't see it)
- But nonlinear dependence is **significant** (NMI detects it)

These pairs often represent:
- **Volatility coupling** — similar variance patterns, different directions
- **Regime-conditional correlation** — related only during specific market states
- **Lagged nonlinear** relationships beyond the Pearson window

---

## Computational Note

NMI computation is `O(n·bins²)` per pair, making it heavier than Pearson (`O(n)`). For 28 assets, that's 378 pairs. The Entropy Lab uses Web Workers conceptually — calculations are batched to avoid blocking the main render thread.
