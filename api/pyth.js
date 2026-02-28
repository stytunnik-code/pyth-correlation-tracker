export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: "Missing ids" });

  try {
    const idList = Array.isArray(ids) ? ids : ids.split(",");
    
    // Build query with proper ids[] format for Hermes v2
    const params = new URLSearchParams();
    idList.forEach(id => params.append("ids[]", id.trim()));
    params.append("parsed", "true");
    
    const url = `https://hermes.pyth.network/v2/updates/price/latest?${params.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "User-Agent": "pyth-correlation-tracker/1.0",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Hermes ${response.status}: ${errText.slice(0,200)}`);
    }

    const data = await response.json();

    // Normalize to { parsed: [...] } format
    // Hermes v2 returns: { binary: {...}, parsed: [{id, price:{price,conf,expo}, ema_price, metadata}] }
    const parsed = (data.parsed || []).map(item => ({
      id: item.id,
      price: item.price,      // {price: "638...", conf: "...", expo: -8, publish_time: ...}
      ema_price: item.ema_price,
      metadata: item.metadata,
    }));

    return res.status(200).json({ parsed, count: parsed.length });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack?.slice(0, 300) });
  }
}
