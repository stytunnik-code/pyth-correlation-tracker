import { useState, useEffect, useRef, useMemo } from "react";
import PythLogo from "../components/PythLogo.jsx";
import { pearson } from "../utils/math.js";
import { fetchPyth } from "../utils/pyth.js";
import {
  WIN_CFG, MAX_LAG, pctReturns, rollingPearson,
  crossCorrFull, findLeadLagValidated, fmtLag, mergeHistoricalBarsWithLiveTicks,
} from "../utils/entropy.js";

function drawXCorr(canvas, pts, symA, symB, windowKey, hoverIdx=null) {
  if(!canvas||!pts||!pts.length) return;
  const par=canvas.parentElement; if(!par) return;
  const W=par.clientWidth||canvas.offsetWidth, H=par.clientHeight||canvas.offsetHeight;
  if(W<10||H<10) return;
  const dpr=window.devicePixelRatio||1;
  canvas.width=W*dpr; canvas.height=H*dpr;
  canvas.style.width=W+"px"; canvas.style.height=H+"px";
  const ctx=canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  ctx.fillStyle="#07050f"; ctx.fillRect(0,0,W,H);

  const PAD={t:32,r:22,b:50,l:46};
  const CW=W-PAD.l-PAD.r, CH=H-PAD.t-PAD.b;
  const n=pts.length;
  const toX=i=>PAD.l+i*(CW/(n-1));
  const toY=v=>PAD.t+CH*((1-v)/2);
  const zero=toY(0);

  // Zone backgrounds (B leads left, A leads right)
  const zeroI=pts.findIndex(p=>p.lag===0);
  if(zeroI>=0){
    const zX=toX(zeroI);
    const gA=ctx.createLinearGradient(zX,0,PAD.l+CW,0);
    gA.addColorStop(0,"rgba(124,58,237,0.06)"); gA.addColorStop(1,"rgba(124,58,237,0.13)");
    ctx.fillStyle=gA; ctx.fillRect(zX,PAD.t,PAD.l+CW-zX,CH);
    const gB=ctx.createLinearGradient(PAD.l,0,zX,0);
    gB.addColorStop(0,"rgba(59,130,246,0.09)"); gB.addColorStop(1,"rgba(59,130,246,0.02)");
    ctx.fillStyle=gB; ctx.fillRect(PAD.l,PAD.t,zX-PAD.l,CH);
  }

  // Horizontal grid lines
  [-1,-0.5,0,0.5,1].forEach(v=>{
    const y=toY(v);
    ctx.strokeStyle=v===0?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.05)";
    ctx.lineWidth=v===0?1.5:1; ctx.setLineDash(v===0?[]:[2,5]);
    ctx.beginPath(); ctx.moveTo(PAD.l,y); ctx.lineTo(PAD.l+CW,y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=v===0?"rgba(255,255,255,0.38)":"rgba(255,255,255,0.2)";
    ctx.font=`${v===0?"bold ":""}9px 'Space Mono',monospace`;
    ctx.textAlign="right"; ctx.textBaseline="middle";
    ctx.fillText(v.toFixed(1),PAD.l-6,y);
  });

  // Find peak
  const best=pts.reduce((a,b)=>Math.abs(b.corr)>Math.abs(a.corr)?b:a);
  const peakI=pts.findIndex(p=>p.lag===best.lag);
  const peakX=toX(peakI), peakY=toY(best.corr);
  const peakCol=best.corr>=0?"#10b981":"#ef4444";
  const peakColLight=best.corr>=0?"#34d399":"#f87171";

  // Filled area
  ctx.beginPath();
  ctx.moveTo(toX(0), zero);
  pts.forEach((p,i)=>ctx.lineTo(toX(i),toY(p.corr)));
  ctx.lineTo(toX(n-1), zero);
  ctx.closePath();
  const fillGrad=ctx.createLinearGradient(0,PAD.t,0,PAD.t+CH);
  fillGrad.addColorStop(0,   "rgba(16,185,129,0.25)");
  fillGrad.addColorStop(0.5, "rgba(239,68,68,0.12)");
  fillGrad.addColorStop(1,   "rgba(16,185,129,0.25)");
  ctx.fillStyle=fillGrad; ctx.fill();

  // Line colored by |corr|
  ctx.lineWidth=2.5; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.setLineDash([]);
  for(let i=0;i<n-1;i++){
    const mc=(Math.abs(pts[i].corr)+Math.abs(pts[i+1].corr))/2;
    const t=Math.min(1,mc/0.65);
    const r=Math.round(239+(16-239)*t);
    const g=Math.round(68+(185-68)*t);
    const b2=Math.round(68+(129-68)*t);
    ctx.strokeStyle=`rgba(${r},${g},${b2},0.95)`;
    ctx.beginPath();
    ctx.moveTo(toX(i),toY(pts[i].corr));
    ctx.lineTo(toX(i+1),toY(pts[i+1].corr));
    ctx.stroke();
  }

  // Vertical zero-lag line
  if(zeroI>=0){
    const zX=toX(zeroI);
    ctx.strokeStyle="rgba(124,58,237,0.8)"; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(zX,PAD.t); ctx.lineTo(zX,PAD.t+CH); ctx.stroke();
    ctx.font="bold 8px 'Space Mono',monospace"; ctx.textBaseline="top";
    ctx.fillStyle="rgba(167,139,250,0.65)"; ctx.textAlign="left";
    ctx.fillText(`${symA} leads →`,zX+5,PAD.t+5);
    ctx.fillStyle="rgba(96,165,250,0.6)"; ctx.textAlign="right";
    ctx.fillText(`← ${symB} leads`,zX-5,PAD.t+5);
  }

  // Peak dashed guide line
  ctx.strokeStyle=best.corr>=0?"rgba(16,185,129,0.35)":"rgba(239,68,68,0.35)";
  ctx.lineWidth=1; ctx.setLineDash([3,4]);
  ctx.beginPath(); ctx.moveTo(peakX,PAD.t+CH); ctx.lineTo(peakX,peakY); ctx.stroke();
  ctx.setLineDash([]);

  // Peak dot (glow)
  ctx.shadowColor=peakCol; ctx.shadowBlur=14;
  ctx.fillStyle=peakCol;
  ctx.beginPath(); ctx.arc(peakX,peakY,5.5,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur=0;
  ctx.fillStyle="#07050f"; ctx.beginPath(); ctx.arc(peakX,peakY,2.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=peakColLight; ctx.beginPath(); ctx.arc(peakX,peakY,1.5,0,Math.PI*2); ctx.fill();

  // Peak value label (pill)
  const isAbove=best.corr>=0;
  const valTxt=`${best.corr>=0?"+":""}${best.corr.toFixed(3)}`;
  ctx.font="bold 10px 'Space Mono',monospace"; ctx.textAlign="center";
  const tw=ctx.measureText(valTxt).width;
  const lx=Math.max(PAD.l+tw/2+6, Math.min(PAD.l+CW-tw/2-6, peakX));
  const ly=isAbove ? peakY-10 : peakY+10;
  const pillH=17, pillW=tw+14;
  ctx.fillStyle="rgba(7,5,15,0.82)";
  ctx.strokeStyle=peakCol+"88"; ctx.lineWidth=1;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(lx-pillW/2, ly-(isAbove?pillH:0), pillW, pillH, 4)
                : ctx.rect(lx-pillW/2, ly-(isAbove?pillH:0), pillW, pillH);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle=peakColLight; ctx.textBaseline=isAbove?"bottom":"top";
  ctx.fillText(valTxt, lx, ly);

  // X-axis lag labels
  const step=Math.max(1,Math.ceil(n/10));
  ctx.textAlign="center"; ctx.textBaseline="top"; ctx.font="9px 'Space Mono',monospace";
  pts.forEach((p,i)=>{
    if(i%step===0||p.lag===0||p.lag===best.lag){
      const lbl=p.lag===0?"0":`${p.lag>0?"+":""}${fmtLag(Math.abs(p.lag),windowKey)}`;
      ctx.fillStyle=p.lag===best.lag?peakColLight:"rgba(255,255,255,0.22)";
      ctx.fillText(lbl,toX(i),PAD.t+CH+6);
    }
  });

  // Bottom label
  ctx.fillStyle="rgba(255,255,255,0.1)"; ctx.font="8px 'Space Mono',monospace";
  ctx.textAlign="center"; ctx.textBaseline="top";
  ctx.fillText("← lag (bars) →",PAD.l+CW/2,PAD.t+CH+28);

  // Title
  ctx.fillStyle="rgba(255,255,255,0.22)"; ctx.font="bold 9px 'Space Mono',monospace";
  ctx.textAlign="center"; ctx.textBaseline="top";
  ctx.fillText(`Cross-Correlation Function  ·  ${symA} vs ${symB}`,PAD.l+CW/2,6);

  // Hover crosshair
  if(hoverIdx!==null && hoverIdx>=0 && hoverIdx<pts.length){
    const hp=pts[hoverIdx];
    const hx=toX(hoverIdx), hy=toY(hp.corr);
    ctx.strokeStyle="rgba(255,255,255,0.28)"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(hx,PAD.t); ctx.lineTo(hx,PAD.t+CH); ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle="rgba(255,255,255,0.12)"; ctx.lineWidth=1; ctx.setLineDash([2,4]);
    ctx.beginPath(); ctx.moveTo(PAD.l,hy); ctx.lineTo(hx,hy); ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowColor="rgba(255,255,255,0.5)"; ctx.shadowBlur=10;
    ctx.fillStyle="#fff";
    ctx.beginPath(); ctx.arc(hx,hy,4.5,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    ctx.fillStyle="#07050f";
    ctx.beginPath(); ctx.arc(hx,hy,1.8,0,Math.PI*2); ctx.fill();
  }
}

function drawPriceLines(canvas, cA, cB, symA, symB, colA, colB, result, windowKey, hoverIdx) {
  if(!canvas) return;
  const par=canvas.parentElement; if(!par) return;
  const W=par.clientWidth||canvas.offsetWidth, H=par.clientHeight||canvas.offsetHeight;
  if(W<10||H<10) return;
  const dpr=window.devicePixelRatio||1;
  canvas.width=W*dpr; canvas.height=H*dpr;
  canvas.style.width=W+"px"; canvas.style.height=H+"px";
  const ctx=canvas.getContext("2d");
  ctx.scale(dpr,dpr);
  ctx.fillStyle="#07050f"; ctx.fillRect(0,0,W,H);

  const N=Math.min(cA.length,cB.length);
  if(N<2){ ctx.fillStyle="rgba(255,255,255,0.1)"; ctx.font="10px 'Space Mono',monospace"; ctx.textAlign="center"; ctx.fillText("ACCUMULATING DATA…",W/2,H/2); return; }

  const PAD={t:28,r:20,b:36,l:54};
  const CW=W-PAD.l-PAD.r, CH=H-PAD.t-PAD.b;
  const slA=cA.slice(-N), slB=cB.slice(-N);
  const nA=slA.map(v=>(v/slA[0]-1)*100);
  const nB=slB.map(v=>(v/slB[0]-1)*100);

  const all=[...nA,...nB];
  const minV=Math.min(...all), maxV=Math.max(...all);
  const range=maxV-minV||1;
  const padV=range*0.1;
  const lo=minV-padV, hi=maxV+padV;

  const toX=i=>PAD.l+i*(CW/(N-1));
  const toY=v=>PAD.t+CH*(1-(v-lo)/(hi-lo));

  // hex → rgba helper
  const hr=(hex,a)=>{ try{ const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16); return `rgba(${r},${g},${b},${a})`; }catch(e){ return `rgba(167,139,250,${a})`; } };

  // Grid lines
  const yStep=(hi-lo)/4;
  for(let i=0;i<=4;i++){
    const v=lo+yStep*i; const y=toY(v);
    ctx.strokeStyle=v===0?"rgba(255,255,255,0.18)":"rgba(255,255,255,0.05)";
    ctx.lineWidth=v===0?1.2:1; ctx.setLineDash(v===0?[]:[2,5]);
    ctx.beginPath(); ctx.moveTo(PAD.l,y); ctx.lineTo(PAD.l+CW,y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=v===0?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.2)";
    ctx.font=(v===0?"bold ":"")+"8px 'Space Mono',monospace";
    ctx.textAlign="right"; ctx.textBaseline="middle";
    ctx.fillText(`${v>=0?"+":""}${v.toFixed(1)}%`,PAD.l-5,y);
  }

  // Subtle fill areas
  const zeroY=toY(Math.max(lo,Math.min(hi,0)));
  [[nA,colA],[nB,colB]].forEach(([arr,col])=>{
    ctx.beginPath();
    arr.forEach((v,i)=>{ i===0?ctx.moveTo(toX(i),toY(v)):ctx.lineTo(toX(i),toY(v)); });
    ctx.lineTo(toX(N-1),zeroY); ctx.lineTo(toX(0),zeroY); ctx.closePath();
    ctx.fillStyle=hr(col,0.05);
    ctx.fill();
  });

  // Lines
  [[nA,colA],[nB,colB]].forEach(([arr,col])=>{
    ctx.strokeStyle=hr(col,0.95);
    ctx.lineWidth=2; ctx.lineJoin="round"; ctx.lineCap="round"; ctx.setLineDash([]);
    ctx.beginPath();
    arr.forEach((v,i)=>{ i===0?ctx.moveTo(toX(i),toY(v)):ctx.lineTo(toX(i),toY(v)); });
    ctx.stroke();
  });

  // Legend
  [[symA,colA,nA],[symB,colB,nB]].forEach(([sym,col,arr],i)=>{
    const lx=PAD.l+8+i*110, ly=PAD.t+10;
    const lastVal=arr[arr.length-1];
    const col2=lastVal>=0?"#10b981":"#ef4444";
    try{ ctx.fillStyle=col; }catch(e){ ctx.fillStyle="#a78bfa"; }
    ctx.fillRect(lx,ly-3,20,3);
    ctx.fillStyle="rgba(255,255,255,0.65)"; ctx.font="bold 9px 'Space Mono',monospace";
    ctx.textAlign="left"; ctx.textBaseline="middle";
    ctx.fillText(sym,lx+24,ly-1);
    ctx.fillStyle=col2; ctx.font="8px 'Space Mono',monospace";
    ctx.fillText(`${lastVal>=0?"+":""}${lastVal.toFixed(2)}%`,lx+24+ctx.measureText(sym).width+6,ly-1);
  });

  // X axis date labels
  const msPerBar2={"1D":60*1000,"7D":3600*1000,"30D":4*3600*1000,"90D":86400*1000}[windowKey]||60*1000;
  const step=Math.max(1,Math.floor(N/6));
  ctx.textAlign="center"; ctx.textBaseline="top"; ctx.font="8px 'Space Mono',monospace"; ctx.fillStyle="rgba(255,255,255,0.2)";
  for(let i=0;i<N;i+=step){
    const barsAgo=N-1-i;
    if(barsAgo===0){ ctx.fillText("now",toX(i),PAD.t+CH+5); continue; }
    const d=new Date(Date.now()-barsAgo*msPerBar2);
    const lbl=windowKey==="1D"
      ? d.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})
      : windowKey==="7D"
        ? `${d.getDate()} ${d.toLocaleString("en",{month:"short"})} ${d.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}`
        : `${d.getDate()} ${d.toLocaleString("en",{month:"short"})}`;
    ctx.fillText(lbl,toX(i),PAD.t+CH+5);
  }

  // Title
  ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.font="bold 9px 'Space Mono',monospace";
  ctx.textAlign="center"; ctx.textBaseline="top";
  ctx.fillText(`Price  ·  ${symA} vs ${symB}`,PAD.l+CW/2,5);

  // Hover crosshair
  if(hoverIdx!==null&&hoverIdx>=0&&hoverIdx<N){
    const hx=toX(hoverIdx);
    ctx.strokeStyle="rgba(255,255,255,0.22)"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(hx,PAD.t); ctx.lineTo(hx,PAD.t+CH); ctx.stroke();
    ctx.setLineDash([]);
    [[nA,colA],[nB,colB]].forEach(([arr,col])=>{
      const hy=toY(arr[hoverIdx]);
      try{ ctx.shadowColor=col; }catch(e){}
      ctx.shadowBlur=8;
      try{ ctx.fillStyle=col; }catch(e){ ctx.fillStyle="#a78bfa"; }
      ctx.beginPath(); ctx.arc(hx,hy,4.5,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle="#07050f"; ctx.beginPath(); ctx.arc(hx,hy,1.8,0,Math.PI*2); ctx.fill();
    });
  }
}

export default function LeadLagView({histRef, tickRef, prices, assets, setActiveTab, status}) {
  const xcRef = useRef();
  const [llWindow, setLlWindow] = useState("7D");
  const [llBars, setLlBars]     = useState({});
  const [symA, setSymA]         = useState(()=>assets[0]?.symbol||"BTC");
  const [symB, setSymB]         = useState(()=>assets[1]?.symbol||"ETH");
  const [loading, setLoading]   = useState(false);
  const [showTip, setShowTip]   = useState(false);
  const [hoverInfo, setHoverInfo] = useState(null);
  const hoverIdxRef = useRef(null);
  const xcContRef = useRef();
  const [, tick] = useState(0);

  // Keep symbols valid if assets change
  useEffect(()=>{
    if(assets.length>0&&!assets.find(a=>a.symbol===symA)) setSymA(assets[0].symbol);
    if(assets.length>1&&!assets.find(a=>a.symbol===symB)) setSymB(assets[1].symbol);
  },[assets]); // eslint-disable-line

  // Fetch bars for selected pair
  useEffect(()=>{
    let dead=false;
    const {tf,limit}=WIN_CFG[llWindow];
    const toFetch=[symA,symB].filter(s=>!llBars[`${llWindow}_${s}`]);
    if(!toFetch.length) return;
    setLoading(true);
    Promise.all(toFetch.map(s=>fetchPyth(s,tf,limit)))
      .then(results=>{
        if(dead) return;
        const upd={};
        toFetch.forEach((s,i)=>{ upd[`${llWindow}_${s}`]=results[i]; });
        setLlBars(p=>({...p,...upd}));
      })
      .catch(()=>{}).finally(()=>{ if(!dead) setLoading(false); });
    return()=>{ dead=true; };
  },[symA,symB,llWindow]); // eslint-disable-line

  // Live refresh every 3s
  useEffect(()=>{
    const iv=setInterval(()=>tick(n=>n+1),3000);
    return()=>clearInterval(iv);
  },[]);

  const getCloses = sym => {
    const hist=llBars[`${llWindow}_${sym}`]||[];
    if(llWindow!=="1D") return hist.map(b=>b.c).slice(-500);
    return mergeHistoricalBarsWithLiveTicks(hist, tickRef?.current?.[sym] || [], 60, 500).map(b=>b.c);
  };

  const cA=getCloses(symA), cB=getCloses(symB);
  const ra=pctReturns(cA), rb=pctReturns(cB);
  const maxLag=MAX_LAG[llWindow]||24;
  const result=symA!==symB&&ra.length>maxLag*2&&rb.length>maxLag*2
    ? findLeadLagValidated(symA,symB,ra,rb,maxLag) : null;

  const aAsset=assets.find(x=>x.symbol===symA)||{color:"#a78bfa",symbol:symA};
  const bAsset=assets.find(x=>x.symbol===symB)||{color:"#7c3aed",symbol:symB};

  // Draw chart on every render (canvas)
  useEffect(()=>{
    const N=Math.min(cA.length,cB.length,300);
    if(N>1) drawPriceLines(xcRef.current,cA,cB,symA,symB,aAsset.color,bAsset.color,result,llWindow,hoverIdxRef.current);
  });
  useEffect(()=>{
    const redraw=()=>{
      const N=Math.min(cA.length,cB.length,300);
      if(N>1) drawPriceLines(xcRef.current,cA,cB,symA,symB,aAsset.color,bAsset.color,result,llWindow,hoverIdxRef.current);
    };
    const ro=new ResizeObserver(redraw);
    if(xcRef.current?.parentElement) ro.observe(xcRef.current.parentElement);
    return()=>ro.disconnect();
  },[symA,symB,llBars,llWindow]); // eslint-disable-line

  // Mouse handlers for hover tooltip
  const handleChartMouseMove = (e) => {
    if(!xcContRef.current) return;
    const rect = xcContRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const PAD = {t:28,r:20,b:36,l:54};
    const CW = rect.width - PAD.l - PAD.r;
    const N = Math.min(cA.length, cB.length);
    if(N<2 || mouseX<PAD.l || mouseX>PAD.l+CW) {
      if(hoverIdxRef.current!==null){ hoverIdxRef.current=null; setHoverInfo(null); }
      return;
    }
    const idx = Math.max(0, Math.min(N-1, Math.round((mouseX-PAD.l)/(CW/(N-1)))));
    hoverIdxRef.current = idx;
    setHoverInfo({ idx, cx: mouseX, cy: mouseY, N });
  };
  const handleChartMouseLeave = () => { hoverIdxRef.current=null; setHoverInfo(null); };

  // All N*(N-1)/2 pairs from every visible asset
  const allPairsRanked = useMemo(()=>{
    const syms=assets.map(a=>a.symbol);
    const rows=[];
    for(let i=0;i<syms.length;i++){
      for(let j=i+1;j<syms.length;j++){
        const a=syms[i], b=syms[j];
        const rra=pctReturns(getCloses(a)), rrb=pctReturns(getCloses(b));
        const ml=Math.min(maxLag, Math.floor(Math.min(rra.length,rrb.length)/3));
        if(ml>=1&&rra.length>ml*2&&rrb.length>ml*2){
          const r=findLeadLagValidated(a,b,rra,rrb,ml);
          if(r) rows.push({a,b,r});
        }
      }
    }
    return rows.sort((x,y)=>Math.abs((y.r.validatedCorr ?? y.r.corrAtLag) || 0)-Math.abs((x.r.validatedCorr ?? x.r.corrAtLag) || 0));
  },[assets,llBars,llWindow,tick]); // eslint-disable-line

  const corrCol=v=>v==null?"rgba(255,255,255,0.3)":Math.abs(v)>=0.7?"#10b981":Math.abs(v)>=0.4?"#f59e0b":"rgba(255,255,255,0.35)";
  const leaderAsset=result?assets.find(x=>x.symbol===result.leader)||aAsset:null;
  const followerAsset=result?assets.find(x=>x.symbol===result.follower)||bAsset:null;
  const totalPairs=assets.length*(assets.length-1)/2;

  const selStyle={
    background:"#07050f",border:"1px solid rgba(124,58,237,0.3)",
    borderRadius:5,padding:"4px 10px",color:"#c4b5fd",fontSize:11,
    fontFamily:"'Space Mono',monospace",fontWeight:700,cursor:"pointer",outline:"none",
    appearance:"none",WebkitAppearance:"none",
  };

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#07050f",fontFamily:"'Space Mono',monospace",overflow:"hidden"}}>

      {/* ── Top bar ── */}
      <div style={{display:"flex",alignItems:"center",height:48,padding:"0 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0b0917",flexShrink:0,gap:16}}>
        <PythLogo size={22}/>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>LEAD-LAG DETECTOR</span>
        <div className="vt-label" style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
          <button
            onMouseEnter={()=>setShowTip(true)}
            onMouseLeave={()=>setShowTip(false)}
            style={{width:18,height:18,borderRadius:"50%",background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.45)",color:"#c4b5fd",fontSize:10,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,lineHeight:1,flexShrink:0}}
          >?</button>
          {showTip&&(
            <div style={{position:"absolute",top:"calc(100% + 10px)",left:"50%",transform:"translateX(-20%)",width:290,background:"#150f28",border:"1px solid rgba(124,58,237,0.35)",borderRadius:10,padding:"14px 16px",zIndex:999,boxShadow:"0 12px 40px rgba(0,0,0,0.7)",pointerEvents:"none"}}>
              <div style={{fontSize:12,fontWeight:800,color:"#c4b5fd",marginBottom:8,letterSpacing:".04em"}}>What is Lead-Lag?</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.65)",lineHeight:1.7,marginBottom:10}}>
                Detects which asset moves <span style={{color:"#a78bfa",fontWeight:700}}>first</span>. If BTC → ETH by 15 min, Bitcoin's price moves tend to be followed by Ethereum ~15 minutes later — giving a predictive signal.
              </div>
              <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.35)",letterSpacing:".08em",marginBottom:6}}>HOW TO USE</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",lineHeight:1.8}}>
                <span style={{color:"#7c3aed",fontWeight:700}}>1.</span> Pick two assets from the <span style={{color:"#c4b5fd"}}>PAIR</span> dropdowns<br/>
                <span style={{color:"#7c3aed",fontWeight:700}}>2.</span> Choose a <span style={{color:"#c4b5fd"}}>time window</span> (1D = 1-min bars, 7D = hourly)<br/>
                <span style={{color:"#7c3aed",fontWeight:700}}>3.</span> The chart shows correlation at every possible time-shift<br/>
                <span style={{color:"#7c3aed",fontWeight:700}}>4.</span> The <span style={{color:"#10b981",fontWeight:700}}>peak</span> = best predictive lag between the pair<br/>
                <span style={{color:"#7c3aed",fontWeight:700}}>5.</span> Right panel ranks <span style={{color:"#c4b5fd"}}>all pairs</span> by correlation strength
              </div>
            </div>
          )}
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {loading&&<span style={{fontSize:9,color:"rgba(124,58,237,0.6)",letterSpacing:".06em"}}>LOADING…</span>}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:3,background:status==="live"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${status==="live"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:status==="live"?"#10b981":"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:status==="live"?"#10b981":"#ef4444"}}>{status==="live"?"LIVE":"DEMO"}</span>
          </div>
          <button onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"6px 15px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,letterSpacing:".05em"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.6)";e.currentTarget.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#080614",flexShrink:0,flexWrap:"wrap"}}>
        <span style={{fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>WINDOW</span>
        <div style={{display:"flex",gap:4}}>
          {Object.keys(WIN_CFG).map(k=>(
            <button key={k} onClick={()=>setLlWindow(k)} style={{padding:"3px 10px",borderRadius:10,border:`1px solid ${llWindow===k?"#7c3aed":"rgba(255,255,255,0.1)"}`,background:llWindow===k?"rgba(124,58,237,0.2)":"transparent",color:llWindow===k?"#c4b5fd":"rgba(255,255,255,0.35)",fontSize:9,fontFamily:"inherit",fontWeight:700,cursor:"pointer"}}>{k}</button>
          ))}
        </div>
        <div style={{width:1,height:16,background:"rgba(255,255,255,0.08)",margin:"0 4px"}}/>
        <span style={{fontSize:9,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>PAIR</span>
        <select value={symA} onChange={e=>{setSymA(e.target.value);}} style={selStyle}>
          {assets.map(a=><option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
        </select>
        <span style={{fontSize:12,color:"rgba(255,255,255,0.2)"}}>vs</span>
        <select value={symB} onChange={e=>{setSymB(e.target.value);}} style={selStyle}>
          {assets.map(a=><option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
        </select>
        {result&&result.lagBars>0&&(
          <div className="ll-ctrl-badge" style={{marginLeft:8,display:"flex",alignItems:"center",gap:7,padding:"4px 12px",background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.22)",borderRadius:20}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>leads:</span>
            <span style={{fontSize:11,fontWeight:800,color:leaderAsset?.color||"#a78bfa"}}>{result.leader}</span>
            <span style={{fontSize:13,color:"rgba(255,255,255,0.25)"}}>→</span>
            <span style={{fontSize:11,fontWeight:800,color:followerAsset?.color||"#7c3aed"}}>{result.follower}</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>by</span>
            <span style={{fontSize:12,fontWeight:800,color:"#fff",background:"rgba(255,255,255,0.07)",padding:"1px 7px",borderRadius:4}}>{fmtLag(result.lagBars,llWindow)}</span>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>r=</span>
            <span style={{fontSize:10,fontWeight:700,color:corrCol(result.corrAtLag)}}>{result.corrAtLag>=0?"+":""}{result.corrAtLag.toFixed(3)}</span>
          </div>
        )}
        {result&&result.lagBars===0&&(
          <span className="ll-ctrl-badge" style={{marginLeft:8,fontSize:9,color:"rgba(255,255,255,0.3)"}}>⟺ move in sync — no lead-lag detected</span>
        )}
      </div>

      {/* Main content */}
      <div className="ll-main" style={{flex:1,display:"flex",minHeight:0,overflow:"hidden"}}>

        {/* Left: stats strip + BIG chart */}
        <div style={{flex:3,display:"flex",flexDirection:"column",minWidth:0,padding:"12px 14px",gap:10}}>

          {/* Stats strip */}
          {result&&result.lagBars>0&&(
            <div className="ll-stats-strip" style={{display:"flex",alignItems:"center",gap:0,background:"rgba(124,58,237,0.05)",border:"1px solid rgba(124,58,237,0.13)",borderRadius:8,padding:"0",flexShrink:0,overflow:"hidden"}}>
              <div style={{padding:"10px 18px",borderRight:"1px solid rgba(124,58,237,0.12)",textAlign:"center"}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginBottom:3}}>LEADS FIRST</div>
                <div style={{fontSize:18,fontWeight:800,color:leaderAsset?.color||"#a78bfa"}}>{result.leader}</div>
              </div>
              <div style={{padding:"10px 16px",borderRight:"1px solid rgba(124,58,237,0.12)",textAlign:"center"}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginBottom:3}}>LEAD BY</div>
                <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{fmtLag(result.lagBars,llWindow)}</div>
              </div>
              <div style={{padding:"10px 18px",borderRight:"1px solid rgba(124,58,237,0.12)",textAlign:"center"}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginBottom:3}}>FOLLOWS AFTER</div>
                <div style={{fontSize:18,fontWeight:800,color:followerAsset?.color||"#7c3aed"}}>{result.follower}</div>
              </div>
              <div style={{width:1,background:"rgba(124,58,237,0.12)"}}/>
              <div style={{padding:"10px 16px",borderRight:"1px solid rgba(124,58,237,0.12)",textAlign:"center"}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginBottom:3}}>PEAK CORR.</div>
                <div style={{fontSize:16,fontWeight:700,color:corrCol(result.corrAtLag)}}>{result.corrAtLag>=0?"+":""}{result.corrAtLag.toFixed(3)}</div>
                <div style={{fontSize:7,color:"rgba(255,255,255,0.15)",marginTop:2}}>in-sample</div>
              </div>
              <div style={{padding:"10px 16px",borderRight:"1px solid rgba(124,58,237,0.12)",textAlign:"center"}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginBottom:3}}>OOS CHECK</div>
                <div style={{fontSize:16,fontWeight:700,color:corrCol(result.testCorrAtLag)}}>{result.testCorrAtLag!=null?(result.testCorrAtLag>=0?"+":"")+result.testCorrAtLag.toFixed(3):"вЂ“"}</div>
                <div style={{fontSize:7,color:"rgba(255,255,255,0.15)",marginTop:2}}>{result.validationStatus==="confirmed"?"confirmed":result.validationStatus==="rejected"?"rejected":"short sample"}</div>
              </div>
              <div style={{padding:"10px 16px",borderRight:"1px solid rgba(124,58,237,0.12)",textAlign:"center"}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginBottom:3}}>ZERO-LAG CORR.</div>
                <div style={{fontSize:16,fontWeight:700,color:corrCol(result.corrAt0)}}>{result.corrAt0!=null?(result.corrAt0>=0?"+":"")+result.corrAt0.toFixed(3):"–"}</div>
                <div style={{fontSize:7,color:"rgba(255,255,255,0.15)",marginTop:2}}>no shift</div>
              </div>
              {result.corrAt0!=null&&(
                <div style={{padding:"10px 16px",borderRight:"1px solid rgba(124,58,237,0.12)",textAlign:"center"}}>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em",marginBottom:3}}>PREDICTIVE GAIN</div>
                  <div style={{fontSize:16,fontWeight:700,color:"#a78bfa"}}>{((result.corrAtLag-result.corrAt0)>=0?"+":"")+(result.corrAtLag-result.corrAt0).toFixed(3)}</div>
                  <div style={{fontSize:7,color:"rgba(255,255,255,0.15)",marginTop:2}}>lag vs sync</div>
                </div>
              )}
              <div style={{padding:"10px 16px",textAlign:"center",marginLeft:"auto"}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em",marginBottom:3}}>DATA BARS</div>
                <div style={{fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.4)"}}>{Math.min(ra.length,rb.length)}</div>
              </div>
            </div>
          )}
          {!result&&(
            <div style={{flexShrink:0,padding:"10px 16px",background:"rgba(124,58,237,0.04)",border:"1px solid rgba(124,58,237,0.1)",borderRadius:8,fontSize:10,color:"rgba(124,58,237,0.5)",letterSpacing:".07em"}}>
              {symA===symB?"⚠ SELECT TWO DIFFERENT ASSETS":loading?"LOADING DATA…":"ACCUMULATING DATA — NEED "+((maxLag*2)+2)+"+ BARS PER ASSET"}
            </div>
          )}

          {/* BIG Cross-Correlation Chart */}
          <div className="ll-xchart" style={{flex:1,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
            <div ref={xcContRef} onMouseMove={handleChartMouseMove} onMouseLeave={handleChartMouseLeave}
              style={{flex:1,position:"relative",minHeight:0,cursor:result?"crosshair":"default"}}>
              <canvas ref={xcRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
              {!result&&(
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,pointerEvents:"none"}}>
                  <div style={{fontSize:28,opacity:.06}}>📊</div>
                  <div style={{fontSize:10,color:"rgba(124,58,237,0.4)",letterSpacing:".1em"}}>{symA===symB?"SELECT TWO DIFFERENT ASSETS":loading?"FETCHING DATA…":"WAITING FOR DATA…"}</div>
                </div>
              )}
              {/* Hover tooltip */}
              {hoverInfo&&(()=>{
                const {idx,N:hN,cx,cy}=hoverInfo;
                const chartN=hN||Math.min(cA.length,cB.length);
                if(cA.length<2||cB.length<2) return null;
                const slA=cA.slice(-chartN), slB=cB.slice(-chartN);
                const nA=slA.map(v=>(v/slA[0]-1)*100);
                const nB=slB.map(v=>(v/slB[0]-1)*100);
                const vA=nA[idx]??0, vB=nB[idx]??0;
                const barsAgo=chartN-1-idx;
                const msPerBar={
                  "1D": 60*1000,
                  "7D": 60*60*1000,
                  "30D": 4*60*60*1000,
                  "90D": 24*60*60*1000
                }[llWindow]||60*1000;
                const barDate=new Date(Date.now()-barsAgo*msPerBar);
                const timeLabel=barsAgo===0
                  ? "now"
                  : llWindow==="1D"
                    ? barDate.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})
                    : barDate.toLocaleDateString("en",{day:"numeric",month:"short"})+(llWindow==="7D"?` ${barDate.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}` :"");
                const useRight=cx>(xcContRef.current?.clientWidth||0)*0.6;
                return (
                  <div style={{position:"absolute",left:useRight?cx-162:cx+14,top:Math.max(4,cy-60),
                    background:"rgba(12,8,28,0.96)",border:"1px solid rgba(124,58,237,0.4)",
                    borderRadius:8,padding:"10px 13px",pointerEvents:"none",zIndex:20,
                    boxShadow:"0 8px 28px rgba(0,0,0,0.7)",minWidth:150}}>
                    <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:".08em",marginBottom:7}}>{timeLabel}</div>
                    <div style={{display:"flex",flexDirection:"column",gap:5}}>
                      <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center"}}>
                        <span style={{fontSize:10,fontWeight:700,color:aAsset.color,fontFamily:"'Space Mono',monospace"}}>{symA}</span>
                        <span style={{fontSize:10,fontWeight:700,color:vA>=0?"#10b981":"#ef4444",fontFamily:"'Space Mono',monospace"}}>{vA>=0?"+":""}{vA.toFixed(2)}%</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center"}}>
                        <span style={{fontSize:10,fontWeight:700,color:bAsset.color,fontFamily:"'Space Mono',monospace"}}>{symB}</span>
                        <span style={{fontSize:10,fontWeight:700,color:vB>=0?"#10b981":"#ef4444",fontFamily:"'Space Mono',monospace"}}>{vB>=0?"+":""}{vB.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div style={{padding:"4px 14px 6px",display:"flex",justifyContent:"space-between",flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
              <span style={{fontSize:8,color:"rgba(255,255,255,0.12)"}}>Cross-correlation of % returns — shows how correlated the two assets are at every possible time shift. The <span style={{color:"rgba(255,255,255,0.25)"}}>peak</span> marks the best predictive lag.</span>
              <span style={{fontSize:8,color:"rgba(255,255,255,0.18)",fontWeight:700}}>{WIN_CFG[llWindow].label}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{width:1,background:"rgba(255,255,255,0.05)",flexShrink:0}}/>

        {/* Right: all pairs ranked list */}
        <div className="ll-side" style={{width:280,display:"flex",flexDirection:"column",overflowY:"auto",flexShrink:0}}>
          <div style={{padding:"8px 14px 8px",borderBottom:"1px solid rgba(255,255,255,0.05)",flexShrink:0,position:"sticky",top:0,background:"#07050f",zIndex:1}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <span style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.4)",letterSpacing:".08em"}}>ALL PAIRS RANKED</span>
              <span style={{fontSize:8,color:"rgba(255,255,255,0.18)"}}>{allPairsRanked.length}/{totalPairs}</span>
            </div>
            <div style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>sorted by strongest correlation · click to inspect</div>
          </div>
          {allPairsRanked.length===0&&(
            <div style={{padding:"24px 14px",textAlign:"center",fontSize:9,color:"rgba(255,255,255,0.15)"}}>
              {loading?"Loading…":"Accumulating live data…"}
            </div>
          )}
          {allPairsRanked.map(({a,b,r},i)=>{
            const lA=assets.find(x=>x.symbol===r.leader)||{color:"#a78bfa"};
            const fA=assets.find(x=>x.symbol===r.follower)||{color:"#6b5c8a"};
            const isActive=(symA===a&&symB===b)||(symA===b&&symB===a);
            const rankCorr=(r.validatedCorr ?? r.corrAtLag) || 0;
            const barPct=Math.abs(rankCorr)*100;
            return(
              <div key={`${a}-${b}`} onClick={()=>{setSymA(a);setSymB(b);}}
                style={{padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",
                  background:isActive?"rgba(124,58,237,0.1)":"transparent",transition:"background .12s",
                  borderLeft:isActive?"2px solid #7c3aed":"2px solid transparent"}}>
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                  <span style={{fontSize:10,fontWeight:700,color:lA.color}}>{r.leader}</span>
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>→</span>
                  <span style={{fontSize:10,fontWeight:700,color:fA.color}}>{r.follower}</span>
                  <span style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:"#c4b5fd",background:"rgba(124,58,237,0.18)",padding:"1px 7px",borderRadius:8}}>
                    {r.lagBars>0?fmtLag(r.lagBars,llWindow):"sync"}
                  </span>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden",marginBottom:4}}>
                  <div style={{height:"100%",width:`${barPct}%`,background:rankCorr>=0?"#10b981":"#ef4444",borderRadius:2}}/>
                </div>
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:8,color:corrCol(r.corrAtLag)}} title="Correlation at the optimal lag">train: {r.corrAtLag>=0?"+":""}{r.corrAtLag.toFixed(3)}</span>
                  <span style={{fontSize:8,color:corrCol(r.testCorrAtLag)}} title="Out-of-sample correlation at the trained lag">oos: {r.testCorrAtLag!=null?(r.testCorrAtLag>=0?"+":"")+r.testCorrAtLag.toFixed(3):"вЂ“"}</span>
                  {r.corrAt0!=null&&<span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}} title="Correlation with no time shift">at 0-lag: {r.corrAt0>=0?"+":""}{r.corrAt0.toFixed(2)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
