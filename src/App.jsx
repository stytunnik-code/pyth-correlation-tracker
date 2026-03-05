// build: 2026-03-05 17:15
import { useState, useEffect, useRef, useCallback } from "react";
import SmokeBackground from "./SmokeBackground";

const ASSETS = [
  { id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", symbol: "BTC",     name: "Bitcoin",      category: "crypto",    color: "#F7931A", icon: "₿", logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", symbol: "ETH",     name: "Ethereum",     category: "crypto",    color: "#8B9FFF", icon: "Ξ", logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL",     name: "Solana",       category: "crypto",    color: "#14F195", icon: "◎", logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c", symbol: "DOGE",    name: "Dogecoin",     category: "crypto",    color: "#C8A84B", icon: "Ð", logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
  { id: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", symbol: "USDC",    name: "USD Coin",     category: "crypto",    color: "#2775CA", icon: "$", logo: "https://assets.coingecko.com/coins/images/6319/small/usdc.png" },
  { id: "a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b", symbol: "EUR/USD", name: "Euro",         category: "fx",        color: "#60A5FA", icon: "€", logo: null },
  { id: "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1", symbol: "GBP/USD", name: "Pound",        category: "fx",        color: "#34D399", icon: "£", logo: null },
  { id: "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", symbol: "XAU/USD", name: "Gold",         category: "commodity", color: "#FCD34D", icon: "Au", logo: null },
  { id: "925ca92ff005ae943c158e3563f59698ce7e75c5a8c8dd43303a0a154887b3e6", symbol: "WTI",     name: "Oil (WTI)",    category: "commodity", color: "#FB923C", icon: "⛽", logo: null },
  { id: "49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688", symbol: "AAPL",   name: "Apple Inc",    category: "equity",    color: "#E2E8F0", icon: "", logo: null },
];

const SEED = { BTC:65000,ETH:3200,SOL:140,DOGE:0.15,USDC:1,"EUR/USD":1.085,"GBP/USD":1.265,"XAU/USD":2320,WTI:78,AAPL:185 };
const CAT_COLORS = { crypto:"#9945FF", fx:"#60A5FA", commodity:"#FCD34D", equity:"#E2E8F0" };

function pearson(a,b){
  const n=Math.min(a.length,b.length);if(n<4)return null;
  const ax=a.slice(-n),bx=b.slice(-n);
  const ma=ax.reduce((s,v)=>s+v,0)/n,mb=bx.reduce((s,v)=>s+v,0)/n;
  let num=0,da=0,db=0;
  for(let i=0;i<n;i++){const ai=ax[i]-ma,bi=bx[i]-mb;num+=ai*bi;da+=ai*ai;db+=bi*bi;}
  const d=Math.sqrt(da*db);return d===0?0:Math.max(-1,Math.min(1,num/d));
}

function corrBg(v){
  if(v===null)return"rgba(255,255,255,0.02)";
  if(v>=0){const t=v;return`rgba(${Math.round(t*20)},${Math.round(180+t*75)},${Math.round(100+t*80)},${0.1+t*0.72})`;}
  const t=-v;return`rgba(${Math.round(210+t*45)},${Math.round(50-t*40)},${Math.round(70-t*50)},${0.1+t*0.72})`;
}
function corrFg(v){if(v===null)return"#2a1f40";return Math.abs(v)>0.4?"#fff":"#c4b5fd";}

function fmt(sym,val){
  if(!val)return"–";
  if(sym==="USDC")return`$${val.toFixed(4)}`;
  if(["EUR/USD","GBP/USD"].includes(sym))return val.toFixed(5);
  if(val>1000)return`$${val.toLocaleString(undefined,{maximumFractionDigits:0})}`;
  if(val>1)return`$${val.toFixed(2)}`;
  return`$${val.toFixed(6)}`;
}

function fmtPct(v){if(v===null||!isFinite(v))return"–";return`${v>=0?"+":""}${v.toFixed(3)}%`;}

/* ── SKELETON ──────────────────────────────────────────────────────────── */
function TickerSkeleton(){return(
  <div className="tc tc-skeleton">
    <div className="tc-head"><div className="sk-icon"/><div className="sk-meta"><div className="sk-line w8"/><div className="sk-line w12"/></div><div className="sk-badge"/></div>
    <div className="tc-price-row"><div className="sk-line w14"/><div className="sk-line w6"/></div>
    <div className="tc-spark-row"><div className="sk-spark"/><div className="sk-line w10"/></div>
    <div className="tc-stats"><div className="sk-stat"/><div className="sk-stat"/><div className="sk-stat"/><div className="sk-stat"/></div>
  </div>
);}

function strengthInfo(v){
  if(v===null)return{label:"COMPUTING",color:"#5a4a7a",desc:"Collecting data..."};
  const a=Math.abs(v);
  if(a>0.8)return{label:v>0?"VERY STRONG +":"VERY STRONG −",color:v>0?"#34d399":"#f87171",desc:v>0?"Assets move almost in lockstep":"Assets move in opposite directions strongly"};
  if(a>0.5)return{label:v>0?"STRONG +":"STRONG −",color:v>0?"#6ee7b7":"#fca5a5",desc:v>0?"Clear positive relationship":"Clear inverse relationship"};
  if(a>0.3)return{label:v>0?"MODERATE +":"MODERATE −",color:v>0?"#a7f3d0":"#fecaca",desc:v>0?"Moderate positive tendency":"Moderate inverse tendency"};
  return{label:"UNCORRELATED",color:"#8b5cf6",desc:"No significant linear relationship"};
}

/* ── SPARKLINE ──────────────────────────────────────────────────────────── */
function Spark({data,color,h=28,w=72}){
  if(!data||data.length<2)return<svg width={w} height={h}/>;
  const pts=data.slice(-50),mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1;
  const xs=pts.map((_,i)=>(i/(pts.length-1))*(w-2)+1);
  const ys=pts.map(v=>h-2-((v-mn)/rng)*(h-4));
  const line=xs.map((x,i)=>`${i===0?"M":"L"}${x},${ys[i]}`).join(" ");
  const area=`${line} L${xs[xs.length-1]},${h} L${xs[0]},${h} Z`;
  const up=pts[pts.length-1]>=pts[0];
  const sc=up?"#34d399":"#f87171";
  return(
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sc} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={sc} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${color.replace("#","")})`}/>
      <path d={line} fill="none" stroke={sc} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── CORR CHART ─────────────────────────────────────────────────────────── */
function CorrChart({symA,symB,histRef}){
  const ref=useRef();
  useEffect(()=>{
    const ha=histRef.current[symA]||[],hb=histRef.current[symB]||[];
    const n=Math.min(ha.length,hb.length),pts=[];
    for(let i=4;i<=n;i++){const v=pearson(ha.slice(0,i),hb.slice(0,i));if(v!==null)pts.push(v);}
    const c=ref.current;if(!c||pts.length<2)return;
    const ctx=c.getContext("2d"),W=c.offsetWidth||400,H=100;
    c.width=W;c.height=H;ctx.clearRect(0,0,W,H);
    // Grid lines
    [-0.5,0,0.5].forEach(v=>{
      const y=H/2-(v*H/2*.88);
      ctx.strokeStyle=v===0?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.05)";
      ctx.lineWidth=v===0?1.5:1;ctx.setLineDash(v===0?[]:[ 3,4]);
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
      ctx.setLineDash([]);
      if(v!==0){ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="9px monospace";ctx.fillText(v>0?"+0.5":"-0.5",4,y-2);}
    });
    const last=pts[pts.length-1];
    // Area fill
    const ag=ctx.createLinearGradient(0,0,0,H);
    ag.addColorStop(0,last>=0?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.15)");
    ag.addColorStop(1,"transparent");
    ctx.fillStyle=ag;
    ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.lineTo(W-2,H/2);ctx.lineTo(2,H/2);ctx.closePath();ctx.fill();
    // Line
    const lg=ctx.createLinearGradient(0,0,W,0);
    lg.addColorStop(0,"rgba(139,92,246,0.8)");
    lg.addColorStop(1,last>=0?"rgba(52,211,153,1)":"rgba(248,113,113,1)");
    ctx.strokeStyle=lg;ctx.lineWidth=2;ctx.lineJoin="round";
    ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();
    // Current value dot
    const lx=(pts.length-1)/(pts.length-1)*(W-4)+2,ly=H/2-(last*H/2*.88);
    ctx.fillStyle=last>=0?"#34d399":"#f87171";
    ctx.beginPath();ctx.arc(lx,ly,4,0,Math.PI*2);ctx.fill();
  });
  return<canvas ref={ref} style={{width:"100%",height:100,display:"block"}}/>;
}

/* ── PYTH LOGO ──────────────────────────────────────────────────────────── */
function PythLogo({size=30}){
  return <img src="/pyth-logo.png" alt="Pyth" width={size} height={size} style={{borderRadius:"8px",objectFit:"contain"}}/>;
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
  );
}


/* ── MAIN ───────────────────────────────────────────────────────────────── */
export default function App(){
  const [prices,setPrices]=useState({});
  const [history,setHistory]=useState({});
  const [corr,setCorr]=useState({});
  const [prevPrices,setPrevPrices]=useState({});
  const [status,setStatus]=useState("connecting");
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState(null);
  const [mounted,setMounted]=useState(false);
  const [activeTab,setActiveTab]=useState("matrix");   // matrix | charts
  const [mobileTab,setMobileTab]=useState("heatmap");
  const [chartAsset,setChartAsset]=useState("BTC");
  const [chartTf,setChartTf]=useState("1m");
  const [chartType,setChartType]=useState("candle");   // candle | line
  const ohlcvRef=useRef({});   // {symbol: {tf: [{t,o,h,l,c,v}]}}
  const [feedbackOpen,setFeedbackOpen]=useState(false);
  const [feedbackText,setFeedbackText]=useState("");
  const [feedbackSent,setFeedbackSent]=useState(false);
  const [tickCount,setTickCount]=useState(0);
  const [lastUpdate,setLastUpdate]=useState(null);
  const [errorMsg,setErrorMsg]=useState(null);
  const histRef=useRef({});

  useEffect(()=>{setTimeout(()=>setMounted(true),80);},[]);

  function push(sym,price){
    if(!histRef.current[sym])histRef.current[sym]=[];
    histRef.current[sym].push(price);
    if(histRef.current[sym].length>200)histRef.current[sym].shift();
    // Build OHLCV candles for each timeframe
    const TF_SECS={"1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1d":86400};
    const now=Math.floor(Date.now()/1000);
    Object.entries(TF_SECS).forEach(([tf,secs])=>{
      if(!ohlcvRef.current[sym])ohlcvRef.current[sym]={};
      if(!ohlcvRef.current[sym][tf])ohlcvRef.current[sym][tf]=[];
      const bars=ohlcvRef.current[sym][tf];
      const barT=Math.floor(now/secs)*secs;
      if(!bars.length||bars[bars.length-1].t!==barT){
        bars.push({t:barT,o:price,h:price,l:price,c:price,n:1});
        if(bars.length>500)bars.shift();
      } else {
        const b=bars[bars.length-1];
        b.h=Math.max(b.h,price);b.l=Math.min(b.l,price);b.c=price;b.n++;
      }
    });
  }

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
      items.forEach(item=>{
        const cleanId=item.id?.replace(/^0x/,"");
        const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
        if(!asset)return;
        const po=item.price;if(!po)return;
        const p=parseFloat(po.price)*Math.pow(10,po.expo??-8);
        if(isFinite(p)&&p>0){np[asset.symbol]=p;push(asset.symbol,p);}
      });
      if(Object.keys(np).length>0){
        setPrices(prev=>{ setPrevPrices(pp=>({...pp,...prev})); return np; });
        setHistory({...histRef.current});
        setStatus("live");setTickCount(t=>t+1);setLastUpdate(new Date());setErrorMsg(null);
      }else throw new Error("0 prices");
    }catch(e){
      setErrorMsg(e?.message||"Network error");
      try{
        const ids2=ASSETS.map(a=>`ids[]=${a.id}`).join("&");
        const r2=await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${ids2}&parsed=true&ignore_invalid_price_ids=true`);
        if(!r2.ok)throw new Error();
        const d2=await r2.json();
        const np2={};
        (d2.parsed||[]).forEach(item=>{
          const cleanId=item.id?.replace(/^0x/,"");
          const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
          if(!asset)return;
          const po=item.price;if(!po)return;
          const p=parseFloat(po.price)*Math.pow(10,po.expo??-8);
          if(isFinite(p)&&p>0){np2[asset.symbol]=p;push(asset.symbol,p);}
        });
        if(Object.keys(np2).length>0){
          setPrices(prev=>{ setPrevPrices(pp=>({...pp,...prev})); return np2; });
          setHistory({...histRef.current});
          setStatus("live");setTickCount(t=>t+1);setLastUpdate(new Date());setErrorMsg(null);return;
        }
      }catch{}
      ASSETS.forEach(a=>{
        const h=histRef.current[a.symbol];
        const last=h?.length?h[h.length-1]:SEED[a.symbol]??100;
        push(a.symbol,last+(Math.random()-.49)*last*.002);
      });
      setPrices(Object.fromEntries(ASSETS.map(a=>[a.symbol,histRef.current[a.symbol].slice(-1)[0]])));
      setHistory({...histRef.current});setStatus("demo");setTickCount(t=>t+1);setLastUpdate(new Date());
      setErrorMsg("API unavailable · showing demo data");
    }
  },[]);  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{fetchPrices();const iv=setInterval(fetchPrices,3000);return()=>clearInterval(iv);},[fetchPrices]);

  useEffect(()=>{
    const nc={};
    ASSETS.forEach((a,i)=>ASSETS.forEach((b,j)=>{
      if(i===j){nc[`${a.symbol}-${b.symbol}`]=1;return;}
      nc[`${a.symbol}-${b.symbol}`]=pearson(histRef.current[a.symbol]||[],histRef.current[b.symbol]||[]);
    }));
    setCorr(nc);
  },[history]);

  const vis=filter==="all"?ASSETS:ASSETS.filter(a=>a.category===filter);

  function topPairs(dir){
    const pairs=[];
    for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){
      const v=corr[`${vis[i].symbol}-${vis[j].symbol}`];
      if(v!=null&&isFinite(v))pairs.push({a:vis[i],b:vis[j],v});
    }
    return dir==="pos"?pairs.sort((x,y)=>y.v-x.v).slice(0,6):pairs.sort((x,y)=>x.v-y.v).slice(0,6);
  }

  // Stats
  const validCorrs=[];
  for(let i=0;i<ASSETS.length;i++)for(let j=i+1;j<ASSETS.length;j++){
    const v=corr[`${ASSETS[i].symbol}-${ASSETS[j].symbol}`];
    if(v!==null&&v!==undefined&&isFinite(v)&&ASSETS[i].symbol!==ASSETS[j].symbol)validCorrs.push(v);
  }
  const avgCorr=validCorrs.length?validCorrs.reduce((a,b)=>a+b,0)/validCorrs.length:0;
  const strongPos=validCorrs.filter(v=>v>0.7).length;
  const strongNeg=validCorrs.filter(v=>v<-0.7).length;

  const selCorr=selected?corr[`${selected.a}-${selected.b}`]??null:null;
  const selA=selected?ASSETS.find(a=>a.symbol===selected.a):null;
  const selB=selected?ASSETS.find(a=>a.symbol===selected.b):null;
  const si=strengthInfo(selCorr);

  async function sendFeedback(){
    if(!feedbackText.trim())return;
    // Escape HTML to prevent XSS in Telegram HTML mode
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
    <div className={`app${mounted?" on":""}`}>
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
          <div className="nav-tabs">
            {[["matrix","Matrix"],["charts","Charts"]].map(([k,l])=>(
              <button key={k} className={`nav-tab${activeTab===k?" a":""}`} onClick={()=>setActiveTab(k)}>{l}</button>
            ))}
          </div>
          <div className={`pill ${status}`}><span className="dot"/>{status==="live"?"LIVE":"DEMO"}</div>
          <div className="tick-badge">#{tickCount}</div>
        </div>
      </header>

      {/* ══ FILTER BAR ══════════════════════════════════════════════════ */}
      <div className="fbar" style={{display:activeTab==="charts"?"none":"flex"}}>
        {["all","crypto","fx","commodity","equity"].map(c=>(
          <button key={c} className={`fbtn${filter===c?" a":""}`} onClick={()=>setFilter(c)}>
            {c==="all"?"All Assets":c==="fx"?"FX Pairs":c==="commodity"?"Commodities":c.charAt(0).toUpperCase()+c.slice(1)}
            <span className="fbtn-count">{c==="all"?ASSETS.length:ASSETS.filter(a=>a.category===c).length}</span>
          </button>
        ))}
        <div className="fbar-right">
          <div className="window-badge">⏱ 200-tick window · 3s interval</div>
        </div>
      </div>

      {/* ══ MOBILE TABS ════════════════════════════════════════════════ */}
      <div className="mtabs" style={{display:activeTab==="charts"?"none":"flex"}}>
        {(activeTab==="charts"?[["chart-main","Chart"],["chart-asset","Asset"]]:[ ["heatmap","Matrix"],["tickers","Prices"],["top","Rankings"]]).map(([k,l])=>(
          <button key={k} className={`mt${mobileTab===k?" a":""}`} onClick={()=>setMobileTab(k)}>{l}</button>
        ))}
      </div>

      <main className="main">
        {status==="demo"&&errorMsg&&(
          <div className="err-banner" role="alert">
            <span className="err-banner-icon">⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {/* Charts portal below */}
        {/* ══ TICKERS ════════════════════════════════════════════════════ */}
        <section className={`sec${mobileTab!=="tickers"?" mh":""}`} id="sec-tickers">
          <div className="tgrid">
            {status==="connecting"?(
              vis.map((_,i)=><TickerSkeleton key={i}/>)
            ):vis.map((asset,i)=>{
              const h=history[asset.symbol]||[],cur=prices[asset.symbol],prev=prevPrices[asset.symbol];
              const pct=prev&&cur?((cur-prev)/prev*100):null;
              const h1=h.length>1?h[0]:null;
              const pct24=h1&&cur?((cur-h1)/h1*100):null;
              const hi=h.length?Math.max(...h):null,lo=h.length?Math.min(...h):null;
              const vs=h.slice(-20);const vol=vs.length>4?Math.sqrt(vs.reduce((s,v,_,a)=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return s+(v-m)**2;},0)/vs.length):null;
              return(
                <div key={asset.symbol} className="tc" style={{"--ac":asset.color,"--d":`${i*30}ms`}}>
                  <div className="tc-head">
                    <AssetIcon asset={asset} size={36}/>
                    <div className="tc-meta">
                      <div className="tc-sym" style={{color:asset.color}}>{asset.symbol}</div>
                      <div className="tc-name">{asset.name}</div>
                    </div>
                    <div className={`tc-badge ${asset.category}`}>{asset.category}</div>
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

        {/* ══ HEATMAP ═════════════════════════════════════════════════════ */}
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
            <div className="hmwrap">
              <table className="hm">
                <thead>
                  <tr>
                    <th className="hm-corner"><span className="hm-corner-txt">↓ row vs col →</span></th>
                    {vis.map(a=>(
                      <th key={a.symbol} className="hm-cl">
                        <div className="hm-cl-inner" style={{color:a.color}}>
                          <div className="hm-cl-sym">{a.symbol}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vis.map(rA=>(
                    <tr key={rA.symbol}>
                      <td className="hm-rl">
                        <div className="hm-rl-inner">
                          <span className="hm-rl-dot" style={{background:rA.color}}/>
                          <span style={{color:rA.color}}>{rA.symbol}</span>
                        </div>
                      </td>
                      {vis.map(cB=>{
                        const key=`${rA.symbol}-${cB.symbol}`,val=corr[key]??null;
                        const diag=rA.symbol===cB.symbol;
                        const sel=selected&&((selected.a===rA.symbol&&selected.b===cB.symbol)||(selected.a===cB.symbol&&selected.b===rA.symbol));
                        return(
                          <td key={cB.symbol}
                            onClick={()=>!diag&&setSelected(sel?null:{a:rA.symbol,b:cB.symbol})}
                            className={`hm-cell${diag?" diag":""}${sel?" sel":""}`}
                            style={{background:diag?"transparent":corrBg(val),color:diag?"#2a1f40":corrFg(val)}}>
                            {diag?<span className="diag-sym" style={{color:rA.color}}>{rA.symbol.split("/")[0]}</span>:
                             val!==null?val.toFixed(2):"…"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── DETAIL PANEL ─────────────────────────────────────────── */}
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

        {/* ══ RANKINGS ════════════════════════════════════════════════════ */}
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

      {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
      <footer className="foot">
        <div className="foot-l">
          <PythLogo size={18}/>
          <span>Powered by <a href="https://pyth.network" target="_blank" rel="noreferrer" className="fl">Pyth Network</a></span>
          <span className="foot-sep">·</span>
          <span>Pyth Playground Hackathon 2025</span>
          <span className="foot-sep">·</span>
          <span>Built by <a href="https://x.com/xzolmoneythinks" target="_blank" rel="noreferrer" className="fl">@xzolmoneythinks</a></span>
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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

        :root {
          --bg: #060410;
          --bg2: #0a0718;
          --card: rgba(255,255,255,0.028);
          --cb: rgba(139,92,246,0.14);
          --cb2: rgba(139,92,246,0.07);
          --pu: #8b5cf6; --pul: #a78bfa; --pud: rgba(139,92,246,0.22);
          --tx: #e2d9f3; --td: #6b5c8a; --tm: #2d1f4a; --txx: #f0eaff;
          --gn: #34d399; --rd: #f87171;
          --fd: 'Outfit', sans-serif;
          --fm: 'Space Mono', monospace;
          --r: 10px; --rs: 7px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { width: 100%; height: 100%; }
        body { width: 100%; min-height: 100%; background: var(--bg); margin: 0; }
        #root { width: 100%; min-height: 100vh; display: block; }
        .app { min-height: 100vh; width: 100%; max-width: 100vw; background: var(--bg); color: var(--tx); font-family: var(--fm); display: flex; flex-direction: column; position: relative; overflow-x: hidden; opacity: 0; transition: opacity .5s; }
        .app.on { opacity: 1; }

        /* HEADER */
        .hdr { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; gap: 16px; padding: 10px 24px; background: rgba(6,4,16,0.92); backdrop-filter: blur(28px); border-bottom: 1px solid var(--cb); flex-wrap: wrap; }
        .hdr-l { display: flex; align-items: center; gap: 12px; }
        .hdr-info { display: flex; flex-direction: column; gap: 2px; }
        .hdr-brand { font-family: var(--fd); font-size: 18px; font-weight: 800; letter-spacing: .04em; }
        .b-pyth { color: #fff; } .b-sep { color: var(--pud); } .b-rs { color: var(--pul); }
        .hdr-sub { font-size: 9px; color: var(--td); letter-spacing: .2em; text-transform: uppercase; }
        .hdr-stats { display: flex; align-items: center; gap: 0; margin-left: 20px; background: rgba(0,0,0,0.3); border: 1px solid var(--cb2); border-radius: var(--rs); overflow: hidden; }
        .hstat { padding: 6px 14px; text-align: center; }
        .hstat-val { font-family: var(--fd); font-size: 16px; font-weight: 700; color: var(--txx); }
        .hstat-val.pos { color: var(--gn); } .hstat-val.neg { color: var(--rd); }
        .hstat-key { font-size: 8px; color: var(--td); letter-spacing: .1em; text-transform: uppercase; margin-top: 1px; }
        .hstat-sep { width: 1px; height: 32px; background: var(--cb); }
        .hdr-r { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .nav-tabs { display: flex; gap: 2px; background: rgba(0,0,0,.3); border: 1px solid var(--cb); border-radius: 8px; padding: 3px; }
        .nav-tab { background: transparent; border: none; color: var(--td); padding: 4px 14px; border-radius: 5px; font-size: 10px; font-family: var(--fm); cursor: pointer; transition: all .2s; letter-spacing: .06em; }
        .nav-tab:hover { color: var(--pul); }
        .nav-tab.a { background: var(--pud); color: #fff; }
        .hdr-upd { font-size: 9px; color: var(--td); letter-spacing: .08em; }
        .pill { display: flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 20px; font-size: 9px; font-weight: 700; letter-spacing: .14em; border: 1px solid; }
        .pill.live { background: rgba(52,211,153,.08); border-color: rgba(52,211,153,.3); color: var(--gn); }
        .pill.demo { background: rgba(251,146,60,.08); border-color: rgba(251,146,60,.3); color: #fb923c; }
        .pill.connecting { background: rgba(139,92,246,.08); border-color: var(--pud); color: var(--pul); }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.3} }
        .tick-badge { font-size: 9px; color: var(--tm); letter-spacing: .06em; }

        /* FILTER BAR */
        .fbar { display: flex; align-items: center; gap: 5px; padding: 8px 24px; border-bottom: 1px solid var(--cb2); background: rgba(6,4,16,.7); overflow-x: auto; scrollbar-width: none; position: relative; z-index: 1; }
        .fbar::-webkit-scrollbar { display: none; }
        .fbtn { display: flex; align-items: center; gap: 6px; flex-shrink: 0; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--tm); background: transparent; color: var(--td); font-size: 10px; font-family: var(--fm); cursor: pointer; transition: all .15s; white-space: nowrap; }
        .fbtn:hover { border-color: var(--pud); color: var(--pul); }
        .fbtn.a { background: var(--pud); border-color: var(--pu); color: #fff; }
        .fbtn-count { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1px 6px; font-size: 8px; }
        .fbar-right { margin-left: auto; flex-shrink: 0; }
        .window-badge { font-size: 9px; color: var(--tm); letter-spacing: .06em; white-space: nowrap; }

        /* MOBILE TABS */
        .mtabs { display: none; gap: 0; border-bottom: 1px solid var(--cb2); background: var(--bg); position: sticky; top: 0; z-index: 10; }
        @media(max-width:768px){
          .mtabs { display: flex; }
          .mtabs { display: none; gap: 0; border-bottom: 1px solid var(--cb2); background: var(--bg); position: sticky; top: 0; z-index: 10; }
          .mt { flex: 1; padding: 10px; border: none; background: transparent; color: var(--td); font-size: 11px; font-family: var(--fm); cursor: pointer; border-bottom: 2px solid transparent; transition: all .2s; }
          .mt.a { color: var(--pul); border-bottom-color: var(--pu); }
          .mh { display: none !important; }
        }

        /* MAIN */
        .main { flex: 1; padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; width: 100%; }

        /* CARDS */
        .card { background: var(--card); border: 1px solid var(--cb); border-radius: var(--r); backdrop-filter: blur(16px); overflow: hidden; animation: fup .4s ease both; }
        @keyframes fup { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .card-hdr { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--cb2); }
        .card-hdr-l { display: flex; flex-direction: column; gap: 2px; }
        .card-hdr-r { display: flex; align-items: center; gap: 8px; }
        .ct { font-family: var(--fd); font-size: 13px; font-weight: 700; color: var(--txx); letter-spacing: .03em; }
        .cm { font-size: 9px; color: var(--td); letter-spacing: .08em; }

        /* TICKERS */
        .tgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; width: 100%; }
        .tc { background: var(--card); border: 1px solid var(--cb2); border-top: 2px solid var(--ac, var(--pu)); border-radius: var(--r); padding: 12px; display: flex; flex-direction: column; gap: 6px; transition: transform .2s, border-color .2s, box-shadow .2s; animation: fup .4s ease both; animation-delay: var(--d,0ms); cursor: default; position: relative; overflow: hidden; }
        .tc::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top left, var(--ac,transparent) 0%, transparent 60%); opacity: 0.04; pointer-events: none; }
        .tc:hover { transform: translateY(-3px); border-color: var(--cb); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .tc-head { display: flex; align-items: center; gap: 8px; }
        .asset-icon { flex-shrink: 0; border-radius: 10px; overflow: hidden; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
        .asset-icon img { width: 100%; height: 100%; object-fit: contain; padding: 2px; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; }
        .asset-icon.sym { background: color-mix(in srgb, var(--ac) 22%, transparent); border: 1px solid color-mix(in srgb, var(--ac) 40%, transparent); }
        .asset-icon-sym { font-size: 13px; font-weight: 800; color: var(--ac); text-transform: uppercase; letter-spacing: .02em; }
        .tc-meta { flex: 1; min-width: 0; }
        .tc-sym { font-family: var(--fd); font-size: 13px; font-weight: 700; line-height: 1.1; }
        .tc-name { font-size: 8px; color: var(--td); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tc-badge { font-size: 7px; padding: 2px 5px; border-radius: 4px; letter-spacing: .08em; text-transform: uppercase; flex-shrink: 0; }
        .tc-badge.crypto { background: rgba(153,69,255,.15); color: #9945ff; }
        .tc-badge.fx { background: rgba(96,165,250,.12); color: #60a5fa; }
        .tc-badge.commodity { background: rgba(252,211,77,.12); color: #fcd34d; }
        .tc-badge.equity { background: rgba(226,232,240,.1); color: #e2e8f0; }
        .tc-price-row { display: flex; align-items: baseline; justify-content: space-between; gap: 4px; }
        .tc-price { font-family: var(--fd); font-size: 15px; font-weight: 700; color: var(--txx); font-variant-numeric: tabular-nums; }
        .tc-pct { font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 4px; }
        .tc-pct.up { color: var(--gn); background: rgba(52,211,153,.1); }
        .tc-pct.dn { color: var(--rd); background: rgba(248,113,113,.1); }
        .tc-spark-row { display: flex; align-items: center; justify-content: space-between; }
        .tc-pct24 { font-size: 8px; }
        .tc-pct24.up { color: var(--gn); } .tc-pct24.dn { color: var(--rd); }
        .tc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; border-top: 1px solid var(--cb2); padding-top: 6px; }
        .tc-stat { display: flex; gap: 4px; align-items: baseline; }
        .tc-sk { font-size: 8px; color: var(--tm); text-transform: uppercase; }
        .tc-sv { font-size: 9px; color: var(--td); font-variant-numeric: tabular-nums; }

        /* SKELETON */
        .tc-skeleton { pointer-events: none; }
        .tc-skeleton .sk-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(90deg,rgba(139,92,246,.15) 25%,rgba(139,92,246,.08) 50%,rgba(139,92,246,.15) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-meta { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .tc-skeleton .sk-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg,rgba(139,92,246,.12) 25%,rgba(139,92,246,.06) 50%,rgba(139,92,246,.12) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-line.w6 { width: 35px; } .tc-skeleton .sk-line.w8 { width: 48px; } .tc-skeleton .sk-line.w10 { width: 55px; } .tc-skeleton .sk-line.w12 { width: 70px; } .tc-skeleton .sk-line.w14 { width: 72px; }
        .tc-skeleton .sk-badge { width: 40px; height: 14px; border-radius: 4px; background: linear-gradient(90deg,rgba(139,92,246,.1) 25%,rgba(139,92,246,.05) 50%,rgba(139,92,246,.1) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-spark { width: 80px; height: 32px; border-radius: 4px; background: linear-gradient(90deg,rgba(139,92,246,.08) 25%,rgba(139,92,246,.04) 50%,rgba(139,92,246,.08) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-stat { height: 12px; border-radius: 3px; background: linear-gradient(90deg,rgba(139,92,246,.08) 25%,rgba(139,92,246,.04) 50%,rgba(139,92,246,.08) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        @keyframes shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ERROR BANNER */
        .err-banner { display: flex; align-items: center; gap: 8px; padding: 10px 16px; margin-bottom: 12px; background: rgba(251,146,60,.12); border: 1px solid rgba(251,146,60,.35); border-radius: var(--r); color: #fb923c; font-size: 11px; }
        .err-banner-icon { font-size: 14px; }

        /* LEGEND */
        .leg { display: flex; align-items: center; gap: 5px; }
        .legbar { width: 60px; height: 6px; border-radius: 3px; background: linear-gradient(90deg,#f87171,rgba(139,92,246,.3),#34d399); }
        .leglb { font-size: 9px; font-weight: 700; }

        /* HEATMAP */
        .hmwrap { overflow-x: auto; padding: 10px; width: 100%; }
        .hm { border-collapse: separate; border-spacing: 2px; width: 100%; }
        .hm-corner { width: 72px; vertical-align: bottom; padding-bottom: 4px; }
        .hm-corner-txt { font-size: 7px; color: var(--tm); display: block; text-align: right; }
        .hm-cl { padding: 2px 1px; }
        .hm-cl-inner { writing-mode: vertical-lr; transform: rotate(180deg); display: flex; flex-direction: column; align-items: center; height: 56px; justify-content: flex-end; }
        .hm-cl-sym { font-size: 8px; font-weight: 700; letter-spacing: .03em; white-space: nowrap; }
        .hm-rl { padding-right: 6px; white-space: nowrap; }
        .hm-rl-inner { display: flex; align-items: center; gap: 5px; }
        .hm-rl-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .hm-cell { min-width: 44px; height: 40px; text-align: center; vertical-align: middle; font-size: 8px; font-weight: 700; border-radius: 5px; cursor: pointer; transition: filter .18s, transform .18s; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
        .hm-cell:hover { filter: brightness(1.4); transform: scale(1.08); z-index: 2; position: relative; }
        .hm-cell.diag { cursor: default; background: rgba(139,92,246,.04) !important; border: 1px solid rgba(139,92,246,.15); }
        .hm-cell.sel { outline: 2px solid rgba(255,255,255,.8); outline-offset: -1px; }
        .diag-sym { font-size: 8px; font-weight: 700; color: var(--td); }
        .xbtn { background: transparent; border: 1px solid var(--tm); color: var(--td); padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 10px; font-family: var(--fm); transition: all .2s; white-space: nowrap; }
        .xbtn:hover { border-color: var(--pud); color: var(--pul); }

        /* DETAIL PANEL */
        .detail-panel { animation: slideIn .28s ease both; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .dp-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .dp-left { padding: 16px; border-right: 1px solid var(--cb2); }
        .dp-right { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .dp-pair { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
        .dp-asset { text-align: center; }
        .dp-asset .asset-icon { margin: 0 auto; }
        .dp-asset .asset-icon-sym { font-size: 18px; }
        .dp-sym { font-family: var(--fd); font-size: 16px; font-weight: 800; margin-top: 4px; }
        .dp-aname { font-size: 9px; color: var(--td); margin-top: 2px; }
        .dp-mid { text-align: center; flex: 1; }
        .dp-corr { font-family: var(--fd); font-size: 42px; font-weight: 800; line-height: 1; transition: color .4s; }
        .dp-label { font-size: 9px; font-weight: 700; letter-spacing: .14em; margin-top: 4px; }
        .dp-desc { font-size: 9px; color: var(--td); margin-top: 4px; max-width: 140px; margin-left: auto; margin-right: auto; line-height: 1.4; }
        .dp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .dp-stat { background: rgba(0,0,0,.25); border: 1px solid var(--cb2); border-radius: var(--rs); padding: 7px 9px; }
        .dp-sk { font-size: 8px; color: var(--td); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 3px; }
        .dp-sv { font-size: 11px; color: var(--tx); }
        .dp-chart-title { font-size: 9px; color: var(--td); letter-spacing: .1em; text-transform: uppercase; }
        .dp-prices { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--cb2); padding-top: 8px; }
        .dp-price-row { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; }
        .dp-pval { font-variant-numeric: tabular-nums; color: var(--tx); flex: 1; }

        /* RANKINGS */
        .rgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rr { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-bottom: 1px solid var(--cb2); cursor: pointer; transition: background .15s; position: relative; overflow: hidden; animation: fup .3s ease both; animation-delay: calc(var(--i)*50ms); }
        .rr-bar { position: absolute; left: 0; top: 0; height: 100%; transition: width .5s; pointer-events: none; }
        .rr:hover { background: rgba(139,92,246,.06); }
        .rr:last-child { border-bottom: none; }
        .rr-num { width: 16px; font-size: 9px; color: var(--tm); flex-shrink: 0; z-index: 1; }
        .rr-pair { flex: 1; display: flex; align-items: center; gap: 5px; z-index: 1; flex-wrap: wrap; }
        .rr-sym { font-size: 11px; font-weight: 700; }
        .rr-cat { font-size: 7px; color: var(--td); padding: 1px 4px; border: 1px solid var(--tm); border-radius: 3px; }
        .rr-vs { font-size: 8px; color: var(--tm); }
        .rr-val { font-family: var(--fd); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; z-index: 1; }
        .rr-val.pos { color: var(--gn); } .rr-val.neg { color: var(--rd); }
        .rr-str { font-size: 7px; color: var(--td); letter-spacing: .08em; z-index: 1; white-space: nowrap; }

        /* FOOTER */
        .foot { display: flex; align-items: center; justify-content: space-between; padding: 10px 24px; font-size: 10px; color: var(--tm); border-top: 1px solid var(--cb2); position: relative; z-index: 1; flex-wrap: wrap; gap: 8px; }
        .foot-l { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .foot-r { display: flex; align-items: center; gap: 10px; }
        .foot-sep { color: var(--tm); }
        .foot-info { font-size: 9px; color: var(--tm); }
        .fl { color: var(--pul); text-decoration: none; } .fl:hover { text-decoration: underline; }
        .fbk-btn { background: transparent; border: 1px solid var(--cb); color: var(--pul); padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 10px; font-family: var(--fm); transition: all .2s; }
        .fbk-btn:hover { background: var(--pud); border-color: var(--pu); }

        /* MODAL */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); animation: fadein .2s ease; }
        @keyframes fadein { from{opacity:0} to{opacity:1} }
        .modal { background: #0c0917; border: 1px solid var(--cb); border-radius: var(--r); width: min(500px, 94vw); overflow: hidden; animation: fup .22s ease; }
        .modal-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
        .fta { width: 100%; padding: 10px 12px; background: rgba(0,0,0,.4); border: 1px solid var(--cb); border-radius: var(--rs); color: var(--tx); font-family: var(--fm); font-size: 12px; resize: vertical; outline: none; transition: border-color .2s; }
        .fta:focus { border-color: var(--pu); }
        .fsend { padding: 10px; background: var(--pud); border: 1px solid var(--pu); border-radius: var(--rs); color: #fff; font-family: var(--fd); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; }
        .fsend:hover:not(:disabled) { background: var(--pu); }
        .fsend:disabled { opacity: .4; cursor: default; }
        .sent { padding: 28px; text-align: center; font-size: 16px; color: var(--gn); }

        /* SCROLLBAR */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--pud); border-radius: 2px; }

        /* RESPONSIVE */
        @media(max-width:1024px) {
          .dp-body { grid-template-columns: 1fr; }
          .dp-left { border-right: none; border-bottom: 1px solid var(--cb2); }
          .hdr-stats { display: none; }
        }
        @media(max-width:768px) {
          .main { padding: 10px 12px; }
          .hdr { padding: 10px 14px; }
          .fbar { padding: 7px 12px; }
          .rgrid { grid-template-columns: 1fr; }
          .hm-cell { width: 34px; height: 34px; font-size: 7px; }
          .hm-cl-inner { height: 44px; }
          .dp-corr { font-size: 32px; }
          .dp-sym { font-size: 14px; }
        }
        /* Charts overlay */
        .charts-overlay {
          position: fixed;
          top: 62px; left: 0; right: 0; bottom: 0;
          z-index: 500;
          background: #070512;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
          display: flex;
          flex-direction: column;
        }
        .charts-overlay--open {
          transform: translateX(0);
          pointer-events: all;
        }
        @media(max-width:480px) {
          .hdr-sub { display: none; }
          .tgrid { grid-template-columns: 1fr 1fr; }
          .hdr-upd { display: none; }
        }


      `}</style>

    {/* Charts overlay */}
    <div className={`charts-overlay${activeTab==="charts"?" charts-overlay--open":""}`}>
      <ChartsTab assets={ASSETS} ohlcvRef={ohlcvRef} histRef={histRef} prices={prices} chartAsset={chartAsset} setChartAsset={setChartAsset} chartTf={chartTf} setChartTf={setChartTf} chartType={chartType} setChartType={setChartType} setActiveTab={setActiveTab}/>
    </div>
  </div>
  );
}

/* ── CHARTS TAB ─────────────────────────────────────────────────────────── */
const TF_LIST    = ["1m","5m","15m","1h","4h","1d"];
const TF_SECS_C  = {"1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1d":86400};

// Merge live Pyth ticks into Binance candles
function mergeLive(base, liveMap, symbol, tf) {
  if (!base || !base.length) return base || [];
  const secs  = TF_SECS_C[tf] || 60;
  const now   = Math.floor(Date.now() / 1000);
  const barT  = Math.floor(now / secs) * secs;
  const price = liveMap[symbol];
  if (!price) return base;

  const copy = base.map(b => ({...b}));
  const last = copy[copy.length - 1];

  if (last && last.t === barT) {
    last.h = Math.max(last.h, price);
    last.l = Math.min(last.l, price);
    last.c = price;
    last.n = (last.n||1) + 1;
  } else if (!last || barT > last.t) {
    // New candle — open = previous close
    const prevClose = last ? last.c : price;
    copy.push({ t: barT, o: prevClose, h: Math.max(prevClose,price), l: Math.min(prevClose,price), c: price, v: 0, n: 1 });
    // Keep max 500 candles
    if (copy.length > 500) copy.shift();
  }
  return copy;
}

function drawChart(canvas, bars, chartType) {
  if (!canvas) return;
  const parent = canvas.parentElement;
  if (!parent) return;
  const W = parent.clientWidth;
  const H = parent.clientHeight;
  if (W < 20 || H < 20) return;
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#070512";
  ctx.fillRect(0, 0, W, H);

  if (!bars || bars.length < 2) {
    ctx.fillStyle = "rgba(139,92,246,0.4)";
    ctx.font = "13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Loading chart data…", W / 2, H / 2);
    return;
  }

  // Layout
  const PAD = { t: 16, r: 72, b: 28, l: 4 };
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;

  const vis = bars.slice(-200);
  const n   = vis.length;

  // Price range from OHLC only
  const dMin = Math.min(...vis.map(b => b.l));
  const dMax = Math.max(...vis.map(b => b.h));
  const dR   = dMax - dMin || dMax * 0.002 || 1;
  const yMin = dMin - dR * 0.04;
  const yMax = dMax + dR * 0.08; // extra top padding
  const yR   = yMax - yMin;

  // Chart area = top 80% of CH, volume = bottom 18%
  const PRICE_H = CH * 0.80;
  const VOL_H   = CH * 0.16;
  const GAP     = CH * 0.04;

  const toY = v => PAD.t + PRICE_H * (1 - (v - yMin) / yR);
  const colW = CW / n;
  const toX  = i => PAD.l + (i + 0.5) * colW;

  // Grid lines in price area
  ctx.setLineDash([2, 4]);
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const v = yMin + (yR / 5) * i;
    const y = toY(v);
    if (y < PAD.t || y > PAD.t + PRICE_H) continue;
    ctx.strokeStyle = "rgba(139,92,246,0.09)";
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
    const lbl = v >= 10000 ? v.toFixed(0) : v >= 100 ? v.toFixed(1) : v >= 1 ? v.toFixed(4) : v.toFixed(6);
    ctx.fillStyle = "rgba(110,90,170,0.55)";
    ctx.font = "9px monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(lbl, W - PAD.r + 4, y);
  }
  ctx.setLineDash([]);

  // Volume bars — in the bottom VOL_H strip
  const volTop = PAD.t + PRICE_H + GAP;
  const volBase = volTop + VOL_H;
  const vols = vis.map(b => b.v || 0);
  const maxV = Math.max(...vols, 1); // never 0
  vis.forEach((b, i) => {
    const x   = toX(i);
    const bw  = Math.max(1, colW * 0.7);
    const pct = (b.v || 0) / maxV;
    const vh  = pct * VOL_H;
    if (vh < 0.5) return;
    ctx.fillStyle = b.c >= b.o ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)";
    ctx.fillRect(x - bw / 2, volBase - vh, bw, vh);
  });

  // Candles / Line in price area
  if (chartType === "line") {
    const up  = vis[vis.length - 1].c >= vis[0].o;
    const col = up ? "#34d399" : "#f87171";
    const grad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + PRICE_H);
    grad.addColorStop(0, up ? "rgba(52,211,153,0.18)" : "rgba(248,113,113,0.18)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath();
    vis.forEach((b, i) => { const x=toX(i), y=toY(b.c); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.lineTo(toX(n-1), PAD.t+PRICE_H); ctx.lineTo(toX(0), PAD.t+PRICE_H);
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.lineJoin = "round";
    ctx.beginPath();
    vis.forEach((b, i) => { const x=toX(i), y=toY(b.c); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke();
  } else {
    const bw = Math.max(1, colW * 0.65);
    vis.forEach((b, i) => {
      const x   = toX(i);
      const up  = b.c >= b.o;
      const col = up ? "rgba(52,211,153,0.9)" : "rgba(248,113,113,0.9)";
      // Wick — clipped to price area
      const wickTop = Math.max(PAD.t, toY(b.h));
      const wickBot = Math.min(PAD.t + PRICE_H, toY(b.l));
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, wickTop); ctx.lineTo(x, wickBot); ctx.stroke();
      // Body
      const rawTop = Math.min(toY(b.o), toY(b.c));
      const rawBot = Math.max(toY(b.o), toY(b.c));
      const bodyTop = Math.max(PAD.t, rawTop);
      const bodyBot = Math.min(PAD.t + PRICE_H, rawBot);
      const bodyH   = Math.max(1, bodyBot - bodyTop);
      ctx.fillStyle = col;
      ctx.fillRect(x - bw/2, bodyTop, bw, bodyH);
      if (bw > 3) { ctx.strokeStyle = col; ctx.lineWidth = 0.5; ctx.strokeRect(x - bw/2, bodyTop, bw, bodyH); }
    });
  }

  // Time axis
  const step = Math.max(1, Math.floor(n / 8));
  ctx.fillStyle = "rgba(100,80,160,0.5)";
  ctx.font = "8px monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  vis.forEach((b, i) => {
    if (i % step === 0) {
      const d = new Date(b.t * 1000);
      const tfS = b.tfSecs || 60;
      const lbl = tfS >= 86400
        ? d.toLocaleDateString("en",{month:"short",day:"numeric"})
        : d.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",hour12:false});
      ctx.fillText(lbl, toX(i), volBase + 3);
    }
  });

  // Current price line
  if (vis.length) {
    const last = vis[vis.length-1].c;
    const y    = toY(last);
    if (y >= PAD.t && y <= PAD.t + PRICE_H) {
      const up = last >= vis[0].o;
      ctx.strokeStyle = up ? "rgba(52,211,153,0.5)" : "rgba(248,113,113,0.5)";
      ctx.lineWidth = 1; ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W-PAD.r, y); ctx.stroke();
      ctx.setLineDash([]);
      const lbl = last>=10000?last.toFixed(0):last>=100?last.toFixed(1):last>=1?last.toFixed(4):last.toFixed(6);
      ctx.fillStyle = up ? "#34d399" : "#f87171";
      ctx.fillRect(W-PAD.r+2, y-7, PAD.r-4, 14);
      ctx.fillStyle = "#000"; ctx.font = "bold 8px monospace";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(lbl, W-PAD.r+5, y);
    }
  }
}


function CandleChart({ bars, chartType }) {
  const ref    = useRef();
  const latest = useRef({ bars, chartType });
  latest.current = { bars, chartType };

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const redraw = () => drawChart(c, latest.current.bars, latest.current.chartType);
    redraw();
    const ro = new ResizeObserver(redraw);
    if (c.parentElement) ro.observe(c.parentElement);
    return () => ro.disconnect();
  // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (ref.current) drawChart(ref.current, bars, chartType);
  }, [bars, chartType]);

  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>;
}

function ChartsTab({ assets, ohlcvRef, histRef, prices, chartAsset, setChartAsset, chartTf, setChartTf, chartType, setChartType, setActiveTab }) {
  // histCandles: { [symbol]: { [tf]: Bar[] } } — from Binance
  const [histCandles, setHistCandles] = useState({});
  const [loadingAsset, setLoadingAsset] = useState(null);
  const [, redraw] = useState(0);

  // Fetch Binance history whenever asset or TF changes
  useEffect(() => {
    let cancelled = false;
    const BINANCE_MAP = {
      "BTC":"BTCUSDT","ETH":"ETHUSDT","SOL":"SOLUSDT","DOGE":"DOGEUSDT",
      "USDC":"USDCUSDT","XAU/USD":"XAUUSDT","EUR/USD":"EURUSDT","GBP/USD":"GBPUSDT"
    };
    async function load() {
      setLoadingAsset(chartAsset);
      const sym = BINANCE_MAP[chartAsset];
      if (!sym) { if (!cancelled) setLoadingAsset(null); return; }
      try {
        const url = `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${chartTf}&limit=300`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Binance ${res.status}`);
        const raw = await res.json();
        const candles = raw.map(k => ({
          t: Math.floor(k[0]/1000), o: parseFloat(k[1]),
          h: parseFloat(k[2]), l: parseFloat(k[3]),
          c: parseFloat(k[4]), v: parseFloat(k[5]), n: parseInt(k[8])||1
        }));
        if (!cancelled && candles.length) {
          setHistCandles(prev => ({
            ...prev,
            [chartAsset]: { ...(prev[chartAsset]||{}), [chartTf]: candles }
          }));
        }
      } catch (e) {
        console.warn("Binance fetch failed:", e.message);
      } finally {
        if (!cancelled) setLoadingAsset(null);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [chartAsset, chartTf]);

  // Live redraw every 1s for smooth price updates
  useEffect(() => {
    const iv = setInterval(() => redraw(n => n + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const asset  = assets.find(a => a.symbol === chartAsset) || assets[0];
  // Merge: Binance history base + live Pyth price on top
  const base   = (histCandles[chartAsset] || {})[chartTf] || [];
  const liveCandles = (ohlcvRef.current[chartAsset] || {})[chartTf] || [];

  // Use Binance if available, else fall back to Pyth-accumulated
  const rawBars = base.length ? mergeLive(base, prices, chartAsset, chartTf) : liveCandles;
  // Tag with tfSecs for time axis
  const bars = rawBars.map(b => ({ ...b, tfSecs: TF_SECS_C[chartTf] || 60 }));

  const h     = histRef.current[chartAsset] || [];
  const cur   = prices[chartAsset];
  const prev  = h.length > 1 ? h[0] : (base.length ? base[0].o : null);
  const pct   = prev && cur ? (cur - prev) / prev * 100 : null;
  const hiBar = bars.length ? Math.max(...bars.map(b => b.h)) : null;
  const loBar = bars.length ? Math.min(...bars.map(b => b.l)) : null;

  function fmt(sym, v) {
    if (!v) return "–";
    if (v >= 10000) return "$" + v.toLocaleString(undefined, {maximumFractionDigits:0});
    if (v >= 100)   return "$" + v.toFixed(2);
    if (v >= 1)     return "$" + v.toFixed(4);
    return "$" + v.toFixed(6);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#070512",fontFamily:"'Space Mono',monospace"}}>

      {/* Top nav row */}
      <div style={{display:"flex",alignItems:"center",gap:0,flexShrink:0,borderBottom:"1px solid rgba(139,92,246,0.25)",background:"rgba(7,5,18,1)",minHeight:48}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 14px",borderRight:"1px solid rgba(139,92,246,0.15)",flexShrink:0}}>
          <span style={{fontSize:16,fontFamily:"'Outfit',sans-serif",fontWeight:800,color:"#8b5cf6"}}>PYTH</span>
          <span style={{fontSize:9,color:"rgba(139,92,246,0.4)",letterSpacing:".1em"}}>CHARTS</span>
        </div>
        <div style={{display:"flex",overflowX:"auto",flex:1,scrollbarWidth:"none"}}>
        {assets.map(a => {
          const p  = prices[a.symbol];
          const hh = histRef.current[a.symbol] || [];
          const hb = (histCandles[a.symbol] || {})[chartTf] || [];
          const p0 = hh.length > 1 ? hh[0] : (hb.length ? hb[0].o : null);
          const pc = p0 && p ? (p - p0) / p0 * 100 : null;
          const sel = chartAsset === a.symbol;
          return (
            <button key={a.symbol} onClick={() => setChartAsset(a.symbol)}
              style={{flexShrink:0,padding:"8px 14px",background:"transparent",border:"none",
                borderBottom: sel ? `2px solid ${a.color}` : "2px solid transparent",
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:2,transition:"background .15s"}}>
              <span style={{fontSize:11,fontWeight:700,color:sel?a.color:"rgba(180,160,220,0.55)",letterSpacing:".04em"}}>{a.symbol}</span>
              <span style={{fontSize:10,color:sel?"#e2d9f3":"rgba(130,110,170,0.45)",fontVariantNumeric:"tabular-nums"}}>{fmt(a.symbol,p)}</span>
              {pc!==null&&<span style={{fontSize:8,color:pc>=0?"#34d399":"#f87171"}}>{pc>=0?"+":""}{pc.toFixed(2)}%</span>}
            </button>
          );
        })}
        </div>
        <button onClick={()=>setActiveTab&&setActiveTab("matrix")}
          style={{flexShrink:0,padding:"0 16px",background:"transparent",border:"none",
            borderLeft:"1px solid rgba(139,92,246,0.15)",cursor:"pointer",height:"100%",minHeight:48,
            color:"rgba(139,92,246,0.6)",fontSize:10,fontFamily:"inherit",whiteSpace:"nowrap",
            transition:"color .15s"}}
          onMouseEnter={e=>e.target.style.color="#a78bfa"}
          onMouseLeave={e=>e.target.style.color="rgba(139,92,246,0.6)"}>
          ← Matrix
        </button>
      </div>

      {/* Info bar */}
      <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0,padding:"7px 16px",borderBottom:"1px solid rgba(139,92,246,0.1)",flexWrap:"wrap",background:"rgba(7,5,18,0.96)"}}>
        <span style={{fontSize:18,color:asset.color}}>{asset.icon}</span>
        <span style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:800,color:asset.color}}>{asset.symbol}</span>
        <span style={{fontFamily:"'Outfit',sans-serif",fontSize:20,fontWeight:800,color:"#f0eaff",fontVariantNumeric:"tabular-nums"}}>{fmt(asset.symbol,cur)}</span>
        {pct!==null&&<span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:4,color:pct>=0?"#34d399":"#f87171",background:pct>=0?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)"}}>
          {pct>=0?"+":""}{pct.toFixed(3)}%
        </span>}
        <div style={{display:"flex",gap:12,fontSize:10,color:"rgba(110,90,160,0.55)",marginLeft:"auto",flexWrap:"wrap"}}>
          {hiBar&&<span>H: <b style={{color:"#34d399"}}>{fmt(asset.symbol,hiBar)}</b></span>}
          {loBar&&<span>L: <b style={{color:"#f87171"}}>{fmt(asset.symbol,loBar)}</b></span>}
          <span>Candles: <b style={{color:"#a78bfa"}}>{bars.length}</b></span>
          {loadingAsset===chartAsset
            ? <span style={{color:"#8b5cf6"}}>⟳ Loading…</span>
            : <span style={{color:"rgba(80,60,120,0.5)"}}>{base.length?"Binance+Pyth":"Pyth only"}</span>}
        </div>
      </div>

      {/* Controls */}
      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,padding:"5px 14px",borderBottom:"1px solid rgba(139,92,246,0.08)",background:"rgba(7,5,18,0.95)"}}>
        <div style={{display:"flex",gap:1,background:"rgba(0,0,0,0.5)",borderRadius:5,padding:2}}>
          {TF_LIST.map(tf=>(
            <button key={tf} onClick={()=>setChartTf(tf)}
              style={{background:chartTf===tf?"rgba(139,92,246,0.4)":"transparent",border:"none",borderRadius:4,
                cursor:"pointer",color:chartTf===tf?"#fff":"rgba(100,80,160,0.55)",
                fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:chartTf===tf?700:400,transition:"all .15s"}}>{tf}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:1,background:"rgba(0,0,0,0.5)",borderRadius:5,padding:2,marginLeft:4}}>
          {[["candle","🕯"],["line","📈"]].map(([k,ic])=>(
            <button key={k} onClick={()=>setChartType(k)}
              style={{background:chartType===k?"rgba(139,92,246,0.4)":"transparent",border:"none",borderRadius:4,
                cursor:"pointer",color:chartType===k?"#fff":"rgba(100,80,160,0.55)",
                fontSize:10,padding:"3px 11px",fontFamily:"inherit",transition:"all .15s"}}>{ic}</button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div style={{flex:1,position:"relative",minHeight:0}}>
        <CandleChart bars={bars} chartType={chartType}/>
      </div>
    </div>
  );
}