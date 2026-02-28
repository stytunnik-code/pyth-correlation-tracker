export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { ids } = req.query;
  if (!ids) return res.status(400).json({ error: "Missing ids" });

  try {
    const idList = Array.isArray(ids) ? ids : ids.split(",");
    const params = idList.map(id => `ids[]=${id.trim()}`).join("&");
    
    // Use the v2 parsed endpoint which returns the exact format App.jsx expects
    const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}&parsed=true`;
    
    const response = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (!response.ok) throw new Error(`Hermes ${response.status}`);

    const data = await response.json();
    
    // Return in the format App.jsx expects: { parsed: [...] }
    return res.status(200).json({ parsed: data.parsed || [] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
