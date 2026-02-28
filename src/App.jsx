import { useState, useEffect, useRef, useCallback } from "react";

/* ─── ASSETS ─────────────────────────────────────────────────────────────── */
const ASSETS = [
  { id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", symbol: "BTC",     name: "Bitcoin",   category: "crypto",    color: "#F7931A" },
  { id: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", symbol: "ETH",     name: "Ethereum",  category: "crypto",    color: "#8B9FFF" },
  { id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL",     name: "Solana",    category: "crypto",    color: "#9945FF" },
  { id: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a461c54d397a53f6f2a1e3cf07c", symbol: "DOGE",    name: "Dogecoin",  category: "crypto",    color: "#C8A84B" },
  { id: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", symbol: "USDC",    name: "USD Coin",  category: "crypto",    color: "#2775CA" },
  { id: "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", symbol: "EUR/USD", name: "Euro",      category: "fx",        color: "#60A5FA" },
  { id: "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1", symbol: "GBP/USD", name: "Pound",     category: "fx",        color: "#34D399" },
  { id: "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", symbol: "XAU/USD", name: "Gold",      category: "commodity", color: "#FCD34D" },
  { id: "c9d8b075a5c69303365ae23632d4e2560c5caa6a73b04100c51cfa985ba4aa0e", symbol: "WTI",     name: "Oil",       category: "commodity", color: "#FB923C" },
  { id: "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", symbol: "AAPL",    name: "Apple",     category: "equity",    color: "#CBD5E1" },
];

const SEED = { BTC:65000, ETH:3200, SOL:140, DOGE:0.15, USDC:1, "EUR/USD":1.085, "GBP/USD":1.265, "XAU/USD":2320, WTI:78, AAPL:185 };

const FAQ = [
  { q: "What is the Correlation Matrix?", a: "It shows how closely two assets move together in real-time. A value near +1 means they move in the same direction, near -1 means opposite, and near 0 means no relationship." },
  { q: "Where does the data come from?", a: "All prices are pulled directly from Pyth Network — a decentralized oracle with 400+ price feeds updated every 400ms, sourced from 120+ institutional publishers like Binance, Jane Street and Cboe." },
  { q: "What does Demo / Live mode mean?", a: "Live means real prices from Pyth Hermes API are flowing in. Demo mode activates automatically if the API is unreachable — it simulates realistic price movements so the tool stays functional." },
  { q: "How do I read the heatmap?", a: "Each cell shows the Pearson correlation coefficient between two assets, calculated over a rolling 200-tick window (~10 minutes). Green = positive correlation, Red = negative. Click any cell to see the full history chart for that pair." },
  { q: "What assets are tracked?", a: "10 assets across 4 categories: Crypto (BTC, ETH, SOL, DOGE, USDC), FX pairs (EUR/USD, GBP/USD), Commodities (XAU/USD Gold, WTI Oil), and Equities (AAPL)." },
  { q: "How often does data update?", a: "The dashboard polls Pyth every 3 seconds. Correlations are recalculated on every new price tick using a rolling window of the last 200 samples." },
  { q: "What is the Pyth Playground Hackathon?", a: "A 6-week community event by the Pyth Community Council (March 4 – April 15, 2025) where builders create apps using Pyth data. This tool was built as a hackathon submission." },
];

const IMPROVEMENTS = [
  { icon: "⚡", title: "WebSocket streaming", desc: "Sub-second live updates instead of polling every 3s" },
  { icon: "📊", title: "Confidence interval overlay", desc: "Visualize Pyth's unique confidence bands on each price" },
  { icon: "🔔", title: "Correlation alerts", desc: "Notify when a pair crosses a user-defined threshold" },
  { icon: "📥", title: "Export to CSV", desc: "Download correlation history for offline analysis" },
  { icon: "🌐", title: "More assets", desc: "Add indices (SPX, NDX), altcoins, and more FX pairs" },
  { icon: "🔗", title: "On-chain integration", desc: "Connect directly to Pyth smart contracts on Solana/EVM" },
];

/* ─── MATH ───────────────────────────────────────────────────────────────── */
function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 4) return null;
  const ax = a.slice(-n), bx = b.slice(-n);
  const ma = ax.reduce((s,v)=>s+v,0)/n, mb = bx.reduce((s,v)=>s+v,0)/n;
  let num=0,da=0,db=0;
  for(let i=0;i<n;i++){const ai=ax[i]-ma,bi=bx[i]-mb;num+=ai*bi;da+=ai*ai;db+=bi*bi;}
  const d=Math.sqrt(da*db);
  return d===0?0:Math.max(-1,Math.min(1,num/d));
}

function corrColor(v) {
  if (v===null) return "rgba(109,40,217,0.07)";
  if (v>=0) return `rgba(52,${Math.round(180+v*75)},${Math.round(100+v*100)},${0.12+v*0.55})`;
  const t=-v;
  return `rgba(${Math.round(200+t*55)},${Math.round(70-t*50)},${Math.round(80-t*60)},${0.12+t*0.55})`;
}
function corrText(v) {
  if (v===null) return "#6b5a8a";
  return Math.abs(v)>0.45?"rgba(255,255,255,0.92)":"rgba(196,181,253,0.85)";
}
function fmt(sym,val) {
  if (!val) return "–";
  if (sym==="USDC") return `$${val.toFixed(4)}`;
  if (["EUR/USD","GBP/USD"].includes(sym)) return val.toFixed(5);
  if (val>1000) return `$${val.toLocaleString(undefined,{maximumFractionDigits:0})}`;
  if (val>1) return `$${val.toFixed(2)}`;
  return `$${val.toFixed(5)}`;
}
function strengthLabel(v) {
  if (v===null) return "computing…";
  const a=Math.abs(v);
  if (a>0.8) return v>0?"Very Strong Positive ▲":"Very Strong Negative ▼";
  if (a>0.5) return v>0?"Strong Positive ▲":"Strong Negative ▼";
  if (a>0.3) return v>0?"Moderate Positive ▲":"Moderate Negative ▼";
  return "Weak / Neutral";
}

/* ─── SPARKLINE ──────────────────────────────────────────────────────────── */
function Sparkline({ data }) {
  if (!data||data.length<2) return <svg width="56" height="20"/>;
  const pts=data.slice(-40), mn=Math.min(...pts), mx=Math.max(...pts), rng=mx-mn||1;
  const d=pts.map((v,i)=>`${(i/(pts.length-1))*54+1},${18-((v-mn)/rng)*16}`).join(" ");
  const up=pts[pts.length-1]>=pts[0];
  return (
    <svg width="56" height="20">
      <polyline points={d} fill="none" stroke={up?"#a78bfa":"#f87171"} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── CORR CHART ─────────────────────────────────────────────────────────── */
function CorrChart({ symA, symB, histRef }) {
  const ref=useRef();
  useEffect(()=>{
    const ha=histRef.current[symA]||[], hb=histRef.current[symB]||[];
    const len=Math.min(ha.length,hb.length), pts=[];
    for(let i=4;i<=len;i++){const v=pearson(ha.slice(0,i),hb.slice(0,i));if(v!==null)pts.push(v);}
    const c=ref.current; if(!c||pts.length<2) return;
    const ctx=c.getContext("2d"), W=c.offsetWidth||400, H=90;
    c.width=W; c.height=H; ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(139,92,246,0.18)"; ctx.lineWidth=1; ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke(); ctx.setLineDash([]);
    const last=pts[pts.length-1];
    const g=ctx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,"rgba(139,92,246,0.6)");
    g.addColorStop(1,last>=0?"rgba(52,211,153,0.9)":"rgba(248,113,113,0.9)");
    ctx.strokeStyle=g; ctx.lineWidth=2.5; ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*0.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();
  });
  return <canvas ref={ref} style={{width:"100%",height:90,display:"block"}}/>;
}

/* ─── ANIMATED BACKGROUND ────────────────────────────────────────────────── */
function AnimBg() {
  return (
    <div className="animBg" aria-hidden="true">
      <div className="blob b1"/><div className="blob b2"/><div className="blob b3"/>
      <div className="blob b4"/><div className="blob b5"/>
      <div className="grid-overlay"/>
    </div>
  );
}

/* ─── PYTH LOGO ──────────────────────────────────────────────────────────── */
function PythLogo({ size=28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15.5" fill="url(#pg)" stroke="rgba(139,92,246,0.5)" strokeWidth="0.5"/>
      <path d="M10.5 22 L16 10 L21.5 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="17" r="2.5" fill="white"/>
      <defs><linearGradient id="pg" x1="0" y1="0" x2="32" y2="32"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#3b0764"/></linearGradient></defs>
    </svg>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────────── */
const TABS = ["matrix","faq","feedback","improvements"];
const TAB_LABELS = { matrix:"Matrix", faq:"FAQ", feedback:"Feedback", improvements:"Roadmap" };

export default function App() {
  const [prices,setPrices]     = useState({});
  const [history,setHistory]   = useState({});
  const [corr,setCorr]         = useState({});
  const [status,setStatus]     = useState("connecting");
  const [filter,setFilter]     = useState("all");
  const [selected,setSelected] = useState(null);
  const [tab,setTab]           = useState("matrix");
  const [mobileTab,setMobileTab] = useState("heatmap");
  const [mounted,setMounted]   = useState(false);
  const [faqOpen,setFaqOpen]   = useState(null);
  const [feedback,setFeedback] = useState({name:"",msg:"",sent:false});
  const histRef = useRef({});

  useEffect(()=>{setTimeout(()=>setMounted(true),80);},[]);

  function push(sym,price){
    if(!histRef.current[sym]) histRef.current[sym]=[];
    histRef.current[sym].push(price);
    if(histRef.current[sym].length>200) histRef.current[sym].shift();
  }

  const fetchPrices = useCallback(async()=>{
    try {
      const idList = ASSETS.map(a=>a.id).join(",");
      const res = await fetch(`/api/pyth?ids=${idList}`);
      if(!res.ok) throw new Error();
      const data = await res.json();
      const np={};
      data.parsed?.forEach(item=>{
        const asset=ASSETS.find(a=>a.id===item.id); if(!asset) return;
        const p=parseFloat(item.price.price)*Math.pow(10,item.price.expo);
        np[asset.symbol]=p; push(asset.symbol,p);
      });
      if(Object.keys(np).length>0){setPrices(np);setHistory({...histRef.current});setStatus("live");}
      else throw new Error();
    } catch {
      ASSETS.forEach(a=>{
        const h=histRef.current[a.symbol];
        const last=h?.length?h[h.length-1]:SEED[a.symbol]??100;
        push(a.symbol, last+(Math.random()-0.49)*last*0.0018);
      });
      setPrices(Object.fromEntries(ASSETS.map(a=>[a.symbol,histRef.current[a.symbol].slice(-1)[0]])));
      setHistory({...histRef.current}); setStatus("demo");
    }
  },[]);

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
    return dir==="pos"?pairs.sort((x,y)=>y.v-x.v).slice(0,5):pairs.sort((x,y)=>x.v-y.v).slice(0,5);
  }

  const selCorr=selected?corr[`${selected.a}-${selected.b}`]??null:null;
  const selA=selected?ASSETS.find(a=>a.symbol===selected.a):null;
  const selB=selected?ASSETS.find(a=>a.symbol===selected.b):null;

  const CATS = [
    {key:"all",label:"All Assets"},
    {key:"crypto",label:"Crypto"},
    {key:"fx",label:"FX Pairs"},
    {key:"equity",label:"Equities"},
    {key:"commodity",label:"Commodities"},
  ];

  return (
    <div className={`app${mounted?" on":""}`}>
      <AnimBg/>

      {/* ── HEADER ── */}
      <header className="hdr">
        <div className="hdr-brand">
          <PythLogo size={34}/>
          <div>
            <div className="hdr-name">
              <span className="c-white fw8">PYTH</span>
              <span className="c-purple3"> × </span>
              <span className="c-purple1">rustrell</span>
            </div>
            <div className="hdr-sub">Cross-Asset Correlation Matrix</div>
          </div>
        </div>
        <div className="hdr-right">
          <nav className="nav-tabs">
            {TABS.map(t=>(
              <button key={t} className={`nav-tab${tab===t?" act":""}`} onClick={()=>setTab(t)}>
                {TAB_LABELS[t]}
              </button>
            ))}
          </nav>
          <div className={`pill ${status}`}>
            <span className="dot"/>
            {status==="live"?"LIVE":status==="demo"?"DEMO":"..."}
          </div>
        </div>
      </header>

      {/* ── FILTER BAR — full width ── */}
      {tab==="matrix" && (
        <div className="filterbar">
          {CATS.map(c=>(
            <button key={c.key} className={`fb-btn${filter===c.key?" act":""}`} onClick={()=>setFilter(c.key)}>
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* ── MOBILE MATRIX TABS ── */}
      {tab==="matrix" && (
        <div className="mob-nav">
          {[["heatmap","Heatmap"],["tickers","Prices"],["top","Top Pairs"]].map(([k,l])=>(
            <button key={k} className={`mob-tab${mobileTab===k?" act":""}`} onClick={()=>setMobileTab(k)}>{l}</button>
          ))}
        </div>
      )}

      <main className="main">

        {/* ════════════════ MATRIX TAB ════════════════ */}
        {tab==="matrix" && (<>

          {/* Tickers */}
          <section className={`sec${mobileTab!=="tickers"?" desk-show mob-hide":""}`}>
            <div className="ticker-grid">
              {vis.map((a,i)=>{
                const h=history[a.symbol]||[], cur=prices[a.symbol];
                const prev=h.length>1?h[h.length-2]:null;
                const pct=prev&&cur?((cur-prev)/prev*100):null;
                return (
                  <div key={a.symbol} className="tcard" style={{"--ac":a.color,"--i":i}}>
                    <div className="tc-top">
                      <div>
                        <div className="tc-cat">{a.category}</div>
                        <div className="tc-sym" style={{color:a.color}}>{a.symbol}</div>
                      </div>
                      {pct!==null&&<span className={`tc-pct${pct>=0?" up":" dn"}`}>{pct>=0?"+":""}{pct.toFixed(2)}%</span>}
                    </div>
                    <div className="tc-bot">
                      <span className="tc-price">{fmt(a.symbol,cur)}</span>
                      <Sparkline data={h}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Heatmap */}
          <section className={`sec${mobileTab!=="heatmap"?" desk-show mob-hide":""}`}>
            <div className="card">
              <div className="card-hdr">
                <span className="card-title">Correlation Heatmap</span>
                <span className="card-meta">{vis.length}×{vis.length} · 200-tick rolling · click cell to inspect</span>
                <div className="legend">
                  <div className="legend-bar"/>
                  <span className="legend-lbl">−1</span>
                  <span className="legend-lbl ml">+1</span>
                </div>
              </div>
              <div className="map-wrap">
                <table className="map">
                  <thead><tr>
                    <th className="map-corner"/>
                    {vis.map(a=><th key={a.symbol} className="map-ch" style={{color:a.color}}>{a.symbol}</th>)}
                  </tr></thead>
                  <tbody>
                    {vis.map(rA=>(
                      <tr key={rA.symbol}>
                        <td className="map-rh" style={{color:rA.color}}>{rA.symbol}</td>
                        {vis.map(cB=>{
                          const key=`${rA.symbol}-${cB.symbol}`;
                          const val=corr[key]??null;
                          const diag=rA.symbol===cB.symbol;
                          const sel=selected&&((selected.a===rA.symbol&&selected.b===cB.symbol)||(selected.a===cB.symbol&&selected.b===rA.symbol));
                          return (
                            <td key={cB.symbol}
                              onClick={()=>!diag&&setSelected(sel?null:{a:rA.symbol,b:cB.symbol})}
                              className={`map-cell${diag?" diag":""}${sel?" sel":""}`}
                              style={{background:diag?"rgba(109,40,217,0.06)":corrColor(val),color:diag?"#5b4a7a":corrText(val)}}>
                              {diag?"·":val!==null?val.toFixed(2):"…"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail panel */}
            {selected&&(
              <div className="card detail-card">
                <div className="card-hdr">
                  <span className="card-title">Pair Analysis</span>
                  <button className="close-btn" onClick={()=>setSelected(null)}>✕</button>
                </div>
                <div className="detail-hero">
                  <div className="d-sym" style={{color:selA?.color}}>{selected.a}</div>
                  <div className="d-mid">
                    <div className="d-val" style={{color:selCorr===null?"#7c5cbf":selCorr>=0?"#34d399":"#f87171"}}>
                      {selCorr===null?"…":selCorr.toFixed(3)}
                    </div>
                    <div className="d-strength">{strengthLabel(selCorr)}</div>
                  </div>
                  <div className="d-sym" style={{color:selB?.color}}>{selected.b}</div>
                </div>
                <div className="chart-box">
                  <div className="chart-lbl">Rolling Correlation History</div>
                  <CorrChart symA={selected.a} symB={selected.b} histRef={histRef}/>
                </div>
                <div className="d-stats">
                  {[["Ticks",Math.min(history[selected.a]?.length||0,history[selected.b]?.length||0)],
                    ["Categories",`${selA?.category} / ${selB?.category}`],
                    ["Window","200 samples"],
                    ["Updated",new Date().toLocaleTimeString()]].map(([k,v])=>(
                    <div key={k} className="d-stat"><div className="d-stat-k">{k}</div><div className="d-stat-v">{v}</div></div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Top Pairs */}
          <section className={`sec${mobileTab!=="top"?" desk-show mob-hide":""}`}>
            <div className="two-col">
              {["pos","neg"].map(dir=>(
                <div key={dir} className="card">
                  <div className="card-hdr">
                    <span className="card-title" style={{color:dir==="pos"?"#34d399":"#f87171"}}>
                      {dir==="pos"?"▲ Strongest Positive":"▼ Strongest Negative"}
                    </span>
                  </div>
                  {topPairs(dir).map(({a,b,v},i)=>(
                    <div key={`${a.symbol}-${b.symbol}`} className="rank-row" style={{"--i":i}}
                      onClick={()=>{setSelected({a:a.symbol,b:b.symbol});setMobileTab("heatmap");}}>
                      <span className="rank-n">{i+1}</span>
                      <span className="rank-pair">
                        <span style={{color:a.color}}>{a.symbol}</span>
                        <span className="rank-vs"> vs </span>
                        <span style={{color:b.color}}>{b.symbol}</span>
                      </span>
                      <span className={`rank-v${dir==="pos"?" pos":" neg"}`}>{v.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

        </>)}

        {/* ════════════════ FAQ TAB ════════════════ */}
        {tab==="faq" && (
          <section className="sec page-sec">
            <div className="page-header">
              <h1 className="page-title">Frequently Asked Questions</h1>
              <p className="page-sub">Everything you need to know about the Pyth Correlation Matrix</p>
            </div>
            <div className="faq-list">
              {FAQ.map((item,i)=>(
                <div key={i} className={`faq-item${faqOpen===i?" open":""}`}>
                  <button className="faq-q" onClick={()=>setFaqOpen(faqOpen===i?null:i)}>
                    <span>{item.q}</span>
                    <span className="faq-icon">{faqOpen===i?"−":"+"}</span>
                  </button>
                  {faqOpen===i&&<div className="faq-a">{item.a}</div>}
                </div>
              ))}
            </div>
            <div className="support-box">
              <div className="support-icon">💬</div>
              <div>
                <div className="support-title">Need more help?</div>
                <div className="support-desc">Reach out directly via Telegram for questions, bugs, or collaboration.</div>
                <a href="https://t.me/xzolmoneythinks" target="_blank" rel="noreferrer" className="tg-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.44 14.617l-2.962-.924c-.642-.204-.657-.642.136-.953l11.57-4.461c.537-.194 1.006.131.378.969z"/></svg>
                  @xzolmoneythinks
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ════════════════ FEEDBACK TAB ════════════════ */}
        {tab==="feedback" && (
          <section className="sec page-sec">
            <div className="page-header">
              <h1 className="page-title">Send Feedback</h1>
              <p className="page-sub">Help improve the Pyth Correlation Matrix — your input matters</p>
            </div>
            {feedback.sent ? (
              <div className="card sent-card">
                <div className="sent-icon">✓</div>
                <div className="sent-title">Thank you!</div>
                <div className="sent-desc">Your feedback has been received. We'll review it shortly.</div>
                <button className="reset-btn" onClick={()=>setFeedback({name:"",msg:"",sent:false})}>Send another</button>
              </div>
            ) : (
              <div className="feedback-layout">
                <div className="card feedback-card">
                  <div className="card-hdr"><span className="card-title">Your Feedback</span></div>
                  <div className="form-body">
                    <div className="form-group">
                      <label className="form-label">Name or handle <span className="form-optional">(optional)</span></label>
                      <input
                        className="form-input"
                        placeholder="e.g. @cryptotrader"
                        value={feedback.name}
                        onChange={e=>setFeedback(f=>({...f,name:e.target.value}))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message <span className="form-req">*</span></label>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="What do you think? What's missing? What could be better?"
                        value={feedback.msg}
                        onChange={e=>setFeedback(f=>({...f,msg:e.target.value}))}
                        rows={5}
                      />
                    </div>
                    <button
                      className={`submit-btn${feedback.msg.trim().length>5?" ready":""}`}
                      onClick={()=>feedback.msg.trim().length>5&&setFeedback(f=>({...f,sent:true}))}
                    >
                      Send Feedback →
                    </button>
                  </div>
                </div>
                <div className="feedback-side">
                  <div className="card side-card">
                    <div className="card-hdr"><span className="card-title">Or reach me directly</span></div>
                    <div className="side-body">
                      <a href="https://t.me/xzolmoneythinks" target="_blank" rel="noreferrer" className="tg-btn large">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.44 14.617l-2.962-.924c-.642-.204-.657-.642.136-.953l11.57-4.461c.537-.194 1.006.131.378.969z"/></svg>
                        Telegram: @xzolmoneythinks
                      </a>
                      <p className="side-note">Response within 24 hours. Happy to discuss bugs, partnerships, or feature ideas.</p>
                    </div>
                  </div>
                  <div className="card side-card">
                    <div className="card-hdr"><span className="card-title">What to include</span></div>
                    <div className="side-body">
                      {["Describe the issue or idea clearly","Mention your device/browser if it's a bug","Share what you were trying to do","Screenshots are always helpful"].map((t,i)=>(
                        <div key={i} className="tip-row"><span className="tip-dot">·</span><span className="tip-text">{t}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ════════════════ IMPROVEMENTS TAB ════════════════ */}
        {tab==="improvements" && (
          <section className="sec page-sec">
            <div className="page-header">
              <h1 className="page-title">Roadmap & Improvements</h1>
              <p className="page-sub">Planned features and upgrades for the next version</p>
            </div>
            <div className="imp-grid">
              {IMPROVEMENTS.map((item,i)=>(
                <div key={i} className="imp-card card" style={{"--i":i}}>
                  <div className="imp-icon">{item.icon}</div>
                  <div className="imp-title">{item.title}</div>
                  <div className="imp-desc">{item.desc}</div>
                  <div className="imp-status">Planned</div>
                </div>
              ))}
            </div>
            <div className="support-box">
              <div className="support-icon">🚀</div>
              <div>
                <div className="support-title">Have an idea?</div>
                <div className="support-desc">Suggest features, vote on priorities, or contribute via Telegram.</div>
                <a href="https://t.me/xzolmoneythinks" target="_blank" rel="noreferrer" className="tg-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.04 9.613c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.44 14.617l-2.962-.924c-.642-.204-.657-.642.136-.953l11.57-4.461c.537-.194 1.006.131.378.969z"/></svg>
                  Suggest a feature
                </a>
              </div>
            </div>
          </section>
        )}

      </main>

      <footer className="footer">
        <PythLogo size={14}/>
        <span>Powered by <strong>Pyth Network</strong> · Pyth Playground Hackathon 2025 · Built by</span>
        <a href="https://t.me/xzolmoneythinks" target="_blank" rel="noreferrer" className="footer-link">@xzolmoneythinks</a>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --bg: #080612;
          --card: rgba(255,255,255,0.035);
          --card-b: rgba(139,92,246,0.12);
          --p1: #a78bfa;   /* light purple — readable text */
          --p2: #8b5cf6;   /* mid purple */
          --p3: #6d28d9;   /* deep purple */
          --p3a: rgba(109,40,217,0.3);
          --text: #e2d9f3;         /* primary text — warm white */
          --text2: #b8a9d9;        /* secondary text */
          --text3: #7c6a9e;        /* muted text */
          --text4: #4a3a6a;        /* very muted */
          --green: #34d399;
          --red:   #f87171;
          --fd: 'Syne', sans-serif;
          --fm: 'JetBrains Mono', monospace;
          --r: 12px; --rs: 8px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; }
        body { background: var(--bg); }

        /* ── App shell ── */
        .app { min-height:100vh; width:100%; color:var(--text); font-family:var(--fm);
          position:relative; overflow-x:hidden; display:flex; flex-direction:column;
          opacity:0; transition:opacity 0.7s ease; }
        .app.on { opacity:1; }

        /* ── Animated background ── */
        .animBg { position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
        .blob { position:absolute; border-radius:50%; filter:blur(90px); }
        .b1 { width:700px;height:700px;top:-200px;left:-200px;
          background:radial-gradient(circle,rgba(109,40,217,0.22) 0%,transparent 65%);
          animation:bf1 22s ease-in-out infinite; }
        .b2 { width:500px;height:500px;bottom:-100px;right:-150px;
          background:radial-gradient(circle,rgba(76,29,149,0.18) 0%,transparent 65%);
          animation:bf2 28s ease-in-out infinite; }
        .b3 { width:350px;height:350px;top:35%;left:55%;
          background:radial-gradient(circle,rgba(139,92,246,0.10) 0%,transparent 65%);
          animation:bf3 19s ease-in-out infinite; }
        .b4 { width:250px;height:250px;top:60%;left:20%;
          background:radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 65%);
          animation:bf4 24s ease-in-out infinite; }
        .b5 { width:180px;height:180px;top:15%;right:25%;
          background:radial-gradient(circle,rgba(124,58,237,0.07) 0%,transparent 65%);
          animation:bf5 16s ease-in-out infinite; }
        .grid-overlay {
          position:absolute;inset:0;
          background-image:linear-gradient(rgba(139,92,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,0.04) 1px,transparent 1px);
          background-size:48px 48px;
        }
        @keyframes bf1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(80px,50px) scale(1.08)}66%{transform:translate(-30px,80px) scale(0.95)}}
        @keyframes bf2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-60px,-40px) scale(1.1)}}
        @keyframes bf3{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.4)}}
        @keyframes bf4{0%,100%{transform:translate(0,0)}50%{transform:translate(40px,-60px)}}
        @keyframes bf5{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,40px)}}

        /* ── Header ── */
        .hdr { position:sticky;top:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;
          padding:14px 28px;
          background:rgba(8,6,18,0.88);backdrop-filter:blur(24px);
          border-bottom:1px solid var(--card-b); }
        .hdr-brand { display:flex;align-items:center;gap:12px; }
        .hdr-name { font-family:var(--fd);font-size:17px;font-weight:800;letter-spacing:0.04em; }
        .hdr-sub { font-size:10px;color:var(--text3);letter-spacing:0.16em;text-transform:uppercase;margin-top:1px; }
        .hdr-right { display:flex;align-items:center;gap:12px;flex-wrap:wrap; }
        .c-white{color:#fff;} .c-purple1{color:var(--p1);} .c-purple3{color:var(--p3a);} .fw8{font-weight:800;}

        /* Nav tabs in header */
        .nav-tabs { display:flex;gap:2px; }
        .nav-tab {
          padding:7px 14px;border-radius:8px;border:none;
          background:transparent;color:var(--text3);
          font-family:var(--fm);font-size:12px;cursor:pointer;
          transition:all 0.2s;
        }
        .nav-tab:hover{color:var(--text2);background:rgba(139,92,246,0.07);}
        .nav-tab.act{color:var(--p1);background:rgba(139,92,246,0.15);}

        /* Status pill */
        .pill{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-family:var(--fm);font-size:10px;font-weight:600;letter-spacing:0.12em;border:1px solid;}
        .pill.live{background:rgba(52,211,153,0.08);border-color:rgba(52,211,153,0.28);color:var(--green);}
        .pill.demo{background:rgba(251,146,60,0.08);border-color:rgba(251,146,60,0.28);color:#fb923c;}
        .pill.connecting{background:rgba(139,92,246,0.08);border-color:var(--p3a);color:var(--p1);}
        .dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}

        /* ── Filter bar — FULL WIDTH ── */
        .filterbar {
          position:relative;z-index:1;
          display:flex;
          background:rgba(8,6,18,0.75);backdrop-filter:blur(16px);
          border-bottom:1px solid var(--card-b);
        }
        .fb-btn {
          flex:1;
          padding:13px 8px;
          border:none;border-right:1px solid var(--card-b);
          background:transparent;color:var(--text3);
          font-family:var(--fm);font-size:12px;cursor:pointer;
          transition:all 0.2s;text-align:center;white-space:nowrap;
          letter-spacing:0.04em;
        }
        .fb-btn:last-child{border-right:none;}
        .fb-btn:hover{color:var(--p1);background:rgba(139,92,246,0.06);}
        .fb-btn.act{color:#fff;background:rgba(139,92,246,0.18);border-bottom:2px solid var(--p2);font-weight:600;}

        /* Mobile sub-nav */
        .mob-nav{display:none;}

        /* ── Main ── */
        .main{flex:1;padding:20px 28px;display:flex;flex-direction:column;gap:18px;position:relative;z-index:1;}

        /* ── Section / Cards ── */
        .sec{display:flex;flex-direction:column;gap:14px;animation:fadeUp 0.45s ease both;}
        .page-sec{max-width:900px;margin:0 auto;width:100%;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .card{background:var(--card);border:1px solid var(--card-b);border-radius:var(--r);backdrop-filter:blur(14px);overflow:hidden;}
        .card-hdr{padding:14px 18px 10px;display:flex;align-items:center;flex-wrap:wrap;gap:8px;border-bottom:1px solid var(--card-b);}
        .card-title{font-family:var(--fd);font-size:14px;font-weight:700;color:var(--text);letter-spacing:0.03em;}
        .card-meta{font-size:10px;color:var(--text3);}

        /* Legend */
        .legend{display:flex;align-items:center;gap:5px;margin-left:auto;}
        .legend-bar{width:50px;height:6px;border-radius:3px;background:linear-gradient(90deg,#f87171,rgba(139,92,246,0.2),#34d399);}
        .legend-lbl{font-size:9px;color:var(--text3);}.ml{margin-left:2px;}

        /* ── Tickers ── */
        .ticker-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px;}
        .tcard{
          background:var(--card);border:1px solid var(--card-b);border-left:2px solid var(--ac);
          border-radius:var(--rs);padding:11px 13px;
          transition:transform 0.2s,box-shadow 0.2s;
          animation:fadeUp 0.4s ease both;animation-delay:calc(var(--i)*35ms);
        }
        .tcard:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(139,92,246,0.12);}
        .tc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;}
        .tc-cat{font-size:9px;color:var(--text3);letter-spacing:0.1em;text-transform:uppercase;}
        .tc-sym{font-family:var(--fd);font-size:15px;font-weight:700;margin-top:2px;}
        .tc-pct{font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;}
        .tc-pct.up{color:var(--green);background:rgba(52,211,153,0.1);}
        .tc-pct.dn{color:var(--red);background:rgba(248,113,113,0.1);}
        .tc-bot{display:flex;justify-content:space-between;align-items:center;}
        .tc-price{font-size:13px;color:var(--text);font-variant-numeric:tabular-nums;}

        /* ── Heatmap ── */
        .map-wrap{overflow-x:auto;padding:12px 10px;}
        .map{border-collapse:separate;border-spacing:2px;}
        .map-corner{width:58px;}
        .map-ch{font-size:8px;font-weight:700;text-align:center;writing-mode:vertical-lr;transform:rotate(180deg);height:52px;padding:2px;white-space:nowrap;}
        .map-rh{font-size:9px;font-weight:700;padding-right:6px;white-space:nowrap;color:var(--text2);}
        .map-cell{width:40px;height:40px;text-align:center;font-size:8px;font-weight:600;
          border-radius:5px;cursor:pointer;transition:all 0.2s;font-variant-numeric:tabular-nums;}
        .map-cell:hover{filter:brightness(1.25);transform:scale(1.06);}
        .map-cell.diag{cursor:default;}
        .map-cell.sel{outline:2px solid rgba(255,255,255,0.6);outline-offset:-1px;}

        /* ── Detail panel ── */
        .detail-card{animation:slideIn 0.3s ease both;}
        @keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        .detail-hero{display:flex;align-items:center;justify-content:space-around;padding:18px 16px;}
        .d-sym{font-family:var(--fd);font-size:22px;font-weight:800;}
        .d-mid{text-align:center;}
        .d-val{font-family:var(--fd);font-size:38px;font-weight:800;line-height:1;transition:color 0.3s;}
        .d-strength{font-size:10px;color:var(--text3);letter-spacing:0.1em;margin-top:4px;}
        .chart-box{background:rgba(0,0,0,0.25);margin:0 12px;border-radius:var(--rs);padding:10px;border:1px solid var(--card-b);}
        .chart-lbl{font-size:9px;color:var(--text3);letter-spacing:0.12em;text-transform:uppercase;margin-bottom:8px;}
        .close-btn{margin-left:auto;background:transparent;border:1px solid var(--text4);color:var(--text3);padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s;font-family:var(--fm);}
        .close-btn:hover{border-color:var(--p3a);color:var(--p1);}
        .d-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px 12px 12px;}
        .d-stat{background:rgba(0,0,0,0.2);border-radius:var(--rs);padding:8px 10px;border:1px solid var(--card-b);}
        .d-stat-k{font-size:9px;color:var(--text3);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:3px;}
        .d-stat-v{font-size:11px;color:var(--text2);}

        /* ── Top pairs ── */
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .rank-row{display:flex;align-items:center;gap:10px;padding:10px 18px;
          border-bottom:1px solid rgba(139,92,246,0.06);cursor:pointer;transition:background 0.15s;
          animation:fadeUp 0.3s ease both;animation-delay:calc(var(--i)*55ms);}
        .rank-row:hover{background:rgba(139,92,246,0.06);}
        .rank-row:last-child{border-bottom:none;}
        .rank-n{width:18px;font-size:10px;color:var(--text4);}
        .rank-pair{flex:1;font-size:12px;font-weight:600;}
        .rank-vs{color:var(--text4);font-weight:400;}
        .rank-v{font-family:var(--fd);font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;}
        .rank-v.pos{color:var(--green);}.rank-v.neg{color:var(--red);}

        /* ── Page sections (FAQ/Feedback/Roadmap) ── */
        .page-header{margin-bottom:28px;text-align:center;}
        .page-title{font-family:var(--fd);font-size:28px;font-weight:800;color:var(--text);letter-spacing:-0.01em;margin-bottom:8px;}
        .page-sub{font-size:14px;color:var(--text3);line-height:1.5;}

        /* ── FAQ ── */
        .faq-list{display:flex;flex-direction:column;gap:6px;margin-bottom:24px;}
        .faq-item{background:var(--card);border:1px solid var(--card-b);border-radius:var(--rs);overflow:hidden;transition:border-color 0.2s;}
        .faq-item.open{border-color:rgba(139,92,246,0.3);}
        .faq-q{width:100%;display:flex;justify-content:space-between;align-items:center;
          padding:16px 18px;background:transparent;border:none;cursor:pointer;
          font-family:var(--fm);font-size:13px;font-weight:600;color:var(--text);
          text-align:left;gap:16px;transition:color 0.2s;}
        .faq-q:hover{color:var(--p1);}
        .faq-icon{color:var(--p2);font-size:18px;flex-shrink:0;font-weight:400;}
        .faq-a{padding:0 18px 16px;font-size:13px;color:var(--text2);line-height:1.65;border-top:1px solid var(--card-b);}

        /* ── Support box ── */
        .support-box{display:flex;align-items:flex-start;gap:16px;padding:20px;
          background:rgba(139,92,246,0.07);border:1px solid rgba(139,92,246,0.2);
          border-radius:var(--r);}
        .support-icon{font-size:28px;flex-shrink:0;}
        .support-title{font-family:var(--fd);font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px;}
        .support-desc{font-size:13px;color:var(--text2);margin-bottom:12px;line-height:1.5;}
        .tg-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;
          background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.4);
          border-radius:8px;color:var(--p1);font-size:12px;font-weight:600;
          text-decoration:none;transition:all 0.2s;font-family:var(--fm);}
        .tg-btn:hover{background:rgba(139,92,246,0.32);border-color:var(--p2);color:#fff;}
        .tg-btn.large{padding:11px 20px;font-size:13px;width:100%;justify-content:center;margin-bottom:12px;}

        /* ── Feedback ── */
        .feedback-layout{display:grid;grid-template-columns:1fr 360px;gap:14px;align-items:start;}
        .feedback-card,.side-card{animation:fadeUp 0.4s ease both;}
        .form-body{padding:18px;}
        .form-group{margin-bottom:16px;}
        .form-label{display:block;font-size:11px;color:var(--text2);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:7px;font-weight:600;}
        .form-optional{color:var(--text4);font-weight:400;text-transform:none;}
        .form-req{color:var(--red);}
        .form-input{width:100%;background:rgba(0,0,0,0.25);border:1px solid var(--card-b);
          border-radius:var(--rs);padding:10px 13px;
          color:var(--text);font-family:var(--fm);font-size:13px;
          outline:none;transition:border-color 0.2s;resize:vertical;}
        .form-input::placeholder{color:var(--text4);}
        .form-input:focus{border-color:rgba(139,92,246,0.4);}
        .form-textarea{min-height:120px;}
        .submit-btn{width:100%;padding:12px;border-radius:var(--rs);border:1px solid var(--card-b);
          background:rgba(139,92,246,0.1);color:var(--text3);
          font-family:var(--fm);font-size:13px;font-weight:600;cursor:pointer;
          transition:all 0.25s;letter-spacing:0.04em;}
        .submit-btn.ready{background:rgba(139,92,246,0.25);border-color:rgba(139,92,246,0.5);color:var(--p1);}
        .submit-btn.ready:hover{background:rgba(139,92,246,0.38);color:#fff;}
        .feedback-side{display:flex;flex-direction:column;gap:14px;}
        .side-body{padding:14px 16px;}
        .side-note{font-size:12px;color:var(--text3);line-height:1.55;}
        .tip-row{display:flex;gap:10px;margin-bottom:10px;}
        .tip-dot{color:var(--p2);font-size:16px;flex-shrink:0;line-height:1.3;}
        .tip-text{font-size:12px;color:var(--text2);line-height:1.5;}
        .sent-card{display:flex;flex-direction:column;align-items:center;padding:48px 32px;text-align:center;gap:12px;}
        .sent-icon{width:56px;height:56px;border-radius:50%;background:rgba(52,211,153,0.15);border:1px solid rgba(52,211,153,0.3);display:flex;align-items:center;justify-content:center;font-size:24px;color:var(--green);}
        .sent-title{font-family:var(--fd);font-size:22px;font-weight:800;color:var(--text);}
        .sent-desc{font-size:13px;color:var(--text2);max-width:320px;line-height:1.6;}
        .reset-btn{padding:9px 20px;border-radius:var(--rs);border:1px solid var(--card-b);background:transparent;color:var(--text3);font-family:var(--fm);font-size:12px;cursor:pointer;transition:all 0.2s;margin-top:8px;}
        .reset-btn:hover{border-color:var(--p3a);color:var(--p1);}

        /* ── Roadmap ── */
        .imp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:24px;}
        .imp-card{padding:20px;animation:fadeUp 0.4s ease both;animation-delay:calc(var(--i)*60ms);transition:transform 0.2s,box-shadow 0.2s;}
        .imp-card:hover{transform:translateY(-3px);box-shadow:0 8px 30px rgba(139,92,246,0.1);}
        .imp-icon{font-size:28px;margin-bottom:10px;}
        .imp-title{font-family:var(--fd);font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;}
        .imp-desc{font-size:12px;color:var(--text2);line-height:1.55;margin-bottom:12px;}
        .imp-status{display:inline-block;padding:3px 9px;border-radius:20px;font-size:10px;
          background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.25);color:var(--p1);
          letter-spacing:0.08em;}

        /* ── Footer ── */
        .footer{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;
          padding:14px 24px;font-size:11px;color:var(--text3);
          border-top:1px solid var(--card-b);position:relative;z-index:1;}
        .footer strong{color:var(--text2);}
        .footer-link{color:var(--p1);text-decoration:none;transition:color 0.2s;}
        .footer-link:hover{color:#fff;}

        /* ── Scrollbar ── */
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.25);border-radius:2px;}

        /* ── DESKTOP helpers ── */
        .desk-show{display:flex;}

        /* ── MOBILE ── */
        @media(max-width:900px){
          .feedback-layout{grid-template-columns:1fr;}
          .two-col{grid-template-columns:1fr;}
        }
        @media(max-width:768px){
          .hdr{padding:12px 16px;}
          .main{padding:12px 14px;gap:12px;}
          .hdr-sub{display:none;}
          .mob-nav{
            display:flex;position:relative;z-index:1;
            background:rgba(8,6,18,0.88);border-bottom:1px solid var(--card-b);
          }
          .mob-tab{flex:1;padding:12px 6px;border:none;background:transparent;
            color:var(--text3);font-family:var(--fm);font-size:12px;cursor:pointer;
            border-bottom:2px solid transparent;transition:all 0.2s;}
          .mob-tab.act{color:var(--p1);border-bottom-color:var(--p2);}
          .mob-hide{display:none!important;}
          .desk-show{display:flex;}
          .ticker-grid{grid-template-columns:repeat(2,1fr);}
          .imp-grid{grid-template-columns:1fr 1fr;}
          .page-title{font-size:22px;}
          .filterbar{overflow-x:auto;scrollbar-width:none;}
          .filterbar::-webkit-scrollbar{display:none;}
          .fb-btn{flex:0 0 auto;padding:11px 14px;font-size:11px;}
        }
        @media(max-width:480px){
          .hdr-name{font-size:14px;}
          .nav-tabs{display:none;}
          .ticker-grid{grid-template-columns:repeat(2,1fr);gap:6px;}
          .imp-grid{grid-template-columns:1fr;}
          .map-cell{width:30px;height:30px;font-size:7px;}
          .map-ch{font-size:7px;height:44px;}
        }
      `}</style>
    </div>
  );
}
