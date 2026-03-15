# Live Correlation Matrix

The **Matrix** is the main dashboard — a real-time heatmap showing Pearson correlations between all selected assets, updated every 3 seconds.

---

## Reading the Matrix

Every cell at row `A`, column `B` shows the rolling Pearson correlation between asset A and asset B over the last 200 price ticks.

- **Diagonal** is always `+1.00` (an asset perfectly correlates with itself)
- The matrix is **symmetric** — cell (A,B) = cell (B,A)
- Values update live as new prices arrive from Pyth oracle

---

## Color Scale

The color encoding is intentionally non-linear to highlight actionable signals:

```
-1.0          -0.65    -0.30     0      +0.30   +0.65    +1.0
 ●━━━━━━━━━━━━━●━━━━━━━━●━━━━━━━━●━━━━━━━●━━━━━━━━●
Deep Red     Red    Faint     Purple  Faint  Yellow   Green
                   Orange            Violet
```

---

## Ticker Cards

Each asset has a **ticker card** showing:
- Live price and % change
- 50-tick sparkline
- 24h High / Low
- Average correlation to all other visible assets
- Category badge

Cards are sortable by: **Default, Price ↓, Price ↑, Correlation ↓, Correlation ↑**

---

## Top Pairs Ranking

Below the heatmap, two ranked lists show:
- **▲ Strongest Positive** — top 6 most correlated pairs
- **▼ Strongest Negative** — top 6 most inversely correlated pairs

Click any row to open the Correlation Deep-Dive for that pair.

---

## Header Stats

The header bar shows live aggregate stats across all visible assets:

| Stat | Description |
|------|-------------|
| **Pairs** | Total correlation pairs being tracked |
| **Strong +** | Pairs with correlation > +0.7 |
| **Strong −** | Pairs with correlation < −0.7 |
| **Avg Corr** | Mean correlation across all pairs |

---

## Correlation Alert

Enable the **Correlation Alert** (bell icon) to get notified when a specific pair crosses a threshold — e.g., BTC/ETH drops below 0.5.
