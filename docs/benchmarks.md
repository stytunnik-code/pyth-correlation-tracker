# Pyth Benchmarks — Historical OHLCV

Historical candlestick data is sourced from **Pyth Benchmarks**, a TradingView-compatible REST API that reconstructs OHLCV bars from Pyth oracle price history.

---

## Endpoint

```
GET https://benchmarks.pyth.network/v1/shims/tradingview/history
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `symbol` | string | Pyth symbol (e.g. `Crypto.BTC/USD`) |
| `resolution` | string | Bar size: `1`, `5`, `15`, `60`, `240`, `D` |
| `from` | unix timestamp | Start time |
| `to` | unix timestamp | End time |
| `countback` | integer | Number of bars to return |

### Example Request

```
GET /v1/shims/tradingview/history
  ?symbol=Crypto.BTC/USD
  &resolution=60
  &from=1710000000
  &to=1710086400
  &countback=300
```

---

## Response Format

```json
{
  "s": "ok",
  "t": [1710000000, 1710003600, ...],
  "o": [65000.0, 65120.5, ...],
  "h": [65200.0, 65300.0, ...],
  "l": [64900.0, 65050.0, ...],
  "c": [65100.0, 65250.0, ...],
  "v": [1200.5, 980.2, ...]
}
```

- `s` — status (`"ok"` or `"no_data"`)
- `t` — Unix timestamps
- `o/h/l/c` — Open/High/Low/Close prices
- `v` — Volume

---

## Symbol Map

| App Symbol | Benchmarks Symbol |
|-----------|------------------|
| BTC | `Crypto.BTC/USD` |
| ETH | `Crypto.ETH/USD` |
| SOL | `Crypto.SOL/USD` |
| XAU/USD | `Metal.XAU/USD` |
| EUR/USD | `FX.EUR/USD` |
| GBP/USD | `FX.GBP/USD` |
| WTI | `Commodities.USOILSPOT` |
| AAPL | `Equity.US.AAPL/USD` |
| SPY | `Equity.US.SPY/USD` |
| QQQ | `Equity.US.QQQ/USD` |

---

## Prefetch on Load

On startup, the app prefetches **60 hours of 1-hour bars** for all active assets:

```javascript
const from = now - 60 * 3600; // 60 hours ago
await fetch(`/api/benchmarks?symbol=${sym}&resolution=60&from=${from}&to=${now}&countback=60`);
```

This pre-populates the correlation history buffer so the Matrix is meaningful from the first tick — rather than waiting 10 minutes for live data to accumulate.

---

{% hint style="info" %}
Pyth Benchmarks data availability varies by asset. Equity feeds (AAPL, SPY, etc.) may return `"no_data"` outside US market hours.
{% endhint %}
