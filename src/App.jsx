import { useState, useEffect, useRef, useCallback } from "react";

const ASSETS = [
  { id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", symbol: "BTC",     name: "Bitcoin",   category: "crypto",    color: "#F7931A" },
  { id: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", symbol: "ETH",     name: "Ethereum",  category: "crypto",    color: "#627EEA" },
  { id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL",     name: "Solana",    category: "crypto",    color: "#9945FF" },
  { id: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a461c54d397a53f6f2a1e3cf07c", symbol: "DOGE",    name: "Dogecoin",  category: "crypto",    color: "#C2A633" },
  { id: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", symbol: "USDC",    name: "USD Coin",  category: "crypto",    color: "#2775CA" },
  { id: "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", symbol: "EUR/USD", name: "Euro",      category: "fx",        color: "#4A90E2" },
  { id: "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1", symbol: "GBP/USD", name: "Pound",     category: "fx",        color: "#00D4AA" },
  { id: "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", symbol: "XAU/USD", name: "Gold",      category: "commodity", color: "#FFD700" },
  { id: "c9d8b075a5c69303365ae23632d4e2560c5caa6a73b04100c51cfa985ba4aa0e", symbol: "WTI",     name: "Oil (WTI)", category: "commodity", color: "#8B6914" },
  { id: "2f95862b045a2af072f7f3e4f3c10c65e0a5a5b2b6ef6f2f6e6a8f9c0d1e2f3", symbol: "AAPL",    name: "Apple",     category: "equity",    color: "#A2AAAD" },
];

const HERMES = "https://hermes.pyth.network";

const SEED = { BTC:65000, ETH:3200, SOL:140, DOGE:0.15, USDC:1, "EUR/USD":1.085, "GBP/USD":1.265, "XAU/USD":2320, WTI:78, AAPL:185 };

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
  if (v===null) return "#0d1225";
  if (v>=0) return `rgb(${Math.round(v*0)},${Math.round(80+v*140)},${Math.round(60-v*30)})`;
  const t=-v;
  return `rgb(${Math.round(t*230)},${Math.round(80-t*60)},${Math.round(60-t*30)})`;
}

function fmt(sym, val) {
  if (!val) return "–";
  if (sym==="USDC") return `$${val.toFixed(4)}`;
  if (["EUR/USD","GBP/USD"].includes(sym)) return val.toFixed(5);
  if (val>1000) return `$${val.toLocaleString(undefined,{maximumFractionDigits:0})}`;
  if (val>1) return `$${val.toFixed(3)}`;
  return `$${val.toFixed(6)}`;
}

// ── Mini sparkline SVG ──────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return <svg width="60" height="20" />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.slice(-30).map((v,i,arr) =>
    `${(i/(arr.length-1))*58+1},${19-((v-min)/range)*17}`
  ).join(" ");
  return (
    <svg width="60" height="20" style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
    </svg>
  );
}

// ── Historical correlation chart ─────────────────────────────────────────────
function CorrChart({ symA, symB, history, color }) {
  const canvasRef = useRef();
  const corrHistory = useRef([]);

  useEffect(() => {
    const ha = history[symA] || [], hb = history[symB] || [];
    const len = Math.min(ha.length, hb.length);
    if (len < 4) return;
    // compute rolling correlation at each step
    const points = [];
    for (let i = 4; i <= len; i++) {
      const v = pearson(ha.slice(0,i), hb.slice(0,i));
      if (v !== null) points.push(v);
    }
    corrHistory.current = points;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);

    // grid
    ctx.strokeStyle = "#1e2d50";
    ctx.lineWidth = 1;
    [-1,-0.5,0,0.5,1].forEach(v => {
      const y = H/2 - (v * H/2 * 0.85);
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
      ctx.fillStyle = "#3a5070";
      ctx.font = "9px IBM Plex Mono";
      ctx.fillText(v.toFixed(1), 2, y-2);
    });

    if (points.length < 2) return;
    // fill area
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, color+"44");
    grad.addColorStop(1, color+"00");
    ctx.beginPath();
    points.forEach((v,i) => {
      const x = (i/(points.length-1))*(W-20)+10;
      const y = H/2 - (v * H/2 * 0.85);
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineTo((points.length-1)/(points.length-1)*(W-20)+10, H/2);
    ctx.lineTo(10, H/2);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }, [history, symA, symB, color]);

  return <canvas ref={canvasRef} width={600} height={120} style={{width:"100%",height:120}} />;
}

export default function App() {
  const [prices, setPrices]   = useState({});
  const [history, setHistory] = useState({});
  const [corr, setCorr]       = useState({});
  const [status, setStatus]   = useState("Connecting…");
  const [filter, setFilter]   = useState("all");
  const [selected, setSelected] = useState(null); // {a, b}
  const histRef = useRef({});
  const priceHistRef = useRef({}); // for sparklines: symbol → [price]

  const fetchPrices = useCallback(async () => {
    try {
      const ids = ASSETS.map(a=>`ids[]=${a.id}`).join("&");
      const res = await fetch(`${HERMES}/v2/updates/price/latest?${ids}&encoding=hex`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const np = {};
      data.parsed?.forEach(item => {
        const asset = ASSETS.find(a=>a.id===item.id);
        if (!asset) return;
        const price = parseFloat(item.price.price) * Math.pow(10, item.price.expo);
        np[asset.symbol] = price;
        push(asset.symbol, price);
      });
      setPrices(np);
      setHistory({...histRef.current});
      setStatus(`Live · ${new Date().toLocaleTimeString()}`);
    } catch {
      ASSETS.forEach(a => {
        const h = histRef.current[a.symbol];
        const last = h?.length ? h[h.length-1] : SEED[a.symbol]??100;
        const p = last + (Math.random()-0.49)*last*0.002;
        push(a.symbol, p);
      });
      setPrices(Object.fromEntries(ASSETS.map(a=>[a.symbol, histRef.current[a.symbol].slice(-1)[0]])));
      setHistory({...histRef.current});
      setStatus(`Demo · ${new Date().toLocaleTimeString()}`);
    }
  }, []);

  function push(sym, price) {
    if (!histRef.current[sym]) histRef.current[sym] = [];
    histRef.current[sym].push(price);
    if (histRef.current[sym].length > 200) histRef.current[sym].shift();
  }

  useEffect(() => {
    const newCorr = {};
    ASSETS.forEach((a,i) => ASSETS.forEach((b,j) => {
      if (i===j) { newCorr[`${a.symbol}-${b.symbol}`]=1; return; }
      const v = pearson(histRef.current[a.symbol]||[], histRef.current[b.symbol]||[]);
      newCorr[`${a.symbol}-${b.symbol}`] = v;
    }));
    setCorr(newCorr);
  }, [history]);

  useEffect(() => {
    fetchPrices();
    const iv = setInterval(fetchPrices, 3000);
    return ()=>clearInterval(iv);
  }, [fetchPrices]);

  const vis = filter==="all" ? ASSETS : ASSETS.filter(a=>a.category===filter);

  function topPairs(dir) {
    const pairs=[];
    for(let i=0;i<vis.length;i++) for(let j=i+1;j<vis.length;j++){
      const v=corr[`${vis[i].symbol}-${vis[j].symbol}`];
      if(v!=null&&isFinite(v)) pairs.push({a:vis[i],b:vis[j],v});
    }
    return dir==="pos"
      ? pairs.sort((x,y)=>y.v-x.v).slice(0,5)
      : pairs.sort((x,y)=>x.v-y.v).slice(0,5);
  }

  const selA = selected ? ASSETS.find(a=>a.symbol===selected.a) : null;
  const selB = selected ? ASSETS.find(a=>a.symbol===selected.b) : null;
  const selCorr = selected ? (corr[`${selected.a}-${selected.b}`] ?? null) : null;

  return (
    <div style={{
      minHeight:"100vh", width:"100vw",
      background:"#08091a",
      color:"#e0e6f0",
      fontFamily:"'IBM Plex Mono','Courier New',monospace",
      display:"flex", flexDirection:"column",
      boxSizing:"border-box",
    }}>
      {/* scanline */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)"}}/>

      {/* ── HEADER ── */}
      <header style={{
        borderBottom:"1px solid #1a2540",
        padding:"16px 32px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:"rgba(8,9,26,0.97)",
        position:"sticky",top:0,zIndex:100,
        backdropFilter:"blur(16px)",
        flexShrink:0,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{
            width:38,height:38,borderRadius:"50%",flexShrink:0,
            background:"linear-gradient(135deg,#9945FF 0%,#00D4AA 100%)",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:17,fontWeight:800,color:"#fff",
          }}>P</div>
          <div>
            <div style={{fontSize:17,fontWeight:700,letterSpacing:"0.1em",color:"#fff"}}>
              PYTH · CORRELATION MATRIX
            </div>
            <div style={{fontSize:10,color:"#3a5070",letterSpacing:"0.18em",marginTop:1}}>
              CROSS-ASSET REAL-TIME ANALYSIS
            </div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          {/* filter */}
          <div style={{display:"flex",gap:6}}>
            {["all","crypto","fx","equity","commodity"].map(cat=>(
              <button key={cat} onClick={()=>setFilter(cat)} style={{
                padding:"5px 13px",
                background:filter===cat?"#1a2d50":"transparent",
                border:`1px solid ${filter===cat?"#4A90E2":"#1a2540"}`,
                borderRadius:4,color:filter===cat?"#fff":"#3a5070",
                fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",
                cursor:"pointer",transition:"all 0.15s",fontFamily:"inherit",
              }}>{cat==="all"?"ALL":cat.toUpperCase()}</button>
            ))}
          </div>
          <div style={{fontSize:11,color:"#3a5070",letterSpacing:"0.1em",display:"flex",alignItems:"center",gap:7}}>
            <span style={{
              display:"inline-block",width:7,height:7,borderRadius:"50%",
              background:status.startsWith("Live")?"#00D4AA":"#F7931A",
              boxShadow:status.startsWith("Live")?"0 0 8px #00D4AA":"0 0 8px #F7931A",
              animation:"pulse 2s infinite",
            }}/>
            {status}
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{flex:1,padding:"24px 32px",display:"flex",flexDirection:"column",gap:20,minWidth:0}}>

        {/* ── TICKER ── */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",
          gap:8,
        }}>
          {vis.map(asset=>{
            const h = history[asset.symbol]||[];
            const prev = h.length>1?h[h.length-2]:null;
            const cur = prices[asset.symbol];
            const pct = prev&&cur ? ((cur-prev)/prev*100) : null;
            return (
              <div key={asset.symbol} style={{
                background:"#0b0e1f",
                border:`1px solid #1a2540`,
                borderLeft:`3px solid ${asset.color}`,
                borderRadius:6,padding:"10px 12px",
                display:"flex",flexDirection:"column",gap:4,
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:9,color:"#3a5070",letterSpacing:"0.14em"}}>{asset.category.toUpperCase()}</div>
                  {pct!==null && <div style={{fontSize:9,color:pct>=0?"#00D4AA":"#FF4C4C",fontWeight:600}}>
                    {pct>=0?"+":""}{pct.toFixed(2)}%
                  </div>}
                </div>
                <div style={{fontSize:13,fontWeight:700,color:asset.color}}>{asset.symbol}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,color:"#c0cce0",fontVariantNumeric:"tabular-nums"}}>{fmt(asset.symbol,cur)}</div>
                  <Sparkline data={h} color={asset.color}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── HEATMAP + CHART ROW ── */}
        <div style={{display:"grid",gridTemplateColumns:selected?"1fr 420px":"1fr",gap:16,minWidth:0}}>

          {/* Heatmap */}
          <div style={{background:"#0b0e1f",border:"1px solid #1a2540",borderRadius:8,overflow:"hidden",minWidth:0}}>
            <div style={{padding:"12px 18px",borderBottom:"1px solid #1a2540",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,letterSpacing:"0.14em",color:"#6080a0"}}>
                CORRELATION HEATMAP
                <span style={{color:"#2a3a55",marginLeft:8}}>· {vis.length}×{vis.length} · rolling 200 ticks · click cell to inspect</span>
              </span>
              <div style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#3a5070"}}>
                <span style={{width:40,height:7,background:"linear-gradient(90deg,rgb(220,30,30),#0b0e1f,rgb(0,200,100))",display:"inline-block",borderRadius:2}}/>
                -1 → +1
              </div>
            </div>
            <div style={{overflowX:"auto",padding:"14px 14px 8px"}}>
              <table style={{borderCollapse:"separate",borderSpacing:3,width:"100%"}}>
                <thead>
                  <tr>
                    <td style={{width:68}}/>
                    {vis.map(a=>(
                      <td key={a.symbol} style={{
                        textAlign:"center",fontSize:9,color:a.color,
                        padding:"3px 2px",fontWeight:700,letterSpacing:"0.05em",
                        writingMode:"vertical-lr",transform:"rotate(180deg)",height:56,
                      }}>{a.symbol}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vis.map(rowA=>(
                    <tr key={rowA.symbol}>
                      <td style={{fontSize:10,color:rowA.color,fontWeight:700,paddingRight:6,letterSpacing:"0.05em",whiteSpace:"nowrap"}}>
                        {rowA.symbol}
                      </td>
                      {vis.map(colB=>{
                        const key=`${rowA.symbol}-${colB.symbol}`;
                        const val=corr[key]??null;
                        const isDiag=rowA.symbol===colB.symbol;
                        const isSel=selected&&((selected.a===rowA.symbol&&selected.b===colB.symbol)||(selected.a===colB.symbol&&selected.b===rowA.symbol));
                        return (
                          <td key={colB.symbol}
                            onClick={()=>!isDiag&&setSelected(isSel?null:{a:rowA.symbol,b:colB.symbol})}
                            title={isDiag?"–":`${rowA.symbol} vs ${colB.symbol}: ${val?.toFixed(3)??'–'}`}
                            style={{
                              background:isDiag?"#141830":corrColor(val),
                              width:42,height:42,textAlign:"center",
                              fontSize:9,fontWeight:600,
                              color:isDiag?"#3a5070":"rgba(255,255,255,0.9)",
                              borderRadius:4,
                              cursor:isDiag?"default":"pointer",
                              outline:isSel?"2px solid #fff":"none",
                              outlineOffset:"-1px",
                              transition:"opacity 0.2s",
                              fontVariantNumeric:"tabular-nums",
                            }}>
                            {isDiag?"—":val!==null?val.toFixed(2):"…"}
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
          {selected && (
            <div style={{background:"#0b0e1f",border:"1px solid #1a2540",borderRadius:8,padding:"18px",display:"flex",flexDirection:"column",gap:14,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:11,letterSpacing:"0.14em",color:"#6080a0"}}>PAIR ANALYSIS</div>
                <button onClick={()=>setSelected(null)} style={{
                  background:"transparent",border:"1px solid #1a2540",borderRadius:4,
                  color:"#3a5070",fontSize:11,cursor:"pointer",padding:"3px 8px",fontFamily:"inherit",
                }}>✕ close</button>
              </div>

              {/* pair header */}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:selA?.color}}>{selected.a}</div>
                  <div style={{fontSize:10,color:"#3a5070"}}>{fmt(selected.a,prices[selected.a])}</div>
                </div>
                <div style={{flex:1,textAlign:"center"}}>
                  <div style={{
                    fontSize:28,fontWeight:800,
                    color:selCorr===null?"#3a5070":selCorr>0?"#00D4AA":"#FF4C4C",
                    fontVariantNumeric:"tabular-nums",
                  }}>
                    {selCorr===null?"…":selCorr.toFixed(3)}
                  </div>
                  <div style={{fontSize:9,color:"#3a5070",letterSpacing:"0.1em",marginTop:2}}>
                    {selCorr===null?"COMPUTING…":
                     selCorr>0.7?"STRONG POSITIVE":
                     selCorr>0.3?"MODERATE POSITIVE":
                     selCorr>-0.3?"WEAK / NEUTRAL":
                     selCorr>-0.7?"MODERATE NEGATIVE":"STRONG NEGATIVE"}
                  </div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700,color:selB?.color}}>{selected.b}</div>
                  <div style={{fontSize:10,color:"#3a5070"}}>{fmt(selected.b,prices[selected.b])}</div>
                </div>
              </div>

              {/* chart */}
              <div style={{background:"#080918",borderRadius:6,padding:"10px 6px",border:"1px solid #1a2540"}}>
                <div style={{fontSize:9,letterSpacing:"0.12em",color:"#3a5070",marginBottom:6,paddingLeft:4}}>
                  ROLLING CORRELATION HISTORY
                </div>
                <CorrChart symA={selected.a} symB={selected.b} history={history} color={selCorr>0?"#00D4AA":"#FF4C4C"}/>
              </div>

              {/* stats */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[
                  ["DATA POINTS", `${Math.min(history[selected.a]?.length||0, history[selected.b]?.length||0)}`],
                  ["CATEGORY", `${selA?.category} / ${selB?.category}`],
                  ["LAST UPDATE", new Date().toLocaleTimeString()],
                  ["WINDOW", "200 ticks"],
                ].map(([k,v])=>(
                  <div key={k} style={{background:"#080918",borderRadius:4,padding:"8px 10px",border:"1px solid #1a2540"}}>
                    <div style={{fontSize:9,color:"#3a5070",letterSpacing:"0.1em",marginBottom:3}}>{k}</div>
                    <div style={{fontSize:11,color:"#8098c0",fontVariantNumeric:"tabular-nums"}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── BOTTOM ROW ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
          {/* Top positive */}
          <div style={{background:"#0b0e1f",border:"1px solid #1a2540",borderRadius:8,padding:"16px 18px"}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"#00D4AA",marginBottom:12}}>▲ TOP POSITIVE</div>
            {topPairs("pos").map(({a,b,v})=>(
              <div key={`${a.symbol}-${b.symbol}`}
                onClick={()=>setSelected({a:a.symbol,b:b.symbol})}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"7px 0",borderBottom:"1px solid #0d1225",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,color:a.color,fontWeight:700}}>{a.symbol}</span>
                  <span style={{fontSize:9,color:"#2a3a55"}}>vs</span>
                  <span style={{fontSize:11,color:b.color,fontWeight:700}}>{b.symbol}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:"#00D4AA",fontVariantNumeric:"tabular-nums"}}>{v.toFixed(3)}</span>
              </div>
            ))}
          </div>

          {/* Top negative */}
          <div style={{background:"#0b0e1f",border:"1px solid #1a2540",borderRadius:8,padding:"16px 18px"}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"#FF4C4C",marginBottom:12}}>▼ TOP NEGATIVE</div>
            {topPairs("neg").map(({a,b,v})=>(
              <div key={`${a.symbol}-${b.symbol}`}
                onClick={()=>setSelected({a:a.symbol,b:b.symbol})}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  padding:"7px 0",borderBottom:"1px solid #0d1225",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,color:a.color,fontWeight:700}}>{a.symbol}</span>
                  <span style={{fontSize:9,color:"#2a3a55"}}>vs</span>
                  <span style={{fontSize:11,color:b.color,fontWeight:700}}>{b.symbol}</span>
                </div>
                <span style={{fontSize:13,fontWeight:700,color:"#FF4C4C",fontVariantNumeric:"tabular-nums"}}>{v.toFixed(3)}</span>
              </div>
            ))}
          </div>

          {/* Category matrix */}
          <div style={{background:"#0b0e1f",border:"1px solid #1a2540",borderRadius:8,padding:"16px 18px"}}>
            <div style={{fontSize:10,letterSpacing:"0.15em",color:"#6080a0",marginBottom:12}}>CATEGORY AVG CORR</div>
            {getCatCorr(corr).map(({label,val})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                padding:"7px 0",borderBottom:"1px solid #0d1225"}}>
                <span style={{fontSize:10,color:"#3a5070"}}>{label}</span>
                <span style={{
                  fontSize:12,fontWeight:700,fontVariantNumeric:"tabular-nums",
                  color:val>0.3?"#00D4AA":val<-0.1?"#FF4C4C":"#6080a0",
                }}>{val.toFixed(3)}</span>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer style={{textAlign:"center",padding:"14px",fontSize:9,color:"#1a2540",letterSpacing:"0.12em",flexShrink:0}}>
        POWERED BY PYTH NETWORK · HERMES REST API · UPDATES EVERY 3S · PYTH PLAYGROUND HACKATHON 2025
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700;800&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;width:100%;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:#08091a;}
        ::-webkit-scrollbar-thumb{background:#1a2540;border-radius:3px;}
        button:hover{opacity:0.8;}
        td{transition:opacity 0.15s;}
        td:hover{opacity:0.75;}
      `}</style>
    </div>
  );
}

function getCatCorr(corr) {
  const cats = ["crypto","fx","equity","commodity"];
  const res = [];
  for(let i=0;i<cats.length;i++) for(let j=i;j<cats.length;j++){
    const aA=ASSETS.filter(a=>a.category===cats[i]);
    const bA=ASSETS.filter(a=>a.category===cats[j]);
    const vals=[];
    aA.forEach(a=>bA.forEach(b=>{
      if(a.symbol===b.symbol)return;
      const v=corr[`${a.symbol}-${b.symbol}`]??corr[`${b.symbol}-${a.symbol}`];
      if(v!=null&&isFinite(v))vals.push(v);
    }));
    if(vals.length){
      const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
      res.push({label:`${cats[i].toUpperCase()} ↔ ${cats[j].toUpperCase()}`,val:avg});
    }
  }
  return res;
}
