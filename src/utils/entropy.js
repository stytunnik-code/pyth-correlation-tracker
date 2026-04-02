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
  let h = 0xA5F1523D;
  for (const s of syms) {
    const v = prices[s];
    if (v) h = Math.imul(h ^ 0x9e3779b9, Math.floor(v * 100) | 0);
  }
  return h >>> 0;
}

export function gaussianEntropy(arr) {
  const vals = (arr || []).filter(Number.isFinite);
  if (vals.length < 4) return null;
  const mean = vals.reduce((s,v)=>s+v,0)/vals.length;
  const variance = vals.reduce((s,v)=>s+(v-mean)**2,0)/vals.length;
  if (variance <= 0) return 0;
  return 0.5 * Math.log(2 * Math.PI * Math.E * variance);
}

export function quantileBins(arr, nBins = 8) {
  const vals = (arr || []).filter(Number.isFinite);
  const sorted = [...vals].sort((a,b)=>a-b);
  const n = sorted.length;
  if (!n) return [];
  const edges = [];
  for (let i=1; i<nBins; i++) edges.push(sorted[Math.min(Math.floor(i/nBins*n), n-1)]);
  return vals.map(v => { let b=0; for(const e of edges){if(v>e)b++;else break;} return b; });
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
  const a = [], b = [];
  const aa = ra.slice(-n), bb = rb.slice(-n);
  for (let i = 0; i < n; i++) {
    if (Number.isFinite(aa[i]) && Number.isFinite(bb[i])) {
      a.push(aa[i]);
      b.push(bb[i]);
    }
  }
  if (a.length < 20) return null;
  const bA = quantileBins(a,nBins), bB = quantileBins(b,nBins);
  const hA = shannonH(bA,nBins), hB = shannonH(bB,nBins);
  const hAB = jointH(bA,bB,nBins);
  const mi = hA+hB-hAB;
  const nmi = Math.sqrt(hA*hB) > 0 ? mi/Math.sqrt(hA*hB) : 0;
  return { mi:Math.max(0,mi), nmi:Math.max(0,Math.min(1,nmi)), hA, hB };
}

export function permutationAdjustedMI(ra, rb, nBins = 8, seed = 0xA5F1523D, nPerm = 24) {
  const observed = computeMI(ra, rb, nBins);
  if (!observed) return null;
  const n = Math.min(ra.length, rb.length);
  const a = [], b = [];
  const aa = ra.slice(-n), bb = rb.slice(-n);
  for (let i = 0; i < n; i++) {
    if (Number.isFinite(aa[i]) && Number.isFinite(bb[i])) {
      a.push(aa[i]);
      b.push(bb[i]);
    }
  }
  if (a.length < 20) return null;
  const rng = mulberry32((seed ^ a.length ^ (nBins << 8)) >>> 0);
  const baseline = [];
  for (let p = 0; p < nPerm; p++) {
    const shuffled = [...b];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const perm = computeMI(a, shuffled, nBins);
    if (perm) baseline.push(perm.nmi);
  }
  if (!baseline.length) return { ...observed, adjNmi: observed.nmi, baselineMean: 0, baselineStd: 0, zScore: null };
  const baselineMean = baseline.reduce((s, v) => s + v, 0) / baseline.length;
  const baselineStd = Math.sqrt(baseline.reduce((s, v) => s + (v - baselineMean) ** 2, 0) / baseline.length);
  const adjNmi = Math.max(0, observed.nmi - baselineMean);
  const zScore = baselineStd > 0 ? (observed.nmi - baselineMean) / baselineStd : null;
  return { ...observed, adjNmi, baselineMean, baselineStd, zScore };
}

export function bootstrapEntropy(returns, seed, nIter = 60, sampleSize = null) {
  const syms = Object.keys(returns);
  const out = {};

  for (let si = 0; si < syms.length; si++) {
    const s = syms[si];
    const arr = returns[s];
    if (!arr || arr.length < 10) { out[s] = null; continue; }
    const vals = arr.filter(Number.isFinite);
    const n = vals.length;
    if (n < 10) { out[s] = null; continue; }

    const hFull = gaussianEntropy(vals);
    if (hFull === null) { out[s] = null; continue; }

    const rng = mulberry32((seed ^ (si * 0x9E3779B9)) >>> 0);
    const resampleSize = Math.min(n, sampleSize ?? Math.min(150, Math.max(20, Math.floor(n * 0.7))));
    const hVals = [];
    for (let iter = 0; iter < nIter; iter++) {
      let sumV = 0, sumV2 = 0;
      for (let k = 0; k < resampleSize; k++) {
        const v = vals[Math.floor(rng() * n)];
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
  for (let i=1;i<closes.length;i++) {
    const prev = closes[i-1];
    const cur = closes[i];
    if (!Number.isFinite(prev) || !Number.isFinite(cur) || prev === 0) continue;
    r.push((cur-prev)/prev*100);
  }
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

export function findLeadLagValidated(symA, symB, ra, rb, maxLag, trainFrac = 0.7) {
  const n = Math.min(ra.length, rb.length);
  const minTrain = Math.max(maxLag * 2 + 8, 30);
  const split = Math.max(minTrain, Math.min(n - (maxLag * 2 + 4), Math.floor(n * trainFrac)));
  if (n < minTrain + maxLag * 2 + 4 || split <= 0 || split >= n) {
    const fallback = findLeadLag(symA, symB, ra, rb, maxLag);
    return fallback ? { ...fallback, trainCorrAtLag: fallback.corrAtLag, testCorrAtLag: null, validatedCorr: fallback.corrAtLag, validationStatus: "insufficient_oos" } : null;
  }
  const trainA = ra.slice(0, split);
  const trainB = rb.slice(0, split);
  const testA = ra.slice(split);
  const testB = rb.slice(split);
  const trained = findLeadLag(symA, symB, trainA, trainB, maxLag);
  if (!trained) return null;
  const signedLag = trained.leader === symA ? trained.lagBars : -trained.lagBars;
  const testCorrAtLag = crossCorrAtLag(testA, testB, signedLag);
  const sameDirection = testCorrAtLag != null && Math.sign(testCorrAtLag || 0) === Math.sign(trained.corrAtLag || 0);
  const validatedCorr = testCorrAtLag != null && sameDirection ? Math.sign(trained.corrAtLag || 0) * Math.min(Math.abs(trained.corrAtLag), Math.abs(testCorrAtLag)) : 0;
  return {
    ...trained,
    trainCorrAtLag: trained.corrAtLag,
    testCorrAtLag,
    validatedCorr,
    validationStatus: testCorrAtLag == null ? "insufficient_oos" : sameDirection ? "confirmed" : "rejected",
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

export function resampleLiveTicksToBars(liveTicks = [], stepSec = 60) {
  if (!Array.isArray(liveTicks) || !liveTicks.length) return [];
  const buckets = new Map();
  for (const tick of liveTicks) {
    const t = Number(tick?.t);
    const p = Number(tick?.p);
    if (!Number.isFinite(t) || !Number.isFinite(p) || p <= 0) continue;
    const bucket = Math.floor(t / stepSec) * stepSec;
    const cur = buckets.get(bucket);
    if (!cur) {
      buckets.set(bucket, { t: bucket, o: p, h: p, l: p, c: p, v: 0, tfs: stepSec });
    } else {
      cur.h = Math.max(cur.h, p);
      cur.l = Math.min(cur.l, p);
      cur.c = p;
    }
  }
  return [...buckets.values()].sort((a, b) => a.t - b.t);
}

export function mergeHistoricalBarsWithLiveTicks(histBars = [], liveTicks = [], stepSec = 60, limit = 500) {
  const hist = Array.isArray(histBars) ? histBars.filter(b => Number.isFinite(b?.t) && Number.isFinite(b?.c)) : [];
  const liveBars = resampleLiveTicksToBars(liveTicks, stepSec);
  if (!liveBars.length) return hist.slice(-limit);
  const merged = [...hist];
  for (const bar of liveBars) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push(bar);
      continue;
    }
    if (bar.t < last.t) continue;
    if (bar.t === last.t) merged[merged.length - 1] = { ...last, ...bar };
    else merged.push(bar);
  }
  return merged.slice(-limit);
}
