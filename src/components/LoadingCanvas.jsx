import { useRef, useEffect } from "react";

export default function LoadingCanvas(){
  const canvasRef=useRef();
  useEffect(()=>{
    const el=canvasRef.current;
    if(!el) return;
    const W=el.width=window.innerWidth;
    const H=el.height=window.innerHeight;
    const ctx=el.getContext("2d");
    const SYMS=["₿","Ξ","◎","$","€","Au","Ð","⊕","◆","▲","∑","λ"];
    const COLORS=["rgba(124,58,237,","rgba(167,139,250,","rgba(99,102,241,","rgba(52,211,153,","rgba(196,181,253,"];
    // pre-build smooth sine-based price curves (no random in draw loop)
    const lines=Array.from({length:7},(_,i)=>({
      pts: Array.from({length:120},(_,j)=>
        H*(0.15+i*0.12) + Math.sin(j*0.12+i*1.3)*28 + Math.sin(j*0.05+i*0.7)*16 + Math.sin(j*0.22+i*2.1)*8
      ),
      color:["rgba(124,58,237,","rgba(167,139,250,","rgba(99,102,241,","rgba(52,211,153,","rgba(248,113,113,","rgba(251,191,36,","rgba(103,232,249,"][i],
      alpha:0.05+i*0.018,
      speed:0.18+i*0.09,
      offset:i*17
    }));
    // particles — visible, smooth drift
    const particles=Array.from({length:22},(_,i)=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*0.28,
      vy:(Math.random()-.5)*0.28,
      sym:SYMS[i%SYMS.length],
      color:COLORS[i%COLORS.length],
      baseAlpha:0.18+Math.random()*0.22,
      size:14+Math.random()*22,
      phase:Math.random()*Math.PI*2,
      phaseSpeed:0.012+Math.random()*0.008
    }));
    // dots
    const dots=Array.from({length:60},(_,i)=>({
      x:Math.random()*W, y:Math.random()*H,
      r:1+Math.random()*2.5,
      baseAlpha:0.12+Math.random()*0.18,
      color:COLORS[i%COLORS.length],
      phase:Math.random()*Math.PI*2,
      phaseSpeed:0.008+Math.random()*0.012
    }));
    // pre-draw bg+grid onto offscreen canvas so we dont recreate gradient each frame
    const offBg=document.createElement("canvas");
    offBg.width=W; offBg.height=H;
    const bctx=offBg.getContext("2d");
    const bg=bctx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*0.75);
    bg.addColorStop(0,"rgba(18,7,42,1)");
    bg.addColorStop(0.45,"rgba(10,4,24,1)");
    bg.addColorStop(1,"rgba(6,3,14,1)");
    bctx.fillStyle=bg; bctx.fillRect(0,0,W,H);
    bctx.strokeStyle="rgba(124,58,237,0.035)"; bctx.lineWidth=1;
    for(let x=0;x<W;x+=56){bctx.beginPath();bctx.moveTo(x,0);bctx.lineTo(x,H);bctx.stroke();}
    for(let y=0;y<H;y+=56){bctx.beginPath();bctx.moveTo(0,y);bctx.lineTo(W,y);bctx.stroke();}
    let raf;
    function draw(){
      ctx.drawImage(offBg,0,0);
      // scrolling chart lines
      lines.forEach(ln=>{
        ln.offset=(ln.offset+ln.speed)%(W/119);
        ctx.beginPath();
        ln.pts.forEach((y,i)=>{
          const x=(i/(ln.pts.length-1))*W-ln.offset;
          i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        });
        ctx.strokeStyle=ln.color+ln.alpha+")";
        ctx.lineWidth=1.5; ctx.lineJoin="round"; ctx.stroke();
      });
      // dots
      dots.forEach(d=>{
        d.phase+=d.phaseSpeed;
        const a=d.baseAlpha*(0.6+0.4*Math.sin(d.phase));
        ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle=d.color+a+")"; ctx.fill();
      });
      // particles — smooth drift, alpha breathe
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-50)p.x=W+10; if(p.x>W+50)p.x=-10;
        if(p.y<-50)p.y=H+10; if(p.y>H+50)p.y=-10;
        p.phase+=p.phaseSpeed;
        const a=p.baseAlpha*(0.7+0.3*Math.sin(p.phase));
        ctx.font=`${p.size}px 'Space Mono',monospace`;
        ctx.fillStyle=p.color+a+")";
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(p.sym,p.x,p.y);
      });
      raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={canvasRef} className="loading-canvas"/>;
}
