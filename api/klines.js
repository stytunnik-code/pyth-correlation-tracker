// api/klines.js — proxy Binance klines to avoid CORS
// Supports: BTC ETH SOL DOGE USDC (crypto pairs vs USDT)
// Falls back gracefully for FX/commodity/equity

const SYMBOL_MAP = {
  "BTC":     "BTCUSDT",
  "ETH":     "ETHUSDT",
  "SOL":     "SOLUSDT",
  "DOGE":    "DOGEUSDT",
  "USDC":    "USDCUSDT",
  "XAU/USD": "XAUUSDT",   // Binance has gold
  "GBP/USD": "GBPUSDT",   // Binance has GBP
  "EUR/USD": "EURUSDT",   // Binance has EUR
  // WTI and AAPL not available on Binance
};

const TF_ALLOWED = new Set(["1m","3m","5m","15m","30m","1h","2h","4h","6h","1d"]);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=10");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol, interval = "1m", limit = "300" } = req.query;

  if (!symbol) return res.status(400).json({ error: "Missing symbol" });

  const binanceSym = SYMBOL_MAP[symbol];
  if (!binanceSym) {
    // Asset not available on Binance — return empty so client shows Pyth-only data
    return res.status(200).json({ candles: [], source: "none", symbol });
  }

  const tf = TF_ALLOWED.has(interval) ? interval : "1m";
  const lim = Math.min(parseInt(limit) || 300, 1000);

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSym}&interval=${tf}&limit=${lim}`;
    const r = await fetch(url, {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (!r.ok) throw new Error(`Binance ${r.status}`);
    const raw = await r.json();

    // Binance format: [openTime, open, high, low, close, volume, closeTime, ...]
    const candles = raw.map(k => ({
      t: Math.floor(k[0] / 1000),   // open time in seconds
      o: parseFloat(k[1]),
      h: parseFloat(k[2]),
      l: parseFloat(k[3]),
      c: parseFloat(k[4]),
      v: parseFloat(k[5]),
      n: parseInt(k[8]) || 1,       // number of trades
    }));

    return res.status(200).json({ candles, source: "binance", symbol });
  } catch (err) {
    console.error("Klines error:", err.message);
    return res.status(500).json({ error: err.message, candles: [] });
  }
}
