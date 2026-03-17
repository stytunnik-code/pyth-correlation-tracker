# Pyth Network — Hermes (Live Feed)

Live price data is sourced from **Pyth Hermes**, the official Pyth Network streaming API.

---

## What is Pyth Network?

[Pyth Network](https://pyth.network) is a decentralized oracle that aggregates price data from **professional market makers, exchanges, and trading firms** and publishes it on-chain with sub-second latency.

Unlike oracles that scrape public exchanges, Pyth sources data from first-party providers — the actual firms trading these assets — making it one of the highest-quality oracle feeds available.

---

## Hermes Endpoint

```
wss://hermes.pyth.network/ws
REST: https://hermes.pyth.network/v2/updates/price/latest
```

The app subscribes to price updates via polling:

```javascript
// Every 3 seconds
const params = new URLSearchParams();
ASSETS.forEach(a => params.append('ids', a.id));
const res = await fetch(`/api/pyth?${params}`);
```

---

## Price Feed IDs

Each asset has a unique 32-byte hex feed ID on Pyth. Example:

| Asset | Feed ID (first 16 chars) |
|-------|--------------------------|
| BTC/USD | `e62df6c8b4a85fe1...` |
| ETH/USD | `ff61491a93111...` |
| SOL/USD | `ef0d8b6fda2ceb...` |
| XAU/USD | `765d2ba906dbc3...` |
| EUR/USD | `a995d00bb36a63...` |

Full feed IDs are available in the [Pyth Price Feed IDs](https://pyth.network/developers/price-feed-ids) documentation.

---

## Price Object Structure

Each price update from Hermes contains:

```json
{
  "id": "e62df6c8b4a85fe1...",
  "price": {
    "price": "6500000000000",
    "conf": "2500000000",
    "expo": -8,
    "publish_time": 1710000000
  },
  "ema_price": { ... }
}
```

The actual price = `price × 10^expo` = `65000.00`

---

## Update Frequency

- **Pyth on-chain**: ~400ms (Solana slot time)
- **App polling**: every 3 seconds
- **UI render**: on each price update

---

## DEMO Mode

If the Pyth API is unreachable (network error, rate limit), the app automatically falls back to **DEMO mode** — simulating price movements using seeded random walks. The `DEMO` badge replaces `LIVE` in the header.
