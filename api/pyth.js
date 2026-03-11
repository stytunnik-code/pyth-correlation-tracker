export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();

  let { ids } = req.query;
  if (!ids) return res.status(400).json({ error: "Missing ids" });

  const idList = Array.isArray(ids)
    ? ids.flatMap(i => i.split(","))
    : ids.split(",").map(s => s.trim()).filter(Boolean);

  try {
    const params = new URLSearchParams();
    idList.forEach(id => params.append("ids[]", id.trim()));
    params.set("parsed", "true");
    params.set("ignore_invalid_price_ids", "true"); // skip 404 IDs gracefully

    const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}`;
    const headers = { "Accept": "application/json" };
    if (process.env.PYTH_API_KEY) headers["Authorization"] = `Bearer ${process.env.PYTH_API_KEY}`;
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error(`Hermes ${response.status}`);
    const data = await response.json();

    const parsed = (data.parsed || []).map(item => ({
      id: item.id,
      price: item.price,
      ema_price: item.ema_price,
      metadata: item.metadata,
    }));

    return res.status(200).json({ parsed, count: parsed.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
