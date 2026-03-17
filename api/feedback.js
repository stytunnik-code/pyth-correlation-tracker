export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text, ts } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "Empty feedback" });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  // Sanitize: strip any remaining HTML
  const safe = String(text).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `🔔 <b>Feedback — Pyth Correlation</b>\n\n${safe}\n\n⏰ ${ts || new Date().toLocaleString()}`,
        parse_mode: "HTML",
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!tgRes.ok) throw new Error(`Telegram ${tgRes.status}`);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Feedback send error:", err.message);
    return res.status(500).json({ error: "Failed to send" });
  }
}
