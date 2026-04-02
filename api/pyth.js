export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(200).end();

  let { ids } = req.query;
  if (!ids) return res.status(400).json({ error: "Missing ids" });

  const idList = Array.isArray(ids)
    ? ids.flatMap(i => i.split(","))
    : ids.split(",").map(s => s.trim()).filter(Boolean);

  const headers = { "Accept": "application/json" };
  if (process.env.PYTH_API_KEY) headers["Authorization"] = `Bearer ${process.env.PYTH_API_KEY}`;

  // Split into batches of 10 to avoid URL length / rate limit issues
  const BATCH_SIZE = 10;
  const batches = [];
  for (let i = 0; i < idList.length; i += BATCH_SIZE) {
    batches.push(idList.slice(i, i + BATCH_SIZE));
  }

  try {
    const results = await Promise.allSettled(
      batches.map(async (batch) => {
        const params = new URLSearchParams();
        batch.forEach(id => params.append("ids[]", id.trim()));
        params.set("parsed", "true");
        params.set("binary", "false");        // disable VAA binary blob (was causing 254MB responses)
        params.set("ignore_invalid_price_ids", "true");

        const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}`;
        const response = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) throw new Error(`Hermes ${response.status}`);
        const data = await response.json();
        return data.parsed || [];
      })
    );

    const parsed = results
      .filter(result => result.status === "fulfilled")
      .flatMap(result => result.value)
      .map(item => ({
      id: item.id,
      price: item.price,
      ema_price: item.ema_price,
      metadata: item.metadata,
    }));

    if (!parsed.length) throw new Error("No valid price updates");

    return res.status(200).json({ parsed, count: parsed.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
