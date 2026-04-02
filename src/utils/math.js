export function pearson(a,b){
  const n=Math.min(a.length,b.length);if(n<4)return null;
  const pairs=[];
  for(let i=0;i<n;i++){
    const av=a[a.length-n+i],bv=b[b.length-n+i];
    if(Number.isFinite(av)&&Number.isFinite(bv))pairs.push([av,bv]);
  }
  if(pairs.length<4)return null;
  const ma=pairs.reduce((s,[v])=>s+v,0)/pairs.length,mb=pairs.reduce((s,[,v])=>s+v,0)/pairs.length;
  let num=0,da=0,db=0;
  for(let i=0;i<pairs.length;i++){const ai=pairs[i][0]-ma,bi=pairs[i][1]-mb;num+=ai*bi;da+=ai*ai;db+=bi*bi;}
  const d=Math.sqrt(da*db);return d===0?null:Math.max(-1,Math.min(1,num/d));
}

export function corrBg(v){
  if(v===null) return "rgba(255,255,255,0.02)";
  const a=Math.abs(v), op=(0.12+a*0.68).toFixed(2);
  if(v>=0.65)  return `rgba(16,185,129,${op})`;
  if(v>=0.30)  return `rgba(234,179,8,${op})`;
  if(v>=0)     return `rgba(167,139,250,${(a*0.22).toFixed(2)})`;
  if(v>=-0.30) return `rgba(251,146,60,${(a*0.25).toFixed(2)})`;
  if(v>=-0.65) return `rgba(239,68,68,${op})`;
  return        `rgba(220,38,38,${Math.min(+op+0.1,0.9).toFixed(2)})`;
}
export function corrFg(v){if(v===null)return"#2a1f40";return Math.abs(v)>0.28?"#fff":"#c4b5fd";}
export function corrTipLabel(v){
  if(v===null) return "Computing…";
  const a=Math.abs(v), d=v>=0?"positive":"negative";
  if(a>=0.8) return `Very strong ${d} correlation`;
  if(a>=0.6) return `Strong ${d} correlation`;
  if(a>=0.3) return `Moderate ${d} correlation`;
  if(a>=0.1) return `Weak ${d} correlation`;
  return "No significant correlation";
}

export function getHeatmapTooltipPosition(cellRect, wrapRect, scrollLeft = 0, scrollTop = 0){
  const tipW = 188;
  const tipH = 104;
  const gap = 10;
  const margin = 12;
  const cellLeft = cellRect.left - wrapRect.left + scrollLeft;
  const cellRight = cellRect.right - wrapRect.left + scrollLeft;
  const cellTop = cellRect.top - wrapRect.top + scrollTop;
  const cellBottom = cellRect.bottom - wrapRect.top + scrollTop;
  const placeLeft = cellRight + gap + tipW > wrapRect.width + scrollLeft - margin;
  const x = placeLeft
    ? Math.max(scrollLeft + margin, cellLeft - tipW - gap)
    : Math.min(scrollLeft + wrapRect.width - tipW - margin, cellRight + gap);
  const idealY = cellTop + cellRect.height/2 - tipH/2;
  const anchoredY = cellBottom - tipH + 8;
  const y = Math.max(scrollTop + margin, Math.min(scrollTop + wrapRect.height - tipH - margin, Math.max(idealY, anchoredY)));
  return { x, y };
}

export function strengthInfo(v){
  if(v===null)return{label:"COMPUTING",color:"#5a4a7a",desc:"Collecting data..."};
  const a=Math.abs(v);
  if(a>0.8)return{label:v>0?"VERY STRONG +":"VERY STRONG −",color:v>0?"#34d399":"#f87171",desc:v>0?"Assets move almost in lockstep":"Assets move in opposite directions strongly"};
  if(a>0.5)return{label:v>0?"STRONG +":"STRONG −",color:v>0?"#6ee7b7":"#fca5a5",desc:v>0?"Clear positive relationship":"Clear inverse relationship"};
  if(a>0.3)return{label:v>0?"MODERATE +":"MODERATE −",color:v>0?"#a7f3d0":"#fecaca",desc:v>0?"Moderate positive tendency":"Moderate inverse tendency"};
  return{label:"UNCORRELATED",color:"#8b5cf6",desc:"No significant linear relationship"};
}
