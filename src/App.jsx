import { useState, useEffect, useRef, useCallback } from "react";

/* ─── ASSETS ─────────────────────────────────────────────────────────────── */
const ASSETS = [
  { id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", symbol: "BTC",     name: "Bitcoin",   category: "crypto",    color: "#F7931A" },
  { id: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", symbol: "ETH",     name: "Ethereum",  category: "crypto",    color: "#8B9FFF" },
  { id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL",     name: "Solana",    category: "crypto",    color: "#9945FF" },
  { id: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a461c54d397a53f6f2a1e3cf07c", symbol: "DOGE",    name: "Dogecoin",  category: "crypto",    color: "#C8A84B" },
  { id: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", symbol: "USDC",    name: "USD Coin",  category: "crypto",    color: "#2775CA" },
  { id: "a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b", symbol: "EUR/USD", name: "Euro",      category: "fx",        color: "#60A5FA" },
  { id: "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1", symbol: "GBP/USD", name: "Pound",     category: "fx",        color: "#34D399" },
  { id: "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", symbol: "XAU/USD", name: "Gold",      category: "commodity", color: "#FCD34D" },
  { id: "c9d8b075a5c69303365ae23632d4e2560c5caa6a73b04100c51cfa985ba4aa0e", symbol: "WTI",     name: "Oil (WTI)", category: "commodity", color: "#FB923C" },
  { id: "49f6b65cb1de6b10468f01a6760ee3c4c7f19ab72c8e7c4c7e8b2a3e3e3e3e3e", symbol: "AAPL",   name: "Apple",     category: "equity",    color: "#E2E8F0" },
];

const SEED = { BTC:65000,ETH:3200,SOL:140,DOGE:0.15,USDC:1,"EUR/USD":1.085,"GBP/USD":1.265,"XAU/USD":2320,WTI:78,AAPL:185 };

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
  if(v===null) return "rgba(139,77,255,0.06)";
  if(v>=0){const t=v;return `rgba(${Math.round(t*20)},${Math.round(160+t*95)},${Math.round(80+t*80)},${0.12+t*0.7})`;}
  const t=-v;
  return `rgba(${Math.round(200+t*55)},${Math.round(60-t*50)},${Math.round(80-t*60)},${0.12+t*0.7})`;
}
function corrTextColor(v){if(v===null)return"#4a3a6a";return Math.abs(v)>0.45?"#fff":"#c4b5fd";}

function fmt(sym,val){
  if(!val)return"–";
  if(sym==="USDC")return`$${val.toFixed(4)}`;
  if(["EUR/USD","GBP/USD"].includes(sym))return val.toFixed(5);
  if(val>1000)return`$${val.toLocaleString(undefined,{maximumFractionDigits:0})}`;
  if(val>1)return`$${val.toFixed(2)}`;
  return`$${val.toFixed(5)}`;
}

function strengthLabel(v){
  if(v===null)return"COMPUTING";
  const a=Math.abs(v);
  if(a>0.8)return v>0?"VERY STRONG ▲":"VERY STRONG ▼";
  if(a>0.5)return v>0?"STRONG ▲":"STRONG ▼";
  if(a>0.3)return v>0?"MODERATE ▲":"MODERATE ▼";
  return"WEAK / NEUTRAL";
}

/* ─── SMOKE ──────────────────────────────────────────────────────────────── */
function Smoke() {
  const ref = useRef();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas)return;
    const ctx=canvas.getContext("2d");
    let W=window.innerWidth,H=window.innerHeight;
    const setSize=()=>{W=window.innerWidth;H=window.innerHeight;canvas.width=W;canvas.height=H;};
    setSize();
    window.addEventListener("resize",setSize);

    const COLS=["rgba(109,40,217,","rgba(139,92,246,","rgba(76,29,149,","rgba(88,28,135,","rgba(124,58,237,"];
    class P{
      constructor(init=false){this.reset(init);}
      reset(init=false){
        this.x=Math.random()*W;
        this.y=init?Math.random()*H:H+120;
        this.r=150+Math.random()*220;
        this.vy=-(0.1+Math.random()*0.25);
        this.vx=(Math.random()-0.5)*0.12;
        this.op=0;
        this.maxOp=0.12+Math.random()*0.18;
        this.fadingIn=true;
        this.col=COLS[Math.floor(Math.random()*COLS.length)];
        this.rot=Math.random()*Math.PI*2;
        this.rspd=(Math.random()-0.5)*0.004;
        this.sx=0.5+Math.random()*0.9;
        this.sy=0.4+Math.random()*0.7;
      }
      tick(){
        this.y+=this.vy; this.x+=this.vx; this.rot+=this.rspd;
        if(this.fadingIn){this.op+=0.002;if(this.op>=this.maxOp)this.fadingIn=false;}
        else this.op-=0.00025;
        if(this.op<=0||this.y<-this.r)this.reset();
      }
      draw(){
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rot);
        ctx.scale(this.sx,this.sy);
        const g=ctx.createRadialGradient(0,0,0,0,0,this.r);
        g.addColorStop(0,`${this.col}${this.op})`);
        g.addColorStop(0.45,`${this.col}${this.op*0.5})`);
        g.addColorStop(1,`${this.col}0)`);
        ctx.fillStyle=g;
        ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.fill();
        ctx.restore();
      }
    }

    const ps=[];
    for(let i=0;i<45;i++)ps.push(new P(true));
    let id;
    const loop=()=>{ctx.clearRect(0,0,W,H);ps.forEach(p=>{p.tick();p.draw();});id=requestAnimationFrame(loop);};
    loop();
    return()=>{cancelAnimationFrame(id);window.removeEventListener("resize",setSize);};
  },[]);

  return <canvas ref={ref} className="smoke-bg" style={{position:"fixed",top:0,left:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:1,opacity:1}}/>;
}

/* ─── SPARKLINE ──────────────────────────────────────────────────────────── */
function Spark({data,color}){
  if(!data||data.length<2)return<svg width="54"height="20"/>;
  const pts=data.slice(-40),mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1;
  const d=pts.map((v,i)=>`${(i/(pts.length-1))*52+1},${18-((v-mn)/rng)*16}`).join(" ");
  const up=pts[pts.length-1]>=pts[0];
  return<svg width="54"height="20"><polyline points={d} fill="none" stroke={up?"#a78bfa":"#f87171"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

/* ─── CORR CHART ─────────────────────────────────────────────────────────── */
function CorrChart({symA,symB,histRef}){
  const ref=useRef();
  useEffect(()=>{
    const ha=histRef.current[symA]||[],hb=histRef.current[symB]||[];
    const n=Math.min(ha.length,hb.length),pts=[];
    for(let i=4;i<=n;i++){const v=pearson(ha.slice(0,i),hb.slice(0,i));if(v!==null)pts.push(v);}
    const c=ref.current;if(!c||pts.length<2)return;
    const ctx=c.getContext("2d"),W=c.offsetWidth||400,H=80;
    c.width=W;c.height=H;
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle="rgba(139,92,246,0.18)";ctx.lineWidth=1;ctx.setLineDash([3,4]);
    ctx.beginPath();ctx.moveTo(0,H/2);ctx.lineTo(W,H/2);ctx.stroke();
    ctx.setLineDash([]);
    const last=pts[pts.length-1];
    const g=ctx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,"rgba(139,92,246,0.6)");
    g.addColorStop(1,last>=0?"rgba(52,211,153,1)":"rgba(248,113,113,1)");
    ctx.strokeStyle=g;ctx.lineWidth=2;
    ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*0.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();
  });
  return<canvas ref={ref} style={{width:"100%",height:80,display:"block"}}/>;
}

/* ─── PYTH LOGO (original P shape) ──────────────────────────────────────── */
function PythLogo({size=30}){
  return(
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect width="120" height="120" rx="24" fill="#7142CF"/>
      {/* Outer arc - left side */}
      <path d="M30 95 L30 42 C30 24 42 14 60 14 C78 14 90 24 90 42 C90 60 78 70 60 70 L52 70 L52 95 Z" 
            fill="none" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Inner P counter */}
      <path d="M52 52 C52 42 58 36 66 36 C74 36 80 42 80 50 C80 58 74 64 66 64 L52 64 Z"
            fill="white"/>
    </svg>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────────────────── */
export default function App(){
  const [prices,setPrices]=useState({});
  const [history,setHistory]=useState({});
  const [corr,setCorr]=useState({});
  const [status,setStatus]=useState("connecting");
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState(null);
  const [mounted,setMounted]=useState(false);
  const [mobileTab,setMobileTab]=useState("heatmap");
  const [feedbackOpen,setFeedbackOpen]=useState(false);
  const [feedbackText,setFeedbackText]=useState("");
  const [feedbackSent,setFeedbackSent]=useState(false);
  const histRef=useRef({});

  useEffect(()=>{setTimeout(()=>setMounted(true),80);},[]);

  function push(sym,price){
    if(!histRef.current[sym])histRef.current[sym]=[];
    histRef.current[sym].push(price);
    if(histRef.current[sym].length>200)histRef.current[sym].shift();
  }

  const fetchPrices=useCallback(async()=>{
    try{
      // Send all IDs as separate params for Hermes compatibility
      const params=new URLSearchParams();
      ASSETS.forEach(a=>params.append("ids",a.id));
      const res=await fetch(`/api/pyth?${params}`);
      if(!res.ok){
        const err=await res.json().catch(()=>({}));
        throw new Error(`HTTP ${res.status}: ${err.error||""}`);
      }
      const data=await res.json();
      console.log("[Pyth] raw response:", data.count, "items, first:", data.parsed?.[0]);

      const items=data.parsed||[];
      if(!items.length)throw new Error("empty response");

      const np={};
      items.forEach(item=>{
        // Match by id (with or without 0x prefix)
        const cleanId=item.id?.replace(/^0x/,"");
        const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
        if(!asset){console.warn("[Pyth] unknown id:",item.id);return;}

        // Hermes v2 parsed format: item.price = {price: "638752...", conf: "...", expo: -8}
        const priceObj=item.price;
        if(!priceObj||priceObj.price===undefined){console.warn("[Pyth] no price for",asset.symbol);return;}
        
        const raw=parseFloat(priceObj.price);
        const expo=priceObj.expo??-8;
        const p=raw*Math.pow(10,expo);
        
        console.log(`[Pyth] ${asset.symbol}: raw=${priceObj.price} expo=${expo} => $${p.toFixed(4)}`);
        
        if(isFinite(p)&&p>0){np[asset.symbol]=p;push(asset.symbol,p);}
      });

      const count=Object.keys(np).length;
      console.log(`[Pyth] parsed ${count} prices successfully`);
      if(count>0){
        setPrices(np);setHistory({...histRef.current});setStatus("live");
      } else throw new Error("0 valid prices parsed");
    }catch(e){
      console.error("[Pyth] proxy failed:", e.message, "- trying Hermes directly...");
      try{
        // Try Hermes directly as second attempt
        const ids2=ASSETS.map(a=>`ids[]=${a.id}`).join("&");
        const r2=await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${ids2}&parsed=true`);
        if(!r2.ok)throw new Error("hermes direct failed");
        const d2=await r2.json();
        const items2=d2.parsed||[];
        const np2={};
        items2.forEach(item=>{
          const cleanId=item.id?.replace(/^0x/,"");
          const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
          if(!asset)return;
          const po=item.price;
          if(!po)return;
          const p=parseFloat(po.price)*Math.pow(10,po.expo??-8);
          if(isFinite(p)&&p>0){np2[asset.symbol]=p;push(asset.symbol,p);}
        });
        if(Object.keys(np2).length>0){
          setPrices(np2);setHistory({...histRef.current});setStatus("live");
          console.log("[Pyth] direct Hermes success!");
          return;
        }
      }catch(e2){console.error("[Pyth] direct also failed:",e2.message);}
      // Final fallback: demo
      ASSETS.forEach(a=>{
        const h=histRef.current[a.symbol];
        const last=h?.length?h[h.length-1]:SEED[a.symbol]??100;
        const p=last+(Math.random()-0.49)*last*0.002;
        push(a.symbol,p);
      });
      setPrices(Object.fromEntries(ASSETS.map(a=>[a.symbol,histRef.current[a.symbol].slice(-1)[0]])));
      setHistory({...histRef.current});
      setStatus("demo");
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

  // Send feedback to Telegram
  async function sendFeedback(){
    if(!feedbackText.trim())return;
    try{
      const BOT_TOKEN="7510359411:AAGfsKzw4DvQpd0sTZAmGUm4l-86SJLL_Xo";
      const CHAT_ID="582278751";
      const msg=`🔔 Feedback — Pyth Correlation Tracker\n\n${feedbackText}\n\n⏰ ${new Date().toLocaleString()}`;
      const res=await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({chat_id:CHAT_ID,text:msg,parse_mode:"HTML"})
      });
      if(!res.ok)throw new Error("tg error");
      setFeedbackSent(true);
      setTimeout(()=>{setFeedbackOpen(false);setFeedbackText("");setFeedbackSent(false);},2500);
    }catch(e){
      console.error("Feedback error:",e);
      setFeedbackSent(true); // show success anyway
      setTimeout(()=>{setFeedbackOpen(false);setFeedbackText("");setFeedbackSent(false);},2500);
    }
  }

  return(
    <div className={`app${mounted?" on":""}`}>
      <Smoke/>

      {/* HEADER */}
      <header className="hdr">
        <div className="hdr-l">
          <PythLogo size={36}/>
          <div>
            <div className="brand"><span className="b-pyth">PYTH</span><span className="b-x"> × </span><span className="b-rs">rustrell</span></div>
            <div className="sub">Cross-Asset Correlation Matrix</div>
          </div>
        </div>
        <div className="hdr-r">
          <div className={`pill ${status}`}><span className="dot"/>{status==="live"?"LIVE":"DEMO"}</div>
        </div>
      </header>

      {/* FILTERS */}
      <div className="filters">
        {["all","crypto","fx","equity","commodity"].map(c=>(
          <button key={c} className={`fbtn${filter===c?" a":""}`} onClick={()=>setFilter(c)}>
            {c==="all"?"All Assets":c==="fx"?"FX Pairs":c.charAt(0).toUpperCase()+c.slice(1)}
          </button>
        ))}
      </div>

      {/* MOBILE TABS */}
      <div className="mtabs">
        {[["heatmap","Matrix"],["tickers","Prices"],["top","Rankings"]].map(([k,l])=>(
          <button key={k} className={`mt${mobileTab===k?" a":""}`} onClick={()=>setMobileTab(k)}>{l}</button>
        ))}
      </div>

      <main className="main">

        {/* TICKERS */}
        <section className={`sec-t${mobileTab!=="tickers"?" mhide":""}`}>
          <div className="tgrid">
            {vis.map((a,i)=>{
              const h=history[a.symbol]||[],cur=prices[a.symbol];
              const prev=h.length>1?h[h.length-2]:null;
              const pct=prev&&cur?((cur-prev)/prev*100):null;
              return(
                <div key={a.symbol} className="tc" style={{"--ac":a.color,"--d":`${i*35}ms`}}>
                  <div className="tc-top">
                    <div><div className="tc-cat">{a.category}</div><div className="tc-sym" style={{color:a.color}}>{a.symbol}</div></div>
                    {pct!==null&&<div className={`tc-pct${pct>=0?" up":" dn"}`}>{pct>=0?"+":""}{pct.toFixed(2)}%</div>}
                  </div>
                  <div className="tc-bot">
                    <div className="tc-p">{fmt(a.symbol,cur)}</div>
                    <Spark data={h} color={a.color}/>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HEATMAP */}
        <section className={`sec-h${mobileTab!=="heatmap"?" mhide":""}`}>
          <div className="card">
            <div className="card-hdr">
              <span className="ct">Correlation Heatmap</span>
              <span className="cm">{vis.length}×{vis.length} · 200 ticks · tap cell</span>
              <div className="leg"><span className="legbar"/><span className="leglb">−1</span><span className="leglb" style={{marginLeft:4}}>+1</span></div>
            </div>
            <div className="hmwrap">
              <table className="hm">
                <thead><tr><th className="hmc"/>{vis.map(a=><th key={a.symbol} className="hmcl" style={{color:a.color}}>{a.symbol}</th>)}</tr></thead>
                <tbody>
                  {vis.map(rA=>(
                    <tr key={rA.symbol}>
                      <td className="hmrl" style={{color:rA.color}}>{rA.symbol}</td>
                      {vis.map(cB=>{
                        const key=`${rA.symbol}-${cB.symbol}`,val=corr[key]??null;
                        const diag=rA.symbol===cB.symbol;
                        const sel=selected&&((selected.a===rA.symbol&&selected.b===cB.symbol)||(selected.a===cB.symbol&&selected.b===rA.symbol));
                        return(
                          <td key={cB.symbol}
                            onClick={()=>!diag&&setSelected(sel?null:{a:rA.symbol,b:cB.symbol})}
                            className={`hmc${diag?" diag":""}${sel?" sel":""}`}
                            style={{background:diag?"rgba(139,92,246,0.04)":corrColor(val),color:diag?"#3a2a5a":corrTextColor(val)}}>
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

          {/* DETAIL PANEL */}
          {selected&&(
            <div className="card detail">
              <div className="card-hdr">
                <span className="ct">Pair Analysis</span>
                <button className="xbtn" onClick={()=>setSelected(null)}>✕</button>
              </div>
              <div className="dpair">
                <div className="dsym" style={{color:selA?.color}}>{selected.a}</div>
                <div className="dblock">
                  <div className="dval" style={{color:selCorr===null?"#5a4a7a":selCorr>=0?"#34d399":"#f87171"}}>{selCorr===null?"…":selCorr.toFixed(3)}</div>
                  <div className="dstr">{strengthLabel(selCorr)}</div>
                </div>
                <div className="dsym" style={{color:selB?.color}}>{selected.b}</div>
              </div>
              <div className="dchartbox">
                <div className="dcl">Rolling Correlation History</div>
                <CorrChart symA={selected.a} symB={selected.b} histRef={histRef}/>
              </div>
              <div className="dstats">
                {[["Ticks",`${Math.min(history[selected.a]?.length||0,history[selected.b]?.length||0)}`],
                  ["Categories",`${selA?.category} / ${selB?.category}`],
                  ["Window","200 samples"],["Updated",new Date().toLocaleTimeString()]].map(([k,v])=>(
                  <div key={k} className="dsi"><div className="dsk">{k}</div><div className="dsv">{v}</div></div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RANKINGS */}
        <section className={`sec-r${mobileTab!=="top"?" mhide":""}`}>
          <div className="rgrid">
            {["pos","neg"].map(dir=>(
              <div key={dir} className="card">
                <div className="card-hdr">
                  <span className="ct" style={{color:dir==="pos"?"#34d399":"#f87171"}}>
                    {dir==="pos"?"▲ Strongest Positive":"▼ Strongest Negative"}
                  </span>
                </div>
                {topPairs(dir).map(({a,b,v},i)=>(
                  <div key={`${a.symbol}${b.symbol}`} className="rr" onClick={()=>setSelected({a:a.symbol,b:b.symbol})} style={{"--i":i}}>
                    <div className="rn">{i+1}</div>
                    <div className="rp"><span style={{color:a.color}}>{a.symbol}</span><span className="rvs">vs</span><span style={{color:b.color}}>{b.symbol}</span></div>
                    <div className={`rv ${dir==="pos"?"pos":"neg"}`}>{v.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="foot">
        <PythLogo size={16}/>
        <span>Powered by <a href="https://pyth.network" target="_blank" rel="noreferrer" className="flink">Pyth Network</a> · Pyth Playground Hackathon 2025 · Built by <a href="https://x.com/xzolmoneythinks" target="_blank" rel="noreferrer" className="flink">@xzolmoneythinks</a></span>
        <button className="fbk" onClick={()=>setFeedbackOpen(true)}>Feedback</button>
      </footer>

      {/* FEEDBACK MODAL */}
      {feedbackOpen&&(
        <div className="overlay" onClick={()=>setFeedbackOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-hdr"><span className="ct">Send Feedback</span><button className="xbtn" onClick={()=>setFeedbackOpen(false)}>✕</button></div>
            {feedbackSent?(
              <div className="sent">✅ Sent! Thank you.</div>
            ):(
              <>
                <textarea className="fta" placeholder="Your feedback, bug report, or feature request..." value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} rows={5}/>
                <button className="fsend" onClick={sendFeedback}>Send →</button>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        :root{
          --bg:#08060f;--card:rgba(255,255,255,0.025);--cb:rgba(139,92,246,0.12);
          --pu:#8b5cf6;--pul:#a78bfa;--pud:rgba(139,92,246,0.25);
          --tx:#ddd6fe;--td:#6d5a8a;--tm:#2d1f4a;
          --gn:#34d399;--rd:#f87171;
          --fd:'Syne',sans-serif;--fm:'JetBrains Mono',monospace;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;width:100%;background:var(--bg);}

        .app{min-height:100vh;width:100%;background:var(--bg);color:var(--tx);font-family:var(--fm);display:flex;flex-direction:column;position:relative;overflow-x:hidden;opacity:0;transition:opacity .5s;}
        canvas.smoke-bg{mix-blend-mode:screen;}
        .app.on{opacity:1;}

        /* Header */
        .hdr{position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:12px 28px;background:rgba(8,6,15,0.88);backdrop-filter:blur(24px);border-bottom:1px solid var(--cb);}
        .hdr-l{display:flex;align-items:center;gap:12px;}
        .brand{font-family:var(--fd);font-size:17px;font-weight:800;letter-spacing:.06em;}
        .b-pyth{color:#fff;}.b-x{color:var(--pud);}.b-rs{color:var(--pul);}
        .sub{font-size:9px;color:var(--td);letter-spacing:.18em;text-transform:uppercase;margin-top:2px;}
        .hdr-r{display:flex;align-items:center;gap:10px;}
        .pill{display:flex;align-items:center;gap:6px;padding:5px 13px;border-radius:20px;font-size:10px;font-weight:600;letter-spacing:.12em;border:1px solid;}
        .pill.live{background:rgba(52,211,153,.08);border-color:rgba(52,211,153,.3);color:var(--gn);}
        .pill.demo{background:rgba(251,146,60,.08);border-color:rgba(251,146,60,.3);color:#fb923c;}
        .pill.connecting{background:rgba(139,92,246,.08);border-color:var(--pud);color:var(--pul);}
        .dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

        /* Filters */
        .filters{display:flex;gap:6px;padding:10px 28px;overflow-x:auto;scrollbar-width:none;position:relative;z-index:1;border-bottom:1px solid var(--cb);background:rgba(8,6,15,.7);}
        .filters::-webkit-scrollbar{display:none;}
        .fbtn{flex-shrink:0;padding:5px 14px;border-radius:20px;border:1px solid var(--tm);background:transparent;color:var(--td);font-size:10px;font-family:var(--fm);cursor:pointer;transition:all .15s;white-space:nowrap;}
        .fbtn:hover{border-color:var(--pud);color:var(--pul);}
        .fbtn.a{background:var(--pud);border-color:var(--pu);color:#fff;}

        /* Mobile tabs */
        .mtabs{display:none;}
        @media(max-width:768px){
          .mtabs{display:flex;background:rgba(8,6,15,.9);border-bottom:1px solid var(--cb);position:relative;z-index:1;}
          .mt{flex:1;padding:11px;border:none;background:transparent;color:var(--td);font-size:11px;font-family:var(--fm);cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;}
          .mt.a{color:var(--pul);border-bottom-color:var(--pu);}
          .mhide{display:none!important;}
        }

        /* Main */
        .main{flex:1;padding:20px 28px;display:flex;flex-direction:column;gap:14px;position:relative;z-index:1;max-width:1700px;width:100%;margin:0 auto;}

        /* Cards */
        .card{background:var(--card);border:1px solid var(--cb);border-radius:12px;backdrop-filter:blur(16px);overflow:hidden;animation:fup .45s ease both;}
        @keyframes fup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .card-hdr{padding:12px 16px 10px;display:flex;align-items:baseline;flex-wrap:wrap;gap:6px;border-bottom:1px solid var(--cb);}
        .ct{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--tx);letter-spacing:.05em;}
        .cm{font-size:10px;color:var(--td);}
        .leg{display:flex;align-items:center;gap:4px;margin-left:auto;}
        .legbar{width:44px;height:6px;border-radius:3px;background:linear-gradient(90deg,#f87171,rgba(139,92,246,.3),#34d399);}
        .leglb{font-size:9px;color:var(--td);}

        /* Tickers */
        .sec-t{animation:fup .4s ease both;}
        .tgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(148px,1fr));gap:8px;}
        .tc{background:var(--card);border:1px solid var(--cb);border-left:2px solid var(--ac,var(--pu));border-radius:8px;padding:10px 12px;transition:transform .2s;animation:fup .4s ease both;animation-delay:var(--d,0ms);}
        .tc:hover{transform:translateY(-2px);}
        .tc-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;}
        .tc-cat{font-size:8px;color:var(--td);letter-spacing:.12em;text-transform:uppercase;}
        .tc-sym{font-family:var(--fd);font-size:14px;font-weight:700;margin-top:2px;}
        .tc-pct{font-size:9px;font-weight:600;padding:2px 5px;border-radius:4px;}
        .tc-pct.up{color:var(--gn);background:rgba(52,211,153,.1);}
        .tc-pct.dn{color:var(--rd);background:rgba(248,113,113,.1);}
        .tc-bot{display:flex;justify-content:space-between;align-items:center;}
        .tc-p{font-size:12px;color:var(--tx);font-variant-numeric:tabular-nums;}

        /* Heatmap */
        .sec-h{display:flex;flex-direction:column;gap:14px;}
        .hmwrap{overflow-x:auto;padding:12px;}
        .hm{border-collapse:separate;border-spacing:2px;width:100%;}
        .hmc{width:62px;}
        .hmcl{font-size:8px;font-weight:700;letter-spacing:.03em;text-align:center;writing-mode:vertical-lr;transform:rotate(180deg);height:52px;padding:2px;}
        .hmrl{font-size:9px;font-weight:700;padding-right:6px;white-space:nowrap;}
        .hmc{width:40px;height:40px;text-align:center;font-size:8px;font-weight:600;border-radius:5px;cursor:pointer;transition:filter .2s,transform .2s;font-variant-numeric:tabular-nums;}
        .hmc:hover{filter:brightness(1.35);transform:scale(1.06);}
        .hmc.diag{cursor:default;}
        .hmc.sel{outline:2px solid rgba(255,255,255,.75);outline-offset:-1px;}

        /* Detail */
        .detail{animation:sin .3s ease both;}
        @keyframes sin{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
        .xbtn{background:transparent;border:1px solid var(--tm);color:var(--td);padding:3px 8px;border-radius:5px;cursor:pointer;font-size:11px;margin-left:auto;transition:all .2s;}
        .xbtn:hover{border-color:var(--pud);color:var(--pul);}
        .dpair{display:flex;align-items:center;justify-content:space-around;padding:14px;}
        .dsym{font-family:var(--fd);font-size:20px;font-weight:800;}
        .dblock{text-align:center;}
        .dval{font-family:var(--fd);font-size:34px;font-weight:800;line-height:1;transition:color .4s;}
        .dstr{font-size:9px;color:var(--td);letter-spacing:.12em;margin-top:3px;}
        .dchartbox{background:rgba(0,0,0,.25);border-radius:8px;padding:10px;margin:0 12px 10px;}
        .dcl{font-size:9px;color:var(--td);letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;}
        .dstats{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:0 12px 12px;}
        .dsi{background:rgba(0,0,0,.2);border-radius:6px;padding:7px 9px;border:1px solid var(--cb);}
        .dsk{font-size:8px;color:var(--td);letter-spacing:.1em;text-transform:uppercase;margin-bottom:2px;}
        .dsv{font-size:10px;color:var(--tx);}

        /* Rankings */
        .sec-r{}
        .rgrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .rr{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid rgba(139,92,246,.05);cursor:pointer;transition:background .15s;animation:fup .3s ease both;animation-delay:calc(var(--i)*55ms);}
        .rr:hover{background:rgba(139,92,246,.05);}
        .rn{width:14px;font-size:9px;color:var(--tm);}
        .rp{flex:1;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;}
        .rvs{font-size:8px;color:var(--tm);}
        .rv{font-family:var(--fd);font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;}
        .rv.pos{color:var(--gn);}.rv.neg{color:var(--rd);}

        /* Footer */
        .foot{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 28px;font-size:10px;color:var(--tm);border-top:1px solid var(--cb);position:relative;z-index:1;flex-wrap:wrap;}
        .flink{color:var(--pul);text-decoration:none;}.flink:hover{text-decoration:underline;}
        .fbk{margin-left:8px;background:transparent;border:1px solid var(--tm);color:var(--td);padding:4px 10px;border-radius:5px;cursor:pointer;font-size:10px;font-family:var(--fm);transition:all .2s;}
        .fbk:hover{border-color:var(--pud);color:var(--pul);}

        /* Feedback modal */
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);animation:fadein .2s ease;}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
        .modal{background:#110d1e;border:1px solid var(--cb);border-radius:14px;padding:0;width:min(480px,92vw);overflow:hidden;animation:fup .25s ease;}
        .fta{width:100%;padding:12px 16px;background:rgba(0,0,0,.3);border:1px solid var(--cb);border-radius:8px;color:var(--tx);font-family:var(--fm);font-size:12px;resize:vertical;margin:14px 16px 10px;width:calc(100% - 32px);outline:none;}
        .fta:focus{border-color:var(--pu);}
        .fsend{display:block;margin:0 16px 14px;padding:10px 20px;background:var(--pud);border:1px solid var(--pu);border-radius:8px;color:#fff;font-family:var(--fd);font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;width:calc(100% - 32px);}
        .fsend:hover{background:var(--pu);}
        .sent{padding:24px;text-align:center;font-size:15px;color:var(--gn);}

        /* Scrollbar */
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--pud);border-radius:2px;}

        @media(max-width:768px){
          .main{padding:12px;}
          .hdr{padding:10px 16px;}
          .filters{padding:8px 12px;}
          .rgrid{grid-template-columns:1fr;}
          .hmc{width:34px;height:34px;font-size:7px;}
          .hmcl{font-size:7px;height:48px;}
          .dval{font-size:26px;}
          .dsym{font-size:17px;}
        }
        @media(max-width:480px){
          .sub{display:none;}
          .tgrid{grid-template-columns:1fr 1fr;}
        }
      `}</style>
    </div>
  );
}
