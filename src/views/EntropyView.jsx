import { useState, useEffect, useRef, useCallback } from "react";
import PythLogo from "../components/PythLogo.jsx";
import { pearson } from "../utils/math.js";
import { PYTH_SYM, fetchPyth } from "../utils/pyth.js";
import {
  pctReturns,
  mulberry32, pythSeed, gaussianEntropy,
  quantileBins, shannonH, jointH, permutationAdjustedMI,
  bootstrapEntropy, interpolateMatrix, interpolateEntropyRanking, mergeHistoricalBarsWithLiveTicks,
} from "../utils/entropy.js";

function drawEntropyBars(canvas, ranking, assets, minH, maxH) {
  if (minH === undefined) { minH = 0; }
  if (!canvas) return;
  const par = canvas.parentElement; if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#07050f"; ctx.fillRect(0, 0, W, H);

  if (!ranking.length) {
    ctx.fillStyle = "rgba(124,58,237,0.4)"; ctx.font = "12px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Computing…", W / 2, H / 2); return;
  }

  const PAD = { t: 16, r: 20, b: 24, l: 64 };
  const CW = W - PAD.l - PAD.r;
  const rowH = (H - PAD.t - PAD.b) / ranking.length;
  const barH = Math.min(rowH * 0.55, 18);

  ranking.forEach(({ sym, data }, i) => {
    if (!data) return;
    const asset = assets.find(a => a.symbol === sym);
    const y = PAD.t + i * rowH + rowH / 2;
    const noData = (data.std === 0 && data.mean === data.ci95lo && data.mean === data.ci95hi);

    // Rank number
    ctx.fillStyle = noData ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)";
    ctx.font = `700 9px 'Space Mono',monospace`;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(`#${i + 1}`, PAD.l - 44, y);

    // Symbol label
    ctx.fillStyle = noData ? "rgba(255,255,255,0.15)" : (asset?.color || "#a78bfa");
    ctx.font = `700 10px 'Space Mono',monospace`;
    ctx.fillText(sym, PAD.l - 6, y);

    // Bar background track
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(PAD.l, y - barH / 2, CW, barH);

    if (noData) {
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(PAD.l + 1, y - barH / 2 + 1, CW - 2, barH - 2);
      return;
    }

    const range = maxH - minH || 1;
    const barW = Math.max(0, (data.mean - minH) / range * CW);
    const ciLo = Math.max(0, (data.ci95lo - minH) / range * CW);
    const ciHi = Math.max(0, (data.ci95hi - minH) / range * CW);

    // Bar fill — gradient low=green(predictable) high=red(chaotic)
    const t = data.mean / maxH;
    const r = Math.floor(16 + t * 223), g = Math.floor(185 - t * 117), b2 = Math.floor(129 - t * 95);
    const grad = ctx.createLinearGradient(PAD.l, 0, PAD.l + barW, 0);
    grad.addColorStop(0, `rgba(${r},${g},${b2},0.9)`);
    grad.addColorStop(1, `rgba(${r},${g},${b2},0.5)`);
    ctx.fillStyle = grad;
    ctx.fillRect(PAD.l, y - barH / 2, barW, barH);

    // CI band
    if (data.std > 0.01) {
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(PAD.l + ciLo, y - barH / 2 - 2, Math.max(ciHi - ciLo, 2), barH + 4);
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(PAD.l + ciLo, y - barH / 2 - 3); ctx.lineTo(PAD.l + ciLo, y + barH / 2 + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.l + ciHi, y - barH / 2 - 3); ctx.lineTo(PAD.l + ciHi, y + barH / 2 + 3); ctx.stroke();
    }

    // Value label
    const ciStr = data.std > 0.01 ? ` ±${data.std.toFixed(2)}` : "";
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = `9px 'Space Mono',monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(`${data.mean.toFixed(2)}${ciStr}`, PAD.l + barW + 6, y);
  });

  // X axis labels
  ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "8px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  const range2 = maxH - minH || 1;
  for (let i = 0; i <= 4; i++) {
    const v = minH + range2 / 4 * i;
    ctx.fillText(v.toFixed(1), PAD.l + (i / 4) * CW, H - PAD.b + 4);
  }
  ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.font = "8px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText("predictable  ←  gaussian entropy of returns  →  chaotic", PAD.l + CW / 2, H - PAD.b + 14);
}

function drawNMIHeatmap(canvas, assets, nmiMatrix) {
  if (!canvas) return;
  const par = canvas.parentElement; if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#07050f"; ctx.fillRect(0, 0, W, H);

  const n = assets.length;
  const PAD = { t: 28, r: 8, b: 8, l: 48 };
  const cellW = (W - PAD.l - PAD.r) / n;
  const cellH = (H - PAD.t - PAD.b) / n;

  // Column headers
  ctx.font = `700 ${Math.min(cellW * 0.35, 9)}px 'Space Mono',monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  assets.forEach((a, j) => {
    ctx.fillStyle = a.color || "#a78bfa";
    ctx.fillText(a.symbol.replace("/USD", ""), PAD.l + j * cellW + cellW / 2, PAD.t - 3);
  });

  // Row labels
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.min(cellH * 0.4, 9)}px 'Space Mono',monospace`;
  assets.forEach((a, i) => {
    ctx.fillStyle = a.color || "#a78bfa";
    ctx.fillText(a.symbol.replace("/USD", ""), PAD.l - 3, PAD.t + i * cellH + cellH / 2);
  });

  // Cells
  assets.forEach((aI, i) => {
    assets.forEach((aJ, j) => {
      const v = nmiMatrix[i]?.[j] ?? 0;
      const diag = i === j;
      const x = PAD.l + j * cellW, y = PAD.t + i * cellH;

      if (diag) {
        ctx.fillStyle = "rgba(124,58,237,0.25)";
        ctx.fillRect(x, y, cellW - 1, cellH - 1);
        ctx.fillStyle = "#c4b5fd"; ctx.font = `700 ${Math.min(cellW * 0.3, 9)}px 'Space Mono',monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("—", x + cellW / 2, y + cellH / 2);
        return;
      }

      const alpha = 0.08 + v * 0.8;
      ctx.fillStyle = v > 0.5
        ? `rgba(16,${Math.floor(v * 185)},${Math.floor(129 * (1 - v) + 80 * v)},${alpha})`
        : `rgba(${100 + Math.floor(v * 100)},${Math.floor(v * 100)},${180 - Math.floor(v * 60)},${alpha})`;
      ctx.fillRect(x, y, cellW - 1, cellH - 1);

      if (cellW > 30) {
        ctx.fillStyle = v > 0.4 ? `rgba(255,255,255,0.85)` : `rgba(255,255,255,0.35)`;
        ctx.font = `${Math.min(cellW * 0.28, 9)}px 'Space Mono',monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(v > 0 ? v.toFixed(2) : "–", x + cellW / 2, y + cellH / 2);
      }

      if (v > 0.4) {
        ctx.strokeStyle = `rgba(167,139,250,${(v - 0.4) * 0.8})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellW - 1, cellH - 1);
      }
    });
  });
}

function drawHiddenConnections(canvas, assets, nmiMatrix, pearsonMatrix) {
  if (!canvas) return;
  const par = canvas.parentElement; if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#07050f"; ctx.fillRect(0, 0, W, H);

  const hidden = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const nmi = nmiMatrix[i]?.[j] ?? 0;
      const r = Math.abs(pearsonMatrix[i]?.[j] ?? 0);
      if (nmi > 0.30 && r < 0.35) {
        hidden.push({ i, j, nmi, r, symA: assets[i].symbol, symB: assets[j].symbol });
      }
    }
  }
  hidden.sort((a, b) => (b.nmi - b.r) - (a.nmi - a.r));

  if (!hidden.length) {
    ctx.strokeStyle = "rgba(124,58,237,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 - 38, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2 - 6, H / 2 - 38);
    ctx.lineTo(W / 2 - 1, H / 2 - 33);
    ctx.lineTo(W / 2 + 8, H / 2 - 44);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.font = "700 12px 'Space Mono',monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No hidden connections right now", W / 2, H / 2 - 10);
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.font = "9px 'Space Mono',monospace";
    ctx.fillText("Current nonlinear links are already visible in Pearson correlation.", W / 2, H / 2 + 12);
    return;
  }

  const rowH = Math.min((H - 16) / Math.min(hidden.length, 6), 36);
  const maxShow = Math.min(hidden.length, Math.floor((H - 16) / rowH));

  hidden.slice(0, maxShow).forEach(({ symA, symB, nmi, r }, idx) => {
    const y = 16 + idx * rowH;
    const strength = nmi - r;

    ctx.fillStyle = idx % 2 === 0 ? "rgba(124,58,237,0.05)" : "transparent";
    ctx.fillRect(0, y, W, rowH);

    ctx.fillStyle = "#f59e0b"; ctx.font = "12px sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText("⚡", 10, y + rowH / 2);

    const aAsset = assets.find(a => a.symbol === symA);
    const bAsset = assets.find(a => a.symbol === symB);
    ctx.font = `700 10px 'Space Mono',monospace`;
    ctx.fillStyle = aAsset?.color || "#a78bfa";
    ctx.fillText(symA, 30, y + rowH / 2 - 6);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `9px 'Space Mono',monospace`;
    ctx.fillText("/", 30 + ctx.measureText(symA).width + 2, y + rowH / 2 - 6);
    ctx.fillStyle = bAsset?.color || "#7c3aed";
    ctx.font = `700 10px 'Space Mono',monospace`;
    ctx.fillText(symB, 30 + ctx.measureText(symA).width + 10, y + rowH / 2 - 6);

    ctx.font = `8px 'Space Mono',monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(`r=${r.toFixed(2)}`, 30, y + rowH / 2 + 6);
    ctx.fillStyle = "#a78bfa";
    ctx.fillText(`NMI=${nmi.toFixed(2)}`, 80, y + rowH / 2 + 6);

    const barX = 160, barW = W - barX - 80;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(barX, y + rowH / 2 - 3, barW, 6);
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, "rgba(124,58,237,0.8)");
    grad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = grad;
    ctx.fillRect(barX, y + rowH / 2 - 3, Math.min(strength / 0.6, 1) * barW, 6);

    const label = nmi > 0.6 ? "strong nonlinear" : nmi > 0.45 ? "regime corr" : "weak nonlinear";
    ctx.fillStyle = "rgba(245,158,11,0.7)"; ctx.font = `700 8px 'Space Mono',monospace`;
    ctx.textAlign = "right";
    ctx.fillText(label, W - 6, y + rowH / 2);
    ctx.textAlign = "left";
  });
}

export default function EntropyView({ histRef, tickRef, prices, assets, setActiveTab, status, liveRun, setLiveRun, corrAlertEnabled, setCorrAlertEnabled, corrAlertPair, setCorrAlertPair, corrAlertThreshold, setCorrAlertThreshold, corrAlertHit, corrAlertOptions }) {
  const barRef     = useRef();
  const heatRef    = useRef();
  const hiddenRef  = useRef();
  const animRef    = useRef({ raf: null, ranking: [], nmi: [], pearson: [] });
  const [entropyData, setEntropyData] = useState(null);
  const [nmiMatrix,   setNmiMatrix]   = useState([]);
  const [pearsonMat,  setPearsonMat]  = useState([]);
  const [barsBySymbol, setBarsBySymbol] = useState({});
  const [loading,     setLoading]     = useState(false);
  const [seedInfo,    setSeedInfo]    = useState(null);
  const [lastRun,     setLastRun]     = useState(null);
  const [autoRun,     setAutoRun]     = useState(true);
  const [showAlertHelp, setShowAlertHelp] = useState(false);
  const [, tick]                      = useState(0);

  const DEFAULT_ENTROPY = ["BTC","ETH","SOL","XAU/USD","EUR/USD","AAPL","SPY"];
  const [selectedSymbols, setSelectedSymbols] = useState(DEFAULT_ENTROPY);
  const activeAssets = assets.filter(a => selectedSymbols.includes(a.symbol));
  const toggleSymbol = sym => {
    setSelectedSymbols(prev =>
      prev.includes(sym) ? (prev.length > 2 ? prev.filter(s => s !== sym) : prev) : [...prev, sym]
    );
    setEntropyData(null); setNmiMatrix([]); setPearsonMat([]);
  };

  const BINS = 8, N_ITER = 40, SAMPLE = 120;

  // Fetch 1m benchmark bars for all assets
  useEffect(() => {
    let dead = false;
    const needed = activeAssets.filter(a => !barsBySymbol[a.symbol] && PYTH_SYM[a.symbol]);
    if (!needed.length) return;
    setLoading(true);
    Promise.all(needed.map(a => fetchPyth(a.symbol, "1m", 300)))
      .then(results => {
        if (dead) return;
        const upd = {};
        needed.forEach((a, i) => { upd[a.symbol] = results[i]; });
        setBarsBySymbol(p => ({ ...p, ...upd }));
      })
      .catch(() => {})
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbols]);

  // Merge benchmark bars + timestamped live ticks
  const getReturns = () => {
    const ret = {};
    for (const a of activeAssets) {
      const hist = barsBySymbol[a.symbol] || [];
      const merged = mergeHistoricalBarsWithLiveTicks(hist, tickRef?.current?.[a.symbol] || [], 60, 300);
      const closes = merged.map(b => b.c);
      if (closes.length >= 10) ret[a.symbol] = pctReturns(closes);
    }
    return ret;
  };

  const runAnalysis = () => {
    const returns = getReturns();
    if (Object.keys(returns).length < 2) return;
    const seed = pythSeed(prices);
    setSeedInfo({ value: seed, hex: seed.toString(16).padStart(8,"0").toUpperCase(), ts: new Date() });
    const bsResult = bootstrapEntropy(returns, seed, N_ITER, SAMPLE);
    const validSyms = Object.keys(bsResult).filter(s => bsResult[s]);
    const ranking = validSyms
      .map(sym => ({ sym, data: bsResult[sym] }))
      .sort((a, b) => a.data.mean - b.data.mean);
    setEntropyData(ranking);
    const n = activeAssets.length;
    const nmi  = Array.from({ length: n }, () => new Array(n).fill(0));
    const pears = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      nmi[i][i] = 1;
      pears[i][i] = 1;
      for (let j = i + 1; j < n; j++) {
        const rA = returns[activeAssets[i].symbol], rB = returns[activeAssets[j].symbol];
        if (!rA || !rB) continue;
        const mi = permutationAdjustedMI(rA, rB, BINS, (seed ^ (i * 73856093) ^ (j * 19349663)) >>> 0, 24);
        const nmiVal = mi?.adjNmi ?? 0;
        const pearsonVal = Math.abs(pearson(rA, rB) ?? 0);
        nmi[i][j] = nmi[j][i] = nmiVal;
        pears[i][j] = pears[j][i] = pearsonVal;
      }
    }
    setNmiMatrix(nmi);
    setPearsonMat(pears);
    setLastRun(new Date());
  };

  const drawEntropyScene = useCallback((ranking, nmi, pears) => {
    if (!ranking?.length) return;
    const allH = ranking.filter(d=>d.data).map(d=>d.data.mean);
    const minH = allH.length ? Math.min(...allH) : -6;
    const maxH = allH.length ? Math.max(...allH) + 0.5 : 4;
    drawEntropyBars(barRef.current, ranking, activeAssets, minH, maxH);
    drawNMIHeatmap(heatRef.current, activeAssets, nmi);
    drawHiddenConnections(hiddenRef.current, activeAssets, nmi, pears);
  }, [activeAssets]);

  // Auto-run when data loads
  useEffect(() => {
    if (!loading && autoRun) {
      setTimeout(() => {
        const ret = getReturns();
        if (Object.keys(ret).length >= 2) { runAnalysis(); setAutoRun(false); }
      }, 200);
    }
  }, [loading, barsBySymbol]);

  // Safety: run after 4s even if still loading
  useEffect(() => {
    const t = setTimeout(() => {
      const ret = getReturns();
      if (Object.keys(ret).length >= 2 && !entropyData) { runAnalysis(); }
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  // Animated redraw on data change
  useEffect(() => {
    if (!entropyData) return;
    const prevRanking = animRef.current.ranking?.length ? animRef.current.ranking : entropyData;
    const prevNmi = animRef.current.nmi?.length ? animRef.current.nmi : nmiMatrix;
    const prevPearson = animRef.current.pearson?.length ? animRef.current.pearson : pearsonMat;
    if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);

    const duration = liveRun ? 900 : 320;
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const ranking = interpolateEntropyRanking(prevRanking, entropyData, ease);
      const nmi = interpolateMatrix(prevNmi, nmiMatrix, ease);
      const pears = interpolateMatrix(prevPearson, pearsonMat, ease);
      animRef.current.ranking = ranking;
      animRef.current.nmi = nmi;
      animRef.current.pearson = pears;
      drawEntropyScene(ranking, nmi, pears);
      if (t < 1) {
        animRef.current.raf = requestAnimationFrame(frame);
      } else {
        animRef.current.raf = null;
      }
    };

    animRef.current.raf = requestAnimationFrame(frame);
    return () => {
      if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
    };
  }, [entropyData, nmiMatrix, pearsonMat, liveRun, drawEntropyScene]);

  // Resize observers
  useEffect(() => {
    if (!entropyData) return;
    const redraw = () => {
      drawEntropyScene(
        animRef.current.ranking?.length ? animRef.current.ranking : entropyData,
        animRef.current.nmi?.length ? animRef.current.nmi : nmiMatrix,
        animRef.current.pearson?.length ? animRef.current.pearson : pearsonMat
      );
    };
    const obs = [barRef, heatRef, hiddenRef].map(r => {
      const ro = new ResizeObserver(redraw);
      if (r.current?.parentElement) ro.observe(r.current.parentElement);
      return ro;
    });
    return () => obs.forEach(ro => ro.disconnect());
  }, [entropyData, nmiMatrix, pearsonMat, drawEntropyScene]);

  // Live tick
  useEffect(() => {
    const iv = setInterval(() => tick(n => n + 1), 3000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!liveRun) return;
    runAnalysis();
    const iv = setInterval(() => {
      runAnalysis();
      tick(n => n + 1);
    }, 2500);
    return () => clearInterval(iv);
  }, [liveRun, barsBySymbol, prices]);

  const returns = getReturns();
  const nAssets = Object.keys(returns).length;
  const mostPredictable = entropyData?.[0] || null;
  const mostChaotic = entropyData?.[entropyData.length - 1] || null;
  const hiddenPairsCount = pearsonMat.length
    ? activeAssets.reduce((count, _, i) => count + activeAssets.slice(i + 1).reduce((rowCount, __, j2) => {
        const j = i + 1 + j2;
        const nmi = nmiMatrix[i]?.[j] ?? 0;
        const r = Math.abs(pearsonMat[i]?.[j] ?? 0);
        return rowCount + (nmi > 0.08 && r < 0.35 ? 1 : 0);
      }, 0), 0)
    : 0;

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#07050f",fontFamily:"'Space Mono',monospace",overflow:"hidden"}}>

      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",height:48,padding:"0 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0b0917",flexShrink:0,gap:12}}>
        <PythLogo size={22}/>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>GAUSSIAN ENTROPY</span>
        <div className="vt-label" style={{height:16,width:1,background:"rgba(255,255,255,0.08)"}}/>
        {seedInfo && (
          <div className="vt-label" style={{display:"flex",alignItems:"center",gap:6,padding:"2px 8px",borderRadius:3,background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
            <span style={{fontSize:8,color:"rgba(167,139,250,0.6)",letterSpacing:".08em"}}>SEED</span>
            <span style={{fontSize:10,fontWeight:700,color:"#c4b5fd",letterSpacing:".04em"}}>0x{seedInfo.hex}</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>Pyth live</span>
          </div>
        )}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {loading && <span className="vt-label" style={{fontSize:9,color:"rgba(124,58,237,0.6)",letterSpacing:".06em",animation:"pulse 1s infinite"}}>LOADING DATA…</span>}
          {liveRun && <span className="vt-label" style={{fontSize:9,color:"#10b981",letterSpacing:".08em",animation:"pulse 1s infinite"}}>LIVE MEASURING</span>}
          {lastRun && <span className="vt-label" style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>ran {lastRun.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:3,background:status==="live"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${status==="live"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:status==="live"?"#10b981":"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,color:status==="live"?"#10b981":"#ef4444"}}>{status==="live"?"LIVE":"DEMO"}</span>
          </div>
          <button onClick={()=>setLiveRun(v=>!v)} style={{background:liveRun?"rgba(239,68,68,0.18)":"rgba(124,58,237,0.2)",border:`1px solid ${liveRun?"rgba(239,68,68,0.42)":"rgba(124,58,237,0.4)"}`,borderRadius:4,padding:"5px 14px",color:liveRun?"#fca5a5":"#c4b5fd",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:700,letterSpacing:".08em",transition:"all .18s",boxShadow:liveRun?"0 0 18px rgba(239,68,68,0.18)":"none"}}
            onMouseEnter={e=>{e.currentTarget.style.background=liveRun?"rgba(239,68,68,0.28)":"rgba(124,58,237,0.35)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=liveRun?"rgba(239,68,68,0.18)":"rgba(124,58,237,0.2)";}}>
            {liveRun ? "■ STOP" : "▶ RUN"}
          </button>
          <button className="chart-back-btn" onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"6px 15px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,letterSpacing:".05em",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.6)";e.currentTarget.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* Config bar */}
      <div className="en-cfg" style={{display:"flex",alignItems:"center",gap:20,padding:"6px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"#080614",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>BOOTSTRAP</span>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{N_ITER} iter × {SAMPLE} samples</span>
        </div>
        <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>BINS</span>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{BINS} quantile</span>
        </div>
        <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>ASSETS</span>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{nAssets} / {activeAssets.length} ready</span>
        </div>
        <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>SEED SOURCE</span>
          <span style={{fontSize:10,fontWeight:700,color:"#a78bfa"}}>Pyth price ticks</span>
        </div>
        <div style={{marginLeft:"auto",fontSize:8,color:"rgba(255,255,255,0.18)",letterSpacing:".08em"}}>
          live uncertainty map
        </div>
      </div>

      {/* Asset selector */}
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"#07050f",flexShrink:0,overflowX:"auto",scrollbarWidth:"none"}}>
        <span style={{fontSize:8,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",flexShrink:0}}>ASSETS:</span>
        {assets.map(a=>{
          const on = selectedSymbols.includes(a.symbol);
          return (
            <button key={a.symbol} onClick={()=>toggleSymbol(a.symbol)} style={{flexShrink:0,padding:"3px 10px",borderRadius:20,border:`1px solid ${on ? a.color+"66" : "rgba(255,255,255,0.08)"}`,background:on ? a.color+"22" : "transparent",color:on ? a.color : "rgba(255,255,255,0.3)",fontSize:10,fontWeight:700,fontFamily:"inherit",cursor:"pointer",transition:"all .15s",letterSpacing:".03em"}}>
              {a.symbol}
            </button>
          );
        })}
      </div>

      {/* Correlation Stability Alert */}
      <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"#080614",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:220}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Correlation Stability Alert</span>
          <div
            onMouseEnter={()=>setShowAlertHelp(true)}
            onMouseLeave={()=>setShowAlertHelp(false)}
            style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:"50%",background:"linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.95))",border:"1px solid rgba(255,255,255,0.24)",color:"#fff",fontSize:10,fontWeight:800,cursor:"help"}}
          >
            i
            {showAlertHelp && (
              <div style={{position:"absolute",top:22,left:-6,width:240,padding:"8px 10px",background:"#0b0917",border:"1px solid rgba(124,58,237,0.35)",borderRadius:6,color:"rgba(255,255,255,0.78)",fontSize:10,lineHeight:1.45,boxShadow:"0 8px 24px rgba(0,0,0,0.35)",zIndex:4}}>
                Turn it on, choose a pair and a minimum |r| level. The alert triggers when recent correlation prints stay tight and strong, which usually means the pair has entered a stable regime.
              </div>
            )}
          </div>
        </div>
        <span style={{fontSize:11,color:corrAlertHit?"#10b981":"rgba(255,255,255,0.42)"}}>
          {corrAlertHit ? "stabilized now" : "waiting for stable correlation regime"}
        </span>
        <select value={corrAlertPair} onChange={e=>setCorrAlertPair(e.target.value)} style={{background:"#0b0917",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#fff",padding:"8px 10px",fontFamily:"inherit",fontSize:11}}>
          {corrAlertOptions.map(opt=><option key={opt.key} value={opt.key}>{opt.label}</option>)}
        </select>
        <select value={corrAlertThreshold} onChange={e=>setCorrAlertThreshold(parseFloat(e.target.value))} style={{background:"#0b0917",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#fff",padding:"8px 10px",fontFamily:"inherit",fontSize:11}}>
          {[0.6,0.7,0.8,0.9].map(v=><option key={v} value={v}>|r| ≥ {v.toFixed(1)}</option>)}
        </select>
        <button onClick={()=>setCorrAlertEnabled(v=>!v)} style={{background:corrAlertEnabled?"rgba(16,185,129,0.14)":"rgba(124,58,237,0.18)",border:`1px solid ${corrAlertEnabled?"rgba(16,185,129,0.35)":"rgba(124,58,237,0.35)"}`,borderRadius:6,color:corrAlertEnabled?"#34d399":"#c4b5fd",padding:"8px 12px",fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer"}}>
          {corrAlertEnabled ? "ALERT ON" : "ENABLE ALERT"}
        </button>
        <div style={{marginLeft:"auto",fontSize:10,color:corrAlertHit?"#10b981":"rgba(255,255,255,0.3)",letterSpacing:".06em"}}>
          {corrAlertEnabled ? (corrAlertHit ? "STABLE CORRELATION DETECTED" : "MONITORING LIVE") : "ALERT DISABLED"}
        </div>
      </div>

      {/* Stats cards */}
      <div className="en-stats" style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(0, 1fr))",gap:1,background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)",flexShrink:0}}>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Most Predictable</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:mostPredictable ? (activeAssets.find(a=>a.symbol===mostPredictable.sym)?.color || "#10b981") : "rgba(255,255,255,0.25)"}}>{mostPredictable?.sym || "—"}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>{mostPredictable?.data ? `${mostPredictable.data.mean.toFixed(2)} gaussian entropy` : "waiting for sample"}</div>
        </div>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Most Chaotic</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:mostChaotic ? (assets.find(a=>a.symbol===mostChaotic.sym)?.color || "#ef4444") : "rgba(255,255,255,0.25)"}}>{mostChaotic?.sym || "—"}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>{mostChaotic?.data ? `${mostChaotic.data.mean.toFixed(2)} gaussian entropy` : "waiting for sample"}</div>
        </div>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Hidden Links</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:hiddenPairsCount ? "#f59e0b" : "rgba(255,255,255,0.25)"}}>{hiddenPairsCount}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>baseline-adjusted nonlinear links</div>
        </div>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Assets Ready</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:nAssets >= 2 ? "#c4b5fd" : "rgba(255,255,255,0.25)"}}>{nAssets}/{activeAssets.length}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>enough history to rank entropy</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="en-grid" style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 200px",gap:1,minHeight:0,background:"rgba(255,255,255,0.04)"}}>

        {/* Entropy Ranking bar chart */}
        <div style={{display:"flex",flexDirection:"column",background:"#07050f",minHeight:0}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>GAUSSIAN ENTROPY RANKING — predictability ladder</span>
            <div style={{display:"flex",gap:8,fontSize:8,color:"rgba(255,255,255,0.2)"}}>
              <span style={{color:"#10b981"}}>■ low = predictable</span>
              <span style={{color:"#ef4444"}}>■ high = chaotic</span>
            </div>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={barRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>

        {/* NMI Heatmap */}
        <div style={{display:"flex",flexDirection:"column",background:"#07050f",minHeight:0}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>NMI HEATMAP — hidden structure map</span>
            <div style={{display:"flex",gap:8,fontSize:8,color:"rgba(255,255,255,0.2)"}}>
              <span style={{color:"rgba(100,80,180,0.8)"}}>■ 0.0</span>
              <span style={{color:"#a78bfa"}}>■ 0.5</span>
              <span style={{color:"#10b981"}}>■ 1.0</span>
            </div>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={heatRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>

        {/* Hidden connections — spans full width */}
        <div style={{display:"flex",flexDirection:"column",background:"#07050f",minHeight:0,gridColumn:"1 / -1"}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>⚡ HIDDEN CONNECTIONS</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.15)"}}>pairs that look weak on Pearson but still move with meaningful nonlinear dependence</span>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={hiddenRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>

      </div>
    </div>
  );
}
