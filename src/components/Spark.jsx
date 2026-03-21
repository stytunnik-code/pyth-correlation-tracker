import { useRef, useEffect } from "react";

function _drawSparkFrame(canvas,pts,h,w){
  if(!canvas||!pts||pts.length<2)return;
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,w,h);
  const mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1;
  const xs=pts.map((_,i)=>(i/(pts.length-1))*(w-2)+1);
  const ys=pts.map(v=>h-2-((v-mn)/rng)*(h-4));
  const up=pts[pts.length-1]>=pts[0];
  const sc=up?"#34d399":"#f87171";
  const grad=ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,up?"rgba(52,211,153,0.28)":"rgba(248,113,113,0.28)");
  grad.addColorStop(1,"rgba(0,0,0,0)");
  ctx.beginPath();
  xs.forEach((x,i)=>i===0?ctx.moveTo(x,ys[i]):ctx.lineTo(x,ys[i]));
  ctx.lineTo(xs[xs.length-1],h);ctx.lineTo(xs[0],h);ctx.closePath();
  ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();
  xs.forEach((x,i)=>i===0?ctx.moveTo(x,ys[i]):ctx.lineTo(x,ys[i]));
  ctx.strokeStyle=sc;ctx.lineWidth=1.5;ctx.lineJoin="round";ctx.lineCap="round";ctx.stroke();
}

export default function Spark({data,color,h=28,w=72}){
  const canvasRef=useRef();
  const stRef=useRef({prev:null,raf:null});
  useEffect(()=>{
    if(!data||data.length<2)return;
    const next=data.slice(-50);
    const prev=stRef.current.prev||next;
    if(stRef.current.raf)cancelAnimationFrame(stRef.current.raf);
    const start=performance.now(),dur=500;
    const len=Math.max(prev.length,next.length);
    const pad=arr=>arr.length>=len?arr.slice(-len):[...Array(len-arr.length).fill(arr[0]),...arr];
    const pA=pad(prev),pB=pad(next);
    const frame=(now)=>{
      const t=Math.min(1,(now-start)/dur);
      const ease=1-Math.pow(1-t,3);
      const interp=pA.map((v,i)=>v+(pB[i]-v)*ease);
      _drawSparkFrame(canvasRef.current,interp,h,w);
      if(t<1){stRef.current.raf=requestAnimationFrame(frame);}
      else{stRef.current.prev=next;stRef.current.raf=null;}
    };
    stRef.current.raf=requestAnimationFrame(frame);
    return()=>{if(stRef.current.raf)cancelAnimationFrame(stRef.current.raf);};
  },[data,h,w]);
  return<canvas ref={canvasRef} width={w} height={h} style={{display:"block"}}/>;
}
