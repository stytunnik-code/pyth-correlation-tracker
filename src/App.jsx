import { useState, useEffect, useRef, useCallback } from "react";

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
  { id: "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", symbol: "AAPL",    name: "Apple",     category: "equity",    color: "#E2E8F0" },
];

const SEED = { BTC:65000, ETH:3200, SOL:140, DOGE:0.15, USDC:1, "EUR/USD":1.085, "GBP/USD":1.265, "XAU/USD":2320, WTI:78, AAPL:185 };
const HERMES = "/api/pyth";

function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 4) return null;
  const ax = a.slice(-n), bx = b.slice(-n);
  const ma = ax.reduce((s,v)=>s+v,0)/n, mb = bx.reduce((s,v)=>s+v,0)/n;
  let num=0, da=0, db=0;
  for(let i=0;i<n;i++){const ai=ax[i]-ma,bi=bx[i]-mb;num+=ai*bi;da+=ai*ai;db+=bi*bi;}
  const d=Math.sqrt(da*db);
  return d===0?0:Math.max(-1,Math.min(1,num/d));
}

function corrColor(v) {
  if (v===null) return "rgba(139,77,255,0.08)";
  if (v>=0) {
    const t=v;
    return `rgba(${Math.round(80)},${Math.round(200+t*55)},${Math.round(100+t*100)},${0.15+t*0.65})`;
  }
  const t=-v;
  return `rgba(${Math.round(220+t*35)},${Math.round(80-t*60)},${Math.round(100-t*80)},${0.15+t*0.65})`;
}

function corrTextColor(v) {
  if (v===null) return "#4a3a6a";
  if (Math.abs(v) > 0.5) return "#fff";
  return "#c4b5fd";
}

function fmt(sym, val) {
  if (!val) return "–";
  if (sym==="USDC") return `$${val.toFixed(4)}`;
  if (["EUR/USD","GBP/USD"].includes(sym)) return val.toFixed(5);
  if (val>1000) return `$${val.toLocaleString(undefined,{maximumFractionDigits:0})}`;
  if (val>1) return `$${val.toFixed(2)}`;
  return `$${val.toFixed(5)}`;
}

function corrLabel(v) { if (v===null) return "…"; return v.toFixed(2); }

function strengthLabel(v) {
  if (v===null) return "COMPUTING";
  const a=Math.abs(v);
  if (a>0.8) return v>0?"VERY STRONG ▲":"VERY STRONG ▼";
  if (a>0.5) return v>0?"STRONG ▲":"STRONG ▼";
  if (a>0.3) return v>0?"MODERATE ▲":"MODERATE ▼";
  return "WEAK / NEUTRAL";
}

function Sparkline({ data, color }) {
  if (!data || data.length < 2) return <svg width="56" height="22"/>;
  const pts = data.slice(-40);
  const mn=Math.min(...pts), mx=Math.max(...pts), rng=mx-mn||1;
  const d = pts.map((v,i)=>`${(i/(pts.length-1))*54+1},${20-((v-mn)/rng)*18}`).join(" ");
  const trend = pts[pts.length-1] >= pts[0];
  return (
    <svg width="56" height="22">
      <polyline points={d} fill="none" stroke={trend?"#a78bfa":"#f87171"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CorrChart({ symA, symB, histRef }) {
  const ref = useRef();
  useEffect(() => {
    const ha=histRef.current[symA]||[], hb=histRef.current[symB]||[];
    const len=Math.min(ha.length,hb.length);
    const pts=[];
    for(let i=4;i<=len;i++){
      const v=pearson(ha.slice(0,i),hb.slice(0,i));
      if(v!==null) pts.push(v);
    }
    const c=ref.current; if(!c||pts.length<2) return;
    const ctx=c.getContext("2d"), W=c.offsetWidth||300, H=80;
    c.width=W; c.height=H;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(139,92,246,0.2)"; ctx.lineWidth=1;
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
    ctx.setLineDash([]);
    const last=pts[pts.length-1];
    const grad=ctx.createLinearGradient(0,0,W,0);
    grad.addColorStop(0,"rgba(139,92,246,0.5)");
    grad.addColorStop(1,last>=0?"rgba(52,211,153,0.9)":"rgba(248,113,113,0.9)");
    ctx.strokeStyle=grad; ctx.lineWidth=2;
    ctx.beginPath();
    pts.forEach((v,i)=>{
      const x=(i/(pts.length-1))*(W-4)+2, y=H/2-(v*H/2*0.88);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.stroke();
  });
  return <canvas ref={ref} style={{width:"100%",height:80,display:"block"}}/>;
}

function PythLogo({ size=28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="url(#pl)" stroke="rgba(139,92,246,0.4)" strokeWidth="0.5"/>
      <path d="M10 22 L16 10 L22 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="17" r="2.5" fill="white"/>
      <defs>
        <linearGradient id="pl" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#4c1d95"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function App() {
  const [prices, setPrices]     = useState({});
  const [history, setHistory]   = useState({});
  const [corr, setCorr]         = useState({});
  const [status, setStatus]     = useState("connecting");
  const [filter, setFilter]     = useState("all");
  const [selected, setSelected] = useState(null);
  const [mounted, setMounted]   = useState(false);
  const [mobileTab, setMobileTab] = useState("heatmap");
  const histRef = useRef({});

  useEffect(() => { setTimeout(()=>setMounted(true), 100); }, []);

  function pushPrice(sym, price) {
    if (!histRef.current[sym]) histRef.current[sym]=[];
    histRef.current[sym].push(price);
    if (histRef.current[sym].length>200) histRef.current[sym].shift();
  }

  const fetchPrices = useCallback(async () => {
    try {
      const idList = ASSETS.map(a => a.id).join(",");
      const res = await fetch(`${HERMES}?ids=${idList}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const np={};
      data.parsed?.forEach(item=>{
        const asset=ASSETS.find(a=>a.id===item.id); if(!asset) return;
        const p=parseFloat(item.price.price)*Math.pow(10,item.price.expo);
        np[asset.symbol]=p; pushPrice(asset.symbol,p);
      });
      setPrices(np); setHistory({...histRef.current}); setStatus("live");
    } catch {
      ASSETS.forEach(a=>{
        const h=histRef.current[a.symbol];
        const last=h?.length?h[h.length-1]:SEED[a.symbol]??100;
        const p=last+(Math.random()-0.49)*last*0.0018;
        pushPrice(a.symbol,p);
      });
      setPrices(Object.fromEntries(ASSETS.map(a=>[a.symbol,histRef.current[a.symbol].slice(-1)[0]])));
      setHistory({...histRef.current}); setStatus("demo");
    }
  }, []);

  useEffect(()=>{ fetchPrices(); const iv=setInterval(fetchPrices,3000); return()=>clearInterval(iv); },[fetchPrices]);

  useEffect(()=>{
    const nc={};
    ASSETS.forEach((a,i)=>ASSETS.forEach((b,j)=>{
      if(i===j){nc[`${a.symbol}-${b.symbol}`]=1;return;}
      nc[`${a.symbol}-${b.symbol}`]=pearson(histRef.current[a.symbol]||[],histRef.current[b.symbol]||[]);
    }));
    setCorr(nc);
  },[history]);

  const vis = filter==="all"?ASSETS:ASSETS.filter(a=>a.category===filter);

  function topPairs(dir) {
    const pairs=[];
    for(let i=0;i<vis.length;i++) for(let j=i+1;j<vis.length;j++){
      const v=corr[`${vis[i].symbol}-${vis[j].symbol}`];
      if(v!=null&&isFinite(v)) pairs.push({a:vis[i],b:vis[j],v});
    }
    return dir==="pos"?pairs.sort((x,y)=>y.v-x.v).slice(0,5):pairs.sort((x,y)=>x.v-y.v).slice(0,5);
  }

  const selCorr = selected?corr[`${selected.a}-${selected.b}`]??null:null;
  const selA = selected?ASSETS.find(a=>a.symbol===selected.a):null;
  const selB = selected?ASSETS.find(a=>a.symbol===selected.b):null;

  return (
    <div className={`app${mounted?" mounted":""}`}>
      <div className="orb orb1"/><div className="orb orb2"/><div className="orb orb3"/>

      <header className="header">
        <div className="header-left">
          <PythLogo size={32}/>
          <div className="header-titles">
            <div className="header-main">
              <span className="brand-pyth">PYTH</span>
              <span className="brand-x"> × </span>
              <span className="brand-rustrell">rustrell</span>
            </div>
            <div className="header-sub">Cross-Asset Correlation Matrix</div>
          </div>
        </div>
        <div className={`status-pill ${status}`}>
          <span className="status-dot"/>
          {status==="live"?"LIVE":status==="demo"?"DEMO":"..."}
        </div>
      </header>

      <div className="filters">
        {["all","crypto","fx","equity","commodity"].map(cat=>(
          <button key={cat} className={`filter-btn${filter===cat?" active":""}`} onClick={()=>setFilter(cat)}>
            {cat==="all"?"All":cat.charAt(0).toUpperCase()+cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="mobile-tabs">
        {[["heatmap","Matrix"],["tickers","Prices"],["top","Rankings"]].map(([k,label])=>(
          <button key={k} className={`mtab${mobileTab===k?" active":""}`} onClick={()=>setMobileTab(k)}>{label}</button>
        ))}
      </div>

      <main className="main">

        <section className={`tickers-section${mobileTab!=="tickers"?" mob-hide":""}`}>
          <div className="tickers-grid">
            {vis.map((asset,i)=>{
              const h=history[asset.symbol]||[], cur=prices[asset.symbol];
              const prev=h.length>1?h[h.length-2]:null;
              const pct=prev&&cur?((cur-prev)/prev*100):null;
              return (
                <div key={asset.symbol} className="ticker-card" style={{"--delay":`${i*40}ms`,"--accent":asset.color}}>
                  <div className="ticker-top">
                    <div>
                      <div className="ticker-cat">{asset.category}</div>
                      <div className="ticker-sym" style={{color:asset.color}}>{asset.symbol}</div>
                    </div>
                    {pct!==null&&<div className={`ticker-pct${pct>=0?" up":" dn"}`}>{pct>=0?"+":""}{pct.toFixed(2)}%</div>}
                  </div>
                  <div className="ticker-bottom">
                    <div className="ticker-price">{fmt(asset.symbol,cur)}</div>
                    <Sparkline data={h} color={asset.color}/>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className={`heatmap-section${mobileTab!=="heatmap"?" mob-hide":""}`}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Correlation Heatmap</span>
              <span className="card-meta">{vis.length}×{vis.length} · 200 ticks · tap cell</span>
              <div className="legend">
                <span className="legend-bar"/>
                <span className="legend-label">−1</span>
                <span className="legend-label" style={{marginLeft:4}}>+1</span>
              </div>
            </div>
            <div className="heatmap-wrap">
              <table className="heatmap">
                <thead><tr>
                  <th className="heatmap-corner"/>
                  {vis.map(a=><th key={a.symbol} className="heatmap-col-label" style={{color:a.color}}>{a.symbol}</th>)}
                </tr></thead>
                <tbody>
                  {vis.map(rowA=>(
                    <tr key={rowA.symbol}>
                      <td className="heatmap-row-label" style={{color:rowA.color}}>{rowA.symbol}</td>
                      {vis.map(colB=>{
                        const key=`${rowA.symbol}-${colB.symbol}`;
                        const val=corr[key]??null;
                        const diag=rowA.symbol===colB.symbol;
                        const sel=selected&&((selected.a===rowA.symbol&&selected.b===colB.symbol)||(selected.a===colB.symbol&&selected.b===rowA.symbol));
                        return (
                          <td key={colB.symbol}
                            onClick={()=>!diag&&setSelected(sel?null:{a:rowA.symbol,b:colB.symbol})}
                            className={`heatmap-cell${diag?" diag":""}${sel?" selected":""}`}
                            style={{background:diag?"rgba(139,92,246,0.05)":corrColor(val),color:diag?"#4a3a6a":corrTextColor(val)}}>
                            {diag?"·":corrLabel(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selected&&(
            <div className="detail-panel card">
              <div className="detail-header">
                <span className="card-title">Pair Analysis</span>
                <button className="close-btn" onClick={()=>setSelected(null)}>✕</button>
              </div>
              <div className="detail-pair">
                <div className="detail-sym" style={{color:selA?.color}}>{selected.a}</div>
                <div className="detail-corr-block">
                  <div className="detail-corr-val" style={{color:selCorr===null?"#6d5a8a":selCorr>=0?"#34d399":"#f87171"}}>
                    {selCorr===null?"…":selCorr.toFixed(3)}
                  </div>
                  <div className="detail-strength">{strengthLabel(selCorr)}</div>
                </div>
                <div className="detail-sym" style={{color:selB?.color}}>{selected.b}</div>
              </div>
              <div className="card-inner">
                <div className="chart-label">Rolling Correlation History</div>
                <CorrChart symA={selected.a} symB={selected.b} histRef={histRef}/>
              </div>
              <div className="detail-stats">
                {[["Ticks",`${Math.min(history[selected.a]?.length||0,history[selected.b]?.length||0)}`],
                  ["Categories",`${selA?.category} / ${selB?.category}`],
                  ["Window","200 samples"],
                  ["Updated",new Date().toLocaleTimeString()]].map(([k,v])=>(
                  <div key={k} className="stat-item">
                    <div className="stat-key">{k}</div>
                    <div className="stat-val">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className={`rankings-section${mobileTab!=="top"?" mob-hide":""}`}>
          <div className="rankings-grid">
            {["pos","neg"].map(dir=>(
              <div key={dir} className="card">
                <div className="card-header">
                  <span className="card-title" style={{color:dir==="pos"?"#34d399":"#f87171"}}>
                    {dir==="pos"?"▲ Top Positive":"▼ Top Negative"}
                  </span>
                </div>
                {topPairs(dir).map(({a,b,v},i)=>(
                  <div key={`${a.symbol}-${b.symbol}`} className="rank-row" onClick={()=>setSelected({a:a.symbol,b:b.symbol})} style={{"--i":i}}>
                    <div className="rank-num">{i+1}</div>
                    <div className="rank-pair">
                      <span style={{color:a.color}}>{a.symbol}</span>
                      <span className="rank-vs">vs</span>
                      <span style={{color:b.color}}>{b.symbol}</span>
                    </div>
                    <div className={`rank-val ${dir==="pos"?"positive":"negative"}`}>{v.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="footer">
        <PythLogo size={14}/>
        <span>Powered by Pyth Network · Hackathon 2025</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root{--bg:#0a0814;--card:rgba(255,255,255,0.03);--card-border:rgba(139,92,246,0.15);--purple:#8b5cf6;--purple-light:#a78bfa;--purple-dim:rgba(139,92,246,0.3);--text:#e2d9f3;--text-dim:#6d5a8a;--text-muted:#3d2d5a;--green:#34d399;--red:#f87171;--font-display:'Syne',sans-serif;--font-mono:'JetBrains Mono',monospace;--radius:12px;--radius-sm:8px;}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;width:100%;}
        .app{min-height:100vh;width:100%;background:var(--bg);color:var(--text);font-family:var(--font-mono);position:relative;overflow-x:hidden;display:flex;flex-direction:column;opacity:0;transition:opacity 0.6s ease;}
        .app.mounted{opacity:1;}
        .orb{position:fixed;border-radius:50%;pointer-events:none;filter:blur(80px);z-index:0;}
        .orb1{width:600px;height:600px;top:-200px;left:-150px;background:radial-gradient(circle,rgba(109,40,217,0.18) 0%,transparent 70%);animation:drift1 20s ease-in-out infinite;}
        .orb2{width:400px;height:400px;bottom:-100px;right:-100px;background:radial-gradient(circle,rgba(76,29,149,0.14) 0%,transparent 70%);animation:drift2 25s ease-in-out infinite;}
        .orb3{width:300px;height:300px;top:40%;left:50%;background:radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%);animation:drift3 18s ease-in-out infinite;}
        @keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(60px,40px)}}
        @keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,-30px)}}
        @keyframes drift3{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.3)}}
        .header{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:rgba(10,8,20,0.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--card-border);}
        .header-left{display:flex;align-items:center;gap:12px;}
        .header-titles{display:flex;flex-direction:column;gap:1px;}
        .header-main{font-family:var(--font-display);font-size:16px;font-weight:800;letter-spacing:0.05em;}
        .brand-pyth{color:#fff;}.brand-x{color:var(--purple-dim);}.brand-rustrell{color:var(--purple-light);}
        .header-sub{font-size:10px;color:var(--text-dim);letter-spacing:0.15em;text-transform:uppercase;}
        .status-pill{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:0.12em;border:1px solid;}
        .status-pill.live{background:rgba(52,211,153,0.08);border-color:rgba(52,211,153,0.3);color:var(--green);}
        .status-pill.demo{background:rgba(251,146,60,0.08);border-color:rgba(251,146,60,0.3);color:#fb923c;}
        .status-pill.connecting{background:rgba(139,92,246,0.08);border-color:var(--purple-dim);color:var(--purple-light);}
        .status-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.8)}}
        .filters{display:flex;gap:6px;padding:12px 24px;overflow-x:auto;scrollbar-width:none;position:relative;z-index:1;border-bottom:1px solid var(--card-border);background:rgba(10,8,20,0.6);}
        .filters::-webkit-scrollbar{display:none;}
        .filter-btn{flex-shrink:0;padding:6px 14px;border-radius:20px;border:1px solid var(--text-muted);background:transparent;color:var(--text-dim);font-size:11px;font-family:var(--font-mono);cursor:pointer;transition:all 0.2s;white-space:nowrap;}
        .filter-btn:hover{border-color:var(--purple-dim);color:var(--purple-light);}
        .filter-btn.active{background:var(--purple-dim);border-color:var(--purple);color:#fff;}
        .mobile-tabs{display:none;}
        .main{flex:1;padding:20px 24px;display:flex;flex-direction:column;gap:16px;position:relative;z-index:1;max-width:1600px;width:100%;margin:0 auto;}
        .card{background:var(--card);border:1px solid var(--card-border);border-radius:var(--radius);backdrop-filter:blur(12px);overflow:hidden;animation:fadeUp 0.5s ease both;}
        .card-inner{background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:10px;margin:0 12px 12px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .card-header{padding:14px 16px 10px;display:flex;align-items:baseline;flex-wrap:wrap;gap:6px;border-bottom:1px solid var(--card-border);}
        .card-title{font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--text);letter-spacing:0.05em;}
        .card-meta{font-size:10px;color:var(--text-dim);}
        .legend{display:flex;align-items:center;gap:4px;margin-left:auto;}
        .legend-bar{width:48px;height:6px;border-radius:3px;background:linear-gradient(90deg,#f87171,rgba(139,92,246,0.3),#34d399);}
        .legend-label{font-size:9px;color:var(--text-dim);}
        .tickers-section{animation:fadeUp 0.4s ease both;}
        .tickers-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;}
        .ticker-card{background:var(--card);border:1px solid var(--card-border);border-left:2px solid var(--accent,var(--purple));border-radius:var(--radius-sm);padding:10px 12px;transition:transform 0.2s;animation:fadeUp 0.4s ease both;animation-delay:var(--delay,0ms);}
        .ticker-card:hover{transform:translateY(-2px);}
        .ticker-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;}
        .ticker-cat{font-size:9px;color:var(--text-dim);letter-spacing:0.1em;text-transform:uppercase;}
        .ticker-sym{font-family:var(--font-display);font-size:14px;font-weight:700;margin-top:2px;}
        .ticker-pct{font-size:10px;font-weight:600;padding:2px 5px;border-radius:4px;}
        .ticker-pct.up{color:var(--green);background:rgba(52,211,153,0.1);}
        .ticker-pct.dn{color:var(--red);background:rgba(248,113,113,0.1);}
        .ticker-bottom{display:flex;justify-content:space-between;align-items:center;}
        .ticker-price{font-size:12px;color:var(--text);font-variant-numeric:tabular-nums;}
        .heatmap-section{display:flex;flex-direction:column;gap:16px;}
        .heatmap-wrap{overflow-x:auto;padding:12px;}
        .heatmap{border-collapse:separate;border-spacing:2px;width:100%;}
        .heatmap-corner{width:60px;}
        .heatmap-col-label{font-size:8px;font-weight:700;letter-spacing:0.04em;text-align:center;padding:2px;white-space:nowrap;writing-mode:vertical-lr;transform:rotate(180deg);height:54px;}
        .heatmap-row-label{font-size:9px;font-weight:700;padding-right:6px;white-space:nowrap;}
        .heatmap-cell{width:40px;height:40px;text-align:center;font-size:8px;font-weight:600;border-radius:5px;cursor:pointer;transition:all 0.25s;font-variant-numeric:tabular-nums;}
        .heatmap-cell:hover{filter:brightness(1.3);transform:scale(1.05);}
        .heatmap-cell.diag{cursor:default;}
        .heatmap-cell.selected{outline:2px solid rgba(255,255,255,0.7);outline-offset:-1px;}
        .detail-panel{animation:slideIn 0.3s ease both;}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .detail-header{padding:14px 16px 10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--card-border);}
        .close-btn{background:transparent;border:1px solid var(--text-muted);color:var(--text-dim);padding:4px 9px;border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s;}
        .close-btn:hover{border-color:var(--purple-dim);color:var(--purple-light);}
        .detail-pair{display:flex;align-items:center;justify-content:space-around;padding:16px;}
        .detail-sym{font-family:var(--font-display);font-size:22px;font-weight:800;}
        .detail-corr-block{text-align:center;}
        .detail-corr-val{font-family:var(--font-display);font-size:36px;font-weight:800;line-height:1;transition:color 0.4s;}
        .detail-strength{font-size:9px;color:var(--text-dim);letter-spacing:0.12em;margin-top:4px;}
        .chart-label{font-size:9px;color:var(--text-dim);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;}
        .detail-stats{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 12px 12px;}
        .stat-item{background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:8px 10px;border:1px solid var(--card-border);}
        .stat-key{font-size:9px;color:var(--text-dim);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:3px;}
        .stat-val{font-size:11px;color:var(--text);}
        .rankings-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .rank-row{display:flex;align-items:center;gap:10px;padding:9px 16px;border-bottom:1px solid rgba(139,92,246,0.06);cursor:pointer;transition:background 0.15s;animation:fadeUp 0.3s ease both;animation-delay:calc(var(--i)*60ms);}
        .rank-row:hover{background:rgba(139,92,246,0.05);}
        .rank-num{width:16px;font-size:10px;color:var(--text-muted);}
        .rank-pair{flex:1;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;}
        .rank-vs{font-size:9px;color:var(--text-muted);}
        .rank-val{font-family:var(--font-display);font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;}
        .rank-val.positive{color:var(--green);}.rank-val.negative{color:var(--red);}
        .footer{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;font-size:10px;color:var(--text-muted);border-top:1px solid var(--card-border);position:relative;z-index:1;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--purple-dim);border-radius:2px;}

        @media(max-width:768px){
          .mobile-tabs{display:flex;position:relative;z-index:1;background:rgba(10,8,20,0.9);border-bottom:1px solid var(--card-border);}
          .mtab{flex:1;padding:12px;border:none;background:transparent;color:var(--text-dim);font-size:12px;font-family:var(--font-mono);cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;}
          .mtab.active{color:var(--purple-light);border-bottom-color:var(--purple);}
          .main{padding:12px;}
          .rankings-grid{grid-template-columns:1fr;}
          .heatmap-cell{width:32px;height:32px;font-size:7px;}
          .heatmap-col-label{font-size:7px;height:46px;}
          .mob-hide{display:none!important;}
        }
        @media(max-width:480px){
          .header-sub{display:none;}
          .tickers-grid{grid-template-columns:1fr 1fr;}
          .detail-corr-val{font-size:28px;}
          .detail-sym{font-size:18px;}
        }
      `}</style>
    </div>
  );
}
