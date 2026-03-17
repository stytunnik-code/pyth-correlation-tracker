# Correlation Deep-Dive

The **Correlation** module lets you analyze any specific asset pair in detail — with rolling history, strength labels, and a shareable image card.

---

## Pair Selector

Choose any two assets from the dropdowns at the top. The module instantly computes and displays:

- The **current Pearson correlation** (large number, color-coded)
- A **rolling correlation chart** showing how the relationship evolved over time
- A **strength label** (Very Strong / Strong / Moderate / Weak / Uncorrelated)
- Individual **sparklines** for both assets

---

## Correlation History Chart

The rolling chart plots the Pearson value computed at each tick as more data accumulates — starting from tick 4 (minimum for a valid correlation) through the full 200-tick window.

This lets you see:
- Is the correlation **stable** or **noisy**?
- Did it recently **flip** from positive to negative?
- Is it **converging** toward a strong signal?

---

## Strength Scale

| Label | Range | Interpretation |
|-------|-------|---------------|
| Very Strong + | > +0.80 | Assets move almost in lockstep |
| Strong + | +0.50 to +0.80 | Clear positive relationship |
| Moderate + | +0.30 to +0.50 | Moderate positive tendency |
| Uncorrelated | −0.30 to +0.30 | No significant linear relationship |
| Moderate − | −0.50 to −0.30 | Moderate inverse tendency |
| Strong − | −0.80 to −0.50 | Clear inverse relationship |
| Very Strong − | < −0.80 | Assets move in opposite directions |

---

## Share Card

Click the **Share** button to generate a 1200×1200 PNG image card containing:

- Asset pair symbols (color-coded)
- Large correlation number
- Color-coded correlation bar (−1 to +1)
- Strength label
- `LIVE · PYTH ORACLE` badge
- `pythcorrelation.com` attribution

The card is ready to download and post on X/Twitter.

---

## Use Cases

- **Pair trading** — identify pairs that historically move together
- **Hedging** — find inverse correlations for portfolio protection  
- **Regime monitoring** — watch if BTC/gold correlation is rising (risk-off signal)
- **Content creation** — share correlation snapshots with your audience
