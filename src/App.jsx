import { useState, useEffect, useRef, useCallback } from "react";

// ─── Pyth Hermes price feed IDs ───────────────────────────────────────────────
const ASSETS = [
  { id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", symbol: "BTC", name: "Bitcoin",        category: "crypto",    color: "#F7931A" },
  { id: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", symbol: "ETH", name: "Ethereum",       category: "crypto",    color: "#627EEA" },
  { id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL", name: "Solana",         category: "crypto",    color: "#9945FF" },
  { id: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a461c54d397a53f6f2a1e3cf07c", symbol: "DOGE", name: "Dogecoin",     category: "crypto",    color: "#C2A633" },
  { id: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", symbol: "USDC", name: "USD Coin",     category: "crypto",    color: "#2775CA" },
  { id: "49f6b65cb1de6b10468f01a6760ee3c4c7f19ab72c8e7c4c7e8b2a3e3e3e3e3e", symbol: "AAPL", name: "Apple",       category: "equity",    color: "#A2AAAD" },
  { id: "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", symbol: "EUR/USD", name: "Euro",      category: "fx",        color: "#003399" },
  { id: "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1", symbol: "GBP/USD", name: "Pound",    category: "fx",        color: "#012169" },
  { id: "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", symbol: "XAU/USD", name: "Gold",     category: "commodity", color: "#FFD700" },
  { id: "c9d8b075a5c69303365ae23632d4e2560c5caa6a73b04100c51cfa985ba4aa0e", symbol: "WTI", name: "Oil (WTI)",     category: "commodity", color: "#8B4513" },
];

const CATEGORY_COLORS = {
  crypto:    "#9945FF",
  equity:    "#00D4AA",
  fx:        "#4A90E2",
  commodity: "#FFD700",
};

const HERMES_BASE = "https://hermes.pyth.network";

// ─── Pearson correlation ───────────────────────────────────────────────────────
function pearsonCorr(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 3) return 0;
  const ax = a.slice(-n), bx = b.slice(-n);
  const ma = ax.reduce((s, v) => s + v, 0) / n;
  const mb = bx.reduce((s, v) => s + v, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const ai = ax[i] - ma, bi = bx[i] - mb;
    num += ai * bi; da += ai * ai; db += bi * bi;
  }
  const denom = Math.sqrt(da * db);
  return denom === 0 ? 0 : Math.max(-1, Math.min(1, num / denom));
}

// ─── Colour scale: -1 → red, 0 → dark, 1 → green ────────────────────────────
function corrColor(v) {
  if (v === null) return "#1a1a2e";
  if (v >= 0) {
    const t = v;
    const r = Math.round(0   + t * 0);
    const g = Math.round(80  + t * 130);
    const b = Math.round(60  + t * (-40));
    return `rgb(${r},${g},${b})`;
  } else {
    const t = -v;
    const r = Math.round(0   + t * 220);
    const g = Math.round(80  - t * 50);
    const b = Math.round(60  - t * 30);
    return `rgb(${r},${g},${b})`;
  }
}

function corrLabel(v) {
  if (v === null) return "–";
  return v.toFixed(2);
}

export default function App() {
  const [prices, setPrices]     = useState({});       // symbol → latest price
  const [history, setHistory]   = useState({});        // symbol → [price, ...]
  const [corr, setCorr]         = useState({});        // "A-B" → number
  const [selected, setSelected] = useState(null);      // highlight pair
  const [tick, setTick]         = useState(0);
  const [status, setStatus]     = useState("Connecting…");
  const [activeFilter, setActiveFilter] = useState("all");
  const histRef = useRef({});

  // ─── Fetch all prices from Hermes ──────────────────────────────────────────
  const fetchPrices = useCallback(async () => {
    try {
      const ids = ASSETS.map(a => `ids[]=${a.id}`).join("&");
      const res = await fetch(`${HERMES_BASE}/v2/updates/price/latest?${ids}&encoding=hex`);
      if (!res.ok) throw new Error("Hermes error");
      const data = await res.json();

      const newPrices = {};
      data.parsed?.forEach(item => {
        const asset = ASSETS.find(a => a.id === item.id);
        if (!asset) return;
        const price = parseFloat(item.price.price) * Math.pow(10, item.price.expo);
        newPrices[asset.symbol] = price;

        if (!histRef.current[asset.symbol]) histRef.current[asset.symbol] = [];
        histRef.current[asset.symbol].push(price);
        if (histRef.current[asset.symbol].length > 120) histRef.current[asset.symbol].shift();
      });

      setPrices(newPrices);
      setHistory({ ...histRef.current });
      setStatus(`Live · ${new Date().toLocaleTimeString()}`);
    } catch (e) {
      // fallback: generate synthetic prices for demo
      const synth = {};
      ASSETS.forEach(a => {
        const prev = histRef.current[a.symbol];
        const last = prev?.length ? prev[prev.length - 1] : getSeedPrice(a.symbol);
        const noise = (Math.random() - 0.49) * last * 0.002;
        synth[a.symbol] = last + noise;
        if (!histRef.current[a.symbol]) histRef.current[a.symbol] = [];
        histRef.current[a.symbol].push(synth[a.symbol]);
        if (histRef.current[a.symbol].length > 120) histRef.current[a.symbol].shift();
      });
      setPrices(synth);
      setHistory({ ...histRef.current });
      setStatus(`Demo mode · ${new Date().toLocaleTimeString()}`);
    }
  }, []);

  function getSeedPrice(sym) {
    const seeds = { BTC:65000, ETH:3200, SOL:140, DOGE:0.15, USDC:1,
                    AAPL:185, "EUR/USD":1.085, "GBP/USD":1.265,
                    "XAU/USD":2320, WTI:78 };
    return seeds[sym] ?? 100;
  }

  // ─── Recompute correlations ─────────────────────────────────────────────────
  useEffect(() => {
    const newCorr = {};
    for (let i = 0; i < ASSETS.length; i++) {
      for (let j = 0; j < ASSETS.length; j++) {
        const a = ASSETS[i].symbol, b = ASSETS[j].symbol;
        const ha = histRef.current[a] ?? [], hb = histRef.current[b] ?? [];
        newCorr[`${a}-${b}`] = i === j ? 1 : pearsonCorr(ha, hb);
      }
    }
    setCorr(newCorr);
  }, [history]);

  // ─── Poll every 3 s ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPrices();
    const iv = setInterval(() => { fetchPrices(); setTick(t => t + 1); }, 3000);
    return () => clearInterval(iv);
  }, [fetchPrices]);

  const filteredAssets = activeFilter === "all"
    ? ASSETS
    : ASSETS.filter(a => a.category === activeFilter);

  const formatPrice = (sym, val) => {
    if (!val) return "–";
    if (sym === "USDC") return `$${val.toFixed(4)}`;
    if (["EUR/USD","GBP/USD"].includes(sym)) return val.toFixed(5);
    if (val > 1000) return `$${val.toLocaleString(undefined,{maximumFractionDigits:0})}`;
    if (val > 1) return `$${val.toFixed(3)}`;
    return `$${val.toFixed(6)}`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#08091a",
      color: "#e0e6f0",
      fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      padding: "0",
      overflow: "hidden auto",
    }}>
      {/* ── Scanline overlay ── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.05) 2px,rgba(0,0,0,0.05) 4px)",
      }} />

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid #1e2d50",
        padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(8,9,26,0.95)",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg,#9945FF,#00D4AA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: "bold",
          }}>P</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.08em", color: "#fff" }}>
              PYTH · CORRELATION MATRIX
            </div>
            <div style={{ fontSize: 10, color: "#4a6080", letterSpacing: "0.15em", marginTop: 2 }}>
              CROSS-ASSET REAL-TIME ANALYSIS
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 11, color: "#4a6080", letterSpacing: "0.12em",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{
            display: "inline-block", width: 6, height: 6, borderRadius: "50%",
            background: status.startsWith("Live") ? "#00D4AA" : "#F7931A",
            boxShadow: status.startsWith("Live") ? "0 0 8px #00D4AA" : "0 0 8px #F7931A",
            animation: "pulse 2s infinite",
          }} />
          {status}
        </div>
      </header>

      <main style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Category filter ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {["all","crypto","fx","equity","commodity"].map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)} style={{
              padding: "6px 16px",
              background: activeFilter === cat ? "#1e2d50" : "transparent",
              border: `1px solid ${activeFilter === cat ? "#4A90E2" : "#1e2d50"}`,
              borderRadius: 4, color: activeFilter === cat ? "#fff" : "#4a6080",
              fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "inherit",
            }}>
              {cat === "all" ? "ALL ASSETS" : cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Live ticker strip ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 8, marginBottom: 32,
        }}>
          {ASSETS.filter(a => activeFilter === "all" || a.category === activeFilter).map(asset => (
            <div key={asset.symbol} style={{
              background: "#0d1225",
              border: `1px solid ${prices[asset.symbol] ? "#1e2d50" : "#111"}`,
              borderLeft: `3px solid ${asset.color}`,
              borderRadius: 6, padding: "10px 12px",
              transition: "all 0.3s",
            }}>
              <div style={{ fontSize: 10, color: "#4a6080", letterSpacing: "0.12em" }}>
                {asset.category.toUpperCase()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: asset.color, marginTop: 2 }}>
                {asset.symbol}
              </div>
              <div style={{ fontSize: 12, color: "#e0e6f0", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                {formatPrice(asset.symbol, prices[asset.symbol])}
              </div>
            </div>
          ))}
        </div>

        {/* ── Correlation heatmap ── */}
        <div style={{
          background: "#0d1225",
          border: "1px solid #1e2d50",
          borderRadius: 8, overflow: "hidden", marginBottom: 32,
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1e2d50", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, letterSpacing: "0.15em", color: "#8098c0" }}>
              CORRELATION HEATMAP  <span style={{ color: "#4a6080" }}>· {filteredAssets.length}×{filteredAssets.length} matrix · rolling 120 ticks</span>
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 10, color: "#4a6080" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ display: "inline-block", width: 24, height: 8, background: "linear-gradient(90deg,rgb(220,30,30),#0d1225,rgb(0,210,100))", borderRadius: 2 }} />
                –1 → 0 → +1
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto", padding: "16px" }}>
            <table style={{ borderCollapse: "separate", borderSpacing: 3, width: "100%" }}>
              <thead>
                <tr>
                  <td style={{ width: 70 }} />
                  {filteredAssets.map(a => (
                    <td key={a.symbol} style={{
                      textAlign: "center", fontSize: 9, color: a.color,
                      padding: "4px 2px", fontWeight: 700, letterSpacing: "0.05em",
                      writingMode: "vertical-lr", transform: "rotate(180deg)",
                      height: 60,
                    }}>{a.symbol}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(rowA => (
                  <tr key={rowA.symbol}>
                    <td style={{
                      fontSize: 10, color: rowA.color, fontWeight: 700,
                      paddingRight: 8, letterSpacing: "0.06em", whiteSpace: "nowrap",
                    }}>{rowA.symbol}</td>
                    {filteredAssets.map(colB => {
                      const key = `${rowA.symbol}-${colB.symbol}`;
                      const val = corr[key] ?? null;
                      const isDiag = rowA.symbol === colB.symbol;
                      const isSelected = selected === key || selected === `${colB.symbol}-${rowA.symbol}`;
                      return (
                        <td key={colB.symbol}
                          onClick={() => setSelected(isSelected ? null : key)}
                          title={`${rowA.symbol} vs ${colB.symbol}: ${corrLabel(val)}`}
                          style={{
                            background: isDiag ? "#1a1a3a" : corrColor(val),
                            width: 44, height: 44, textAlign: "center",
                            fontSize: 9, fontWeight: 600,
                            color: isDiag ? "#5566aa" : "rgba(255,255,255,0.85)",
                            borderRadius: 4, cursor: "pointer",
                            outline: isSelected ? "2px solid #fff" : "none",
                            transition: "all 0.3s",
                            fontVariantNumeric: "tabular-nums",
                          }}>
                          {isDiag ? "—" : corrLabel(val)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Top correlations ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
          {/* Strong positive */}
          <div style={{ background: "#0d1225", border: "1px solid #1e2d50", borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#00D4AA", marginBottom: 12 }}>
              ▲ TOP POSITIVE CORRELATIONS
            </div>
            {getTopPairs(corr, filteredAssets, "pos").map(({ pair, val }) => (
              <div key={pair} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #111" }}>
                <span style={{ fontSize: 12, color: "#8098c0" }}>{pair}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "#00D4AA",
                  fontVariantNumeric: "tabular-nums",
                }}>{val.toFixed(3)}</span>
              </div>
            ))}
          </div>
          {/* Strong negative */}
          <div style={{ background: "#0d1225", border: "1px solid #1e2d50", borderRadius: 8, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#FF4C4C", marginBottom: 12 }}>
              ▼ TOP NEGATIVE CORRELATIONS
            </div>
            {getTopPairs(corr, filteredAssets, "neg").map(({ pair, val }) => (
              <div key={pair} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #111" }}>
                <span style={{ fontSize: 12, color: "#8098c0" }}>{pair}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "#FF4C4C",
                  fontVariantNumeric: "tabular-nums",
                }}>{val.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Category correlation summary ── */}
        <div style={{ background: "#0d1225", border: "1px solid #1e2d50", borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#8098c0", marginBottom: 16 }}>
            CROSS-CATEGORY AVERAGE CORRELATION
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 8 }}>
            {getCategoryCorrPairs(corr).map(({ label, val }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#080918", borderRadius: 4, padding: "8px 12px",
                border: `1px solid ${val > 0.3 ? "#00D4AA33" : val < -0.1 ? "#FF4C4C33" : "#1e2d50"}`,
              }}>
                <span style={{ fontSize: 11, color: "#4a6080" }}>{label}</span>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: val > 0.3 ? "#00D4AA" : val < -0.1 ? "#FF4C4C" : "#8098c0",
                  fontVariantNumeric: "tabular-nums",
                }}>{val.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer style={{ textAlign: "center", padding: "20px", fontSize: 10, color: "#2a3a55", letterSpacing: "0.1em" }}>
        POWERED BY PYTH NETWORK · DATA FROM HERMES REST API · UPDATES EVERY 3S
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0d1225; }
        ::-webkit-scrollbar-thumb { background: #1e2d50; border-radius: 3px; }
        button:hover { opacity: 0.85; }
        td:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTopPairs(corr, assets, dir) {
  const pairs = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const key = `${assets[i].symbol}-${assets[j].symbol}`;
      const val = corr[key];
      if (val !== undefined && val !== null && isFinite(val)) {
        pairs.push({ pair: `${assets[i].symbol} / ${assets[j].symbol}`, val });
      }
    }
  }
  if (dir === "pos") return pairs.sort((a, b) => b.val - a.val).slice(0, 5);
  return pairs.sort((a, b) => a.val - b.val).slice(0, 5);
}

function getCategoryCorrPairs(corr) {
  const cats = ["crypto","fx","equity","commodity"];
  const results = [];
  for (let i = 0; i < cats.length; i++) {
    for (let j = i; j < cats.length; j++) {
      const aAssets = ASSETS.filter(a => a.category === cats[i]);
      const bAssets = ASSETS.filter(a => a.category === cats[j]);
      const vals = [];
      aAssets.forEach(a => bAssets.forEach(b => {
        if (a.symbol === b.symbol) return;
        const key = `${a.symbol}-${b.symbol}`;
        const v = corr[key] ?? corr[`${b.symbol}-${a.symbol}`];
        if (v !== undefined && isFinite(v)) vals.push(v);
      }));
      if (vals.length) {
        const avg = vals.reduce((s,v)=>s+v,0)/vals.length;
        const label = cats[i] === cats[j]
          ? `${cats[i].toUpperCase()} ↔ ${cats[i].toUpperCase()}`
          : `${cats[i].toUpperCase()} ↔ ${cats[j].toUpperCase()}`;
        results.push({ label, val: avg });
      }
    }
  }
  return results;
}
