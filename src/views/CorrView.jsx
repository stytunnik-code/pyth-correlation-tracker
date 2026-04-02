import { useState, useEffect, useRef, useMemo } from "react";
import PythLogo from "../components/PythLogo.jsx";
import { pearson } from "../utils/math.js";
import { fetchPyth } from "../utils/pyth.js";
import {
  WIN_CFG, pctReturns, rollingPearson, fmtAxisTime, mergeHistoricalBarsWithLiveTicks,
} from "../utils/entropy.js";

const CORR_PAIRS = [
  // Crypto pairs
  ["BTC","ETH"],["BTC","SOL"],["BTC","DOGE"],
  ["ETH","SOL"],["SOL","DOGE"],
  // Crypto vs Macro
  ["BTC","XAU/USD"],["ETH","XAU/USD"],
  ["BTC","EUR/USD"],["ETH","EUR/USD"],
  // Macro pairs
  ["XAU/USD","EUR/USD"],["XAU/USD","GBP/USD"],
  // Crypto vs Equity
  ["BTC","AAPL"],["ETH","AAPL"],
  // Index pairs
  ["SPY","QQQ"],["SPY","DIA"],["SPY","IWM"],
  // Indices vs Crypto
  ["BTC","SPY"],["ETH","QQQ"],
  // Indices vs Equity
  ["SPY","AAPL"],["QQQ","AAPL"],
];

function drawScatter(canvas, ra, rb, symA, symB, colA, colB) {
  if (!canvas) return;
  const par = canvas.parentElement; if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W<10||H<10) return;
  canvas.width=W; canvas.height=H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle="#07050f"; ctx.fillRect(0,0,W,H);

  const pts = ra.slice(-Math.min(ra.length,rb.length,200))
                .map((v,i)=>({x:v,y:rb[rb.length-Math.min(ra.length,rb.length,200)+i]}))
                .filter(p=>isFinite(p.x)&&isFinite(p.y));
  if (pts.length < 4) {
    ctx.fillStyle="rgba(124,58,237,0.4)"; ctx.font="12px 'Space Mono',monospace";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("Loading data…", W/2, H/2); return;
  }

  const PAD={t:32,r:24,b:48,l:56};
  const CW=W-PAD.l-PAD.r, CH=H-PAD.t-PAD.b;

  const xs=pts.map(p=>p.x), ys=pts.map(p=>p.y);
  const xPad=(Math.max(...xs)-Math.min(...xs))*0.15||0.05;
  const yPad=(Math.max(...ys)-Math.min(...ys))*0.15||0.05;
  const xMin=Math.min(...xs)-xPad, xMax=Math.max(...xs)+xPad;
  const yMin=Math.min(...ys)-yPad, yMax=Math.max(...ys)+yPad;
  const toX=v=>PAD.l+(v-xMin)/(xMax-xMin)*CW;
  const toY=v=>PAD.t+CH-(v-yMin)/(yMax-yMin)*CH;

  // Grid
  ctx.strokeStyle="rgba(255,255,255,0.04)"; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
    const xv=xMin+(xMax-xMin)/4*i, yv=yMin+(yMax-yMin)/4*i;
    ctx.beginPath();ctx.moveTo(toX(xv),PAD.t);ctx.lineTo(toX(xv),PAD.t+CH);ctx.stroke();
    ctx.beginPath();ctx.moveTo(PAD.l,toY(yv));ctx.lineTo(PAD.l+CW,toY(yv));ctx.stroke();
  }
  // Zero lines
  if(xMin<0&&xMax>0){ctx.strokeStyle="rgba(255,255,255,0.1)";ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(toX(0),PAD.t);ctx.lineTo(toX(0),PAD.t+CH);ctx.stroke();ctx.setLineDash([]);}
  if(yMin<0&&yMax>0){ctx.strokeStyle="rgba(255,255,255,0.1)";ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(PAD.l,toY(0));ctx.lineTo(PAD.l+CW,toY(0));ctx.stroke();ctx.setLineDash([]);}

  // Regression
  const mX=xs.reduce((s,v)=>s+v,0)/xs.length, mY=ys.reduce((s,v)=>s+v,0)/ys.length;
  const num=pts.reduce((s,p)=>s+(p.x-mX)*(p.y-mY),0);
  const den=pts.reduce((s,p)=>s+(p.x-mX)**2,0);
  if(den){
    const sl=num/den, ic=mY-sl*mX;
    ctx.strokeStyle="rgba(167,139,250,0.45)"; ctx.lineWidth=1.5; ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(toX(xMin),toY(sl*xMin+ic));ctx.lineTo(toX(xMax),toY(sl*xMax+ic));ctx.stroke();
    ctx.setLineDash([]);
  }

  // Dots — recent = brighter & larger
  pts.forEach((p,i)=>{
    const age=i/(pts.length-1);
    ctx.globalAlpha=0.15+age*0.75;
    ctx.fillStyle=age>0.6?colA:"rgba(100,80,150,1)";
    ctx.beginPath();ctx.arc(toX(p.x),toY(p.y),1.8+age*2.2,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;

  // Axis labels
  ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.font="9px 'Space Mono',monospace";
  ctx.textAlign="center"; ctx.textBaseline="top";
  ctx.fillText(symA+" return %", PAD.l+CW/2, PAD.t+CH+20);
  ctx.save();ctx.translate(PAD.l-36,PAD.t+CH/2);ctx.rotate(-Math.PI/2);
  ctx.fillText(symB+" return %",0,0);ctx.restore();

  // Axis ticks
  ctx.fillStyle="rgba(255,255,255,0.15)"; ctx.font="8px 'Space Mono',monospace";
  ctx.textAlign="center"; ctx.textBaseline="top";
  for(let i=0;i<=4;i++){const v=xMin+(xMax-xMin)/4*i;ctx.fillText(v.toFixed(1),toX(v),PAD.t+CH+5);}
  ctx.textAlign="right"; ctx.textBaseline="middle";
  for(let i=0;i<=4;i++){const v=yMin+(yMax-yMin)/4*i;ctx.fillText(v.toFixed(1),PAD.l-6,toY(v));}
}

function drawRolling(canvas, allPts, times, cutoff, windowKey) {
  if (!canvas) return;
  const par=canvas.parentElement; if(!par) return;
  const W=par.clientWidth, H=par.clientHeight;
  if(W<10||H<10) return;
  const dpr=window.devicePixelRatio||1;
  canvas.width=W*dpr; canvas.height=H*dpr;
  canvas.style.width=W+"px"; canvas.style.height=H+"px";
  const ctx=canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  ctx.fillStyle="#07050f"; ctx.fillRect(0,0,W,H);

  if(!allPts||allPts.length<2){
    ctx.fillStyle="rgba(124,58,237,0.3)"; ctx.font="11px 'Space Mono',monospace";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("Accumulating…",W/2,H/2); return;
  }

  const pts = allPts;
  const curIdx = Math.min(pts.length-1, Math.max(0, Math.round((cutoff??1)*(pts.length-1))));

  const PAD={t:16,r:64,b:34,l:40};
  const CW=W-PAD.l-PAD.r, CH=H-PAD.t-PAD.b;
  const toY=v=>PAD.t+CH*(1-(v+1)/2);
  const toX=i=>PAD.l+(i/(Math.max(pts.length-1,1)))*CW;

  const endVal=pts[pts.length-1];
  const curVal=pts[curIdx];
  const col=endVal>=0.7?"#10b981":endVal>=0?"#f59e0b":"#ef4444";
  const curCol=curVal>=0.7?"#10b981":curVal>=0?"#f59e0b":"#ef4444";

  // Bands
  [-1,-0.5,0,0.5,1].forEach(v=>{
    const y=toY(v);
    ctx.strokeStyle=v===0?"rgba(255,255,255,0.1)":"rgba(255,255,255,0.04)";
    ctx.lineWidth=1; ctx.setLineDash(v===0?[]:[3,4]);
    ctx.beginPath();ctx.moveTo(PAD.l,y);ctx.lineTo(PAD.l+CW,y);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle="rgba(255,255,255,0.2)"; ctx.font="8px 'Space Mono',monospace";
    ctx.textAlign="right"; ctx.textBaseline="middle";
    ctx.fillText(v.toFixed(1),PAD.l-4,y);
  });

  // Fill (always full)
  const grd=ctx.createLinearGradient(0,PAD.t,0,PAD.t+CH);
  grd.addColorStop(0,endVal>=0?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)");
  grd.addColorStop(1,"rgba(0,0,0,0)");
  ctx.beginPath();
  pts.forEach((v,i)=>{const x=toX(i),y=toY(v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.lineTo(toX(pts.length-1),toY(0));ctx.lineTo(toX(0),toY(0));
  ctx.closePath();ctx.fillStyle=grd;ctx.fill();

  // Line (always full)
  const lg=ctx.createLinearGradient(PAD.l,0,PAD.l+CW,0);
  lg.addColorStop(0,"rgba(124,58,237,0.7)");lg.addColorStop(1,col);
  ctx.strokeStyle=lg;ctx.lineWidth=2;ctx.lineJoin="round";
  ctx.beginPath();
  pts.forEach((v,i)=>{const x=toX(i),y=toY(v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.stroke();

  // Playhead
  const px=toX(curIdx), py=toY(curVal);
  ctx.save();
  ctx.strokeStyle=curCol; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(px,PAD.t); ctx.lineTo(px,PAD.t+CH); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Dot at playhead
  ctx.fillStyle=curCol; ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,0.6)"; ctx.lineWidth=1.5; ctx.stroke();

  // Value badge
  const bw=48, bh=16;
  const bx=px+10+bw>PAD.l+CW ? px-bw-6 : px+10;
  const by=Math.max(PAD.t,Math.min(py-bh/2,PAD.t+CH-bh));
  ctx.fillStyle=`${curCol}33`; ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,3); ctx.fill();
  ctx.strokeStyle=curCol; ctx.lineWidth=0.8; ctx.stroke();
  ctx.fillStyle="#fff"; ctx.font="bold 9px 'Space Mono',monospace";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(curVal.toFixed(3),bx+bw/2,by+bh/2);

  // X-axis time labels
  if(times&&times.length>1){
    const NUM_LABELS=5;
    ctx.fillStyle="rgba(255,255,255,0.22)"; ctx.font="8px 'Space Mono',monospace";
    ctx.textAlign="center"; ctx.textBaseline="top";
    for(let li=0;li<NUM_LABELS;li++){
      const idx=Math.round(li/(NUM_LABELS-1)*(allPts.length-1));
      const t=times[Math.min(idx,times.length-1)];
      if(!t) continue;
      const x=toX(idx);
      ctx.fillText(fmtAxisTime(t,windowKey),x,PAD.t+CH+4);
    }
  }
}

export default function CorrView({histRef, tickRef, prices, assets, setActiveTab, status, initialPair}) {
  const scatterRef = useRef();
  const rollingRef = useRef();
  const [symA, setSymA] = useState(()=>assets[0]?.symbol||"BTC");
  const [symB, setSymB] = useState(()=>assets[1]?.symbol||"ETH");
  const [corrWindow, setCorrWindow] = useState("7D");
  const [bars, setBars] = useState({});
  const [loading, setLoading] = useState(false);
  const [playPos, setPlayPos] = useState(1.0);
  const [playing, setPlaying] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const playRef = useRef(null);
  const initialPairAppliedRef = useRef(false);
  const [, tick] = useState(0);

  // Keep symbols valid if assets change
  useEffect(()=>{
    if(assets.length>0&&!assets.find(a=>a.symbol===symA)) setSymA(assets[0].symbol);
    if(assets.length>1&&!assets.find(a=>a.symbol===symB)) setSymB(assets[1].symbol);
  },[assets]); // eslint-disable-line

  // Build pairs dynamically from selected assets
  const dynPairs = useMemo(()=>{
    const syms = new Set(assets.map(a=>a.symbol));
    const valid = CORR_PAIRS.filter(([a,b])=>syms.has(a)&&syms.has(b));
    if(valid.length >= 1) return valid;
    const out=[];
    const arr=assets.slice(0,8);
    for(let i=0;i<arr.length;i++) for(let j=i+1;j<arr.length;j++) out.push([arr[i].symbol,arr[j].symbol]);
    return out.slice(0,20);
  },[assets]);

  useEffect(()=>{
    if(initialPairAppliedRef.current || !initialPair?.a || !initialPair?.b) return;
    const hasA = assets.find(a=>a.symbol===initialPair.a);
    const hasB = assets.find(a=>a.symbol===initialPair.b);
    if(hasA) setSymA(initialPair.a);
    if(hasB) setSymB(initialPair.b);
    initialPairAppliedRef.current = true;
  },[assets, initialPair]); // eslint-disable-line

  const selStyle={
    background:"#07050f",border:"1px solid rgba(124,58,237,0.3)",
    borderRadius:5,padding:"4px 10px",color:"#c4b5fd",fontSize:11,
    fontFamily:"'Space Mono',monospace",fontWeight:700,cursor:"pointer",outline:"none",
    appearance:"none",WebkitAppearance:"none",
  };

  // Fetch historical bars for active pair + window
  useEffect(()=>{
    let dead=false;
    const { tf, limit } = WIN_CFG[corrWindow];
    const toFetch=[symA,symB].filter(s=>!bars[`${corrWindow}_${s}`]);
    if(!toFetch.length) return;
    setLoading(true);
    Promise.all(toFetch.map(s=>fetchPyth(s, tf, limit)))
      .then(results=>{
        if(dead) return;
        const upd={};
        toFetch.forEach((s,i)=>{ upd[`${corrWindow}_${s}`]=results[i]; });
        setBars(p=>({...p,...upd}));
      })
      .catch(()=>{})
      .finally(()=>{if(!dead)setLoading(false);});
    return()=>{dead=true;};
  },[symA,symB,corrWindow]); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge historical bars with live ticks
  const getBarData = (sym) => {
    const key=`${corrWindow}_${sym}`;
    const hist=bars[key]||[];
    const merged=corrWindow==="1D"
      ? mergeHistoricalBarsWithLiveTicks(hist, tickRef?.current?.[sym] || [], 60, 500)
      : hist;
    return { closes:merged.map(b=>b.c), times:merged.map(b=>b.t) };
  };

  // Reset playback when pair or window changes
  useEffect(()=>{ setPlayPos(1.0); setPlaying(false); },[symA,symB,corrWindow]);

  // Play animation loop
  useEffect(()=>{
    if(!playing){ cancelAnimationFrame(playRef.current); return; }
    const step=()=>{
      setPlayPos(p=>{
        if(p>=1.0){ setPlaying(false); return 1.0; }
        return Math.min(1.0, p+0.0015);
      });
      playRef.current=requestAnimationFrame(step);
    };
    playRef.current=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(playRef.current);
  },[playing]);

  // Redraw every 2s
  useEffect(()=>{
    const iv=setInterval(()=>tick(n=>n+1),2000);
    return()=>clearInterval(iv);
  },[]);

  // Draw
  useEffect(()=>{
    const {closes:cA,times:tA}=getBarData(symA);
    const {closes:cB}=getBarData(symB);
    const ra=pctReturns(cA), rb=pctReturns(cB);
    const aAsset=assets.find(a=>a.symbol===symA)||assets[0];
    drawScatter(scatterRef.current, ra, rb, symA, symB, aAsset.color, "#a78bfa");
    const winSize=WIN_CFG[corrWindow].win;
    const rpts=rollingPearson(ra,rb,winSize);
    const rptsTimes=tA.slice(winSize+1, winSize+1+rpts.length);
    drawRolling(rollingRef.current, rpts, rptsTimes, playPos, corrWindow);
  });

  // Resize observers
  useEffect(()=>{
    const redraw=()=>{
      const {closes:cA,times:tA}=getBarData(symA);
      const {closes:cB}=getBarData(symB);
      const ra=pctReturns(cA),rb=pctReturns(cB);
      const aAsset=assets.find(a=>a.symbol===symA)||assets[0];
      drawScatter(scatterRef.current,ra,rb,symA,symB,aAsset.color,"#a78bfa");
      const winSize=WIN_CFG[corrWindow].win;
      const rpts=rollingPearson(ra,rb,winSize);
      const rptsTimes=tA.slice(winSize+1,winSize+1+rpts.length);
      drawRolling(rollingRef.current,rpts,rptsTimes,playPos,corrWindow);
    };
    const ro1=new ResizeObserver(redraw),ro2=new ResizeObserver(redraw);
    if(scatterRef.current?.parentElement) ro1.observe(scatterRef.current.parentElement);
    if(rollingRef.current?.parentElement) ro2.observe(rollingRef.current.parentElement);
    return()=>{ro1.disconnect();ro2.disconnect();};
  },[symA,symB,bars,corrWindow]); // eslint-disable-line react-hooks/exhaustive-deps

  const {closes:cA,times:tA}=getBarData(symA);
  const {closes:cB}=getBarData(symB);
  const ra=pctReturns(cA),rb=pctReturns(cB);
  const n=Math.min(ra.length,rb.length);
  const winSize=WIN_CFG[corrWindow].win;
  const rpts=rollingPearson(ra,rb,winSize);
  const visIdx=Math.max(0,Math.round(playPos*rpts.length)-1);
  const corrVal=rpts.length>0?rpts[visIdx]:n>=4?pearson(ra.slice(-Math.min(n,60)),rb.slice(-Math.min(n,60))):null;
  const dateStart=tA.length>0?new Date(tA[0]*1000):null;
  const dateCutIdx=Math.round(playPos*(tA.length-1));
  const dateEnd=tA.length>0?new Date(tA[dateCutIdx]*1000):null;
  const fmtDate=d=>d?d.toLocaleDateString("en",{day:"2-digit",month:"short",year:"numeric"}):"";
  const aAsset=assets.find(a=>a.symbol===symA)||assets[0];
  const bAsset=assets.find(a=>a.symbol===symB)||assets[0];
  const fmtP=v=>!v?"–":v>=10000?"$"+v.toLocaleString(undefined,{maximumFractionDigits:0}):v>=100?"$"+v.toFixed(2):v>=1?"$"+v.toFixed(4):"$"+v.toFixed(6);
  const corrColor=corrVal===null?"rgba(255,255,255,0.2)":corrVal>=0.7?"#10b981":corrVal>=0.3?"#f59e0b":corrVal>=-0.3?"rgba(255,255,255,0.5)":corrVal>=-0.7?"#f59e0b":"#ef4444";
  const corrLabel=corrVal===null?"–":corrVal>=0.7?"Strong +":corrVal>=0.3?"Moderate +":corrVal>=-0.3?"Weak":corrVal>=-0.7?"Moderate −":"Strong −";

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#07050f",fontFamily:"'Space Mono',monospace",overflow:"hidden"}}>

      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",height:48,padding:"0 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0b0917",flexShrink:0,gap:16}}>
        <PythLogo size={22}/>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>CORRELATION</span>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {loading&&<span style={{fontSize:9,color:"rgba(124,58,237,0.6)",letterSpacing:".06em"}}>LOADING…</span>}
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

      {/* Controls: pair dropdowns + quick select */}
      <div style={{display:"flex",flexDirection:"column",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#080614",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",flexWrap:"wrap"}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>PAIR</span>
          <select value={symA} onChange={e=>{setSymA(e.target.value);setPlayPos(1.0);setPlaying(false);}} style={selStyle}>
            {assets.map(a=><option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
          </select>
          <span style={{fontSize:12,color:"rgba(255,255,255,0.2)"}}>vs</span>
          <select value={symB} onChange={e=>{setSymB(e.target.value);setPlayPos(1.0);setPlaying(false);}} style={selStyle}>
            {assets.map(a=><option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
          </select>
          {symA===symB&&<span style={{fontSize:9,color:"#f87171",letterSpacing:".04em"}}>pick different assets</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:2,padding:"4px 12px",overflowX:"auto",scrollbarWidth:"none"}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.15)",letterSpacing:".1em",flexShrink:0,marginRight:4}}>QUICK</span>
          {dynPairs.map(([a,b],i)=>{
            const sel=a===symA&&b===symB||a===symB&&b===symA;
            const aA=assets.find(x=>x.symbol===a)||assets[0];
            return (
              <button key={i} onClick={()=>{setSymA(a);setSymB(b);setPlayPos(1.0);setPlaying(false);}}
                style={{flexShrink:0,background:sel?"rgba(124,58,237,0.22)":"rgba(255,255,255,0.03)",border:`1px solid ${sel?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.07)"}`,borderRadius:12,padding:"2px 10px",cursor:"pointer",fontSize:9,fontWeight:sel?700:500,color:sel?"#c4b5fd":"rgba(255,255,255,0.3)",fontFamily:"inherit",letterSpacing:".03em",transition:"all .12s"}}>
                <span style={{color:sel?aA.color:"inherit"}}>{a}</span>/{b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div className="corr-stats-bar" style={{display:"flex",alignItems:"center",gap:0,padding:"0 16px",height:56,borderBottom:"1px solid rgba(255,255,255,0.04)",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"baseline",gap:6,marginRight:20}}>
          <span style={{fontSize:11,fontWeight:700,color:aAsset.color,letterSpacing:".04em"}}>{symA}</span>
          <span style={{fontSize:18,fontWeight:700,color:"#fff"}}>{fmtP(prices[symA])}</span>
        </div>
        <div style={{width:1,height:24,background:"rgba(255,255,255,0.06)",marginRight:20}}/>
        <div style={{display:"flex",alignItems:"baseline",gap:6,marginRight:24}}>
          <span style={{fontSize:11,fontWeight:700,color:bAsset.color,letterSpacing:".04em"}}>{symB}</span>
          <span style={{fontSize:18,fontWeight:700,color:"#fff"}}>{fmtP(prices[symB])}</span>
        </div>
        <div style={{width:1,height:24,background:"rgba(255,255,255,0.06)",marginRight:24}}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:".1em"}}>PEARSON r</span>
            <span style={{fontSize:24,fontWeight:800,color:corrColor,lineHeight:1,letterSpacing:"-.02em"}}>{corrVal===null?"–":corrVal.toFixed(3)}</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>
            <span style={{fontSize:9,padding:"2px 8px",borderRadius:2,background:corrColor==="rgba(255,255,255,0.2)"?"rgba(255,255,255,0.05)":`${corrColor}22`,color:corrColor,fontWeight:700,letterSpacing:".06em"}}>{corrLabel}</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>last 60 ticks · {n} pts</span>
          </div>
        </div>
        {corrVal!==null&&<div style={{marginLeft:"auto",width:120,height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
          <div style={{width:`${((corrVal+1)/2)*100}%`,height:"100%",background:`linear-gradient(90deg,#ef4444,#f59e0b,#10b981)`,borderRadius:3}}/>
        </div>}
      </div>

      {/* Charts side by side */}
      <div className="corr-charts-wrap" style={{flex:1,display:"flex",gap:1,minHeight:0}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>SCATTER — RETURNS ({n} pts)</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.15)"}}>recent = brighter</span>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={scatterRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>
        <div style={{width:1,background:"rgba(255,255,255,0.05)",flexShrink:0}}/>
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
          <div style={{padding:"6px 12px 4px",flexShrink:0,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginRight:4}}>ROLLING</span>
            {Object.entries(WIN_CFG).map(([k,cfg])=>(
              <button key={k} onClick={()=>setCorrWindow(k)} style={{
                padding:"2px 8px",borderRadius:10,border:`1px solid ${corrWindow===k?"#7c3aed":"rgba(255,255,255,0.1)"}`,
                background:corrWindow===k?"rgba(124,58,237,0.2)":"transparent",
                color:corrWindow===k?"#c4b5fd":"rgba(255,255,255,0.35)",
                fontSize:9,fontFamily:"inherit",fontWeight:700,cursor:"pointer",letterSpacing:".04em",
                transition:"all .15s"
              }}>{k}</button>
            ))}
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
              {dateStart&&<span style={{fontSize:8,color:"rgba(255,255,255,0.2)",whiteSpace:"nowrap"}}>
                {fmtDate(dateStart)} → {fmtDate(dateEnd)}
              </span>}
              <button onClick={()=>{
                if(playing){setPlaying(false);}
                else{if(playPos>=0.98)setPlayPos(0.05);setPlaying(true);}
              }} style={{
                padding:"3px 10px",borderRadius:10,border:"1px solid rgba(124,58,237,0.4)",
                background:playing?"rgba(239,68,68,0.15)":"rgba(124,58,237,0.15)",
                color:playing?"#f87171":"#a78bfa",
                fontSize:10,fontFamily:"inherit",fontWeight:700,cursor:"pointer",letterSpacing:".04em",
                transition:"all .15s"
              }}>{playing?"⏸ Pause":"▶ Play"}</button>
            </div>
          </div>
          {/* Scrubber */}
          <div style={{padding:"0 12px 2px",flexShrink:0}}>
            <input type="range" min={0} max={100} step={0.5}
              value={Math.round(playPos*100)}
              onChange={e=>{setPlaying(false);setPlayPos(Number(e.target.value)/100);}}
              onMouseDown={()=>setScrubbing(true)}
              onMouseUp={()=>setScrubbing(false)}
              onTouchStart={()=>setScrubbing(true)}
              onTouchEnd={()=>setScrubbing(false)}
              style={{width:"100%",accentColor:"#7c3aed",cursor:"pointer",height:3}}
            />
            <div style={{
              height:14,
              display:"flex",alignItems:"center",justifyContent:"center",
              transition:"opacity .15s",
              opacity:(scrubbing||playing||playPos<0.99)?1:0,
            }}>
              {dateEnd&&<span style={{
                fontSize:10,fontFamily:"'Space Mono',monospace",fontWeight:700,
                color:"#c4b5fd",letterSpacing:".04em",
                padding:"1px 10px",borderRadius:8,
                background:"rgba(124,58,237,0.15)",
                border:"1px solid rgba(124,58,237,0.3)",
              }}>
                {dateEnd.toLocaleDateString("en",{day:"2-digit",month:"short",year:"numeric"})}
                {" · "}
                {dateEnd.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </span>}
            </div>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={rollingRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>
      </div>
    </div>
  );
}
