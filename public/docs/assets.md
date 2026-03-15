# Assets Tracked

All 28 assets available in Pyth Correlation Tracker, organized by category.

---

## Crypto (18 assets)

| Symbol | Name | Pyth Feed |
|--------|------|-----------|
| BTC | Bitcoin | `Crypto.BTC/USD` |
| ETH | Ethereum | `Crypto.ETH/USD` |
| SOL | Solana | `Crypto.SOL/USD` |
| DOGE | Dogecoin | `Crypto.DOGE/USD` |
| USDC | USD Coin | `Crypto.USDC/USD` |
| AVAX | Avalanche | `Crypto.AVAX/USD` |
| ADA | Cardano | `Crypto.ADA/USD` |
| LINK | Chainlink | `Crypto.LINK/USD` |
| UNI | Uniswap | `Crypto.UNI/USD` |
| LTC | Litecoin | `Crypto.LTC/USD` |
| DOT | Polkadot | `Crypto.DOT/USD` |
| TRX | TRON | `Crypto.TRX/USD` |
| APT | Aptos | `Crypto.APT/USD` |
| SUI | Sui | `Crypto.SUI/USD` |
| PEPE | Pepe | `Crypto.PEPE/USD` |
| NEAR | NEAR Protocol | `Crypto.NEAR/USD` |
| ATOM | Cosmos | `Crypto.ATOM/USD` |
| POL | POL (MATIC) | `Crypto.POL/USD` |
| HYPE | Hyperliquid | `Crypto.HYPE/USD` |

---

## FX Pairs (2 assets)

| Symbol | Name | Pyth Feed |
|--------|------|-----------|
| EUR/USD | Euro | `FX.EUR/USD` |
| GBP/USD | British Pound | `FX.GBP/USD` |

---

## Commodities (2 assets)

| Symbol | Name | Pyth Feed |
|--------|------|-----------|
| XAU/USD | Gold | `Metal.XAU/USD` |
| WTI | Crude Oil (WTI) | `Commodities.USOILSPOT` |

---

## Equities (1 asset)

| Symbol | Name | Pyth Feed |
|--------|------|-----------|
| AAPL | Apple Inc. | `Equity.US.AAPL/USD` |

---

## Indices (4 assets)

| Symbol | Name | Pyth Feed |
|--------|------|-----------|
| SPY | S&P 500 ETF | `Equity.US.SPY/USD` |
| QQQ | NASDAQ 100 ETF | `Equity.US.QQQ/USD` |
| DIA | Dow Jones ETF | `Equity.US.DIA/USD` |
| IWM | Russell 2000 ETF | `Equity.US.IWM/USD` |

---

## Default Selection

When you first open the app, 10 core assets are selected by default:

`BTC · ETH · SOL · DOGE · AVAX · ADA · LINK · SUI · NEAR · HYPE`

Your selection is saved to `localStorage` and restored on next visit.

---

{% hint style="info" %}
**Equity and index feeds** (AAPL, SPY, QQQ, DIA, IWM) are only active during US market hours: **9:30 AM – 4:00 PM ET, Monday–Friday**. Outside these hours, prices may be stale or unavailable.
{% endhint %}
