# Entropy Lab

The **Entropy Lab** goes beyond linear correlation to detect **nonlinear dependencies** between assets that Pearson completely misses.

---

## The Problem with Pearson

Pearson correlation only captures **linear** relationships. Two assets can have near-zero Pearson correlation yet still be deeply dependent — just in a nonlinear way.

Example: an asset that mirrors another's volatility (not direction) shows `r ≈ 0` on Pearson but high NMI.

---

## Shannon Entropy

The Entropy module computes **Shannon entropy** for each asset's price return distribution:

```
H(X) = -Σ p(x) · log₂(p(x))
```

- **Low entropy** → returns are predictable, concentrated distribution
- **High entropy** → returns are chaotic, spread distribution

---

## Entropy Ranking

The **Entropy Ranking** bar chart ranks all active assets from most predictable (low entropy) to most chaotic (high entropy).

This answers: *"Which asset has the most predictable price behavior right now?"*

---

## NMI Heatmap

**Normalized Mutual Information (NMI)** measures how much knowing one asset's returns tells you about another's — regardless of whether the relationship is linear.

```
NMI(X,Y) = I(X;Y) / sqrt(H(X) · H(Y))
```

- Range: **0.0** (completely independent) to **1.0** (perfectly dependent)
- The heatmap color scale: dark purple (0) → violet (0.5) → green (1.0)

---

## Hidden Connections

The bottom panel highlights **Hidden Connections** — pairs where:
- Pearson correlation is **weak** (< 0.3 in absolute value)
- But NMI is **high** (> 0.4)

These are pairs that appear uncorrelated on the surface but have a meaningful nonlinear dependence. They often represent lagged relationships, volatility coupling, or regime-dependent co-movement.

---

## Live Run Mode

Toggle **Live Run** to continuously update entropy calculations as new price ticks arrive. In static mode, entropy is computed once per session load.

---

{% hint style="info" %}
Entropy calculations require a minimum sample size. The **Assets Ready** counter in the header shows how many assets have enough history to compute reliable entropy values.
{% endhint %}
