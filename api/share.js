function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function strengthLabel(v) {
  if (!Number.isFinite(v)) return "Live cross-asset correlation snapshot";
  const a = Math.abs(v);
  if (a >= 0.8) return `Very strong ${v >= 0 ? "positive" : "negative"} correlation`;
  if (a >= 0.6) return `Strong ${v >= 0 ? "positive" : "negative"} correlation`;
  if (a >= 0.3) return `Moderate ${v >= 0 ? "positive" : "negative"} correlation`;
  if (a >= 0.1) return `Weak ${v >= 0 ? "positive" : "negative"} correlation`;
  return "No significant correlation";
}

function safeHex(color, fallback) {
  return /^#[0-9a-fA-F]{6}$/.test(color || "") ? color : fallback;
}

export default function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "pyth-correlation-tracker.vercel.app";
  const origin = `${proto}://${host}`;
  const a = String(req.query.a || "BTC").slice(0, 24);
  const b = String(req.query.b || "ETH").slice(0, 24);
  const vRaw = Number(req.query.v);
  const v = Number.isFinite(vRaw) ? Math.max(-1, Math.min(1, vRaw)) : null;
  const ca = safeHex(req.query.ca, "#a78bfa");
  const cb = safeHex(req.query.cb, "#67e8f9");
  const title = `${a} / ${b} Correlation`;
  const valueText = v === null ? "Live snapshot" : `${v >= 0 ? "+" : ""}${v.toFixed(3)}`;
  const description = `${strengthLabel(v)}. ${a}/${b} ${valueText}. Powered by Pyth Network.`;
  const imageUrl = `${origin}/api/share-image?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}${v === null ? "" : `&v=${encodeURIComponent(v.toFixed(3))}`}&ca=${encodeURIComponent(ca)}&cb=${encodeURIComponent(cb)}`;
  const appUrl = `${origin}/`;
  const canonicalUrl = `${origin}/share?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}${v === null ? "" : `&v=${encodeURIComponent(v.toFixed(3))}`}&ca=${encodeURIComponent(ca)}&cb=${encodeURIComponent(cb)}`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)} - Pyth Correlation Tracker</title>
    <meta name="description" content="${esc(description)}" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${esc(canonicalUrl)}" />
    <meta http-equiv="refresh" content="0;url=${esc(appUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Pyth Correlation Tracker" />
    <meta property="og:url" content="${esc(canonicalUrl)}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:image" content="${esc(imageUrl)}" />
    <meta property="og:image:secure_url" content="${esc(imageUrl)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${esc(`${title} ${valueText}`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${esc(canonicalUrl)}" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <meta name="twitter:image" content="${esc(imageUrl)}" />
    <meta name="twitter:image:src" content="${esc(imageUrl)}" />
    <meta name="twitter:image:alt" content="${esc(`${title} ${valueText}`)}" />
    <style>
      body { margin: 0; background: #07050f; color: rgba(255,255,255,0.86); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; display: grid; place-items: center; min-height: 100vh; }
      .card { width: min(560px, calc(100vw - 32px)); border: 1px solid rgba(124,58,237,0.28); border-radius: 16px; padding: 24px; background: radial-gradient(circle at top, rgba(124,58,237,0.18), transparent 48%), rgba(7,5,15,0.96); box-shadow: 0 18px 60px rgba(0,0,0,0.45); }
      .eyebrow { color: #c4b5fd; font-size: 12px; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 10px; }
      h1 { margin: 0 0 8px; font-size: 28px; }
      p { margin: 0 0 16px; line-height: 1.6; color: rgba(255,255,255,0.62); }
      a { color: #c4b5fd; }
    </style>
    <script>
      window.location.replace(${JSON.stringify(appUrl)});
    </script>
  </head>
  <body>
    <div class="card">
      <div class="eyebrow">Pyth Correlation Share</div>
      <h1>${esc(title)}</h1>
      <p>${esc(description)}</p>
      <p>Redirecting to <a href="${esc(appUrl)}">pythcorrelation.com</a>.</p>
      <noscript><p>JavaScript is disabled. Open <a href="${esc(appUrl)}">the app</a>.</p></noscript>
    </div>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
  res.status(200).send(html);
}
