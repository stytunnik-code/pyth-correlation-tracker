import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SmokeBackground from "./SmokeBackground";
import { Analytics } from "@vercel/analytics/react";
import "./styles/main.css";

import { ASSETS, SEED, CAT_COLORS } from "./constants";
import { pearson, corrBg, corrFg, corrTipLabel, getHeatmapTooltipPosition, strengthInfo } from "./utils/math";
import { fmt, fmtPct } from "./utils/format";
import { fetchPyth, CHART_FETCH_BARS } from "./utils/pyth";
import { pctReturns } from "./utils/entropy";
import { summarizeLiveDataHealth } from "./utils/live-data";
import PythLogo from "./components/PythLogo";
import Spark from "./components/Spark";
import LoadingCanvas from "./components/LoadingCanvas";
import ChartView from "./views/ChartView";
import CorrView from "./views/CorrView";
import LeadLagView from "./views/LeadLagView";
import EntropyView from "./views/EntropyView";
import DocsView from "./views/DocsView";

/* ── SHARE IMAGE GENERATOR ──────────────────────────────────────────────── */
function generateShareImage(symA, symB, corrVal, colorA, colorB) {
  const S = 1200;
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const ctx = cv.getContext('2d');

  const corrColor = corrVal === null ? '#a78bfa'
    : corrVal >= 0.65 ? '#10b981' : corrVal >= 0.30 ? '#eab308'
    : corrVal >= 0    ? '#a78bfa' : corrVal >= -0.30 ? '#fb923c'
    : corrVal >= -0.65? '#ef4444' : '#dc2626';

  const h2r = (hex, a) => {
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  ctx.fillStyle = '#07050f';
  ctx.fillRect(0, 0, S, S);

  const gl = ctx.createRadialGradient(S/2, 560, 0, S/2, 560, 600);
  gl.addColorStop(0, h2r(corrColor, 0.18));
  gl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, S, S);

  const tl = ctx.createLinearGradient(0, 0, S, 0);
  tl.addColorStop(0,   'rgba(124,58,237,0)');
  tl.addColorStop(0.3, '#7c3aed');
  tl.addColorStop(0.7, '#67e8f9');
  tl.addColorStop(1,   'rgba(103,232,249,0)');
  ctx.fillStyle = tl;
  ctx.fillRect(0, 0, S, 4);

  ctx.save();
  ctx.font = '600 26px "Space Mono", monospace';
  ctx.textAlign = 'center';
  const bt = '● LIVE  ·  PYTH ORACLE';
  const bw = ctx.measureText(bt).width + 56;
  const bx = S/2 - bw/2;
  ctx.beginPath(); ctx.roundRect(bx, 88, bw, 52, 26);
  ctx.fillStyle = 'rgba(124,58,237,0.15)'; ctx.fill();
  ctx.strokeStyle = 'rgba(124,58,237,0.42)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(196,181,253,0.9)';
  ctx.fillText(bt, S/2, 124);
  ctx.restore();

  const maxLen = Math.max(symA.length, symB.length);
  const nameFsz = maxLen <= 4 ? 130 : maxLen <= 6 ? 100 : 80;
  const pairY = 390;

  ctx.save();
  ctx.font = `bold ${nameFsz}px "Outfit", sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = colorA || '#a78bfa';
  ctx.fillText(symA, S/2 - 28, pairY);
  ctx.restore();

  ctx.save();
  ctx.font = `300 ${Math.round(nameFsz*0.8)}px "Outfit", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillText('/', S/2, pairY);
  ctx.restore();

  ctx.save();
  ctx.font = `bold ${nameFsz}px "Outfit", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillStyle = colorB || '#67e8f9';
  ctx.fillText(symB, S/2 + 28, pairY);
  ctx.restore();

  const corrStr = corrVal === null ? '–' : (corrVal >= 0 ? '+' : '') + corrVal.toFixed(2);
  ctx.save();
  ctx.font = 'bold 260px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = corrColor;
  ctx.fillText(corrStr, S/2, 680);
  ctx.restore();

  ctx.save();
  ctx.font = '700 28px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = corrColor;
  ctx.globalAlpha = 0.72;
  ctx.fillText(corrTipLabel(corrVal).toUpperCase(), S/2, 730);
  ctx.restore();

  const bW = 640, bH = 14, bX = S/2 - bW/2, bY = 810;
  const barG = ctx.createLinearGradient(bX, 0, bX + bW, 0);
  barG.addColorStop(0,    '#dc2626');
  barG.addColorStop(0.35, '#ef4444');
  barG.addColorStop(0.5,  'rgba(139,92,246,0.55)');
  barG.addColorStop(0.65, '#eab308');
  barG.addColorStop(1,    '#10b981');
  ctx.save();
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, bH/2);
  ctx.fillStyle = barG; ctx.fill();
  ctx.restore();

  if (corrVal !== null) {
    const mx = bX + bW * ((corrVal + 1) / 2);
    ctx.save();
    ctx.beginPath(); ctx.arc(mx, bY + bH/2, 15, 0, Math.PI*2);
    ctx.fillStyle = corrColor; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.font = '500 20px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'left';  ctx.fillText('−1', bX, bY + bH + 32);
  ctx.textAlign = 'center'; ctx.fillText('0', S/2, bY + bH + 32);
  ctx.textAlign = 'right';  ctx.fillText('+1', bX + bW, bY + bH + 32);
  ctx.restore();

  ctx.save();
  ctx.font = '400 20px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  ctx.fillText('Pearson correlation  ·  rolling 200 ticks  ·  Pyth Oracle data', S/2, 960);
  ctx.restore();

  ctx.save();
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(167,139,250,0.62)';
  ctx.fillText('pythcorrelation.com', S/2, 1090);
  ctx.restore();

  const bl = ctx.createLinearGradient(0, 0, S, 0);
  bl.addColorStop(0, 'rgba(124,58,237,0)');
  bl.addColorStop(0.5, 'rgba(124,58,237,0.5)');
  bl.addColorStop(1, 'rgba(124,58,237,0)');
  ctx.fillStyle = bl;
  ctx.fillRect(0, S - 4, S, 4);

  return cv;
}

/* ── SKELETON ──────────────────────────────────────────────────────────── */
function TickerSkeleton(){return(
  <div className="tc tc-skeleton">
    <div className="tc-head"><div className="sk-icon"/><div className="sk-meta"><div className="sk-line w8"/><div className="sk-line w12"/></div><div className="sk-badge"/></div>
    <div className="tc-price-row"><div className="sk-line w14"/><div className="sk-line w6"/></div>
    <div className="tc-spark-row"><div className="sk-spark"/><div className="sk-line w10"/></div>
    <div className="tc-stats"><div className="sk-stat"/><div className="sk-stat"/><div className="sk-stat"/><div className="sk-stat"/></div>
  </div>
);}

/* ── CORR CHART ─────────────────────────────────────────────────────────── */
function CorrChart({symA,symB,histRef}){
  const ref=useRef();
  useEffect(()=>{
    const ha=histRef.current[symA]||[],hb=histRef.current[symB]||[];
    const ra=pctReturns(ha),rb=pctReturns(hb);
    const n=Math.min(ra.length,rb.length),pts=[];
    for(let i=4;i<=n;i++){const v=pearson(ra.slice(0,i),rb.slice(0,i));if(v!==null)pts.push(v);}
    const c=ref.current;if(!c||pts.length<2)return;
    const ctx=c.getContext("2d"),W=c.offsetWidth||400,H=100;
    c.width=W;c.height=H;ctx.clearRect(0,0,W,H);
    [-0.5,0,0.5].forEach(v=>{
      const y=H/2-(v*H/2*.88);
      ctx.strokeStyle=v===0?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.05)";
      ctx.lineWidth=v===0?1.5:1;ctx.setLineDash(v===0?[]:[ 3,4]);
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
      ctx.setLineDash([]);
      if(v!==0){ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="9px monospace";ctx.fillText(v>0?"+0.5":"-0.5",4,y-2);}
    });
    const last=pts[pts.length-1];
    const ag=ctx.createLinearGradient(0,0,0,H);
    ag.addColorStop(0,last>=0?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.15)");
    ag.addColorStop(1,"transparent");
    ctx.fillStyle=ag;
    ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.lineTo(W-2,H/2);ctx.lineTo(2,H/2);ctx.closePath();ctx.fill();
    const lg=ctx.createLinearGradient(0,0,W,0);
    lg.addColorStop(0,"rgba(139,92,246,0.8)");
    lg.addColorStop(1,last>=0?"rgba(52,211,153,1)":"rgba(248,113,113,1)");
    ctx.strokeStyle=lg;ctx.lineWidth=2;ctx.lineJoin="round";
    ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();
    const lx=(pts.length-1)/(pts.length-1)*(W-4)+2,ly=H/2-(last*H/2*.88);
    ctx.fillStyle=last>=0?"#34d399":"#f87171";
    ctx.beginPath();ctx.arc(lx,ly,4,0,Math.PI*2);ctx.fill();
  });
  return<canvas ref={ref} style={{width:"100%",height:100,display:"block"}}/>;
}

/* ── ASSET ICON ─────────────────────────────────────────────────────────── */
function AssetIcon({asset,size=36}){
  const [imgErr,setImgErr]=useState(false);
  const hasLogo=asset.logo&&!imgErr;
  const sym=asset.icon||asset.symbol.split("/")[0].slice(0,2);
  return(
    <div className={`asset-icon${!hasLogo?" sym":""}`} style={{width:size,height:size,"--ac":asset.color}}>
      {hasLogo?(
        <img src={asset.logo} alt="" width={size} height={size} onError={()=>setImgErr(true)}/>
      ):(
        <span className="asset-icon-sym">{sym}</span>
      )}
    </div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────────────────── */
const LOADING_PHRASES=[
  "PARSING WHALE WALLETS...",
  "INITIALIZING AI SENTIMENT MODEL...",
  "LOADING PYTH ORACLE FEEDS...",
  "COMPUTING CORRELATION MATRIX...",
  "CALIBRATING ENTROPY ENGINE...",
];

const DEFAULT_COINS=new Set(["BTC","ETH","SOL","DOGE","AVAX","ADA","LINK","SUI","NEAR","HYPE"]);

export default function App(){
  const [prices,setPrices]=useState({});
  const [history,setHistory]=useState({});
  const [corr,setCorr]=useState({});
  const [prevPrices,setPrevPrices]=useState({});
  const [status,setStatus]=useState("connecting");
  const [filter,setFilter]=useState("all");
  const [sortBy,setSortBy]=useState("default");
  const [selected,setSelected]=useState(null);
  const [hmTooltip,setHmTooltip]=useState(null);
  const hmWrapRef=useRef(null);
  const [initialCorrPair,setInitialCorrPair]=useState(null);
  const [mounted,setMounted]=useState(false);
  const [mobileTab,setMobileTab]=useState("heatmap");
  const [activeTab,setActiveTab]=useState("matrix");
  useEffect(()=>{
    const isOverlay = activeTab==="charts"||activeTab==="corr"||activeTab==="leadlag"||activeTab==="entropy"||activeTab==="docs";
    document.body.style.overflow = isOverlay ? "hidden" : "";
    return ()=>{ document.body.style.overflow = ""; };
  },[activeTab]);
  const [showLanding,setShowLanding]=useState(false);
  const [landingExiting,setLandingExiting]=useState(false);
  const [showLoading,setShowLoading]=useState(true);
  const [loadingPhase,setLoadingPhase]=useState(0);

  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a");
    const b = params.get("b");
    if(!a || !b || a===b) return;
    const hasA = ASSETS.some(asset=>asset.symbol===a);
    const hasB = ASSETS.some(asset=>asset.symbol===b);
    if(!hasA || !hasB) return;
    setInitialCorrPair({a,b});
    setActiveTab("corr");
    setShowLanding(false);
    setLandingExiting(false);
    setShowLoading(false);
  },[]);

  useEffect(()=>{
    let phase=0;
    const iv=setInterval(()=>{
      phase++;
      if(phase<LOADING_PHRASES.length){ setLoadingPhase(phase); }
      else {
        clearInterval(iv);
        setShowLanding(true);
        requestAnimationFrame(()=>requestAnimationFrame(()=>setShowLoading(false)));
      }
    }, 520);
    return ()=>clearInterval(iv);
  },[]);

  const goFromLanding=(tab="matrix")=>{
    setLandingExiting(true);
    setTimeout(()=>{ setShowLanding(false); if(tab!=="matrix") setActiveTab(tab); }, 420);
  };

  const handleShareApp=()=>{
    const btc=ASSETS.find(a=>a.symbol==="BTC");
    const eth=ASSETS.find(a=>a.symbol==="ETH");
    const btcPrice=prices[btc?.id];
    const ethPrice=prices[eth?.id];
    let lines=["📊 Live Cross-Asset Correlation Matrix"];
    if(btcPrice!=null) lines.push(`BTC $${Math.round(btcPrice).toLocaleString()}`);
    if(ethPrice!=null) lines.push(`ETH $${Math.round(ethPrice).toLocaleString()}`);
    let best=null, bestVal=-Infinity;
    ASSETS.forEach((a,i)=>ASSETS.forEach((b,j)=>{
      if(i>=j) return;
      const v=corr[`${a.id}|${b.id}`]??corr[`${b.id}|${a.id}`];
      if(v!=null&&v>bestVal){bestVal=v;best=[a.symbol,b.symbol,v];}
    }));
    if(best) lines.push(`Top pair: ${best[0]}/${best[1]} ${best[2]>=0?"+":""}${best[2].toFixed(2)}`);
    lines.push("","Powered by @PythNetwork","pythcorrelation.com");
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
  };

  const handleShareCorr=(assetA, assetB, corrVal)=>{
    if(corrVal===null) return;
    const txt=`${assetA.symbol}/${assetB.symbol} correlation: ${corrVal>=0?'+':''}${corrVal.toFixed(2)}\n\nPowered by @PythNetwork`;
    const shareUrl = new URL("/share", window.location.origin);
    shareUrl.searchParams.set("a", assetA.symbol);
    shareUrl.searchParams.set("b", assetB.symbol);
    shareUrl.searchParams.set("v", corrVal.toFixed(3));
    shareUrl.searchParams.set("ca", assetA.color || "#a78bfa");
    shareUrl.searchParams.set("cb", assetB.color || "#67e8f9");
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}&url=${encodeURIComponent(shareUrl.toString())}`,'_blank');
  };

  const [chartAsset,setChartAsset]=useState("BTC");
  const [chartTf,setChartTf]=useState("1m");
  const [chartType,setChartType]=useState("candle");
  const [chartHist,setChartHist]=useState({});
  const [feedbackOpen,setFeedbackOpen]=useState(false);
  const [feedbackText,setFeedbackText]=useState("");
  const [feedbackSent,setFeedbackSent]=useState(false);
  const [tickCount,setTickCount]=useState(0);
  const [lastUpdate,setLastUpdate]=useState(null);
  const [errorMsg,setErrorMsg]=useState(null);
  const [entropyLiveRun,setEntropyLiveRun]=useState(false);
  const [corrAlertEnabled,setCorrAlertEnabled]=useState(false);
  const [corrAlertPair,setCorrAlertPair]=useState("BTC-ETH");
  const [corrAlertThreshold,setCorrAlertThreshold]=useState(0.8);
  const [corrAlertHit,setCorrAlertHit]=useState(false);
  const [feedDiagOpen,setFeedDiagOpen]=useState(false);
  const [selectedCoins,setSelectedCoins]=useState(()=>{
    try{const s=localStorage.getItem("sc");return s?new Set(JSON.parse(s)):new Set(DEFAULT_COINS);}catch{return new Set(DEFAULT_COINS);}
  });
  const [pickerOpen,setPickerOpen]=useState(false);
  const pickerRef=useRef(null);
  const histRef=useRef({});
  const tickRef=useRef({});
  const corrTraceRef=useRef({});

  useEffect(()=>{setTimeout(()=>setMounted(true),80);},[]);

  useEffect(()=>{
    if(selectedCoins===null) localStorage.removeItem("sc");
    else localStorage.setItem("sc",JSON.stringify([...selectedCoins]));
  },[selectedCoins]);

  useEffect(()=>{
    if(!pickerOpen)return;
    const handler=(e)=>{if(pickerRef.current&&!pickerRef.current.contains(e.target))setPickerOpen(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[pickerOpen]);

  function push(sym,price,ts=Math.floor(Date.now()/1000)){
    if(!histRef.current[sym])histRef.current[sym]=[];
    histRef.current[sym].push(price);
    if(histRef.current[sym].length>200)histRef.current[sym].shift();
    if(!tickRef.current[sym])tickRef.current[sym]=[];
    tickRef.current[sym].push({t:ts,p:price});
    if(tickRef.current[sym].length>240)tickRef.current[sym].shift();
  }

  function alignedReturnCorr(symA, symB){
    const ta=tickRef.current[symA]||[],tb=tickRef.current[symB]||[];
    if(ta.length<4||tb.length<4)return null;
    const bMap=new Map(tb.map(t=>[t.t,t.p]));
    const aPrices=[],bPrices=[];
    for(const tick of ta){
      const bp=bMap.get(tick.t);
      if(!Number.isFinite(tick.p)||!Number.isFinite(bp))continue;
      aPrices.push(tick.p);bPrices.push(bp);
    }
    if(aPrices.length<4)return null;
    return pearson(pctReturns(aPrices).slice(-200),pctReturns(bPrices).slice(-200));
  }

  const PYTH_SYM_PREFETCH = {
    "BTC":"Crypto.BTC/USD","ETH":"Crypto.ETH/USD","SOL":"Crypto.SOL/USD",
    "DOGE":"Crypto.DOGE/USD","USDC":"Crypto.USDC/USD",
    "EUR/USD":"FX.EUR/USD","GBP/USD":"FX.GBP/USD",
    "XAU/USD":"Metal.XAU/USD","WTI":"Commodities.USOILSPOT",
    "AAPL":"Equity.US.AAPL/USD",
    "SPY":"Equity.US.SPY/USD","QQQ":"Equity.US.QQQ/USD",
    "DIA":"Equity.US.DIA/USD","IWM":"Equity.US.IWM/USD",
    "AVAX":"Crypto.AVAX/USD","ADA":"Crypto.ADA/USD","LINK":"Crypto.LINK/USD",
    "UNI":"Crypto.UNI/USD","LTC":"Crypto.LTC/USD","DOT":"Crypto.DOT/USD",
    "TRX":"Crypto.TRX/USD","APT":"Crypto.APT/USD","SUI":"Crypto.SUI/USD",
    "PEPE":"Crypto.PEPE/USD","NEAR":"Crypto.NEAR/USD","ATOM":"Crypto.ATOM/USD",
    "POL":"Crypto.POL/USD","HYPE":"Crypto.HYPE/USD",
  };

  const prefetchHistory = useCallback(async () => {
    const now = Math.floor(Date.now()/1000);
    const from = now - 60*3600;
    await Promise.allSettled(
      ASSETS.map(async a => {
        const sym = PYTH_SYM_PREFETCH[a.symbol];
        if (!sym) return;
        try {
          const res = await fetch(`/api/benchmarks?symbol=${encodeURIComponent(sym)}&resolution=60&from=${from}&to=${now}&countback=60`);
          if (!res.ok) return;
          const d = await res.json();
          if (d.s==="ok" && d.c?.length) {
            histRef.current[a.symbol] = d.c.slice(-60);
          }
        } catch {}
      })
    );
  }, []);

  const fetchPrices=useCallback(async()=>{
    try{
      const params=new URLSearchParams();
      ASSETS.forEach(a=>params.append("ids",a.id));
      const res=await fetch(`/api/pyth?${params}`);
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      const items=data.parsed||[];
      if(!items.length)throw new Error("empty");
      const np={};
      const sampleTs=Math.floor(Date.now()/1000);
      items.forEach(item=>{
        const cleanId=item.id?.replace(/^0x/,"");
        const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
        if(!asset)return;
        const po=item.price;if(!po)return;
        const p=parseFloat(po.price)*Math.pow(10,po.expo??-8);
        if(isFinite(p)&&p>0){np[asset.symbol]=p;push(asset.symbol,p,sampleTs);}
      });
      if(Object.keys(np).length>0){
        setPrices(prev=>{ setPrevPrices(pp=>({...pp,...prev})); return np; });
        setHistory({...histRef.current});
        setStatus("live");setTickCount(t=>t+1);setLastUpdate(new Date());setErrorMsg(null);
      }else throw new Error("0 prices");
    }catch(e){
      setErrorMsg(e?.message||"Network error");
      try{
        const BATCH=10;
        const batches=[];
        for(let i=0;i<ASSETS.length;i+=BATCH)batches.push(ASSETS.slice(i,i+BATCH));
        const results=await Promise.all(batches.map(async batch=>{
          const params=new URLSearchParams();
          batch.forEach(a=>params.append("ids[]",a.id));
          params.set("parsed","true");params.set("binary","false");params.set("ignore_invalid_price_ids","true");
          const r=await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params}`);
          if(!r.ok)return[];
          const d=await r.json();
          return d.parsed||[];
        }));
        const np2={};
        const sampleTs2=Math.floor(Date.now()/1000);
        results.flat().forEach(item=>{
          const cleanId=item.id?.replace(/^0x/,"");
          const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
          if(!asset)return;
          const po=item.price;if(!po)return;
          const p=parseFloat(po.price)*Math.pow(10,po.expo??-8);
          if(isFinite(p)&&p>0){np2[asset.symbol]=p;push(asset.symbol,p,sampleTs2);}
        });
        if(Object.keys(np2).length>0){
          setPrices(prev=>{ setPrevPrices(pp=>({...pp,...prev})); return np2; });
          setHistory({...histRef.current});
          setStatus("live");setTickCount(t=>t+1);setLastUpdate(new Date());setErrorMsg(null);return;
        }
      }catch{}
      const demoTs=Math.floor(Date.now()/1000);
      ASSETS.forEach(a=>{
        const h=histRef.current[a.symbol];
        const last=h?.length?h[h.length-1]:SEED[a.symbol]??100;
        push(a.symbol,last+(Math.random()-.49)*last*.002,demoTs);
      });
      setPrices(Object.fromEntries(ASSETS.map(a=>[a.symbol,histRef.current[a.symbol].slice(-1)[0]])));
      setHistory({...histRef.current});setStatus("demo");setTickCount(t=>t+1);setLastUpdate(new Date());
      setErrorMsg("API unavailable · showing demo data");
    }
  },[]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{
    fetchPrices();
    const iv=setInterval(fetchPrices,3000);
    prefetchHistory().then(()=>setHistory({...histRef.current}));

    const tfs = ["1m","5m","15m","1h","4h","1d"];
    let delay = 0;
    for(const sym of ["BTC","ETH"]){
      for(const tf of tfs){
        const d = delay;
        setTimeout(()=>{
          fetchPyth(sym, tf, CHART_FETCH_BARS).then(candles=>{
            if(!candles?.length) return;
            setChartHist(p=>({...p,[sym]:{...(p[sym]||{}),[tf]:candles}}));
          });
        }, d);
        delay += 200;
      }
    }
    return ()=>clearInterval(iv);
  },[prefetchHistory,fetchPrices]);

  useEffect(()=>{
    const nc={};
    ASSETS.forEach((a,i)=>ASSETS.forEach((b,j)=>{
      if(i===j){nc[`${a.symbol}-${b.symbol}`]=1;return;}
      nc[`${a.symbol}-${b.symbol}`]=alignedReturnCorr(a.symbol,b.symbol);
    }));
    setCorr(nc);

    for(let i=0;i<ASSETS.length;i++)for(let j=i+1;j<ASSETS.length;j++){
      const key=`${ASSETS[i].symbol}-${ASSETS[j].symbol}`;
      const v=nc[key];
      if(v==null || !isFinite(v)) continue;
      if(!corrTraceRef.current[key]) corrTraceRef.current[key]=[];
      corrTraceRef.current[key].push(v);
      if(corrTraceRef.current[key].length>24) corrTraceRef.current[key].shift();
    }
  },[history]);

  useEffect(()=>{
    if(!corrAlertEnabled){ setCorrAlertHit(false); return; }
    const series = corrTraceRef.current[corrAlertPair] || [];
    const recent = series.slice(-6);
    if(recent.length < 6) { setCorrAlertHit(false); return; }
    const min = Math.min(...recent), max = Math.max(...recent);
    const avgAbs = recent.reduce((s,v)=>s+Math.abs(v),0)/recent.length;
    setCorrAlertHit(max - min <= 0.04 && avgAbs >= corrAlertThreshold);
  },[corr, corrAlertEnabled, corrAlertPair, corrAlertThreshold]);

  const visCat=filter==="all"?ASSETS:ASSETS.filter(a=>a.category===filter);
  const vis=(!selectedCoins||selectedCoins.size===0)?visCat:visCat.filter(a=>selectedCoins.has(a.symbol));

  const sortedVis=useMemo(()=>{
    const arr=[...vis];
    if(sortBy==="price_desc") return arr.sort((a,b)=>(prices[b.symbol]||0)-(prices[a.symbol]||0));
    if(sortBy==="price_asc")  return arr.sort((a,b)=>(prices[a.symbol]||0)-(prices[b.symbol]||0));
    if(sortBy==="corr_desc"||sortBy==="corr_asc"){
      const avgCorr=a=>{
        const vals=vis.filter(b=>b.symbol!==a.symbol).map(b=>{
          const v=corr[`${a.symbol}-${b.symbol}`]??corr[`${b.symbol}-${a.symbol}`]??null;
          return v;
        }).filter(v=>v!==null&&isFinite(v));
        return vals.length?vals.reduce((s,v)=>s+Math.abs(v),0)/vals.length:null;
      };
      return arr.sort((a,b)=>{
        const pa=avgCorr(a),pb=avgCorr(b);
        if(pa===null&&pb===null)return 0;if(pa===null)return 1;if(pb===null)return -1;
        return sortBy==="corr_desc"?pb-pa:pa-pb;
      });
    }
    return arr;
  },[vis,sortBy,prices,corr]);

  const corrAlertOptions = [];
  for(let i=0;i<ASSETS.length;i++) for(let j=i+1;j<ASSETS.length;j++) {
    corrAlertOptions.push({
      key:`${ASSETS[i].symbol}-${ASSETS[j].symbol}`,
      label:`${ASSETS[i].symbol} / ${ASSETS[j].symbol}`
    });
  }

  function topPairs(dir){
    const pairs=[];
    for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){
      const v=corr[`${vis[i].symbol}-${vis[j].symbol}`];
      if(v!=null&&isFinite(v))pairs.push({a:vis[i],b:vis[j],v});
    }
    return dir==="pos"?pairs.sort((x,y)=>y.v-x.v).slice(0,6):pairs.sort((x,y)=>x.v-y.v).slice(0,6);
  }

  const validCorrs=[];
  for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){
    const v=corr[`${vis[i].symbol}-${vis[j].symbol}`];
    if(v!==null&&v!==undefined&&isFinite(v)&&vis[i].symbol!==vis[j].symbol)validCorrs.push(v);
  }
  const avgCorr=validCorrs.length?validCorrs.reduce((a,b)=>a+b,0)/validCorrs.length:0;
  const strongPos=validCorrs.filter(v=>v>0.7).length;
  const strongNeg=validCorrs.filter(v=>v<-0.7).length;
  const feedHealth=useMemo(()=>{
    const nowSec=Math.floor(Date.now()/1000);
    const refSeries=tickRef.current.BTC||tickRef.current.ETH||[];
    const summaries=ASSETS.map(a=>{
      const tickSeries=tickRef.current[a.symbol]||[];
      if(!tickSeries.length)return null;
      return {
        symbol:a.symbol,
        ...summarizeLiveDataHealth({
          tickSeries,
          compareSeries: refSeries.length?refSeries:tickSeries,
          livePrice: prices[a.symbol],
          benchmarkClose: null,
          nowSec,
          staleAfterSec: 15,
          maxSkewSec: 6,
        })
      };
    }).filter(Boolean);
    const issueCount=summaries.filter(s=>!s.ok).length;
    const staleCount=summaries.filter(s=>s.issues.includes("stale_tick")).length;
    const skewCount=summaries.filter(s=>s.issues.includes("timestamp_skew")).length;
    const badOrderCount=summaries.filter(s=>s.issues.includes("non_monotonic_ticks")).length;
    const worst=summaries.find(s=>!s.ok)||null;
    const level=badOrderCount>0||staleCount>=3?"bad":issueCount>0?"warn":"good";
    return { summaries, issueCount, staleCount, skewCount, badOrderCount, worst, level };
  },[prices,tickCount]);

  const selCorr=selected?corr[`${selected.a}-${selected.b}`]??null:null;
  const selA=selected?ASSETS.find(a=>a.symbol===selected.a):null;
  const selB=selected?ASSETS.find(a=>a.symbol===selected.b):null;
  const si=strengthInfo(selCorr);

  async function sendFeedback(){
    if(!feedbackText.trim())return;
    const safe=feedbackText.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    try{
      await fetch("/api/feedback",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text:safe,ts:new Date().toLocaleString()})
      });
    }catch(e){console.error("Feedback error:",e);}
    setFeedbackSent(true);
    setTimeout(()=>{setFeedbackOpen(false);setFeedbackText("");setFeedbackSent(false);},2200);
  }

  return(
    <>
    <div className={`app${mounted?" on":""}`} style={{visibility:showLoading?"hidden":"visible"}}>
      <SmokeBackground/>

      {/* ══ HEADER ══════════════════════════════════════════════════════ */}
      <header className="hdr">
        <div className="hdr-l">
          <PythLogo size={38}/>
          <div className="hdr-info">
            <div className="hdr-brand">
              <span className="b-pyth">PYTH</span>
              <span className="b-sep"> × </span>
              <span className="b-rs">rustrell</span>
            </div>
            <div className="hdr-sub">Cross-Asset Correlation Matrix</div>
          </div>
        </div>
        <div className="hdr-stats">
          <div className="hstat">
            <div className="hstat-val">{validCorrs.length}</div>
            <div className="hstat-key">Pairs</div>
          </div>
          <div className="hstat-sep"/>
          <div className="hstat">
            <div className="hstat-val pos">{strongPos}</div>
            <div className="hstat-key">Strong +</div>
          </div>
          <div className="hstat-sep"/>
          <div className="hstat">
            <div className="hstat-val neg">{strongNeg}</div>
            <div className="hstat-key">Strong −</div>
          </div>
          <div className="hstat-sep"/>
          <div className="hstat">
            <div className="hstat-val" style={{color:avgCorr>=0?"#34d399":"#f87171"}}>{avgCorr.toFixed(3)}</div>
            <div className="hstat-key">Avg Corr</div>
          </div>
        </div>
        <div className="hdr-r">
          <div className="hdr-upd">{lastUpdate?`UPD ${lastUpdate.toLocaleTimeString()}`:""}</div>
          <div className="hdr-nav" style={{display:"flex",gap:2,background:"rgba(0,0,0,0.4)",borderRadius:6,padding:3,marginRight:6}}>
            {[["matrix","Matrix"],["charts","Charts"],["corr","Correlation"],["leadlag","Lead-Lag"],["entropy","Entropy"],["docs","Docs ↗"]].map(([k,l])=>(
              <button key={k} onClick={()=>k==="docs"?window.open("https://pythcorrelation.gitbook.io/pythcorrelation-docs/","_blank"):setActiveTab(k)} style={{background:activeTab===k?"rgba(139,92,246,0.35)":"transparent",border:"none",borderRadius:4,padding:"4px 12px",fontFamily:"inherit",fontSize:11,fontWeight:600,color:activeTab===k?"#e2d9f3":"rgba(139,92,246,0.5)",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {/* Coin picker */}
          <div ref={pickerRef} className="hdr-picker" style={{position:"relative",marginRight:6}}>
            <button onClick={()=>setPickerOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:5,background:(selectedCoins&&selectedCoins.size<ASSETS.length)?"rgba(124,58,237,0.22)":"rgba(255,255,255,0.05)",border:`1px solid ${(selectedCoins&&selectedCoins.size<ASSETS.length)?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.1)"}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",color:(selectedCoins&&selectedCoins.size<ASSETS.length)?"#c4b5fd":"rgba(255,255,255,0.5)",fontFamily:"inherit",fontSize:11,fontWeight:600,letterSpacing:".04em",transition:"all .15s"}}>
              <span style={{fontSize:13}}>⊞</span>
              {(!selectedCoins||selectedCoins.size===0||selectedCoins.size>=ASSETS.length)?`All ${ASSETS.length}`:`${selectedCoins.size} / ${ASSETS.length}`}
              <span style={{fontSize:9,opacity:.7,marginLeft:1}}>{pickerOpen?"▲":"▼"}</span>
            </button>
            {pickerOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:9999,background:"#0f0b1e",border:"1px solid rgba(124,58,237,0.35)",borderRadius:10,padding:"14px",minWidth:320,maxHeight:"70vh",overflowY:"auto",boxShadow:"0 12px 48px rgba(0,0,0,0.85)",backdropFilter:"blur(16px)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:"1px solid rgba(124,58,237,0.2)"}}>
                  <span style={{color:"#e2d9f3",fontSize:12,fontWeight:700,letterSpacing:".08em"}}>SELECT COINS</span>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>setSelectedCoins(new Set(DEFAULT_COINS))} style={{background:"rgba(124,58,237,0.18)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:4,padding:"3px 9px",cursor:"pointer",color:"#c4b5fd",fontSize:10,fontFamily:"inherit",fontWeight:600}}>Default</button>
                    <button onClick={()=>setSelectedCoins(new Set(ASSETS.map(a=>a.symbol)))} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,padding:"3px 9px",cursor:"pointer",color:"rgba(255,255,255,0.55)",fontSize:10,fontFamily:"inherit",fontWeight:600}}>All</button>
                    <button onClick={()=>setSelectedCoins(new Set())} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"3px 9px",cursor:"pointer",color:"rgba(255,255,255,0.35)",fontSize:10,fontFamily:"inherit",fontWeight:600}}>None</button>
                  </div>
                </div>
                {["crypto","fx","commodity","equity","index"].map(cat=>{
                  const catAssets=ASSETS.filter(a=>a.category===cat);
                  if(!catAssets.length)return null;
                  const allOn=catAssets.every(a=>!selectedCoins||selectedCoins.size===0||selectedCoins.has(a.symbol));
                  return(
                    <div key={cat} style={{marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,paddingBottom:4,borderBottom:"1px solid rgba(124,58,237,0.15)"}}>
                        <span style={{color:"rgba(124,58,237,0.7)",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>
                          {cat==="fx"?"FX Pairs":cat==="commodity"?"Commodities":cat==="equity"?"Equities":cat==="index"?"Indices":"Crypto"}
                        </span>
                        <button onClick={()=>{
                          const syms=catAssets.map(a=>a.symbol);
                          const cur=selectedCoins&&selectedCoins.size>0?new Set(selectedCoins):new Set(ASSETS.map(a=>a.symbol));
                          const allSel=syms.every(s=>cur.has(s));
                          const next=new Set(cur);
                          if(allSel) syms.forEach(s=>next.delete(s)); else syms.forEach(s=>next.add(s));
                          setSelectedCoins(next.size>=ASSETS.length?new Set(ASSETS.map(a=>a.symbol)):next);
                        }} style={{background:"transparent",border:"none",cursor:"pointer",color:"rgba(124,58,237,0.6)",fontSize:9,fontFamily:"inherit",textDecoration:"underline",padding:0}}>
                          {allOn?"deselect all":"select all"}
                        </button>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {catAssets.map(a=>{
                          const on=!selectedCoins||selectedCoins.size===0||selectedCoins.has(a.symbol);
                          return(
                            <button key={a.symbol} onClick={()=>{
                              const cur=selectedCoins&&selectedCoins.size>0?new Set(selectedCoins):new Set(ASSETS.map(a=>a.symbol));
                              const next=new Set(cur);
                              if(on) next.delete(a.symbol); else next.add(a.symbol);
                              setSelectedCoins(next);
                            }} style={{display:"flex",alignItems:"center",gap:4,background:on?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${on?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:5,padding:"3px 8px",cursor:"pointer",color:on?a.color:"rgba(255,255,255,0.3)",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all .12s"}}>
                              {on&&<span style={{color:"rgba(124,58,237,0.8)",fontSize:9}}>✓</span>}
                              {a.symbol}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{position:"relative",marginRight:6}}>
            <button onClick={()=>setFeedDiagOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:6,cursor:"pointer",
              background:feedHealth.level==="good"?"rgba(16,185,129,0.12)":feedHealth.level==="warn"?"rgba(245,158,11,0.12)":"rgba(239,68,68,0.12)",
              border:`1px solid ${feedHealth.level==="good"?"rgba(16,185,129,0.28)":feedHealth.level==="warn"?"rgba(245,158,11,0.28)":"rgba(239,68,68,0.28)"}`}}>
              <span style={{width:6,height:6,borderRadius:"50%",display:"inline-block",
                background:feedHealth.level==="good"?"#10b981":feedHealth.level==="warn"?"#f59e0b":"#ef4444"}}/>
              <span style={{fontSize:10,fontWeight:700,letterSpacing:".08em",
                color:feedHealth.level==="good"?"#34d399":feedHealth.level==="warn"?"#fbbf24":"#f87171"}}>
                FEED {feedHealth.level==="good"?"OK":feedHealth.level==="warn"?"WARN":"DEGRADED"}
              </span>
              {feedHealth.summaries.length>0&&(
                <span style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>
                  {feedHealth.issueCount===0?`${feedHealth.summaries.length} assets`:`${feedHealth.issueCount}/${feedHealth.summaries.length} flagged`}
                </span>
              )}
            </button>
            {feedDiagOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,zIndex:9999,minWidth:320,maxWidth:380,
                background:"#0f0b1e",border:"1px solid rgba(124,58,237,0.35)",borderRadius:10,padding:"12px 14px",
                boxShadow:"0 12px 48px rgba(0,0,0,0.85)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:".08em",color:"#e2d9f3"}}>FEED DIAGNOSTICS</div>
                  <button onClick={()=>setFeedDiagOpen(false)} style={{background:"transparent",border:"none",color:"rgba(255,255,255,0.35)",cursor:"pointer",fontSize:12}}>×</button>
                </div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",marginBottom:10}}>
                  stale: {feedHealth.staleCount} · skew: {feedHealth.skewCount} · non-monotonic: {feedHealth.badOrderCount}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:260,overflowY:"auto"}}>
                  {feedHealth.summaries.filter(s=>!s.ok).length===0?(
                    <div style={{fontSize:10,color:"#34d399"}}>No current feed issues detected.</div>
                  ):feedHealth.summaries.filter(s=>!s.ok).map(s=>(
                    <div key={s.symbol} style={{padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:11,fontWeight:700,color:"#fff"}}>{s.symbol}</span>
                        <span style={{fontSize:8,color:s.stale?"#f87171":"#fbbf24"}}>{s.issues.join(", ")}</span>
                      </div>
                      <div style={{display:"flex",gap:10,fontSize:9,color:"rgba(255,255,255,0.45)"}}>
                        <span>age: {s.ageSec ?? "–"}s</span>
                        <span>skew: {s.skewSec ?? "–"}s</span>
                        <span>order: {s.monotonic ? "ok" : "bad"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={`pill ${status}`}><span className="dot"/>{status==="live"?"LIVE":"DEMO"}</div>
          <div className="tick-badge">#{tickCount}</div>
        </div>
      </header>

      {/* ══ MOBILE NAV BAR ══════════════════════════════════════════════ */}
      <nav className="mob-nav">
        {[["matrix","Matrix"],["charts","Charts"],["corr","Corr"],["leadlag","Lead-Lag"],["entropy","Entropy"],["docs","Docs"]].map(([k,l])=>(
          <button key={k} className={`mob-nav-btn${activeTab===k?" a":""}`}
            onClick={()=>k==="docs"?window.open("https://pythcorrelation.gitbook.io/pythcorrelation-docs/","_blank"):setActiveTab(k)}>
            {l}
          </button>
        ))}
      </nav>

      {/* ══ FILTER BAR ══════════════════════════════════════════════════ */}
      <div className="fbar" style={{display:activeTab!=="matrix"?"none":"flex"}}>
        {["all","crypto","fx","commodity","equity","index"].map(c=>{
          const base=c==="all"?ASSETS:ASSETS.filter(a=>a.category===c);
          const cnt=(!selectedCoins||selectedCoins.size===0)?base.length:base.filter(a=>selectedCoins.has(a.symbol)).length;
          return(
            <button key={c} className={`fbtn${filter===c?" a":""}`} onClick={()=>setFilter(c)}>
              {c==="all"?"All Assets":c==="fx"?"FX Pairs":c==="commodity"?"Commodities":c==="index"?"Indices":c==="equity"?"Equity":"Crypto"}
              <span className="fbtn-count">{cnt}</span>
            </button>
          );
        })}
        <div className="fbar-right">
          <div className="sort-wrap">
            <span className="sort-label">Sort:</span>
            {[
              {k:"default",    t:"Default"},
              {k:"price_desc", t:"Price ↓"},
              {k:"price_asc",  t:"Price ↑"},
              {k:"corr_desc",  t:"Corr ↓"},
              {k:"corr_asc",   t:"Corr ↑"},
            ].map(({k,t})=>(
              <button key={k} className={`sbtn${sortBy===k?" a":""}`} onClick={()=>setSortBy(k)}>{t}</button>
            ))}
          </div>
          <div className="window-badge">⏱ 200-tick · 3s</div>
        </div>
      </div>

      {/* ══ MOBILE SECTION TABS ════════════════════════════════════════ */}
      <div className="mtabs" style={{display:activeTab!=="matrix"?"none":undefined}}>
        {[["tickers","Tickers"],["heatmap","Heatmap"],["top","Rankings"]].map(([k,l])=>(
          <button key={k} className={`mt${mobileTab===k?" a":""}`} onClick={()=>setMobileTab(k)}>{l}</button>
        ))}
      </div>

      {/* ══ MATRIX VIEW ═════════════════════════════════════════════════ */}
      {activeTab === "matrix" && (
        <main className="main">
          {status==="demo"&&errorMsg&&(
            <div className="err-banner" role="alert">
              <span className="err-banner-icon">⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}
          {status==="live"&&feedHealth.level!=="good"&&(
            <div className="err-banner" role="status" style={{
              background:feedHealth.level==="warn"?"rgba(245,158,11,0.08)":"rgba(239,68,68,0.08)",
              borderColor:feedHealth.level==="warn"?"rgba(245,158,11,0.22)":"rgba(239,68,68,0.22)",
              color:feedHealth.level==="warn"?"#fbbf24":"#f87171"
            }}>
              <span className="err-banner-icon">{feedHealth.level==="warn"?"вљ ":"!"}</span>
              <span>
                Feed health {feedHealth.level==="warn"?"warning":"degraded"}:
                {feedHealth.staleCount>0?` stale ${feedHealth.staleCount}`:""}
                {feedHealth.skewCount>0?` · skew ${feedHealth.skewCount}`:""}
                {feedHealth.badOrderCount>0?` · non-monotonic ${feedHealth.badOrderCount}`:""}
                {feedHealth.worst?` · worst ${feedHealth.worst.symbol}`:""}
              </span>
            </div>
          )}

          {/* TICKERS */}
          <section className={`sec${mobileTab!=="tickers"?" mh":""}`} id="sec-tickers">
            <div className="tgrid">
              {status==="connecting"?(
                sortedVis.map((_,i)=><TickerSkeleton key={i}/>)
              ):sortedVis.map((asset,i)=>{
                const h=history[asset.symbol]||[],cur=prices[asset.symbol],prev=prevPrices[asset.symbol];
                const pct=prev&&cur?((cur-prev)/prev*100):null;
                const h1=h.length>1?h[0]:null;
                const pct24=h1&&cur?((cur-h1)/h1*100):null;
                const hi=h.length?Math.max(...h):null,lo=h.length?Math.min(...h):null;
                const vs=h.slice(-20);const vol=vs.length>4?Math.sqrt(vs.reduce((s,v,_,a)=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return s+(v-m)**2;},0)/vs.length):null;
                return(
                  <div key={asset.symbol} className="tc" style={{"--ac":asset.color,"--d":`${i*30}ms`,cursor:"pointer"}}
                    onClick={()=>{setChartAsset(asset.symbol);setActiveTab("charts");}}
                    title={`View ${asset.symbol} chart`}>
                    <div className="tc-head">
                      <AssetIcon asset={asset} size={36}/>
                      <div className="tc-meta">
                        <div className="tc-sym" style={{color:asset.color}}>{asset.symbol}</div>
                        <div className="tc-name">{asset.name}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:10,color:"rgba(167,139,250,0.45)",opacity:.7}}>📈</span>
                        <div className={`tc-badge ${asset.category}`}>{asset.category}</div>
                      </div>
                    </div>
                    <div className="tc-price-row">
                      <div className="tc-price">{fmt(asset.symbol,cur)}</div>
                      {pct!==null&&<div className={`tc-pct${pct>=0?" up":" dn"}`}>{fmtPct(pct)}</div>}
                    </div>
                    <div className="tc-spark-row">
                      <Spark data={h} color={asset.color} w={80} h={32}/>
                      {pct24!==null&&<div className={`tc-pct24${pct24>=0?" up":" dn"}`}>Session: {fmtPct(pct24)}</div>}
                    </div>
                    <div className="tc-stats">
                      {hi&&<div className="tc-stat"><span className="tc-sk">H</span><span className="tc-sv">{fmt(asset.symbol,hi)}</span></div>}
                      {lo&&<div className="tc-stat"><span className="tc-sk">L</span><span className="tc-sv">{fmt(asset.symbol,lo)}</span></div>}
                      {vol&&<div className="tc-stat"><span className="tc-sk">σ</span><span className="tc-sv">{vol.toFixed(4)}</span></div>}
                      <div className="tc-stat"><span className="tc-sk">n</span><span className="tc-sv">{h.length}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* HEATMAP */}
          <section className={`sec${mobileTab!=="heatmap"?" mh":""}`} id="sec-heatmap">
            <div className="card">
              <div className="card-hdr">
                <div className="card-hdr-l">
                  <span className="ct">Correlation Heatmap</span>
                  <span className="cm">{vis.length}×{vis.length} Pearson · rolling 200 ticks</span>
                </div>
                <div className="card-hdr-r">
                  <div className="leg">
                    <span className="leglb" style={{color:"#f87171"}}>−1</span>
                    <span className="legbar"/>
                    <span className="leglb" style={{color:"#34d399"}}>+1</span>
                  </div>
                </div>
              </div>
              <div ref={hmWrapRef} className="hmwrap" onMouseLeave={()=>setHmTooltip(null)}>
                <table className="hm">
                  <thead>
                    <tr>
                      <th className="hm-corner"><span className="hm-corner-txt">↓ row vs col →</span></th>
                      {vis.map(a=>{
                        const base=a.symbol.split("/")[0];
                        const quote=a.symbol.includes("/")?"/"+a.symbol.split("/")[1]:null;
                        return(
                          <th key={a.symbol} className="hm-cl">
                            <div className="hm-cl-inner" style={{color:a.color}}>
                              <div className="hm-cl-sym">{base}<span style={{opacity:.35,fontWeight:400}}>{quote}</span></div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {vis.map(rA=>(
                      <tr key={rA.symbol}>
                        <td className="hm-rl">
                          <div className="hm-rl-inner">
                            <span className="hm-rl-dot" style={{background:rA.color}}/>
                            <span style={{color:rA.color}}>{rA.symbol.split("/")[0]}</span>
                            {rA.symbol.includes("/")&&<span style={{color:"rgba(255,255,255,0.22)",fontSize:7}}>/{rA.symbol.split("/")[1]}</span>}
                          </div>
                        </td>
                        {vis.map(cB=>{
                          const key=`${rA.symbol}-${cB.symbol}`,val=corr[key]??null;
                          const diag=rA.symbol===cB.symbol;
                          const sel=selected&&((selected.a===rA.symbol&&selected.b===cB.symbol)||(selected.a===cB.symbol&&selected.b===rA.symbol));
                          return(
                            <td key={cB.symbol}
                              onClick={()=>!diag&&setSelected(sel?null:{a:rA.symbol,b:cB.symbol})}
                              onMouseEnter={(e)=>{
                                if(diag) return;
                                const wrap=hmWrapRef.current;
                                if(!wrap) return;
                                const r=e.currentTarget.getBoundingClientRect();
                                const wrapRect=wrap.getBoundingClientRect();
                                const pos=getHeatmapTooltipPosition(r, wrapRect, wrap.scrollLeft, wrap.scrollTop);
                                setHmTooltip({x:pos.x, y:pos.y, symA:rA.symbol,symB:cB.symbol,val});
                              }}
                              onMouseMove={(e)=>{
                                if(diag) return;
                                const wrap=hmWrapRef.current;
                                if(!wrap) return;
                                const r=e.currentTarget.getBoundingClientRect();
                                const wrapRect=wrap.getBoundingClientRect();
                                const pos=getHeatmapTooltipPosition(r, wrapRect, wrap.scrollLeft, wrap.scrollTop);
                                setHmTooltip({x:pos.x, y:pos.y, symA:rA.symbol,symB:cB.symbol,val});
                              }}
                              onMouseLeave={()=>setHmTooltip(null)}
                              className={`hm-cell${diag?" diag":""}${sel?" sel":""}`}
                              style={{background:diag?"transparent":corrBg(val),color:diag?"#2a1f40":corrFg(val),position:"relative"}}>
                              {diag?<span className="diag-sym" style={{color:rA.color}}>{rA.symbol.split("/")[0]}</span>:
                               val!==null?val.toFixed(2):"…"}
                              {!diag&&val!==null&&(
                                <button className="hm-share-btn" title="Share on X" onClick={(e)=>{e.stopPropagation();handleShareCorr(rA,cB,val);}}>
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* HEATMAP TOOLTIP */}
              {hmTooltip&&(()=>{
                const si=strengthInfo(hmTooltip.val);
                const lbl=corrTipLabel(hmTooltip.val);
                return(
                  <div className="hm-tooltip" style={{left:hmTooltip.x,top:hmTooltip.y}}>
                    <div className="hm-tt-pair">{hmTooltip.symA} <span style={{opacity:.4}}>/</span> {hmTooltip.symB}</div>
                    <div className="hm-tt-val" style={{color:si.color}}>
                      {hmTooltip.val!==null?hmTooltip.val.toFixed(3):"–"}
                    </div>
                    <div className="hm-tt-lbl" style={{color:si.color}}>{lbl}</div>
                  </div>
                );
              })()}
            </div>

            {/* DETAIL PANEL */}
            {selected&&(
              <div className="card detail-panel">
                <div className="card-hdr">
                  <div className="card-hdr-l">
                    <span className="ct">Pair Analysis</span>
                    <span className="cm">{selected.a} / {selected.b}</span>
                  </div>
                  <button className="xbtn" onClick={()=>setSelected(null)}>✕ Close</button>
                </div>
                <div className="dp-body">
                  <div className="dp-left">
                    <div className="dp-pair">
                      <div className="dp-asset">
                        {selA&&<AssetIcon asset={selA} size={48}/>}
                        <div className="dp-sym" style={{color:selA?.color}}>{selected.a}</div>
                        <div className="dp-aname">{selA?.name}</div>
                      </div>
                      <div className="dp-mid">
                        <div className="dp-corr" style={{color:si.color}}>{selCorr===null?"–":selCorr.toFixed(3)}</div>
                        <div className="dp-label" style={{color:si.color}}>{si.label}</div>
                        <div className="dp-desc">{si.desc}</div>
                      </div>
                      <div className="dp-asset">
                        {selB&&<AssetIcon asset={selB} size={48}/>}
                        <div className="dp-sym" style={{color:selB?.color}}>{selected.b}</div>
                        <div className="dp-aname">{selB?.name}</div>
                      </div>
                    </div>
                    <div className="dp-stats-grid">
                      {[
                        ["Ticks collected",`${Math.min(history[selected.a]?.length||0,history[selected.b]?.length||0)}`],
                        ["Window size","200 samples"],
                        ["Update interval","3 seconds"],
                        ["Algorithm","Pearson r"],
                        [`${selected.a} category`,selA?.category||"–"],
                        [`${selected.b} category`,selB?.category||"–"],
                      ].map(([k,v])=>(
                        <div key={k} className="dp-stat">
                          <div className="dp-sk">{k}</div>
                          <div className="dp-sv">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="dp-right">
                    <div className="dp-chart-title">Rolling Correlation History</div>
                    <CorrChart symA={selected.a} symB={selected.b} histRef={histRef}/>
                    <div className="dp-prices">
                      {[selA,selB].map(a=>a&&(
                        <div key={a.symbol} className="dp-price-row">
                          <span style={{color:a.color}}>{a.symbol}</span>
                          <span className="dp-pval">{fmt(a.symbol,prices[a.symbol])}</span>
                          <Spark data={history[a.symbol]||[]} color={a.color} w={60} h={22}/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* CORRELATION EXPLANATION */}
          <section className="sec" id="sec-corr-explain">
            <div className="ce-grid">
              {[
                {
                  val:"+1.0", color:"#10b981", bg:"rgba(16,185,129,0.07)", border:"rgba(16,185,129,0.22)",
                  title:"Move Together",
                  desc:"Both assets rise and fall in sync. A portfolio of two such assets offers no diversification benefit.",
                  lines:[
                    {d:"M0,32 C12,26 24,16 36,10 S52,6 60,3", color:"#10b981", w:1.8, dash:""},
                    {d:"M0,34 C12,28 24,18 36,12 S52,8 60,5", color:"rgba(255,255,255,0.35)", w:1.4, dash:"4 2"},
                  ],
                },
                {
                  val:"0.0", color:"#a78bfa", bg:"rgba(124,58,237,0.07)", border:"rgba(124,58,237,0.22)",
                  title:"No Relationship",
                  desc:"Assets move independently of each other. Combining uncorrelated assets reduces overall portfolio risk.",
                  lines:[
                    {d:"M0,20 C10,8 20,30 30,18 S46,10 60,22",  color:"#a78bfa", w:1.8, dash:""},
                    {d:"M0,18 C12,30 22,10 32,24 S48,28 60,14", color:"rgba(255,255,255,0.35)", w:1.4, dash:"4 2"},
                  ],
                },
                {
                  val:"−1.0", color:"#ef4444", bg:"rgba(239,68,68,0.07)", border:"rgba(239,68,68,0.22)",
                  title:"Move Opposite",
                  desc:"When one asset rises, the other falls. A perfect hedge — rare to find in real markets.",
                  lines:[
                    {d:"M0,33 C15,26 30,18 45,10 L60,3",  color:"#ef4444", w:1.8, dash:""},
                    {d:"M0,3  C15,10 30,18 45,26 L60,33", color:"rgba(255,255,255,0.35)", w:1.4, dash:"4 2"},
                  ],
                },
              ].map(({val,color,bg,border,title,desc,lines})=>(
                <div key={val} className="ce-card" style={{"--cc":color,"--cbg":bg,"--cbr":border}}>
                  <div className="ce-top">
                    <div className="ce-val">{val}</div>
                    <svg className="ce-chart" viewBox="0 0 60 36" fill="none">
                      {lines.map((l,i)=>(
                        <path key={i} d={l.d} stroke={l.color} strokeWidth={l.w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={l.dash||undefined}/>
                      ))}
                    </svg>
                  </div>
                  <div className="ce-title">{title}</div>
                  <div className="ce-desc">{desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* RANKINGS */}
          <section className={`sec${mobileTab!=="top"?" mh":""}`} id="sec-rankings">
            <div className="rgrid">
              {["pos","neg"].map(dir=>(
                <div key={dir} className="card">
                  <div className="card-hdr">
                    <div className="card-hdr-l">
                      <span className="ct" style={{color:dir==="pos"?"#34d399":"#f87171"}}>
                        {dir==="pos"?"▲ Strongest Positive":"▼ Strongest Negative"}
                      </span>
                      <span className="cm">Top 6 pairs · {filter==="all"?"all assets":filter}</span>
                    </div>
                  </div>
                  {topPairs(dir).map(({a,b,v},i)=>{
                    const bar=Math.abs(v)*100;
                    return(
                      <div key={`${a.symbol}${b.symbol}`} className="rr" onClick={()=>setSelected({a:a.symbol,b:b.symbol})} style={{"--i":i}}>
                        <div className="rr-bar" style={{width:`${bar}%`,background:dir==="pos"?"rgba(52,211,153,0.12)":"rgba(248,113,113,0.12)"}}/>
                        <div className="rr-num">{i+1}</div>
                        <div className="rr-pair">
                          <span className="rr-sym" style={{color:a.color}}>{a.symbol}</span>
                          <span className="rr-cat">{a.category}</span>
                          <span className="rr-vs">vs</span>
                          <span className="rr-sym" style={{color:b.color}}>{b.symbol}</span>
                          <span className="rr-cat">{b.category}</span>
                        </div>
                        <div className={`rr-val ${dir}`}>{v.toFixed(3)}</div>
                        <div className="rr-str">{strengthInfo(v).label.split(" ")[0]}</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ══ FULL-SCREEN VIEWS ══════════════════════════════════════════ */}
      {activeTab !== "matrix" && (
        <div style={{position:"fixed",inset:0,background:"#07050f",zIndex:200,display:"flex",flexDirection:"column",animation:"fadein .22s ease"}}>
          {activeTab==="charts" && <ChartView assets={ASSETS} prices={prices} chartAsset={chartAsset} setChartAsset={setChartAsset} chartTf={chartTf} setChartTf={setChartTf} chartType={chartType} setChartType={setChartType} chartHist={chartHist} setChartHist={setChartHist} setActiveTab={setActiveTab} status={status} histRef={histRef}/>}
          {activeTab==="corr" && <CorrView histRef={histRef} tickRef={tickRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status} initialPair={initialCorrPair}/>}
          {activeTab==="leadlag" && <LeadLagView histRef={histRef} tickRef={tickRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status}/>}
          {activeTab==="entropy" && <EntropyView histRef={histRef} tickRef={tickRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status} liveRun={entropyLiveRun} setLiveRun={setEntropyLiveRun} corrAlertEnabled={corrAlertEnabled} setCorrAlertEnabled={setCorrAlertEnabled} corrAlertPair={corrAlertPair} setCorrAlertPair={setCorrAlertPair} corrAlertThreshold={corrAlertThreshold} setCorrAlertThreshold={setCorrAlertThreshold} corrAlertHit={corrAlertHit} corrAlertOptions={corrAlertOptions}/>}
          {activeTab==="docs" && <DocsView setActiveTab={setActiveTab}/>}
        </div>
      )}

      {/* ══ LANDING ═════════════════════════════════════════════════════ */}
      {showLanding&&(
        <div className={`landing-ov${landingExiting?" landing-ov-out":""}`}>
          <div className="landing-inner">
            <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
              <PythLogo size={64}/>
            </div>
            <div className="hero-badge">
              <span className="dot" style={{color:"#a78bfa"}}/> Live · Pyth Oracle
            </div>
            <h1 className="hero-title">
              Real-Time Crypto Correlation<br/>
              <span className="hero-title-hi">Powered by Pyth Oracle Data</span>
            </h1>
            <p className="hero-sub">Explore how crypto assets move together using live market data.</p>
            <div className="hero-btns">
              <button className="hero-btn-p" onClick={()=>goFromLanding("matrix")}>Start analysis</button>
              <button className="hero-btn-s" onClick={()=>goFromLanding("corr")}>View correlation heatmap</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
      <footer className="foot">
        <div className="foot-l">
          <PythLogo size={18}/>
          <span>Powered by <a href="https://pyth.network" target="_blank" rel="noreferrer" className="fl">Pyth Network</a></span>
          <span className="foot-sep">·</span>
          <span style={{color:"rgba(255,255,255,0.35)"}}>© 2026 rustrell. All rights reserved.</span>
          <span className="foot-sep">·</span>
          <a href="mailto:stytunnik@gmail.com" style={{color:"rgba(255,255,255,0.3)",textDecoration:"none",fontSize:11}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>stytunnik@gmail.com</a>
          <span className="foot-sep">·</span>
          <a href="https://x.com/xzolmoney" target="_blank" rel="noreferrer" style={{color:"rgba(255,255,255,0.3)",textDecoration:"none",fontSize:11}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>𝕏 @xzolmoney</a>
          <span className="foot-sep">·</span>
          <a href="https://x.com/wladwtf" target="_blank" rel="noreferrer" style={{color:"rgba(255,255,255,0.3)",textDecoration:"none",fontSize:11}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>𝕏 @wladwtf</a>
          <span className="foot-sep">·</span>
          <button onClick={()=>window.open("https://pythcorrelation.gitbook.io/pythcorrelation-docs/","_blank")} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:11,fontFamily:"inherit",padding:0}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.25)"}>Docs & Legal ↗</button>
        </div>
        <div className="foot-r">
          <span className="foot-info">Data updates every 3s · 400ms Pyth oracle</span>
          <button className="fbk-btn" onClick={()=>setFeedbackOpen(true)}>💬 Feedback</button>
        </div>
      </footer>

      {/* ══ FEEDBACK MODAL ═════════════════════════════════════════════ */}
      {feedbackOpen&&(
        <div className="overlay" onClick={()=>setFeedbackOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="card-hdr">
              <div className="card-hdr-l">
                <span className="ct">Send Feedback</span>
                <span className="cm">Sent to Telegram instantly</span>
              </div>
              <button className="xbtn" onClick={()=>setFeedbackOpen(false)}>✕</button>
            </div>
            {feedbackSent?(
              <div className="sent">✅ Received! Thank you.</div>
            ):(
              <div className="modal-body">
                <textarea className="fta" placeholder="Bug report, feature request, or general feedback..." value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} rows={5} autoFocus/>
                <button className="fsend" onClick={sendFeedback} disabled={!feedbackText.trim()}>Send →</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

    {showLoading&&(
      <div className="loading-ov">
        <LoadingCanvas/>
        <div className="loading-content">
          <img src="/pyth-logo.png" alt="Pyth" className="loading-logo"/>
          <div className="loading-brand">
            <span className="loading-brand-pyth">PYTH</span>
            <span className="loading-brand-sep"> × </span>
            <span className="loading-brand-rs">rustrell</span>
          </div>
          <div className="loading-spinner"/>
          <div key={loadingPhase} className="loading-text">{LOADING_PHRASES[loadingPhase]}</div>
          <div className="loading-bar-wrap">
            <div className="loading-bar-bg"/>
            <div className="loading-bar-fill" style={{width:`${((loadingPhase+1)/LOADING_PHRASES.length)*100}%`}}/>
          </div>
        </div>
      </div>
    )}
    <Analytics />
    </>
  );
}
