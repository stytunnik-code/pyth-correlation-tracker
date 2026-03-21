import { pearson } from "./math.js";

export function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function pythSeed(prices) {
  const syms = ["BTC","ETH","SOL","DOGE","XAU/USD"];
  let h = Date.now() & 0xFFFFFF;
  for (const s of syms) {
    const v = prices[s];
    if (v) h = Math.imul(h ^ 0x9e3779b9, Math.floor(v * 100) | 0);
  }
  return h >>> 0;
}

export function gaussianEntropy(arr) {
  if (!arr || arr.length < 4) return null;
  const mean = arr.reduce((s,v)=>s+v,0)/arr.length;
  const variance = arr.reduce((s,v)=>s+(v-mean)**2,0)/arr.length;
  if (variance <= 0) return 0;
  return 0.5 * Math.log(2 * Math.PI * Math.E * variance);
}

export function quantileBins(arr, nBins = 8) {
  const sorted = [...arr].sort((a,b)=>a-b);
  const n = sorted.length;
  const edges = [];
  for (let i=1; i<nBins; i++) edges.push(sorted[Math.min(Math.floor(i/nBins*n), n-1)]);
  return arr.map(v => { let b=0; for(const e of edges){if(v>e)b++;else break;} return b; });
}

export function shannonH(bins, nBins = 8) {
  const counts = new Array(nBins).fill(0);
  for (const b of bins) counts[b]++;
  let H = 0;
  for (const c of counts) { if(c>0){const p=c/bins.length; H-=p*Math.log2(p);} }
  return H;
}

export function jointH(binsX, binsY, nBins = 8) {
  const counts = {};
  for (let i=0; i<binsX.length; i++) {
    const k = binsX[i]*nBins+binsY[i];
    counts[k] = (counts[k]||0)+1;
  }
  let H=0;
  for (const c of Object.values(counts)){const p=c/binsX.length; H-=p*Math.log2(p);}
  return H;
}

export function computeMI(ra, rb, nBins = 8) {
  const n = Math.min(ra.length, rb.length);
  if (n < 20) return null;
  const a = ra.slice(-n), b = rb.slice(-n);
  const bA = quantileBins(a,nBins), bB = quantileBins(b,nBins);
  const hA = shannonH(bA,nBins), hB = shannonH(bB,nBins);
  const hAB = jointH(bA,bB,nBins);
  const mi = hA+hB-hAB;
  const nmi = Math.sqrt(hA*hB) > 0 ? mi/Math.sqrt(hA*hB) : 0;
  return { mi:Math.max(0,mi), nmi:Math.max(0,Math.min(1,nmi)), hA, hB };
}

export function bootstrapEntropy(returns, seed, nIter = 60) {
  const syms = Object.keys(returns);
  const out = {};

  for (let si = 0; si < syms.length; si++) {
    const s = syms[si];
    const arr = returns[s];
    if (!arr || arr.length < 10) { out[s] = null; continue; }
    const n = arr.length;

    const hFull = gaussianEntropy(arr);
    if (hFull === null) { out[s] = null; continue; }

    const rng = mulberry32((seed ^ (si * 0x9E3779B9)) >>> 0);

    const resampleSize = Math.min(150, Math.max(20, Math.floor(n * 0.7)));
    const hVals = [];
    for (let iter = 0; iter < nIter; iter++) {
      let sumV = 0, sumV2 = 0;
      for (let k = 0; k < resampleSize; k++) {
        const v = arr[Math.floor(rng() * n)];
        sumV += v; sumV2 += v * v;
      }
      const mean = sumV / resampleSize;
      const variance = sumV2 / resampleSize - mean * mean;
      if (variance > 0) hVals.push(0.5 * Math.log(2 * Math.PI * Math.E * variance));
    }

    if (!hVals.length) { out[s] = null; continue; }
    const hMean = hVals.reduce((a,b)=>a+b,0)/hVals.length;
    const hStd = Math.sqrt(hVals.reduce((a,v)=>a+(v-hMean)**2,0)/hVals.length);
    const sorted = [...hVals].sort((a,b)=>a-b);
    out[s] = {
      mean: hFull,
      std: hStd,
      ci95lo: sorted[Math.floor(hVals.length*0.025)] ?? hFull - hStd*1.96,
      ci95hi: sorted[Math.floor(hVals.length*0.975)] ?? hFull + hStd*1.96,
    };
  }
  return out;
}

export function interpolateValue(a, b, t) {
  return a + (b - a) * t;
}

export function interpolateMatrix(prev = [], next = [], t = 1) {
  if (!next.length) return [];
  return next.map((row, i) =>
    row.map((val, j) => interpolateValue(prev[i]?.[j] ?? val, val, t))
  );
}

export function interpolateEntropyRanking(prev = [], next = [], t = 1) {
  if (!next.length) return [];
  const prevBySym = new Map(prev.map(item => [item.sym, item]));
  return next.map(item => {
    if (!item?.data) return item;
    const prevItem = prevBySym.get(item.sym);
    if (!prevItem?.data) return item;
    return {
      ...item,
      data: {
        mean: interpolateValue(prevItem.data.mean, item.data.mean, t),
        std: interpolateValue(prevItem.data.std, item.data.std, t),
        ci95lo: interpolateValue(prevItem.data.ci95lo, item.data.ci95lo, t),
        ci95hi: interpolateValue(prevItem.data.ci95hi, item.data.ci95hi, t),
      },
    };
  });
}

export function pctReturns(closes) {
  const r = [];
  for (let i=1;i<closes.length;i++) r.push((closes[i]-closes[i-1])/closes[i-1]*100);
  return r;
}

export function rollingPearson(ra, rb, win) {
  const n = Math.min(ra.length, rb.length);
  const pts = [];
  for (let i=win; i<=n; i++) {
    const v = pearson(ra.slice(i-win,i), rb.slice(i-win,i));
    if (v !== null) pts.push(v);
  }
  return pts;
}

export const WIN_CFG = {
  "1D":  { tf:"1m",  limit:720,  win:60,  label:"1 Day"   },
  "7D":  { tf:"1h",  limit:168,  win:24,  label:"7 Days"  },
  "30D": { tf:"4h",  limit:180,  win:21,  label:"30 Days" },
  "90D": { tf:"1d",  limit:90,   win:14,  label:"90 Days" },
};

export const MAX_LAG = { "1D":60, "7D":24, "30D":7, "90D":7 };

export function crossCorrAtLag(ra, rb, k) {
  if(k===0) return pearson(ra, rb);
  if(k>0)   return pearson(ra.slice(0,ra.length-k), rb.slice(k));
  return          pearson(ra.slice(-k), rb.slice(0,rb.length+k));
}

export function crossCorrFull(ra, rb, maxLag) {
  const out=[];
  for(let k=-maxLag;k<=maxLag;k++){
    const v=crossCorrAtLag(ra,rb,k);
    if(v!==null) out.push({lag:k,corr:v});
  }
  return out;
}

export function findLeadLag(symA, symB, ra, rb, maxLag) {
  const pts=crossCorrFull(ra,rb,maxLag);
  if(!pts.length) return null;
  const best=pts.reduce((a,b)=>Math.abs(b.corr)>Math.abs(a.corr)?b:a);
  return {
    leader:    best.lag>=0?symA:symB,
    follower:  best.lag>=0?symB:symA,
    lagBars:   Math.abs(best.lag),
    corrAtLag: best.corr,
    corrAt0:   pts.find(p=>p.lag===0)?.corr??null,
    pts,
  };
}

export function fmtLag(lagBars, windowKey) {
  if(!lagBars) return "sync";
  if(windowKey==="1D")  return `${lagBars}m`;
  if(windowKey==="7D")  return `${lagBars}h`;
  if(windowKey==="30D") return `${lagBars*4}h`;
  if(windowKey==="90D") return lagBars===1?"1d":`${lagBars}d`;
  return `${lagBars}`;
}

export function fmtAxisTime(t, windowKey) {
  if (!t) return "";
  const d = new Date(t * 1000);
  if (windowKey === "1D") return d.toLocaleTimeString("en", {hour:"2-digit", minute:"2-digit"});
  if (windowKey === "90D") return d.toLocaleDateString("en", {month:"short", year:"2-digit"});
  return d.toLocaleDateString("en", {day:"2-digit", month:"short"});
}
