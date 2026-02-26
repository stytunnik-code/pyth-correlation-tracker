export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: "Missing ids parameter" });
  }

  try {
    // Support both single string "id1,id2" and array ids[]=id1&ids[]=id2
    const idList = Array.isArray(ids) ? ids : ids.split(",");
    const params = idList.map((id) => `ids[]=${id.trim()}`).join("&");

    // Use parsed=true to get human-readable price data (price, conf, expo, publish_time)
    // Do NOT use encoding=hex — that returns raw binary VAA data, not parsed prices
    const url = `https://hermes.pyth.network/v2/updates/price/latest?${params}&parsed=true`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      // Forward the actual error body from Hermes for easier debugging
      const errBody = await response.text();
      return res.status(response.status).json({
        error: `Hermes error: ${response.status}`,
        details: errBody,
      });
    }

    const data = await response.json();

    // Extract only the parsed price objects — clean, ready-to-use format:
    // { id, price: { price, conf, expo, publish_time }, ema_price: {...}, metadata: {...} }
    const parsed = data.parsed ?? [];

    // Convert raw price strings to human-readable floats using the exponent
    const prices = parsed.map((feed) => {
      const toFloat = (p) =>
        p ? parseFloat(p.price) * Math.pow(10, p.expo) : null;

      return {
        id: feed.id,
        price: toFloat(feed.price),
        conf: feed.price ? parseFloat(feed.price.conf) * Math.pow(10, feed.price.expo) : null,
        expo: feed.price?.expo,
        publish_time: feed.price?.publish_time,
        ema_price: toFloat(feed.ema_price),
        // Raw fields in case the caller needs them
        raw: {
          price: feed.price,
          ema_price: feed.ema_price,
          metadata: feed.metadata,
        },
      };
    });

    return res.status(200).json({ prices });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
