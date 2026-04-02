import { useState, useEffect, useRef, useCallback } from "react";
import { pearson } from "../utils/math.js";
import {
  TF_LIST, TF_SECS,
  CHART_VISIBLE_BARS, CHART_FETCH_BARS, CHART_OVERSCROLL_BARS,
  CHART_MIN_VISIBLE_BARS, CHART_MAX_VISIBLE_BARS, CHART_SIDE_PAD,
  fetchPyth,
} from "../utils/pyth.js";
import PythLogo from "../components/PythLogo.jsx";

function getChartViewport(totalBars, view = {}) {
  const visibleCount = Math.max(20, Math.min(view.visibleCount || CHART_VISIBLE_BARS, totalBars));
  const maxOffset = Math.max(0, totalBars - visibleCount);
  const overscrollBars = Math.max(0, view.overscrollBars ?? CHART_OVERSCROLL_BARS);
  const panBars = Math.max(-overscrollBars, Math.min(view.offset || 0, maxOffset));
  const historyOffset = Math.max(0, Math.min(maxOffset, panBars));
  const end = Math.max(visibleCount, totalBars - historyOffset);
  const start = Math.max(0, end - visibleCount);
  const overscrollShiftBars = historyOffset - panBars;
  // If history is shorter than the default viewport and the user is not actively
  // overscrolling to the right, use the actual bar count so the latest candle
  // sits against the right edge instead of leaving a large empty gap.
  const fittedVisible = Math.max(1, end - start);
  const totalSlots = Math.max(
    panBars < 0 ? visibleCount : Math.min(visibleCount, fittedVisible),
    1
  );
  return { visibleCount, maxOffset, start, end, historyOffset, overscrollShiftBars, totalSlots };
}

function getChartHoverBar(x, width, bars, view = {}) {
  if (!bars?.length) return null;
  const plotWidth = width - CHART_SIDE_PAD.l - CHART_SIDE_PAD.r;
  if (plotWidth <= 0) return null;
  const { start, end, overscrollShiftBars, totalSlots } = getChartViewport(bars.length, view);
  const visible = bars.slice(start, end);
  if (!visible.length) return null;
  const rawIndex = ((x - CHART_SIDE_PAD.l) / plotWidth) * totalSlots + overscrollShiftBars - 0.5;
  const idx = Math.max(0, Math.min(visible.length - 1, Math.round(rawIndex)));
  const bar = visible[idx];
  return bar ? { bar, idx, absoluteIndex: start + idx } : null;
}

function getChartDisplayPrice(lastBar, livePrice) {
  if (!lastBar) return null;
  if (!Number.isFinite(livePrice)) return lastBar.c;
  const tfs = lastBar.tfs || 60;
  const nowTs = Math.floor(Date.now() / 1000);
  const currentSlot = Math.floor(nowTs / tfs) * tfs;
  const lastBarIsCurrent = lastBar.t >= currentSlot;
  const lastRange = Math.max(Math.abs(lastBar.h - lastBar.l), Math.abs(lastBar.c) * 0.0015, 0.000001);
  const liveAligned = Math.abs(livePrice - lastBar.c) <= lastRange * 3;
  return lastBarIsCurrent && liveAligned ? livePrice : lastBar.c;
}

function drawCandles(canvas, bars, chartType, view = {}, scaleOut = null, livePrice = null) {
  if (!canvas) return;
  const par = canvas.parentElement;
  if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = "#07050f"; ctx.fillRect(0,0,W,H);

  if (!bars || bars.length < 2) {
    ctx.fillStyle = "rgba(124,58,237,0.3)"; ctx.font = "12px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Loading data…", W/2, H/2);
    return;
  }

  // PYTH watermark — logo image + "PYTH" text, shown only after data loads
  {
    const wH = Math.min(H * 0.065, 40);
    const fontSize = wH * 0.88;
    ctx.save();
    ctx.globalAlpha = 0.032;
    ctx.fillStyle = "#fff";
    ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
    const textW = ctx.measureText("PYTH").width;
    const iconW = wH;
    const gap   = wH * 0.38;
    const ox = (W - iconW - gap - textW) / 2;
    const oy = H / 2;
    // Logo image
    const img = drawCandles._logoImg;
    if (img?.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, ox, oy - wH / 2, iconW, wH);
    } else if (!drawCandles._logoImg) {
      const i = new Image();
      i.src = "/pyth-logo.png";
      i.onload = () => { drawCandles._logoImg = i; };
      drawCandles._logoImg = i;
    }
    // PYTH text
    ctx.textBaseline = "middle";
    ctx.textAlign    = "left";
    ctx.fillText("PYTH", ox + iconW + gap, oy);
    ctx.restore();
  }

  const PAD = { t:12, b:32, l:8, r: W < 500 ? 54 : 80 };
  const PH = (H - PAD.t - PAD.b) * 0.78;
  const VH = (H - PAD.t - PAD.b) * 0.14;
  const CW = W - PAD.l - PAD.r;
  const { start, end, historyOffset, overscrollShiftBars, totalSlots } = getChartViewport(bars.length, view);
  const vis = bars.slice(start, end);
  const N = vis.length;
  const colW = CW / totalSlots;

  const lo = Math.min(...vis.map(b=>b.l));
  const hi = Math.max(...vis.map(b=>b.h));
  const rng = hi - lo || hi * 0.002 || 1;
  const { yZoom = 1, yOffset = 0 } = view;
  const baseRange = rng * 1.09;
  const refPrice = (lo + hi) / 2 + yOffset;
  const rangeH = baseRange / Math.max(yZoom, 0.1);
  const yMin = refPrice - rangeH * 0.5;
  const yMax = refPrice + rangeH * 0.5;
  const toY = v => PAD.t + PH * (1 - (v-yMin)/(yMax-yMin));
  const toX = i => PAD.l + (i + 0.5 - overscrollShiftBars) * colW;
  if (scaleOut) { scaleOut.yMin=yMin; scaleOut.yMax=yMax; scaleOut.padT=PAD.t; scaleOut.ph=PH; scaleOut.padR=PAD.r; scaleOut.w=W; }

  // Grid lines + price labels
  const gridCount = 6;
  for (let i=0;i<=gridCount;i++) {
    const v = yMin + (yMax-yMin)/gridCount*i;
    const y = toY(v);
    if (y < PAD.t || y > PAD.t+PH) continue;
    // Grid line
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W-PAD.r, y); ctx.stroke();
    // Price label
    const s = v>=100000?v.toFixed(0):v>=10000?v.toFixed(0):v>=100?v.toFixed(2):v>=1?v.toFixed(4):v.toFixed(6);
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px 'Space Mono',monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(s, W-PAD.r+8, y);
  }

  // Volume bars
  const volTop = PAD.t + PH + (H-PAD.t-PAD.b)*0.05;
  const volBase = volTop + VH;
  const maxV = Math.max(...vis.map(b=>b.v||0), 1);

  // Clip chart content to prevent artifacts outside the chart area when Y-zoomed
  ctx.save();
  ctx.beginPath();
  ctx.rect(PAD.l, PAD.t, CW, volBase - PAD.t);
  ctx.clip();

  vis.forEach((b,i)=>{
    const vh = ((b.v||0)/maxV) * VH;
    if (vh < 0.5) return;
    ctx.fillStyle = b.c>=b.o ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)";
    ctx.fillRect(toX(i)-colW*0.38, volBase-vh, colW*0.76, vh);
  });

  // Candles or Line
  if (chartType === "line") {
    const up = vis[vis.length-1].c >= vis[0].o;
    const col = up ? "#10b981" : "#ef4444";
    const grd = ctx.createLinearGradient(0,PAD.t,0,PAD.t+PH);
    grd.addColorStop(0, up?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)");
    grd.addColorStop(1,"rgba(0,0,0,0)");
    ctx.beginPath();
    vis.forEach((b,i)=>{ const x=toX(i),y=toY(b.c); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.lineTo(toX(N-1),PAD.t+PH); ctx.lineTo(toX(0),PAD.t+PH);
    ctx.closePath(); ctx.fillStyle=grd; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.lineJoin="round";
    ctx.beginPath();
    vis.forEach((b,i)=>{ const x=toX(i),y=toY(b.c); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke();
  } else {
    const bw = Math.max(1, colW * 0.6);
    vis.forEach((b,i)=>{
      const x=toX(i), up=b.c>=b.o;
      const upCol = "#10b981", dnCol = "#ef4444";
      const col = up ? upCol : dnCol;

      // Wick
      const wickTop = toY(b.h);
      const wickBot = toY(b.l);
      if (wickBot >= PAD.t && wickTop <= PAD.t+PH) {
        ctx.strokeStyle = col; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, wickTop);
        ctx.lineTo(x, Math.max(wickTop + 1, wickBot));
        ctx.stroke();
      }
      // Body — clamp both top and bottom edges
      const bodyTop = Math.min(toY(b.o), toY(b.c));
      const bodyBot = Math.max(toY(b.o), toY(b.c));
      if (bodyBot >= PAD.t && bodyTop <= PAD.t+PH) {
        ctx.fillStyle = up ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)";
        ctx.fillRect(x-bw/2, bodyTop, bw, Math.max(1, bodyBot-bodyTop));
      }
    });
  }

  ctx.restore(); // end chart-area clip

  // Time axis
  const step = Math.max(1, Math.floor(N/8));
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "8px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  vis.forEach((b,i)=>{
    if (i%step!==0) return;
    const d = new Date(b.t*1000);
    const tfs = b.tfs||60;
    const s = tfs>=86400
      ? d.toLocaleDateString("en",{month:"short",day:"numeric"})
      : d.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",hour12:false});
    ctx.fillText(s, toX(i), volBase+4);
  });

  // Current price line
  const lastBar = vis[vis.length - 1];
  const displayPrice = getChartDisplayPrice(lastBar, livePrice);
  const ly = toY(displayPrice);
  if (ly>=PAD.t && ly<=PAD.t+PH) {
    const prevClose = vis.length > 1 ? vis[Math.max(0, vis.length - 2)].c : vis[0].o;
    const up = displayPrice >= prevClose;
    ctx.strokeStyle = up ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)";
    ctx.lineWidth = 1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(PAD.l, ly); ctx.lineTo(W-PAD.r, ly); ctx.stroke();
    ctx.setLineDash([]);
    const s = displayPrice>=100000?displayPrice.toFixed(0):displayPrice>=10000?displayPrice.toFixed(0):displayPrice>=100?displayPrice.toFixed(2):displayPrice>=1?displayPrice.toFixed(4):displayPrice.toFixed(6);
    ctx.fillStyle = up ? "#10b981" : "#ef4444";
    ctx.fillRect(W-PAD.r+1, ly-8, PAD.r-3, 16);
    ctx.fillStyle = "#fff"; ctx.font = "bold 9px 'Space Mono',monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(s, W-PAD.r+6, ly);
  }

  if (historyOffset > 0) {
    ctx.fillStyle = "rgba(7,5,15,0.9)";
    ctx.fillRect(PAD.l + 8, PAD.t + 8, 136, 22);
    ctx.strokeStyle = "rgba(124,58,237,0.35)";
    ctx.strokeRect(PAD.l + 8.5, PAD.t + 8.5, 135, 21);
    ctx.fillStyle = "#c4b5fd";
    ctx.font = "10px 'Space Mono',monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${historyOffset} bars back`, PAD.l + 16, PAD.t + 19);
  }
}

function buildRollingCorrelationSeries(primaryBars, secondaryBars, window = 30) {
  if (!primaryBars?.length || !secondaryBars?.length) return [];
  const secondaryMap = new Map(secondaryBars.map(b => [b.t, b.c]));
  const aligned = primaryBars
    .filter(b => secondaryMap.has(b.t))
    .map(b => ({ t: b.t, a: b.c, b: secondaryMap.get(b.t) }));
  if (aligned.length < window + 2) return [];

  const series = [];
  for (let i = window - 1; i < aligned.length; i++) {
    const slice = aligned.slice(i - window + 1, i + 1);
    const value = pearson(slice.map(p => p.a), slice.map(p => p.b));
    if (value !== null) series.push({ t: aligned[i].t, v: value });
  }
  return series;
}

function drawRollingCorrTimeline(canvas, primaryBars, secondaryBars, view = {}) {
  if (!canvas) return;
  const par = canvas.parentElement;
  if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#07050f";
  ctx.fillRect(0, 0, W, H);

  if (!primaryBars?.length || !secondaryBars?.length) {
    ctx.fillStyle = "rgba(124,58,237,0.3)";
    ctx.font = "11px 'Space Mono',monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Loading correlation history...", W / 2, H / 2);
    return;
  }

  const PAD = { t: 14, b: 28, ...CHART_SIDE_PAD };
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;
  const { start, end, overscrollShiftBars, totalSlots } = getChartViewport(primaryBars.length, view);
  const visibleBars = primaryBars.slice(start, end);

  const series = buildRollingCorrelationSeries(primaryBars, secondaryBars, 30);
  const valueByTime = new Map(series.map(p => [p.t, p.v]));

  // First pass — collect x/v without y so we can compute auto-range
  const rawPts = visibleBars.map((b, i) => {
    const v = valueByTime.get(b.t);
    if (v == null) return null;
    return { i, x: PAD.l + ((i + 0.5 - overscrollShiftBars) / totalSlots) * CW, v, t: b.t };
  }).filter(Boolean);

  // Simulate a soft continuation to the viewport edges
  if (rawPts.length >= 1) {
    const first = rawPts[0];
    const last = rawPts[rawPts.length - 1];
    if (first.i > 0) {
      const leftSeed = rawPts[Math.min(1, rawPts.length - 1)] || first;
      const missing = first.i;
      const simPts = [];
      const delta = leftSeed.v - first.v;
      for (let i = 0; i < missing; i++) {
        const progress = missing <= 1 ? 1 : i / (missing - 1);
        const ease = Math.pow(progress, 1.35);
        const swing = Math.sin((i + 1) * 0.72 + first.t * 0.00013);
        const swing2 = Math.cos((i + 1) * 0.31 + first.t * 0.00007);
        const base = first.v - delta * (1 - ease) * 0.42;
        const wiggle = (swing * 0.11 + swing2 * 0.05) * (Math.abs(delta) + 0.08) * (0.35 + (1 - ease) * 0.65);
        simPts.push({
          ...first,
          i,
          x: PAD.l + ((i + 0.5 - overscrollShiftBars) / totalSlots) * CW,
          v: Math.max(-1, Math.min(1, base + wiggle)),
        });
      }
      rawPts.unshift(...simPts);
    }
    if (last.i < visibleBars.length - 1) {
      const rightSeed = rawPts[Math.max(0, rawPts.length - 2)] || last;
      const edgeIndex = visibleBars.length - 1;
      const missing = edgeIndex - last.i;
      const delta = last.v - rightSeed.v;
      for (let step = 1; step <= missing; step++) {
        const i = last.i + step;
        const progress = missing <= 1 ? 1 : step / missing;
        const ease = Math.pow(progress, 1.25);
        const swing = Math.sin((i + 1) * 0.68 + last.t * 0.00012);
        const swing2 = Math.cos((i + 1) * 0.28 + last.t * 0.00008);
        const base = last.v + delta * ease * 0.28;
        const wiggle = (swing * 0.09 + swing2 * 0.04) * (Math.abs(delta) + 0.06) * (0.3 + (1 - ease) * 0.5);
        rawPts.push({
          ...last,
          i,
          x: PAD.l + ((i + 0.5 - overscrollShiftBars) / totalSlots) * CW,
          v: Math.max(-1, Math.min(1, base + wiggle)),
        });
      }
    }
  }

  if (rawPts.length < 2) {
    ctx.fillStyle = "rgba(124,58,237,0.3)";
    ctx.font = "11px 'Space Mono',monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Need more aligned bars for correlation", W / 2, H / 2);
    return;
  }

  // Auto-scale: fit visible data with padding, clamped to [-1, 1]
  const vals = rawPts.map(p => p.v);
  const rawMin = Math.min(...vals), rawMax = Math.max(...vals);
  const rangePad = Math.max(0.08, (rawMax - rawMin) * 0.25);
  const rangeMin = Math.max(-1.0, rawMin - rangePad);
  const rangeMax = Math.min( 1.0, rawMax + rangePad);
  const toY = v => PAD.t + CH * (1 - (v - rangeMin) / (rangeMax - rangeMin));

  // Second pass — add y
  const drawn = rawPts.map(p => ({ ...p, y: toY(p.v) }));
  const firstDrawn = drawn[0];
  const lastDrawn = drawn[drawn.length - 1];

  // Grid lines at round values visible within the auto range
  [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].filter(v => v >= rangeMin - 0.02 && v <= rangeMax + 0.02).forEach(v => {
    const y = toY(v);
    ctx.strokeStyle = v === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.setLineDash(v === 0 ? [] : [3, 4]);
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(PAD.l + CW, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = v === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.20)";
    ctx.font = "8px 'Space Mono',monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(v === 0 ? "0" : v.toFixed(2), W - PAD.r + 4, y);
  });

  const last = drawn[drawn.length - 1];
  const zeroY = toY(Math.max(rangeMin, Math.min(rangeMax, 0)));
  const grd = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + CH);
  grd.addColorStop(0, last.v >= 0 ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  drawn.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
  ctx.lineTo(lastDrawn.x, zeroY);
  ctx.lineTo(firstDrawn.x, zeroY);
  ctx.closePath();
  ctx.fillStyle = grd;
  ctx.fill();

  const lg = ctx.createLinearGradient(PAD.l, 0, PAD.l + CW, 0);
  lg.addColorStop(0, "rgba(124,58,237,0.85)");
  lg.addColorStop(1, last.v >= 0 ? "#10b981" : "#ef4444");
  ctx.strokeStyle = lg;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  drawn.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
  ctx.stroke();

  ctx.fillStyle = last.v >= 0 ? "#10b981" : "#ef4444";
  ctx.beginPath();
  ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(W - PAD.r + 2, last.y - 8, PAD.r - 4, 16);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px 'Space Mono',monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(last.v.toFixed(3), W - PAD.r + 6, last.y);

  if (firstDrawn.x > PAD.l + 1) {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(PAD.l, zeroY);
    ctx.lineTo(firstDrawn.x, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export default function ChartView({assets, prices, chartAsset, setChartAsset, chartTf, setChartTf, chartType, setChartType, chartHist, setChartHist, setActiveTab, status, histRef}) {
  const canvasRef = useRef();
  const corrCanvasRef = useRef();
  const barsRef   = useRef([]);
  // Tracks the in-progress live candle across price updates so its open/high/low
  // are stable (not reset on every 3-second price tick).
  const liveCandleRef = useRef({ asset: null, tf: null, t: null, o: null, h: null, l: null });
  const dragRef   = useRef({ active:false, pointerId:null, startX:0, startY:0, startOffset:0, startYOffset:0, dir:null });
  const [viewOffset, setViewOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomBars, setZoomBars] = useState(()=>window.innerWidth<=768?90:CHART_VISIBLE_BARS);
  const [crosshairActive, setCrosshairActive] = useState(false);
  const [crosshairX, setCrosshairX] = useState(null);
  const [crosshairY, setCrosshairY] = useState(null);
  const [hoverBar, setHoverBar] = useState(null);
  const [showCorrHelp, setShowCorrHelp] = useState(false);
  const [corrHeight, setCorrHeight] = useState(()=>window.innerWidth<=768?80:176);
  const [corrInfoHovered, setCorrInfoHovered] = useState(false);
  const corrResizeRef = useRef({ active:false, startY:0, startH:0 });
  const chartScaleRef = useRef({ yMin:0, yMax:0, padT:12, ph:0, padR:80, w:0 });
  const pointersRef   = useRef(new Map());
  const pinchRef      = useRef({ active:false, initDist:0, initBars:0 });
  const [yZoom, setYZoom] = useState(1);
  const [yOffset, setYOffset] = useState(0);
  const yDragRef = useRef({ active:false, startY:0, startZoom:1 });
  const visibleBars = zoomBars;
  const benchmarkSymbol = ({
    "BTC":"ETH","ETH":"BTC","SOL":"BTC","DOGE":"BTC","USDC":"BTC",
    "EUR/USD":"GBP/USD","GBP/USD":"EUR/USD",
    "XAU/USD":"WTI","WTI":"XAU/USD",
    "AAPL":"SPY",
    "SPY":"QQQ","QQQ":"SPY","DIA":"SPY","IWM":"SPY",
  })[chartAsset] ?? "BTC";
  const renderChart = useCallback(() => {
    if (!canvasRef.current) return;
    drawCandles(
      canvasRef.current,
      barsRef.current,
      chartType,
      { offset:viewOffset, visibleCount:visibleBars, overscrollBars:CHART_OVERSCROLL_BARS, yZoom, yOffset },
      chartScaleRef.current,
      prices[chartAsset]
    );
  }, [chartType, viewOffset, visibleBars, yZoom, yOffset, prices, chartAsset]);
  const renderCorrChart = useCallback(() => {
    if (!corrCanvasRef.current) return;
    const benchmarkBars = (chartHist[benchmarkSymbol] || {})[chartTf] || [];
    drawRollingCorrTimeline(corrCanvasRef.current, barsRef.current, benchmarkBars, { offset:viewOffset, visibleCount:visibleBars, overscrollBars:CHART_OVERSCROLL_BARS });
  }, [benchmarkSymbol, chartHist, chartTf, viewOffset, visibleBars]);

  // Prefetch BTC + ETH on mount for all timeframes — warms cache for benchmark and most-viewed assets
  useEffect(()=>{
    let dead = false;
    const warmTfs = ["1m","5m","15m","1h","4h","1d"];
    warmTfs.forEach(tf=>{
      ["BTC","ETH"].forEach(sym=>{
        if((chartHist[sym]||{})[tf]?.length) return;
        fetchPyth(sym, tf, CHART_FETCH_BARS).then(candles=>{
          if(dead||!candles?.length) return;
          setChartHist(p=>({...p,[sym]:{...(p[sym]||{}),[tf]:candles}}));
        });
      });
    });
    return ()=>{dead=true;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Fetch history from Pyth Benchmarks
  useEffect(()=>{
    let dead = false;
    setViewOffset(0);
    setZoomBars(CHART_VISIBLE_BARS);
    // Reset live-candle tracking so the previous asset's open/high/low don't
    // bleed into the new asset's first live candle.
    liveCandleRef.current = { asset: null, tf: null, t: null, o: null, h: null, l: null };
    const fetches = [];
    // Fix: always refetch on chartAsset/chartTf change — the old cache-hit guard
    // skipped fetches when stale cached data existed, leaving wrong bars in barsRef.
    fetches.push(
      fetchPyth(chartAsset, chartTf, CHART_FETCH_BARS).then(candles => {
        if (dead||!candles?.length) return;
        setChartHist(p=>({...p,[chartAsset]:{...(p[chartAsset]||{}),[chartTf]:candles}}));
      })
    );
    if (!((chartHist[benchmarkSymbol]||{})[chartTf]?.length)) {
      fetches.push(
        fetchPyth(benchmarkSymbol, chartTf, CHART_FETCH_BARS).then(candles => {
          if (dead||!candles?.length) return;
          setChartHist(p=>({...p,[benchmarkSymbol]:{...(p[benchmarkSymbol]||{}),[chartTf]:candles}}));
        })
      );
    }
    // Prefetch remaining timeframes for current asset in background
    TF_LIST.forEach(tf=>{
      if(tf===chartTf) return;
      if((chartHist[chartAsset]||{})[tf]?.length) return;
      fetchPyth(chartAsset, tf, CHART_FETCH_BARS).then(candles=>{
        if(dead||!candles?.length) return;
        setChartHist(p=>({...p,[chartAsset]:{...(p[chartAsset]||{}),[tf]:candles}}));
      });
    });
    return ()=>{dead=true;};
  },[chartAsset, chartTf, benchmarkSymbol]);

  // Merge live price into bars
  useEffect(()=>{
    const now  = Math.floor(Date.now() / 1000);
    const secs = TF_SECS[chartTf] || 60;
    const barT = Math.floor(now / secs) * secs;
    // Filter out bars in FUTURE SLOTS only (b.t >= barT + secs).
    // The Benchmarks API sometimes returns the current-slot bar with a timestamp a few
    // seconds ahead of `now` (same slot, just clock skew) — keep those.
    // Genuinely extrapolated next-slot bars (b.t >= barT + secs) are dropped so that
    // gapBars doesn't go negative and corrupt the body.
    const base = ((chartHist[chartAsset]||{})[chartTf] || []).filter(b =>
      b.t < barT + secs &&
      Number.isFinite(b.o) &&
      Number.isFinite(b.h) &&
      Number.isFinite(b.l) &&
      Number.isFinite(b.c)
    );
    const price = null;
    if (!base.length) {
      barsRef.current = [];
      // Render immediately so the canvas shows "Loading…" rather than stale candles.
      renderChart();
      return;
    }
    const copy = base.map(b=>({...b}));
    const last = copy[copy.length-1];

    if (last) {
      const gapBars = Math.round((barT - last.t) / secs);

      if (gapBars <= 0) {
        if (price) {
          // Benchmark has the current slot bar.  Normally the benchmark open is
          // authoritative, but for new/illiquid tokens (e.g. HYPE) the Benchmarks
          // API can lag the real-time Hermes price by $0.40+, creating a huge body.
          // If the live price is outside the benchmark bar's h/l range by more than
          // the bar's own range, the benchmark open is stale — treat like gapBars≥1
          // and let liveCandleRef own the open so it stays visually reasonable.
          const barRange = last.h - last.l || secs * 0.0001;
          const priceDeviation = Math.abs(price - last.o);
          if (priceDeviation > barRange * 3) {
            // Benchmark open is too far from live price — the benchmark bar is stale.
            // Replace o/h/l entirely with liveCandleRef values; do NOT merge with
            // last.h/last.l — that would pull in the stale benchmark low/high and
            // create a giant wick stretching down to the old historical price.
            last.h = Math.max(last.h, price);
            last.l = Math.min(last.l, price);
            last.c = price;
          } else {
            // Benchmark open is reliable — just update h/l/c.
            last.h = Math.max(last.h, price);
            last.l = Math.min(last.l, price);
            last.c = price;
            liveCandleRef.current = { asset: null, tf: null, t: null, o: null, h: null, l: null };
          }
        }
      } else if (price) {
        // Benchmark is behind by ≥1 slot.  Build a live candle via liveCandleRef so
        // the open stays stable (not reset every 3-second price tick) and h/l accumulate.
        liveCandleRef.current = { asset: null, tf: null, t: null, o: null, h: null, l: null };
        if (false) {
          // Adjacent slot — push the live candle right after the last benchmark bar.
          copy.push({ t: barT, o, h, l, c: price, v: 0, tfs: secs });
        } else if (false) {
          // Benchmark lags by >1 slot (common for new/illiquid tokens like HYPE).
          // Fill missing slots with carry-forward bars from the last known close, then
          // append the current live candle opened from that same close. This removes
          // the fake upward gap introduced by opening the live candle at `price`.
          const carry = Number.isFinite(last.c) ? last.c : o;
          for (let step = 1; step < gapBars; step++) {
            const t = last.t + secs * step;
            copy.push({ t, o: carry, h: carry, l: carry, c: carry, v: 0, tfs: secs });
          }
          copy.push({ t: barT, o, h, l, c: price, v: 0, tfs: secs });
        }
      }
    } else if (price) {
      copy.push({ t: barT, o: price, h: price, l: price, c: price, v: 0, tfs: secs });
    }

    barsRef.current = copy;
    const maxOffset = Math.max(0, copy.length - visibleBars);
    const minOffset = -CHART_OVERSCROLL_BARS;
    const maxPanOffset = maxOffset;
    if (viewOffset < minOffset || viewOffset > maxPanOffset) {
      setViewOffset(Math.max(minOffset, Math.min(viewOffset, maxPanOffset)));
      return;
    }
    renderChart();
    renderCorrChart();
  },[chartHist, chartAsset, chartTf, prices, visibleBars, viewOffset, renderChart, renderCorrChart]);

  // 1s redraw
  useEffect(()=>{
    const iv = setInterval(()=>{
      renderChart();
      renderCorrChart();
    }, 1000);
    return ()=>clearInterval(iv);
  },[renderChart, renderCorrChart]);

  // Resize
  useEffect(()=>{
    const c = canvasRef.current; if (!c) return;
    const ro = new ResizeObserver(()=>{
      renderChart();
      renderCorrChart();
    });
    if (c.parentElement) ro.observe(c.parentElement);
    if (corrCanvasRef.current?.parentElement) ro.observe(corrCanvasRef.current.parentElement);
    return ()=>ro.disconnect();
  },[renderChart, renderCorrChart]);

  useEffect(()=>{
    renderChart();
    renderCorrChart();
  },[renderChart, renderCorrChart]);

  // Clear crosshair + reset Y-zoom when switching assets
  useEffect(() => {
    setCrosshairActive(false);
    setCrosshairX(null);
    setCrosshairY(null);
    setHoverBar(null);
    setYZoom(1);
    setYOffset(0);
  }, [chartAsset, chartTf]);

  const stopDragging = useCallback((e) => {
    if (e?.pointerId != null) {
      pointersRef.current.delete(e.pointerId);
    }
    if (pointersRef.current.size < 2) {
      pinchRef.current = { active:false, initDist:0, initBars:0 };
    }
    yDragRef.current = { active:false, startY:0, startZoom:1 };
    if (dragRef.current.pointerId != null && e?.currentTarget?.hasPointerCapture?.(dragRef.current.pointerId)) {
      e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    }
    dragRef.current = { active:false, pointerId:null, startX:0, startY:0, startOffset:0, startYOffset:0, dir:null };
    setIsDragging(false);
  }, []);

  const updateCrosshair = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nextX = e.clientX - rect.left;
    const nextY = e.clientY - rect.top;
    setCrosshairActive(true);
    setCrosshairX(nextX);
    setCrosshairY(nextY);
    setHoverBar(getChartHoverBar(nextX, rect.width, barsRef.current, {
      offset:viewOffset,
      visibleCount:visibleBars,
      overscrollBars:CHART_OVERSCROLL_BARS,
    }));
  }, [viewOffset, visibleBars]);

  const clearCrosshair = useCallback(() => {
    setCrosshairActive(false);
    setCrosshairX(null);
    setCrosshairY(null);
    setHoverBar(null);
  }, []);

  const onChartPointerDown = useCallback((e) => {
    // Y-axis drag (right panel) → vertical price scale zoom
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padR = rect.width < 500 ? 54 : 80;
    if (x > rect.width - padR - 2) {
      yDragRef.current = { active:true, startY:e.clientY, startZoom:yZoom };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    pointersRef.current.set(e.pointerId, { x:e.clientX, y:e.clientY });
    if (pointersRef.current.size === 2) {
      // Two fingers — start pinch zoom
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchRef.current = { active:true, initDist:dist, initBars:zoomBars };
      // Cancel any active drag
      if (dragRef.current.active && dragRef.current.pointerId != null) {
        try { e.currentTarget.releasePointerCapture(dragRef.current.pointerId); } catch(_) {}
      }
      dragRef.current = { active:false, pointerId:null, startX:0, startY:0, startOffset:0, startYOffset:0, dir:null };
      setIsDragging(false);
      return;
    }
    if ((e.pointerType === "mouse" && e.button !== 0)) return;
    setCrosshairActive(true);
    setCrosshairX(e.clientX - rect.left);
    dragRef.current = { active:true, pointerId:e.pointerId, startX:e.clientX, startY:e.clientY, startOffset:viewOffset, startYOffset:yOffset, dir:null };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, [viewOffset, visibleBars, zoomBars, yZoom, yOffset]);

  const onChartPointerMove = useCallback((e) => {
    // Y-axis vertical zoom drag
    if (yDragRef.current.active) {
      const delta = (yDragRef.current.startY - e.clientY) / 120;
      setYZoom(Math.max(0.2, Math.min(8, yDragRef.current.startZoom * Math.exp(delta))));
      return;
    }
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x:e.clientX, y:e.clientY });
    }
    // Pinch zoom
    if (pinchRef.current.active && pointersRef.current.size >= 2) {
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      if (dist < 1) return;
      const ratio = pinchRef.current.initDist / dist;
      const bars = barsRef.current;
      const next = Math.max(CHART_MIN_VISIBLE_BARS, Math.min(CHART_MAX_VISIBLE_BARS, bars.length, Math.round(pinchRef.current.initBars * ratio)));
      setZoomBars(next);
      setViewOffset(prev => Math.max(-CHART_OVERSCROLL_BARS, Math.min(prev, Math.max(0, bars.length - next))));
      return;
    }
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    // Detect direction after 5px threshold
    if (!dragRef.current.dir) {
      if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      dragRef.current.dir = Math.abs(dy) > Math.abs(dx) ? 'y' : 'x';
    }
    if (dragRef.current.dir === 'y') {
      // Vertical pan — shift price range
      const { yMin, yMax, ph } = chartScaleRef.current;
      if (!ph) return;
      const pricePerPx = (yMax - yMin) / ph;
      setYOffset(dragRef.current.startYOffset + dy * pricePerPx);
      return;
    }
    // Horizontal pan — shift time
    const bars = barsRef.current;
    const maxOffset = Math.max(0, bars.length - visibleBars);
    const minOffset = -CHART_OVERSCROLL_BARS;
    if (maxOffset <= 0) return;
    const plotWidth = Math.max(120, (canvasRef.current?.parentElement?.clientWidth || 0) - 88);
    const pxPerBar = plotWidth / visibleBars;
    const deltaBars = Math.round(dx / Math.max(pxPerBar, 1));
    const nextOffset = Math.max(minOffset, Math.min(maxOffset, dragRef.current.startOffset + deltaBars));
    setViewOffset(prev => prev === nextOffset ? prev : nextOffset);
  }, [visibleBars]);

  const onChartWheel = useCallback((e) => {
    e.preventDefault();
    const bars = barsRef.current;
    if (!bars.length) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    const step = Math.max(8, Math.round(visibleBars * 0.12));
    const nextVisible = Math.max(
      CHART_MIN_VISIBLE_BARS,
      Math.min(CHART_MAX_VISIBLE_BARS, bars.length, visibleBars + direction * step)
    );
    if (nextVisible === visibleBars) return;
    setZoomBars(nextVisible);
    const nextMaxOffset = Math.max(0, bars.length - nextVisible);
    setViewOffset(prev => Math.max(-CHART_OVERSCROLL_BARS, Math.min(prev, nextMaxOffset)));
  }, [visibleBars]);

  const { padR: scalePadR = 80, w: scaleW = 0 } = chartScaleRef.current;
  const isOnYAxis = crosshairX != null && scaleW > 0 && crosshairX > scaleW - scalePadR - 2;
  const bars = barsRef.current || [];
  const liveCur = prices[chartAsset];
  const hist = (chartHist[chartAsset]||{})[chartTf]||[];
  const cur = getChartDisplayPrice(bars[bars.length - 1], liveCur);
  const pct  = hist.length && cur ? (cur-hist[0].o)/hist[0].o*100 : null;
  const fmtP = v => !v?"–":v>=10000?"$"+v.toLocaleString(undefined,{maximumFractionDigits:0}):v>=100?"$"+v.toFixed(2):v>=1?"$"+v.toFixed(4):"$"+v.toFixed(6);
  const asset= assets.find(a=>a.symbol===chartAsset)||assets[0];
  const benchmarkAsset = assets.find(a=>a.symbol===benchmarkSymbol) || assets[0];
  const corrA = histRef?.current?.[chartAsset] || [];
  const corrB = histRef?.current?.[benchmarkSymbol] || [];
  const liveCorr = pearson(corrA.slice(-60), corrB.slice(-60));
  const hoverTime = hoverBar?.bar?.t ? new Date(hoverBar.bar.t * 1000).toLocaleString("en", {
    month:"short",
    day:"numeric",
    hour:"2-digit",
    minute:"2-digit",
    hour12:false,
  }) : null;

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#07050f",fontFamily:"'Space Mono',monospace",position:"relative"}}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="chart-topbar" style={{display:"flex",alignItems:"center",height:48,padding:"0 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0b0917",flexShrink:0,gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <PythLogo size={22}/>
          <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
          <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>CHARTS</span>
        </div>
        <div className="vt-label" style={{width:1,height:20,background:"rgba(255,255,255,0.08)"}}/>
        {/* Asset symbol + price + pct */}
        <div style={{display:"flex",alignItems:"baseline",gap:8}}>
          <span style={{fontSize:13,fontWeight:700,color:"#fff",letterSpacing:".04em"}}>{asset.symbol}</span>
          <span style={{fontSize:20,fontWeight:700,color:"#fff",letterSpacing:"-.01em"}}>{fmtP(cur)}</span>
          {pct!=null&&<span style={{fontSize:12,fontWeight:600,color:pct>=0?"#10b981":"#ef4444"}}>{pct>=0?"+":""}{pct.toFixed(2)}%</span>}
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:3,background:status==="live"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${status==="live"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:status==="live"?"#10b981":"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:status==="live"?"#10b981":"#ef4444"}}>{status==="live"?"LIVE":"DEMO"}</span>
          </div>
          <button className="chart-back-btn" onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"6px 15px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,letterSpacing:".05em",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.6)";e.currentTarget.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* ── SYMBOL STRIP ────────────────────────────────────────────────── */}
      <div className="chart-sym-strip" style={{display:"flex",alignItems:"center",height:36,padding:"0 0",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#080614",flexShrink:0,overflowX:"auto",scrollbarWidth:"none"}}>
        {assets.map(a=>{
          const p=prices[a.symbol];
          const h=(chartHist[a.symbol]||{})[chartTf]||[];
          const pc=h.length&&p?(p-h[0].o)/h[0].o*100:null;
          const sel=chartAsset===a.symbol;
          return (
            <button key={a.symbol} onClick={()=>{setChartAsset(a.symbol);if(a.category!=="crypto"&&(chartTf==="1m"||chartTf==="5m"))setChartTf("15m");}} style={{flexShrink:0,display:"flex",alignItems:"center",gap:6,padding:"0 14px",height:"100%",background:sel?"rgba(124,58,237,0.12)":"transparent",border:"none",borderBottom:sel?"2px solid #7c3aed":"2px solid transparent",cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:11,fontWeight:700,color:sel?"#c4b5fd":"rgba(255,255,255,0.35)",letterSpacing:".03em"}}>{a.symbol}</span>
              {pc!=null&&<span style={{fontSize:9,color:pc>=0?"#10b981":"#ef4444",fontWeight:600}}>{pc>=0?"+":""}{pc.toFixed(2)}%</span>}
            </button>
          );
        })}
      </div>

      {/* ── CONTROLS ROW ────────────────────────────────────────────────── */}
      <div className="cv-ctrl" style={{display:"flex",alignItems:"center",height:34,padding:"0 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#07050f",flexShrink:0,gap:2}}>
        {/* Timeframes */}
        {TF_LIST.filter(tf=>{
          const cat=assets.find(a=>a.symbol===chartAsset)?.category;
          return cat==="crypto"||(tf!=="1m"&&tf!=="5m");
        }).map(tf=>(
          <button key={tf} onClick={()=>setChartTf(tf)} style={{background:chartTf===tf?"rgba(124,58,237,0.25)":"transparent",border:"none",borderRadius:2,cursor:"pointer",color:chartTf===tf?"#c4b5fd":"rgba(255,255,255,0.3)",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:chartTf===tf?700:500,letterSpacing:".04em",transition:"all .15s"}}>
            {tf}
          </button>
        ))}
        <div style={{width:1,height:16,background:"rgba(255,255,255,0.08)",margin:"0 8px"}}/>
        {/* Chart type */}
        {[["candle","Candles"],["line","Line"]].map(([k,label])=>(
          <button key={k} onClick={()=>setChartType(k)} style={{background:chartType===k?"rgba(124,58,237,0.25)":"transparent",border:"none",borderRadius:2,cursor:"pointer",color:chartType===k?"#c4b5fd":"rgba(255,255,255,0.3)",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:chartType===k?700:500,letterSpacing:".04em",transition:"all .15s"}}>
            {label}
          </button>
        ))}
        {viewOffset !== 0 && (
          <button onClick={()=>setViewOffset(0)} style={{marginLeft:8,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:3,cursor:"pointer",color:"#10b981",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:700,letterSpacing:".04em"}}>
            Latest
          </button>
        )}
        <button onClick={()=>setZoomBars(CHART_VISIBLE_BARS)} style={{marginLeft:8,background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:3,cursor:"pointer",color:"rgba(255,255,255,0.5)",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:700,letterSpacing:".04em"}}>
          Reset Zoom
        </button>
        {/* Stats */}
        <div className="cv-ctrl-stats" style={{marginLeft:"auto",display:"flex",gap:16,fontSize:9,letterSpacing:".04em"}}>
          {bars.length>0&&<span style={{color:"rgba(255,255,255,0.25)"}}>H: <span style={{color:"#10b981"}}>{fmtP(Math.max(...bars.map(b=>b.h)))}</span></span>}
          {bars.length>0&&<span style={{color:"rgba(255,255,255,0.25)"}}>L: <span style={{color:"#ef4444"}}>{fmtP(Math.min(...bars.map(b=>b.l)))}</span></span>}
          <span style={{color:"rgba(255,255,255,0.2)"}}>{visibleBars} visible · {bars.length} bars</span>
        </div>
      </div>

      {/* ── CHART AREA ──────────────────────────────────────────────────── */}
      <div style={{flex:1,position:"relative",minHeight:0}}>
        <canvas
          ref={canvasRef}
          onPointerDown={onChartPointerDown}
          onPointerMove={onChartPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerLeave={(e)=>{ stopDragging(e); clearCrosshair(); }}
          onPointerMoveCapture={updateCrosshair}
          onWheel={onChartWheel}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",cursor:isDragging?"grabbing":isOnYAxis?"ns-resize":"grab",touchAction:"none"}}
        />
        {crosshairActive && crosshairX != null && (
          <div style={{position:"absolute",top:0,bottom:0,left:crosshairX,width:1,background:"rgba(196,181,253,0.45)",pointerEvents:"none",boxShadow:"0 0 0 1px rgba(124,58,237,0.08)"}}/>
        )}
        {crosshairActive && crosshairY != null && (()=>{
          const { yMin, yMax, padT, ph, padR } = chartScaleRef.current;
          if (!ph || crosshairY < padT || crosshairY > padT + ph) return null;
          const price = yMin + (yMax - yMin) * (1 - (crosshairY - padT) / ph);
          const label = fmtP(price);
          const areaW = canvasRef.current?.parentElement?.clientWidth || 0;
          return (<>
            <div style={{position:"absolute",left:0,right:0,top:crosshairY,height:1,background:"rgba(196,181,253,0.3)",pointerEvents:"none",borderTop:"1px dashed rgba(196,181,253,0.35)"}}/>
            <div style={{position:"absolute",top:crosshairY-8,right:0,width:padR,height:16,display:"flex",alignItems:"center",pointerEvents:"none"}}>
              <div style={{width:0,height:0,borderTop:"8px solid transparent",borderBottom:"8px solid transparent",borderRight:"7px solid rgba(109,40,217,0.95)",flexShrink:0}}/>
              <div style={{flex:1,height:"100%",background:"rgba(109,40,217,0.95)",display:"flex",alignItems:"center",justifyContent:"center",borderTop:"1px solid rgba(196,181,253,0.45)",borderBottom:"1px solid rgba(196,181,253,0.45)"}}>
                <span style={{fontSize:9,fontWeight:700,color:"#fff",fontFamily:"'Space Mono',monospace",letterSpacing:".02em",whiteSpace:"nowrap"}}>{label}</span>
              </div>
            </div>
          </>);
        })()}
        <div style={{position:"absolute",left:16,bottom:12,padding:"4px 8px",background:"rgba(7,5,15,0.72)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,color:"rgba(255,255,255,0.38)",fontSize:9,letterSpacing:".04em",pointerEvents:"none"}}>
          Drag to pan · Wheel / Pinch to zoom
        </div>
      </div>

      {/* ── OHLC TOOLTIP ────────────────────────────────────────────────── */}
      {hoverBar?.bar && crosshairX != null && crosshairY != null && (()=>{
        const TIP_W = 148, TIP_H = 72, GAP = 14;
        const chartEl = canvasRef.current?.parentElement;
        const areaW = chartEl?.clientWidth || 600;
        const areaH = chartEl?.clientHeight || 400;
        const onRight = crosshairX + GAP + TIP_W > areaW - 10;
        const tipLeft = onRight ? crosshairX - GAP - TIP_W : crosshairX + GAP;
        const tipTop = Math.max(6, Math.min(crosshairY - TIP_H / 2, areaH - TIP_H - 6));
        const isUp = hoverBar.bar.c >= hoverBar.bar.o;
        return (
          <div style={{position:"absolute",left:tipLeft,top:tipTop,width:TIP_W,padding:"7px 10px",background:"rgba(7,5,15,0.94)",border:`1px solid ${isUp?"rgba(16,185,129,0.35)":"rgba(239,68,68,0.35)"}`,borderRadius:6,color:"rgba(255,255,255,0.82)",fontSize:9,lineHeight:1.6,letterSpacing:".03em",pointerEvents:"none",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:10}}>
            <div style={{color:"rgba(196,181,253,0.7)",fontSize:8,fontWeight:700,letterSpacing:".07em",marginBottom:3}}>{hoverTime}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px 8px"}}>
              <span style={{color:"rgba(255,255,255,0.38)"}}>O</span><span style={{color:"rgba(255,255,255,0.75)"}}>{fmtP(hoverBar.bar.o)}</span>
              <span style={{color:"rgba(255,255,255,0.38)"}}>H</span><span style={{color:"#10b981"}}>{fmtP(hoverBar.bar.h)}</span>
              <span style={{color:"rgba(255,255,255,0.38)"}}>L</span><span style={{color:"#ef4444"}}>{fmtP(hoverBar.bar.l)}</span>
              <span style={{color:"rgba(255,255,255,0.38)"}}>C</span><span style={{color:"#fff",fontWeight:700}}>{fmtP(hoverBar.bar.c)}</span>
            </div>
          </div>
        );
      })()}

      {/* ── RESIZE HANDLE ────────────────────────────────────────────────── */}
      <div
        className="chart-resize-hdl"
        onPointerDown={(e) => {
          corrResizeRef.current = { active:true, startY:e.clientY, startH:corrHeight };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!corrResizeRef.current.active) return;
          const delta = corrResizeRef.current.startY - e.clientY;
          setCorrHeight(Math.max(60, Math.min(520, corrResizeRef.current.startH + delta)));
        }}
        onPointerUp={(e) => {
          corrResizeRef.current.active = false;
          if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        style={{height:8,flexShrink:0,cursor:"row-resize",display:"flex",alignItems:"center",justifyContent:"center",
          borderTop:"1px solid rgba(255,255,255,0.07)",borderBottom:"1px solid rgba(255,255,255,0.04)",
          background:"rgba(255,255,255,0.02)",userSelect:"none",zIndex:5}}
        onPointerEnter={(e)=>{ e.currentTarget.style.background="rgba(124,58,237,0.18)"; }}
        onPointerLeave={(e)=>{ e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}
      >
        <div style={{width:32,height:2,borderRadius:2,background:"rgba(255,255,255,0.15)"}}/>
      </div>

      {/* ── CORRELATION TIMELINE ─────────────────────────────────────────── */}
      <div style={{height:corrHeight,flexShrink:0,background:"#080614",minHeight:0,position:"relative",overflow:"hidden"}}>
        <canvas ref={corrCanvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>

        {/* Info overlay: compact number by default, full panel on hover */}
        <div
          onMouseEnter={() => setCorrInfoHovered(true)}
          onMouseLeave={() => setCorrInfoHovered(false)}
          style={{position:"absolute",top:0,left:0,
            background:"rgba(6,4,16,0.82)",
            borderRight:"1px solid rgba(124,58,237,0.20)",
            borderBottom:"1px solid rgba(124,58,237,0.20)",
            borderRadius:"0 0 10px 0",
            backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",
            zIndex:2,cursor:"default",overflow:"hidden",
            transition:"all .18s ease",
          }}
        >
          {/* accent line */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${liveCorr==null?"rgba(196,181,253,0.5)":liveCorr>=0?"#10b981":"#ef4444"} 0%,transparent 100%)`}}/>
          {corrInfoHovered ? (
            /* expanded (hover) */
            <div style={{padding:"9px 13px 10px"}}>
              <div style={{fontSize:8,fontWeight:700,color:"rgba(196,181,253,0.50)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:3}}>Corr Timeline</div>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.70)",letterSpacing:"-.01em",marginBottom:6}}>
                {chartAsset} <span style={{color:"rgba(255,255,255,0.28)",fontWeight:400}}>vs</span> {benchmarkSymbol}
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                <span style={{fontSize:26,fontWeight:800,fontVariantNumeric:"tabular-nums",letterSpacing:"-.02em",lineHeight:1,color:liveCorr==null?"rgba(255,255,255,0.20)":liveCorr>=0?"#34d399":"#f87171"}}>
                  {liveCorr==null?"–":liveCorr.toFixed(3)}
                </span>
                {liveCorr!=null&&(
                  <span style={{fontSize:8,fontWeight:700,letterSpacing:".06em",color:Math.abs(liveCorr)>=0.7?"#34d399":Math.abs(liveCorr)>=0.4?"#a78bfa":"rgba(255,255,255,0.30)"}}>
                    {Math.abs(liveCorr)>=0.7?"STRONG":Math.abs(liveCorr)>=0.4?"MODERATE":"WEAK"}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* compact (default) */
            <div style={{padding:"6px 10px 7px"}}>
              <div style={{fontSize:13,fontWeight:800,fontVariantNumeric:"tabular-nums",letterSpacing:"-.01em",lineHeight:1,color:liveCorr==null?"rgba(255,255,255,0.20)":liveCorr>=0?"#34d399":"#f87171"}}>
                {liveCorr==null?"–":liveCorr.toFixed(3)}
              </div>
            </div>
          )}
        </div>

        {/* Crosshair — same x as main chart */}
        {crosshairActive && crosshairX != null && (
          <div style={{position:"absolute",top:0,bottom:0,left:crosshairX,width:1,background:"rgba(196,181,253,0.45)",pointerEvents:"none",zIndex:3}}/>
        )}
      </div>

    </div>
  );
}
