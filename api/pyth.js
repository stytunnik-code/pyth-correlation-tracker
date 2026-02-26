export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: "Missing ids parameter" });
  }

  try {
    // Build Hermes URL — support multiple ids
    const idList = Array.isArray(ids) ? ids : ids.split(",");
    const params = idList.map(id => `ids[]=${id.trim()}`).join("&");
    const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}&encoding=hex`;

    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Hermes error: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
