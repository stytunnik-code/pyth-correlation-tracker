// api/benchmarks.js — proxy Pyth Benchmarks to keep API key server-side
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=10");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { symbol, resolution, from, to, countback } = req.query;
  if (!symbol || !resolution) return res.status(400).json({ error: "Missing params" });

  const params = new URLSearchParams({ symbol, resolution });
  if (from)      params.set("from", from);
  if (to)        params.set("to", to);
  if (countback) params.set("countback", countback);

  const url = `https://benchmarks.pyth.network/v1/shims/tradingview/history?${params}`;
  const headers = { "Accept": "application/json" };
  if (process.env.PYTH_API_KEY) headers["Authorization"] = `Bearer ${process.env.PYTH_API_KEY}`;

  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`Benchmarks ${r.status}`);
    const data = await r.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
