import { useState, useEffect, useRef, useCallback } from "react";
import SmokeBackground from "./SmokeBackground";

const ASSETS = [
  { id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", symbol: "BTC",     name: "Bitcoin",      category: "crypto",    color: "#F7931A", icon: "₿", logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", symbol: "ETH",     name: "Ethereum",     category: "crypto",    color: "#8B9FFF", icon: "Ξ", logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL",     name: "Solana",       category: "crypto",    color: "#14F195", icon: "◎", logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c", symbol: "DOGE",    name: "Dogecoin",     category: "crypto",    color: "#C8A84B", icon: "Ð", logo: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
  { id: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", symbol: "USDC",    name: "USD Coin",     category: "crypto",    color: "#2775CA", icon: "$", logo: "https://assets.coingecko.com/coins/images/6319/small/usdc.png" },
  { id: "a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b", symbol: "EUR/USD", name: "Euro",         category: "fx",        color: "#60A5FA", icon: "€", logo: null },
  { id: "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1", symbol: "GBP/USD", name: "Pound",        category: "fx",        color: "#34D399", icon: "£", logo: null },
  { id: "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", symbol: "XAU/USD", name: "Gold",         category: "commodity", color: "#FCD34D", icon: "Au", logo: null },
  { id: "925ca92ff005ae943c158e3563f59698ce7e75c5a8c8dd43303a0a154887b3e6", symbol: "WTI",     name: "Oil (WTI)",    category: "commodity", color: "#FB923C", icon: "⛽", logo: null },
  { id: "49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688", symbol: "AAPL",   name: "Apple Inc",    category: "equity",    color: "#E2E8F0", icon: "", logo: null },
];

const SEED = { BTC:65000,ETH:3200,SOL:140,DOGE:0.15,USDC:1,"EUR/USD":1.085,"GBP/USD":1.265,"XAU/USD":2320,WTI:78,AAPL:185 };
const CAT_COLORS = { crypto:"#9945FF", fx:"#60A5FA", commodity:"#FCD34D", equity:"#E2E8F0" };

function pearson(a,b){
  const n=Math.min(a.length,b.length);if(n<4)return null;
  const ax=a.slice(-n),bx=b.slice(-n);
  const ma=ax.reduce((s,v)=>s+v,0)/n,mb=bx.reduce((s,v)=>s+v,0)/n;
  let num=0,da=0,db=0;
  for(let i=0;i<n;i++){const ai=ax[i]-ma,bi=bx[i]-mb;num+=ai*bi;da+=ai*ai;db+=bi*bi;}
  const d=Math.sqrt(da*db);return d===0?0:Math.max(-1,Math.min(1,num/d));
}

function corrBg(v){
  if(v===null)return"rgba(255,255,255,0.02)";
  if(v>=0){const t=v;return`rgba(${Math.round(t*20)},${Math.round(180+t*75)},${Math.round(100+t*80)},${0.1+t*0.72})`;}
  const t=-v;return`rgba(${Math.round(210+t*45)},${Math.round(50-t*40)},${Math.round(70-t*50)},${0.1+t*0.72})`;
}
function corrFg(v){if(v===null)return"#2a1f40";return Math.abs(v)>0.4?"#fff":"#c4b5fd";}

function fmt(sym,val){
  if(!val)return"–";
  if(sym==="USDC")return`$${val.toFixed(4)}`;
  if(["EUR/USD","GBP/USD"].includes(sym))return val.toFixed(5);
  if(val>1000)return`$${val.toLocaleString(undefined,{maximumFractionDigits:0})}`;
  if(val>1)return`$${val.toFixed(2)}`;
  return`$${val.toFixed(6)}`;
}

function fmtPct(v){if(v===null||!isFinite(v))return"–";return`${v>=0?"+":""}${v.toFixed(3)}%`;}

/* ── SKELETON ──────────────────────────────────────────────────────────── */
function TickerSkeleton(){return(
  <div className="tc tc-skeleton">
    <div className="tc-head"><div className="sk-icon"/><div className="sk-meta"><div className="sk-line w8"/><div className="sk-line w12"/></div><div className="sk-badge"/></div>
    <div className="tc-price-row"><div className="sk-line w14"/><div className="sk-line w6"/></div>
    <div className="tc-spark-row"><div className="sk-spark"/><div className="sk-line w10"/></div>
    <div className="tc-stats"><div className="sk-stat"/><div className="sk-stat"/><div className="sk-stat"/><div className="sk-stat"/></div>
  </div>
);}

function strengthInfo(v){
  if(v===null)return{label:"COMPUTING",color:"#5a4a7a",desc:"Collecting data..."};
  const a=Math.abs(v);
  if(a>0.8)return{label:v>0?"VERY STRONG +":"VERY STRONG −",color:v>0?"#34d399":"#f87171",desc:v>0?"Assets move almost in lockstep":"Assets move in opposite directions strongly"};
  if(a>0.5)return{label:v>0?"STRONG +":"STRONG −",color:v>0?"#6ee7b7":"#fca5a5",desc:v>0?"Clear positive relationship":"Clear inverse relationship"};
  if(a>0.3)return{label:v>0?"MODERATE +":"MODERATE −",color:v>0?"#a7f3d0":"#fecaca",desc:v>0?"Moderate positive tendency":"Moderate inverse tendency"};
  return{label:"UNCORRELATED",color:"#8b5cf6",desc:"No significant linear relationship"};
}

/* ── SPARKLINE ──────────────────────────────────────────────────────────── */
function Spark({data,color,h=28,w=72}){
  if(!data||data.length<2)return<svg width={w} height={h}/>;
  const pts=data.slice(-50),mn=Math.min(...pts),mx=Math.max(...pts),rng=mx-mn||1;
  const xs=pts.map((_,i)=>(i/(pts.length-1))*(w-2)+1);
  const ys=pts.map(v=>h-2-((v-mn)/rng)*(h-4));
  const line=xs.map((x,i)=>`${i===0?"M":"L"}${x},${ys[i]}`).join(" ");
  const area=`${line} L${xs[xs.length-1]},${h} L${xs[0]},${h} Z`;
  const up=pts[pts.length-1]>=pts[0];
  const sc=up?"#34d399":"#f87171";
  return(
    <svg width={w} height={h}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sc} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={sc} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg${color.replace("#","")})`}/>
      <path d={line} fill="none" stroke={sc} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── CORR CHART ─────────────────────────────────────────────────────────── */
function CorrChart({symA,symB,histRef}){
  const ref=useRef();
  useEffect(()=>{
    const ha=histRef.current[symA]||[],hb=histRef.current[symB]||[];
    const n=Math.min(ha.length,hb.length),pts=[];
    for(let i=4;i<=n;i++){const v=pearson(ha.slice(0,i),hb.slice(0,i));if(v!==null)pts.push(v);}
    const c=ref.current;if(!c||pts.length<2)return;
    const ctx=c.getContext("2d"),W=c.offsetWidth||400,H=100;
    c.width=W;c.height=H;ctx.clearRect(0,0,W,H);
    // Grid lines
    [-0.5,0,0.5].forEach(v=>{
      const y=H/2-(v*H/2*.88);
      ctx.strokeStyle=v===0?"rgba(139,92,246,0.25)":"rgba(255,255,255,0.05)";
      ctx.lineWidth=v===0?1.5:1;ctx.setLineDash(v===0?[]:[ 3,4]);
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
      ctx.setLineDash([]);
      if(v!==0){ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="9px monospace";ctx.fillText(v>0?"+0.5":"-0.5",4,y-2);}
    });
    const last=pts[pts.length-1];
    // Area fill
    const ag=ctx.createLinearGradient(0,0,0,H);
    ag.addColorStop(0,last>=0?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.15)");
    ag.addColorStop(1,"transparent");
    ctx.fillStyle=ag;
    ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.lineTo(W-2,H/2);ctx.lineTo(2,H/2);ctx.closePath();ctx.fill();
    // Line
    const lg=ctx.createLinearGradient(0,0,W,0);
    lg.addColorStop(0,"rgba(139,92,246,0.8)");
    lg.addColorStop(1,last>=0?"rgba(52,211,153,1)":"rgba(248,113,113,1)");
    ctx.strokeStyle=lg;ctx.lineWidth=2;ctx.lineJoin="round";
    ctx.beginPath();
    pts.forEach((v,i)=>{const x=(i/(pts.length-1))*(W-4)+2,y=H/2-(v*H/2*.88);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
    ctx.stroke();
    // Current value dot
    const lx=(pts.length-1)/(pts.length-1)*(W-4)+2,ly=H/2-(last*H/2*.88);
    ctx.fillStyle=last>=0?"#34d399":"#f87171";
    ctx.beginPath();ctx.arc(lx,ly,4,0,Math.PI*2);ctx.fill();
  });
  return<canvas ref={ref} style={{width:"100%",height:100,display:"block"}}/>;
}

/* ── PYTH LOGO ──────────────────────────────────────────────────────────── */
function PythLogo({size=30}){
  return <img src="/pyth-logo.png" alt="Pyth" width={size} height={size} style={{borderRadius:"8px",objectFit:"contain"}}/>;
}

/* ── ASSET ICON ─────────────────────────────────────────────────────────── */
function AssetIcon({asset,size=36}){
  const [imgErr,setImgErr]=useState(false);
  const hasLogo=asset.logo&&!imgErr;
  const sym=asset.icon||asset.symbol.split("/")[0].slice(0,2);
  return(
    <div className={`asset-icon${!hasLogo?" sym":""}`} style={{width:size,height:size,"--ac":asset.color}}>
      {hasLogo?(
        <img src={asset.logo} alt="" width={size} height={size} onError={()=>setImgErr(true)}/>
      ):(
        <span className="asset-icon-sym">{sym}</span>
      )}
    </div>
  );
}

/* ── MAIN ───────────────────────────────────────────────────────────────── */

/* ══════════════════════════════════════════════════════════════════════════
   CHAIN VIEW — On-Chain Entropy Explorer
   Uses MetaMask window.ethereum to fetch real Ethereum block data.
   Displays:
     • Block stream — live incoming blocks with hash visualization
     • Entropy meter — Shannon H of last N block hashes (bits/byte)
     • Byte heatmap — distribution of hex bytes across block hashes
     • Hash cascade — waterfall of hash bits over time
   ══════════════════════════════════════════════════════════════════════════ */

// ── Canvas draw helpers ────────────────────────────────────────────────────
function drawHashBitmap(canvas, hashes) {
  if (!canvas || !hashes.length) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  if (!W || !H) return;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // Each hash = 32 bytes = 256 bits; show last 32 hashes as bitmap rows
  const rows = Math.min(hashes.length, 32);
  const cols = 256;
  const cellW = W / cols;
  const cellH = H / rows;

  for (let r = 0; r < rows; r++) {
    const hash = hashes[hashes.length - rows + r].replace(/^0x/, "");
    for (let c = 0; c < cols; c++) {
      const byteIdx = Math.floor(c / 8);
      const bitIdx  = 7 - (c % 8);
      const byte    = parseInt(hash.slice(byteIdx * 2, byteIdx * 2 + 2) || "0", 16);
      const bit     = (byte >> bitIdx) & 1;
      // Color: 0 = deep purple, 1 = bright green
      ctx.fillStyle = bit ? "#22c55e" : "#1a0a2e";
      ctx.fillRect(c * cellW + 0.5, r * cellH + 0.5, cellW - 0.5, cellH - 0.5);
    }
  }
  // Grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.5;
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath(); ctx.moveTo(0, r*cellH); ctx.lineTo(W, r*cellH); ctx.stroke();
  }
}

function drawByteHistogram(canvas, hashes) {
  if (!canvas || !hashes.length) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  if (!W || !H) return;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  // Count byte frequency across all hashes
  const freq = new Array(256).fill(0);
  let total = 0;
  for (const h of hashes) {
    const clean = h.replace(/^0x/, "");
    for (let i = 0; i < clean.length - 1; i += 2) {
      const b = parseInt(clean.slice(i, i+2), 16);
      if (!isNaN(b)) { freq[b]++; total++; }
    }
  }

  // Compute Shannon H
  let H_bits = 0;
  for (const c of freq) {
    if (c > 0) { const p = c / total; H_bits -= p * Math.log2(p); }
  }
  const H_max = 8; // log2(256)
  const uniformity = H_bits / H_max;

  const PAD = { l: 4, r: 4, t: 28, b: 20 };
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;
  const barW = Math.max(1, CW / 256);
  const maxFreq = Math.max(...freq) || 1;

  // Expected uniform line
  const expectedH = (total / 256) / maxFreq * CH;
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.setLineDash([3,3]);
  ctx.beginPath();
  ctx.moveTo(PAD.l, PAD.t + CH - expectedH);
  ctx.lineTo(PAD.l + CW, PAD.t + CH - expectedH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Bars
  for (let b = 0; b < 256; b++) {
    const barH = (freq[b] / maxFreq) * CH;
    const x = PAD.l + b * barW;
    const hue = Math.round(b / 255 * 240); // blue→red spectrum
    const alpha = 0.5 + 0.5 * uniformity;
    ctx.fillStyle = `hsla(${hue},70%,55%,${alpha})`;
    ctx.fillRect(x, PAD.t + CH - barH, barW - 0.3, barH);
  }

  // H label
  ctx.fillStyle = uniformity > 0.97 ? "#22c55e" : uniformity > 0.92 ? "#f59e0b" : "#ef4444";
  ctx.font = "bold 11px 'Space Mono',monospace";
  ctx.textAlign = "left"; ctx.textBaseline = "top";
  ctx.fillText(`H = ${H_bits.toFixed(4)} bits/byte`, PAD.l + 4, 6);

  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.font = "9px 'Space Mono',monospace";
  ctx.textAlign = "right";
  ctx.fillText(`${(uniformity*100).toFixed(2)}% uniform`, W - PAD.r - 4, 6);

  // X axis labels
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "8px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  for (const v of [0, 64, 128, 192, 255]) {
    ctx.fillText(`0x${v.toString(16).padStart(2,"0").toUpperCase()}`, PAD.l + v * barW, H - PAD.b + 4);
  }
}

function drawEntropyHistory(canvas, entropyHistory) {
  if (!canvas || !entropyHistory.length) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth, H = canvas.offsetHeight;
  if (!W || !H) return;
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);

  const PAD = { l: 36, r: 8, t: 10, b: 20 };
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.5;
  for (const h of [7.5, 7.8, 7.9, 7.95, 8.0]) {
    const y = PAD.t + CH - ((h - 7.4) / 0.7) * CH;
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(PAD.l + CW, y); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "8px 'Space Mono',monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(h.toFixed(2), PAD.l - 4, y);
  }

  // Ideal = 8.0 line
  ctx.strokeStyle = "rgba(34,197,94,0.2)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4,4]);
  const y8 = PAD.t + CH - ((8.0 - 7.4) / 0.7) * CH;
  ctx.beginPath(); ctx.moveTo(PAD.l, y8); ctx.lineTo(PAD.l+CW, y8); ctx.stroke();
  ctx.setLineDash([]);

  // Entropy line
  const n = entropyHistory.length;
  const pts = entropyHistory.map((v, i) => ({
    x: PAD.l + (i / Math.max(n-1,1)) * CW,
    y: PAD.t + CH - ((Math.max(7.4, Math.min(8.0, v)) - 7.4) / 0.7) * CH
  }));

  // Fill
  ctx.beginPath();
  ctx.moveTo(pts[0].x, PAD.t + CH);
  for (const p of pts) ctx.lineTo(p.x, p.y);
  ctx.lineTo(pts[pts.length-1].x, PAD.t + CH);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, PAD.t, 0, PAD.t+CH);
  grad.addColorStop(0, "rgba(34,197,94,0.25)");
  grad.addColorStop(1, "rgba(34,197,94,0.02)");
  ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = "#22c55e"; ctx.lineWidth = 1.5;
  pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  ctx.stroke();

  // Last value dot
  const last = pts[pts.length-1];
  ctx.beginPath();
  ctx.arc(last.x, last.y, 3, 0, Math.PI*2);
  ctx.fillStyle = "#22c55e"; ctx.fill();

  // X axis
  ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.font="8px 'Space Mono',monospace";
  ctx.textAlign="center"; ctx.textBaseline="top";
  ctx.fillText(`last ${n} blocks`, PAD.l + CW/2, H - PAD.b + 4);
}

// ── ChainView component ────────────────────────────────────────────────────
function ChainView({ setActiveTab }) {
  const [connected,  setConnected]  = React.useState(false);
  const [account,    setAccount]    = React.useState(null);
  const [network,    setNetwork]    = React.useState(null);
  const [blocks,     setBlocks]     = React.useState([]);      // [{number, hash, ts, txCount, gasUsed}]
  const [hashes,     setHashes]     = React.useState([]);      // raw 0x... strings
  const [entropyHist,setEntropyHist]= React.useState([]);      // H per block
  const [polling,    setPolling]    = React.useState(false);
  const [lastBlock,  setLastBlock]  = React.useState(null);
  const [error,      setError]      = React.useState(null);
  const [sessionH,   setSessionH]   = React.useState(null);   // session composite hash

  const bitmapRef  = React.useRef(null);
  const histRef2   = React.useRef(null);
  const histoRef   = React.useRef(null);
  const pollRef    = React.useRef(null);

  // ── Compute Shannon H of byte distribution from hashes
  const computeH = (hashList) => {
    const freq = new Array(256).fill(0);
    let total = 0;
    for (const h of hashList) {
      const clean = h.replace(/^0x/,"");
      for (let i=0; i<clean.length-1; i+=2) {
        const b = parseInt(clean.slice(i,i+2),16);
        if (!isNaN(b)) { freq[b]++; total++; }
      }
    }
    if (!total) return 0;
    let H=0;
    for (const c of freq) { if(c>0){const p=c/total; H-=p*Math.log2(p);} }
    return H;
  };

  // ── XOR all hashes into a single composite 32-byte session hash
  const computeSessionHash = (hashList) => {
    if (!hashList.length) return null;
    let composite = new Array(64).fill("0");
    for (const h of hashList) {
      const clean = h.replace(/^0x/,"");
      for (let i=0; i<64; i++) {
        const a = parseInt(composite[i]||"0",16);
        const b = parseInt(clean[i]||"0",16);
        composite[i] = ((a^b)&0xf).toString(16);
      }
    }
    return "0x" + composite.join("");
  };

  // ── Fetch a single block by number
  const fetchBlock = async (blockNum) => {
    const numHex = typeof blockNum === "number"
      ? "0x"+blockNum.toString(16) : blockNum;
    const block = await window.ethereum.request({
      method: "eth_getBlockByNumber", params: [numHex, false]
    });
    if (!block) return null;
    return {
      number:   parseInt(block.number,16),
      hash:     block.hash,
      ts:       new Date(parseInt(block.timestamp,16)*1000),
      txCount:  block.transactions?.length ?? 0,
      gasUsed:  parseInt(block.gasUsed,16),
      gasLimit: parseInt(block.gasLimit,16),
    };
  };

  // ── Connect MetaMask
  const connect = async () => {
    if (!window.ethereum) {
      setError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    try {
      setError(null);
      const accounts = await window.ethereum.request({ method:"eth_requestAccounts" });
      const chainId  = await window.ethereum.request({ method:"eth_chainId" });
      setAccount(accounts[0]);
      setConnected(true);
      const chainNames = {"0x1":"Ethereum","0x89":"Polygon","0xa":"Optimism",
        "0x2105":"Base","0xa4b1":"Arbitrum","0x38":"BSC"};
      setNetwork({ id: chainId, name: chainNames[chainId] || `Chain ${parseInt(chainId,16)}` });

      // Fetch last 20 blocks immediately
      const latestHex = await window.ethereum.request({ method:"eth_blockNumber" });
      const latest = parseInt(latestHex, 16);
      const fetched = [];
      for (let i = latest; i > latest - 20 && i >= 0; i--) {
        const b = await fetchBlock(i);
        if (b) fetched.unshift(b);
      }
      const newHashes = fetched.map(b=>b.hash).filter(Boolean);
      setBlocks(fetched);
      setHashes(newHashes);
      setLastBlock(fetched[fetched.length-1]?.number ?? latest);

      // Compute initial entropy history (per-block rolling H)
      const hists = [];
      for (let i=1; i<=newHashes.length; i++) {
        hists.push(computeH(newHashes.slice(0,i)));
      }
      setEntropyHist(hists);
      setSessionH(computeSessionHash(newHashes));
    } catch(e) {
      setError(e.message || "Connection failed");
    }
  };

  // ── Poll for new blocks
  const startPolling = React.useCallback(() => {
    if (pollRef.current) return;
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const latestHex = await window.ethereum.request({ method:"eth_blockNumber" });
        const latest = parseInt(latestHex,16);
        setLastBlock(prev => {
          if (prev !== null && latest > prev) {
            // Fetch new blocks
            (async () => {
              const newBlocks = [];
              for (let i = prev+1; i <= latest; i++) {
                const b = await fetchBlock(i);
                if (b) newBlocks.push(b);
              }
              if (!newBlocks.length) return;
              setBlocks(bk => [...bk, ...newBlocks].slice(-50));
              setHashes(hs => {
                const updated = [...hs, ...newBlocks.map(b=>b.hash).filter(Boolean)].slice(-100);
                setEntropyHist(eh => {
                  const newH = computeH(updated);
                  return [...eh, newH].slice(-100);
                });
                setSessionH(computeSessionHash(updated));
                return updated;
              });
            })();
            return latest;
          }
          return prev ?? latest;
        });
      } catch(e) { console.error("poll error",e); }
    }, 12000); // ~12s Ethereum block time
  }, []);

  const stopPolling = () => {
    clearInterval(pollRef.current); pollRef.current = null; setPolling(false);
  };

  React.useEffect(() => () => clearInterval(pollRef.current), []);

  // ── Redraw canvases
  React.useEffect(() => {
    drawHashBitmap(bitmapRef.current, hashes);
    drawByteHistogram(histoRef.current, hashes);
    drawEntropyHistory(histRef2.current, entropyHist);
  }, [hashes, entropyHist]);

  // ── Resize
  React.useEffect(() => {
    const redraw = () => {
      drawHashBitmap(bitmapRef.current, hashes);
      drawByteHistogram(histoRef.current, hashes);
      drawEntropyHistory(histRef2.current, entropyHist);
    };
    window.addEventListener("resize", redraw);
    return () => window.removeEventListener("resize", redraw);
  }, [hashes, entropyHist]);

  const currentH = entropyHist.length ? entropyHist[entropyHist.length-1] : null;
  const hColor   = currentH === null ? "#666"
    : currentH > 7.95 ? "#22c55e" : currentH > 7.85 ? "#f59e0b" : "#ef4444";

  // ── Styles
  const S = {
    page:    { display:"flex", flexDirection:"column", height:"100%", background:"#06030f", fontFamily:"'Space Mono',monospace", color:"rgba(255,255,255,0.85)", overflow:"hidden" },
    topbar:  { display:"flex", alignItems:"center", gap:12, padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", background:"#07040f", flexShrink:0 },
    grid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"1fr 1fr", gap:1, flex:1, background:"rgba(255,255,255,0.04)", overflow:"hidden" },
    panel:   { background:"#06030f", display:"flex", flexDirection:"column", overflow:"hidden", padding:"10px 12px" },
    plabel:  { fontSize:9, color:"rgba(255,255,255,0.2)", letterSpacing:".1em", marginBottom:6, flexShrink:0 },
    canvas:  { flex:1, minHeight:0, width:"100%" },
    badge:   { display:"flex", alignItems:"center", gap:5, padding:"2px 8px", borderRadius:3 },
    btn:     { padding:"4px 14px", borderRadius:3, cursor:"pointer", fontSize:10, fontFamily:"inherit", fontWeight:700, letterSpacing:".06em", border:"1px solid" },
  };

  return (
    <div style={S.page}>
      {/* ── Top bar ── */}
      <div style={S.topbar}>
        {/* Logo */}
        <span style={{fontSize:16}}>⛓</span>
        <span style={{fontSize:13,fontWeight:700,color:"#22c55e",letterSpacing:".06em"}}>CHAIN</span>
        <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.2)"}}>ENTROPY</span>
        <div style={{width:1,height:16,background:"rgba(255,255,255,0.07)"}}/>

        {/* Network badge */}
        {connected && network && (
          <div style={{...S.badge, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.2)"}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
            <span style={{fontSize:9,color:"#22c55e"}}>{network.name}</span>
          </div>
        )}

        {/* Account badge */}
        {account && (
          <div style={{...S.badge, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>{account.slice(0,6)}…{account.slice(-4)}</span>
          </div>
        )}

        {/* Live H badge */}
        {currentH !== null && (
          <div style={{...S.badge, background:"rgba(34,197,94,0.05)", border:`1px solid ${hColor}40`}}>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>H</span>
            <span style={{fontSize:12,fontWeight:700,color:hColor}}>{currentH.toFixed(4)}</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>bits/byte</span>
          </div>
        )}

        {/* Session composite hash */}
        {sessionH && (
          <div style={{...S.badge, background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)"}}>
            <span style={{fontSize:8,color:"rgba(167,139,250,0.5)",letterSpacing:".08em"}}>XOR</span>
            <span style={{fontSize:9,color:"#a78bfa",fontFamily:"'Space Mono',monospace"}}>{sessionH.slice(0,14)}…</span>
          </div>
        )}

        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {/* Polling toggle */}
          {connected && (
            <button
              onClick={polling ? stopPolling : startPolling}
              style={{...S.btn,
                background: polling?"rgba(16,185,129,0.1)":"rgba(255,255,255,0.04)",
                borderColor: polling?"rgba(16,185,129,0.35)":"rgba(255,255,255,0.1)",
                color: polling?"#10b981":"rgba(255,255,255,0.4)"}}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(16,185,129,0.5)"; e.currentTarget.style.color="#10b981"; }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor=polling?"rgba(16,185,129,0.35)":"rgba(255,255,255,0.1)"; e.currentTarget.style.color=polling?"#10b981":"rgba(255,255,255,0.4)"; }}>
              {polling ? "⏸ PAUSE" : "▶ LIVE"}
            </button>
          )}

          {/* Connect */}
          {!connected && (
            <button onClick={connect}
              style={{...S.btn, background:"rgba(34,197,94,0.12)", borderColor:"rgba(34,197,94,0.35)", color:"#22c55e"}}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(34,197,94,0.22)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(34,197,94,0.12)"; }}>
              🦊 CONNECT
            </button>
          )}

          <button onClick={()=>setActiveTab("matrix")}
            style={{...S.btn, background:"transparent", borderColor:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.4)"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(34,197,94,0.5)";e.currentTarget.style.color="#22c55e";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="rgba(255,255,255,0.4)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{padding:"8px 16px",background:"rgba(239,68,68,0.08)",borderBottom:"1px solid rgba(239,68,68,0.2)",fontSize:10,color:"#f87171"}}>
          ⚠ {error}
        </div>
      )}

      {/* ── Not connected splash ── */}
      {!connected && !error && (
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,padding:40}}>
          <div style={{fontSize:48,opacity:.6}}>⛓</div>
          <div style={{textAlign:"center",maxWidth:480}}>
            <div style={{fontSize:18,fontWeight:700,color:"#22c55e",marginBottom:10,letterSpacing:".04em"}}>
              ON-CHAIN ENTROPY EXPLORER
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",lineHeight:1.8,maxWidth:400,margin:"0 auto"}}>
              Connects to Ethereum via MetaMask. Streams real block hashes and
              measures the statistical randomness of on-chain data — bit distribution,
              Shannon entropy per byte, and a composite session XOR hash.
            </div>
          </div>

          {/* Feature bullets */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,maxWidth:480,width:"100%"}}>
            {[
              ["🧱","Block stream","Live Ethereum blocks with hash + gas data"],
              ["📊","Byte histogram","256-bucket frequency of all hash bytes"],
              ["📈","Entropy history","H(bits/byte) per block, tracks toward 8.0"],
              ["🔢","Bit bitmap","256×N bit-level visualization of block hashes"],
            ].map(([icon,title,desc])=>(
              <div key={title} style={{padding:"10px 14px",background:"rgba(34,197,94,0.04)",border:"1px solid rgba(34,197,94,0.1)",borderRadius:4}}>
                <div style={{fontSize:13,marginBottom:4}}>{icon} <span style={{color:"#22c55e",fontWeight:700,fontSize:10}}>{title}</span></div>
                <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",lineHeight:1.6}}>{desc}</div>
              </div>
            ))}
          </div>

          <button onClick={connect}
            style={{...S.btn, fontSize:12, padding:"8px 28px", background:"rgba(34,197,94,0.15)", borderColor:"rgba(34,197,94,0.4)", color:"#22c55e"}}>
            🦊 CONNECT METAMASK
          </button>
          {!window?.ethereum && (
            <div style={{fontSize:10,color:"rgba(239,68,68,0.6)"}}>
              MetaMask not detected — <a href="https://metamask.io" target="_blank" rel="noreferrer" style={{color:"#f87171"}}>install MetaMask</a>
            </div>
          )}
        </div>
      )}

      {/* ── Connected: 2×2 grid ── */}
      {connected && (
        <div style={S.grid}>

          {/* ① Bit bitmap — top left */}
          <div style={{...S.panel, gridColumn:"1", gridRow:"1"}}>
            <div style={S.plabel}>BIT BITMAP — 256 bits × last {Math.min(hashes.length,32)} block hashes · green=1  dark=0</div>
            <canvas ref={bitmapRef} style={S.canvas}/>
          </div>

          {/* ② Byte histogram — top right */}
          <div style={{...S.panel, gridColumn:"2", gridRow:"1"}}>
            <div style={S.plabel}>BYTE DISTRIBUTION — frequency of 0x00–0xFF across all collected hashes</div>
            <canvas ref={histoRef} style={S.canvas}/>
          </div>

          {/* ③ Entropy history — bottom left */}
          <div style={{...S.panel, gridColumn:"1", gridRow:"2"}}>
            <div style={S.plabel}>SHANNON H — bits/byte per block  (ideal = 8.000 = perfect uniform)</div>
            <canvas ref={histRef2} style={S.canvas}/>
          </div>

          {/* ④ Block stream — bottom right */}
          <div style={{...S.panel, gridColumn:"2", gridRow:"2", padding:"0"}}>
            <div style={{...S.plabel, padding:"10px 12px 6px", marginBottom:0}}>
              BLOCK STREAM — {blocks.length} blocks · {polling?"🟢 live polling":"⏸ paused"}
            </div>
            <div style={{flex:1,overflowY:"auto",fontSize:9,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
              {[...blocks].reverse().map((b,i)=>(
                <div key={b.number} style={{
                  display:"grid", gridTemplateColumns:"72px 1fr 56px 64px",
                  alignItems:"center", gap:8, padding:"5px 12px",
                  background: i===0?"rgba(34,197,94,0.05)":"transparent",
                  borderBottom:"1px solid rgba(255,255,255,0.03)"
                }}>
                  <span style={{color: i===0?"#22c55e":"rgba(255,255,255,0.4)", fontWeight: i===0?700:400}}>
                    #{b.number.toLocaleString()}
                  </span>
                  <span style={{color:"rgba(167,139,250,0.6)",fontFamily:"'Space Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                    {b.hash?.slice(0,22)}…
                  </span>
                  <span style={{color:"rgba(255,255,255,0.25)",textAlign:"right"}}>
                    {b.txCount} tx
                  </span>
                  <span style={{color:"rgba(255,255,255,0.2)",textAlign:"right"}}>
                    {b.ts.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {!blocks.length && (
                <div style={{padding:20,color:"rgba(255,255,255,0.2)",textAlign:"center"}}>
                  Loading blocks…
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}


export default function App(){
  const [prices,setPrices]=useState({});
  const [history,setHistory]=useState({});
  const [corr,setCorr]=useState({});
  const [prevPrices,setPrevPrices]=useState({});
  const [status,setStatus]=useState("connecting");
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState(null);
  const [mounted,setMounted]=useState(false);
  const [mobileTab,setMobileTab]=useState("heatmap");
  const [activeTab,setActiveTab]=useState("matrix");
  const [chartAsset,setChartAsset]=useState("BTC");
  const [chartTf,setChartTf]=useState("1m");
  const [chartType,setChartType]=useState("candle");
  const [chartHist,setChartHist]=useState({});
  const [feedbackOpen,setFeedbackOpen]=useState(false);
  const [feedbackText,setFeedbackText]=useState("");
  const [feedbackSent,setFeedbackSent]=useState(false);
  const [tickCount,setTickCount]=useState(0);
  const [lastUpdate,setLastUpdate]=useState(null);
  const [errorMsg,setErrorMsg]=useState(null);
  const histRef=useRef({});

  useEffect(()=>{setTimeout(()=>setMounted(true),80);},[]);

  function push(sym,price){
    if(!histRef.current[sym])histRef.current[sym]=[];
    histRef.current[sym].push(price);
    if(histRef.current[sym].length>200)histRef.current[sym].shift();
  }

  const fetchPrices=useCallback(async()=>{
    try{
      const params=new URLSearchParams();
      ASSETS.forEach(a=>params.append("ids",a.id));
      const res=await fetch(`/api/pyth?${params}`);
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      const items=data.parsed||[];
      if(!items.length)throw new Error("empty");
      const np={};
      items.forEach(item=>{
        const cleanId=item.id?.replace(/^0x/,"");
        const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
        if(!asset)return;
        const po=item.price;if(!po)return;
        const p=parseFloat(po.price)*Math.pow(10,po.expo??-8);
        if(isFinite(p)&&p>0){np[asset.symbol]=p;push(asset.symbol,p);}
      });
      if(Object.keys(np).length>0){
        setPrices(prev=>{ setPrevPrices(pp=>({...pp,...prev})); return np; });
        setHistory({...histRef.current});
        setStatus("live");setTickCount(t=>t+1);setLastUpdate(new Date());setErrorMsg(null);
      }else throw new Error("0 prices");
    }catch(e){
      setErrorMsg(e?.message||"Network error");
      try{
        const ids2=ASSETS.map(a=>`ids[]=${a.id}`).join("&");
        const r2=await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${ids2}&parsed=true&ignore_invalid_price_ids=true`);
        if(!r2.ok)throw new Error();
        const d2=await r2.json();
        const np2={};
        (d2.parsed||[]).forEach(item=>{
          const cleanId=item.id?.replace(/^0x/,"");
          const asset=ASSETS.find(a=>a.id.replace(/^0x/,"")===cleanId);
          if(!asset)return;
          const po=item.price;if(!po)return;
          const p=parseFloat(po.price)*Math.pow(10,po.expo??-8);
          if(isFinite(p)&&p>0){np2[asset.symbol]=p;push(asset.symbol,p);}
        });
        if(Object.keys(np2).length>0){
          setPrices(prev=>{ setPrevPrices(pp=>({...pp,...prev})); return np2; });
          setHistory({...histRef.current});
          setStatus("live");setTickCount(t=>t+1);setLastUpdate(new Date());setErrorMsg(null);return;
        }
      }catch{}
      ASSETS.forEach(a=>{
        const h=histRef.current[a.symbol];
        const last=h?.length?h[h.length-1]:SEED[a.symbol]??100;
        push(a.symbol,last+(Math.random()-.49)*last*.002);
      });
      setPrices(Object.fromEntries(ASSETS.map(a=>[a.symbol,histRef.current[a.symbol].slice(-1)[0]])));
      setHistory({...histRef.current});setStatus("demo");setTickCount(t=>t+1);setLastUpdate(new Date());
      setErrorMsg("API unavailable · showing demo data");
    }
  },[]);  // eslint-disable-line react-hooks/exhaustive-deps

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
    return dir==="pos"?pairs.sort((x,y)=>y.v-x.v).slice(0,6):pairs.sort((x,y)=>x.v-y.v).slice(0,6);
  }

  // Stats
  const validCorrs=[];
  for(let i=0;i<ASSETS.length;i++)for(let j=i+1;j<ASSETS.length;j++){
    const v=corr[`${ASSETS[i].symbol}-${ASSETS[j].symbol}`];
    if(v!==null&&v!==undefined&&isFinite(v)&&ASSETS[i].symbol!==ASSETS[j].symbol)validCorrs.push(v);
  }
  const avgCorr=validCorrs.length?validCorrs.reduce((a,b)=>a+b,0)/validCorrs.length:0;
  const strongPos=validCorrs.filter(v=>v>0.7).length;
  const strongNeg=validCorrs.filter(v=>v<-0.7).length;

  const selCorr=selected?corr[`${selected.a}-${selected.b}`]??null:null;
  const selA=selected?ASSETS.find(a=>a.symbol===selected.a):null;
  const selB=selected?ASSETS.find(a=>a.symbol===selected.b):null;
  const si=strengthInfo(selCorr);

  async function sendFeedback(){
    if(!feedbackText.trim())return;
    // Escape HTML to prevent XSS in Telegram HTML mode
    const safe=feedbackText.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    try{
      await fetch("/api/feedback",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text:safe,ts:new Date().toLocaleString()})
      });
    }catch(e){console.error("Feedback error:",e);}
    setFeedbackSent(true);
    setTimeout(()=>{setFeedbackOpen(false);setFeedbackText("");setFeedbackSent(false);},2200);
  }

  return(
    <div className={`app${mounted?" on":""}`}>
      <SmokeBackground/>

      {/* ══ HEADER ══════════════════════════════════════════════════════ */}
      <header className="hdr">
        <div className="hdr-l">
          <PythLogo size={38}/>
          <div className="hdr-info">
            <div className="hdr-brand">
              <span className="b-pyth">PYTH</span>
              <span className="b-sep"> × </span>
              <span className="b-rs">rustrell</span>
            </div>
            <div className="hdr-sub">Cross-Asset Correlation Matrix</div>
          </div>
        </div>
        <div className="hdr-stats">
          <div className="hstat">
            <div className="hstat-val">{validCorrs.length}</div>
            <div className="hstat-key">Pairs</div>
          </div>
          <div className="hstat-sep"/>
          <div className="hstat">
            <div className="hstat-val pos">{strongPos}</div>
            <div className="hstat-key">Strong +</div>
          </div>
          <div className="hstat-sep"/>
          <div className="hstat">
            <div className="hstat-val neg">{strongNeg}</div>
            <div className="hstat-key">Strong −</div>
          </div>
          <div className="hstat-sep"/>
          <div className="hstat">
            <div className="hstat-val" style={{color:avgCorr>=0?"#34d399":"#f87171"}}>{avgCorr.toFixed(3)}</div>
            <div className="hstat-key">Avg Corr</div>
          </div>
        </div>
        <div className="hdr-r">
          <div className="hdr-upd">{lastUpdate?`UPD ${lastUpdate.toLocaleTimeString()}`:""}</div>
          <div style={{display:"flex",gap:2,background:"rgba(0,0,0,0.4)",borderRadius:6,padding:3,marginRight:6}}>
            {[["matrix","Matrix"],["charts","Charts"],["corr","Correlation"],["entropy","Entropy"],["chain","Chain"]].map(([k,l])=>(
              <button key={k} onClick={()=>setActiveTab(k)} style={{background:activeTab===k?"rgba(139,92,246,0.35)":"transparent",border:"none",borderRadius:4,padding:"4px 12px",fontFamily:"inherit",fontSize:11,fontWeight:600,color:activeTab===k?"#e2d9f3":"rgba(139,92,246,0.5)",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          <div className={`pill ${status}`}><span className="dot"/>{status==="live"?"LIVE":"DEMO"}</div>
          <div className="tick-badge">#{tickCount}</div>
        </div>
      </header>

      {/* ══ FILTER BAR ══════════════════════════════════════════════════ */}
      <div className="fbar" style={{display:activeTab==="charts"||activeTab==="corr"||activeTab==="entropy"||activeTab==="chain"?"none":"flex"}}>
        {["all","crypto","fx","commodity","equity"].map(c=>(
          <button key={c} className={`fbtn${filter===c?" a":""}`} onClick={()=>setFilter(c)}>
            {c==="all"?"All Assets":c==="fx"?"FX Pairs":c==="commodity"?"Commodities":c.charAt(0).toUpperCase()+c.slice(1)}
            <span className="fbtn-count">{c==="all"?ASSETS.length:ASSETS.filter(a=>a.category===c).length}</span>
          </button>
        ))}
        <div className="fbar-right">
          <div className="window-badge">⏱ 200-tick window · 3s interval</div>
        </div>
      </div>

      <main className="main" style={{display:activeTab==="charts"||activeTab==="corr"||activeTab==="entropy"||activeTab==="chain"?"none":"block"}}>
        {status==="demo"&&errorMsg&&(
          <div className="err-banner" role="alert">
            <span className="err-banner-icon">⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {/* ══ TICKERS ════════════════════════════════════════════════════ */}
        <section className={`sec${mobileTab!=="tickers"?" mh":""}`} id="sec-tickers">
          <div className="tgrid">
            {status==="connecting"?(
              vis.map((_,i)=><TickerSkeleton key={i}/>)
            ):vis.map((asset,i)=>{
              const h=history[asset.symbol]||[],cur=prices[asset.symbol],prev=prevPrices[asset.symbol];
              const pct=prev&&cur?((cur-prev)/prev*100):null;
              const h1=h.length>1?h[0]:null;
              const pct24=h1&&cur?((cur-h1)/h1*100):null;
              const hi=h.length?Math.max(...h):null,lo=h.length?Math.min(...h):null;
              const vs=h.slice(-20);const vol=vs.length>4?Math.sqrt(vs.reduce((s,v,_,a)=>{const m=a.reduce((x,y)=>x+y,0)/a.length;return s+(v-m)**2;},0)/vs.length):null;
              return(
                <div key={asset.symbol} className="tc" style={{"--ac":asset.color,"--d":`${i*30}ms`}}>
                  <div className="tc-head">
                    <AssetIcon asset={asset} size={36}/>
                    <div className="tc-meta">
                      <div className="tc-sym" style={{color:asset.color}}>{asset.symbol}</div>
                      <div className="tc-name">{asset.name}</div>
                    </div>
                    <div className={`tc-badge ${asset.category}`}>{asset.category}</div>
                  </div>
                  <div className="tc-price-row">
                    <div className="tc-price">{fmt(asset.symbol,cur)}</div>
                    {pct!==null&&<div className={`tc-pct${pct>=0?" up":" dn"}`}>{fmtPct(pct)}</div>}
                  </div>
                  <div className="tc-spark-row">
                    <Spark data={h} color={asset.color} w={80} h={32}/>
                    {pct24!==null&&<div className={`tc-pct24${pct24>=0?" up":" dn"}`}>Session: {fmtPct(pct24)}</div>}
                  </div>
                  <div className="tc-stats">
                    {hi&&<div className="tc-stat"><span className="tc-sk">H</span><span className="tc-sv">{fmt(asset.symbol,hi)}</span></div>}
                    {lo&&<div className="tc-stat"><span className="tc-sk">L</span><span className="tc-sv">{fmt(asset.symbol,lo)}</span></div>}
                    {vol&&<div className="tc-stat"><span className="tc-sk">σ</span><span className="tc-sv">{vol.toFixed(4)}</span></div>}
                    <div className="tc-stat"><span className="tc-sk">n</span><span className="tc-sv">{h.length}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══ HEATMAP ═════════════════════════════════════════════════════ */}
        <section className={`sec${mobileTab!=="heatmap"?" mh":""}`} id="sec-heatmap">
          <div className="card">
            <div className="card-hdr">
              <div className="card-hdr-l">
                <span className="ct">Correlation Heatmap</span>
                <span className="cm">{vis.length}×{vis.length} Pearson · rolling 200 ticks</span>
              </div>
              <div className="card-hdr-r">
                <div className="leg">
                  <span className="leglb" style={{color:"#f87171"}}>−1</span>
                  <span className="legbar"/>
                  <span className="leglb" style={{color:"#34d399"}}>+1</span>
                </div>
              </div>
            </div>
            <div className="hmwrap">
              <table className="hm">
                <thead>
                  <tr>
                    <th className="hm-corner"><span className="hm-corner-txt">↓ row vs col →</span></th>
                    {vis.map(a=>(
                      <th key={a.symbol} className="hm-cl">
                        <div className="hm-cl-inner" style={{color:a.color}}>
                          <div className="hm-cl-sym">{a.symbol}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vis.map(rA=>(
                    <tr key={rA.symbol}>
                      <td className="hm-rl">
                        <div className="hm-rl-inner">
                          <span className="hm-rl-dot" style={{background:rA.color}}/>
                          <span style={{color:rA.color}}>{rA.symbol}</span>
                        </div>
                      </td>
                      {vis.map(cB=>{
                        const key=`${rA.symbol}-${cB.symbol}`,val=corr[key]??null;
                        const diag=rA.symbol===cB.symbol;
                        const sel=selected&&((selected.a===rA.symbol&&selected.b===cB.symbol)||(selected.a===cB.symbol&&selected.b===rA.symbol));
                        return(
                          <td key={cB.symbol}
                            onClick={()=>!diag&&setSelected(sel?null:{a:rA.symbol,b:cB.symbol})}
                            className={`hm-cell${diag?" diag":""}${sel?" sel":""}`}
                            style={{background:diag?"transparent":corrBg(val),color:diag?"#2a1f40":corrFg(val)}}>
                            {diag?<span className="diag-sym" style={{color:rA.color}}>{rA.symbol.split("/")[0]}</span>:
                             val!==null?val.toFixed(2):"…"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── DETAIL PANEL ─────────────────────────────────────────── */}
          {selected&&(
            <div className="card detail-panel">
              <div className="card-hdr">
                <div className="card-hdr-l">
                  <span className="ct">Pair Analysis</span>
                  <span className="cm">{selected.a} / {selected.b}</span>
                </div>
                <button className="xbtn" onClick={()=>setSelected(null)}>✕ Close</button>
              </div>
              <div className="dp-body">
                <div className="dp-left">
                  <div className="dp-pair">
                    <div className="dp-asset">
                      {selA&&<AssetIcon asset={selA} size={48}/>}
                      <div className="dp-sym" style={{color:selA?.color}}>{selected.a}</div>
                      <div className="dp-aname">{selA?.name}</div>
                    </div>
                    <div className="dp-mid">
                      <div className="dp-corr" style={{color:si.color}}>{selCorr===null?"–":selCorr.toFixed(3)}</div>
                      <div className="dp-label" style={{color:si.color}}>{si.label}</div>
                      <div className="dp-desc">{si.desc}</div>
                    </div>
                    <div className="dp-asset">
                      {selB&&<AssetIcon asset={selB} size={48}/>}
                      <div className="dp-sym" style={{color:selB?.color}}>{selected.b}</div>
                      <div className="dp-aname">{selB?.name}</div>
                    </div>
                  </div>
                  <div className="dp-stats-grid">
                    {[
                      ["Ticks collected",`${Math.min(history[selected.a]?.length||0,history[selected.b]?.length||0)}`],
                      ["Window size","200 samples"],
                      ["Update interval","3 seconds"],
                      ["Algorithm","Pearson r"],
                      [`${selected.a} category`,selA?.category||"–"],
                      [`${selected.b} category`,selB?.category||"–"],
                    ].map(([k,v])=>(
                      <div key={k} className="dp-stat">
                        <div className="dp-sk">{k}</div>
                        <div className="dp-sv">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="dp-right">
                  <div className="dp-chart-title">Rolling Correlation History</div>
                  <CorrChart symA={selected.a} symB={selected.b} histRef={histRef}/>
                  <div className="dp-prices">
                    {[selA,selB].map(a=>a&&(
                      <div key={a.symbol} className="dp-price-row">
                        <span style={{color:a.color}}>{a.symbol}</span>
                        <span className="dp-pval">{fmt(a.symbol,prices[a.symbol])}</span>
                        <Spark data={history[a.symbol]||[]} color={a.color} w={60} h={22}/>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ══ RANKINGS ════════════════════════════════════════════════════ */}
        <section className={`sec${mobileTab!=="top"?" mh":""}`} id="sec-rankings">
          <div className="rgrid">
            {["pos","neg"].map(dir=>(
              <div key={dir} className="card">
                <div className="card-hdr">
                  <div className="card-hdr-l">
                    <span className="ct" style={{color:dir==="pos"?"#34d399":"#f87171"}}>
                      {dir==="pos"?"▲ Strongest Positive":"▼ Strongest Negative"}
                    </span>
                    <span className="cm">Top 6 pairs · {filter==="all"?"all assets":filter}</span>
                  </div>
                </div>
                {topPairs(dir).map(({a,b,v},i)=>{
                  const bar=Math.abs(v)*100;
                  return(
                    <div key={`${a.symbol}${b.symbol}`} className="rr" onClick={()=>setSelected({a:a.symbol,b:b.symbol})} style={{"--i":i}}>
                      <div className="rr-bar" style={{width:`${bar}%`,background:dir==="pos"?"rgba(52,211,153,0.12)":"rgba(248,113,113,0.12)"}}/>
                      <div className="rr-num">{i+1}</div>
                      <div className="rr-pair">
                        <span className="rr-sym" style={{color:a.color}}>{a.symbol}</span>
                        <span className="rr-cat">{a.category}</span>
                        <span className="rr-vs">vs</span>
                        <span className="rr-sym" style={{color:b.color}}>{b.symbol}</span>
                        <span className="rr-cat">{b.category}</span>
                      </div>
                      <div className={`rr-val ${dir}`}>{v.toFixed(3)}</div>
                      <div className="rr-str">{strengthInfo(v).label.split(" ")[0]}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

      </main>

      {activeTab==="charts"&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#070512",zIndex:200,display:"flex",flexDirection:"column",fontFamily:"'Space Mono',monospace"}}>
        <ChartView assets={ASSETS} prices={prices} chartAsset={chartAsset} setChartAsset={setChartAsset} chartTf={chartTf} setChartTf={setChartTf} chartType={chartType} setChartType={setChartType} chartHist={chartHist} setChartHist={setChartHist} setActiveTab={setActiveTab} status={status}/>
      </div>}

      {activeTab==="corr"&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#07050f",zIndex:200,display:"flex",flexDirection:"column"}}>
        <CorrView histRef={histRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status}/>
      </div>}

      {activeTab==="entropy"&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#07050f",zIndex:200,display:"flex",flexDirection:"column"}}>
        <EntropyView histRef={histRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status}/>
      </div>}

      {activeTab==="chain" && <div style={{position:"fixed",inset:0,background:"#06030f",zIndex:200,display:"flex",flexDirection:"column"}}>
        <ChainView setActiveTab={setActiveTab}/>
      </div>}

      {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
      <footer className="foot">
        <div className="foot-l">
          <PythLogo size={18}/>
          <span>Powered by <a href="https://pyth.network" target="_blank" rel="noreferrer" className="fl">Pyth Network</a></span>
          <span className="foot-sep">·</span>
          <span>Pyth Playground Hackathon 2025</span>
          <span className="foot-sep">·</span>
          <span>Built by <a href="https://x.com/xzolmoneythinks" target="_blank" rel="noreferrer" className="fl">@xzolmoneythinks</a></span>
        </div>
        <div className="foot-r">
          <span className="foot-info">Data updates every 3s · 400ms Pyth oracle</span>
          <button className="fbk-btn" onClick={()=>setFeedbackOpen(true)}>💬 Feedback</button>
        </div>
      </footer>

      {/* ══ FEEDBACK MODAL ═════════════════════════════════════════════ */}
      {feedbackOpen&&(
        <div className="overlay" onClick={()=>setFeedbackOpen(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="card-hdr">
              <div className="card-hdr-l">
                <span className="ct">Send Feedback</span>
                <span className="cm">Sent to Telegram instantly</span>
              </div>
              <button className="xbtn" onClick={()=>setFeedbackOpen(false)}>✕</button>
            </div>
            {feedbackSent?(
              <div className="sent">✅ Received! Thank you.</div>
            ):(
              <div className="modal-body">
                <textarea className="fta" placeholder="Bug report, feature request, or general feedback..." value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} rows={5} autoFocus/>
                <button className="fsend" onClick={sendFeedback} disabled={!feedbackText.trim()}>Send →</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

        :root {
          --bg: #060410;
          --bg2: #0a0718;
          --card: rgba(255,255,255,0.028);
          --cb: rgba(139,92,246,0.14);
          --cb2: rgba(139,92,246,0.07);
          --pu: #8b5cf6; --pul: #a78bfa; --pud: rgba(139,92,246,0.22);
          --tx: #e2d9f3; --td: #6b5c8a; --tm: #2d1f4a; --txx: #f0eaff;
          --gn: #34d399; --rd: #f87171;
          --fd: 'Outfit', sans-serif;
          --fm: 'Space Mono', monospace;
          --r: 10px; --rs: 7px;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { width: 100%; height: 100%; }
        body { width: 100%; min-height: 100%; background: var(--bg); margin: 0; }
        #root { width: 100%; min-height: 100vh; display: block; }
        .app { min-height: 100vh; width: 100%; max-width: 100vw; background: var(--bg); color: var(--tx); font-family: var(--fm); display: flex; flex-direction: column; position: relative; overflow-x: hidden; opacity: 0; transition: opacity .5s; }
        .app.on { opacity: 1; }

        /* HEADER */
        .hdr { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; gap: 16px; padding: 10px 24px; background: rgba(6,4,16,0.92); backdrop-filter: blur(28px); border-bottom: 1px solid var(--cb); flex-wrap: wrap; }
        .hdr-l { display: flex; align-items: center; gap: 12px; }
        .hdr-info { display: flex; flex-direction: column; gap: 2px; }
        .hdr-brand { font-family: var(--fd); font-size: 18px; font-weight: 800; letter-spacing: .04em; }
        .b-pyth { color: #fff; } .b-sep { color: var(--pud); } .b-rs { color: var(--pul); }
        .hdr-sub { font-size: 9px; color: var(--td); letter-spacing: .2em; text-transform: uppercase; }
        .hdr-stats { display: flex; align-items: center; gap: 0; margin-left: 20px; background: rgba(0,0,0,0.3); border: 1px solid var(--cb2); border-radius: var(--rs); overflow: hidden; }
        .hstat { padding: 6px 14px; text-align: center; }
        .hstat-val { font-family: var(--fd); font-size: 16px; font-weight: 700; color: var(--txx); }
        .hstat-val.pos { color: var(--gn); } .hstat-val.neg { color: var(--rd); }
        .hstat-key { font-size: 8px; color: var(--td); letter-spacing: .1em; text-transform: uppercase; margin-top: 1px; }
        .hstat-sep { width: 1px; height: 32px; background: var(--cb); }
        .hdr-r { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .hdr-upd { font-size: 9px; color: var(--td); letter-spacing: .08em; }
        .pill { display: flex; align-items: center; gap: 5px; padding: 4px 11px; border-radius: 20px; font-size: 9px; font-weight: 700; letter-spacing: .14em; border: 1px solid; }
        .pill.live { background: rgba(52,211,153,.08); border-color: rgba(52,211,153,.3); color: var(--gn); }
        .pill.demo { background: rgba(251,146,60,.08); border-color: rgba(251,146,60,.3); color: #fb923c; }
        .pill.connecting { background: rgba(139,92,246,.08); border-color: var(--pud); color: var(--pul); }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.3} }
        .tick-badge { font-size: 9px; color: var(--tm); letter-spacing: .06em; }

        /* FILTER BAR */
        .fbar { display: flex; align-items: center; gap: 5px; padding: 8px 24px; border-bottom: 1px solid var(--cb2); background: rgba(6,4,16,.7); overflow-x: auto; scrollbar-width: none; position: relative; z-index: 1; }
        .fbar::-webkit-scrollbar { display: none; }
        .fbtn { display: flex; align-items: center; gap: 6px; flex-shrink: 0; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--tm); background: transparent; color: var(--td); font-size: 10px; font-family: var(--fm); cursor: pointer; transition: all .15s; white-space: nowrap; }
        .fbtn:hover { border-color: var(--pud); color: var(--pul); }
        .fbtn.a { background: var(--pud); border-color: var(--pu); color: #fff; }
        .fbtn-count { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1px 6px; font-size: 8px; }
        .fbar-right { margin-left: auto; flex-shrink: 0; }
        .window-badge { font-size: 9px; color: var(--tm); letter-spacing: .06em; white-space: nowrap; }

        /* MOBILE TABS */
        .mtabs { display: none; }
        @media(max-width:768px){
          .mtabs { display: flex; background: rgba(6,4,16,.95); border-bottom: 1px solid var(--cb); position: relative; z-index: 1; }
          .mt { flex: 1; padding: 10px; border: none; background: transparent; color: var(--td); font-size: 11px; font-family: var(--fm); cursor: pointer; border-bottom: 2px solid transparent; transition: all .2s; }
          .mt.a { color: var(--pul); border-bottom-color: var(--pu); }
          .mh { display: none !important; }
        }

        /* MAIN */
        .main { flex: 1; padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 1; width: 100%; }

        /* CARDS */
        .card { background: var(--card); border: 1px solid var(--cb); border-radius: var(--r); backdrop-filter: blur(16px); overflow: hidden; animation: fup .4s ease both; }
        @keyframes fup { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .card-hdr { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--cb2); }
        .card-hdr-l { display: flex; flex-direction: column; gap: 2px; }
        .card-hdr-r { display: flex; align-items: center; gap: 8px; }
        .ct { font-family: var(--fd); font-size: 13px; font-weight: 700; color: var(--txx); letter-spacing: .03em; }
        .cm { font-size: 9px; color: var(--td); letter-spacing: .08em; }

        /* TICKERS */
        .tgrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px; width: 100%; }
        .tc { background: var(--card); border: 1px solid var(--cb2); border-top: 2px solid var(--ac, var(--pu)); border-radius: var(--r); padding: 12px; display: flex; flex-direction: column; gap: 6px; transition: transform .2s, border-color .2s, box-shadow .2s; animation: fup .4s ease both; animation-delay: var(--d,0ms); cursor: default; position: relative; overflow: hidden; }
        .tc::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top left, var(--ac,transparent) 0%, transparent 60%); opacity: 0.04; pointer-events: none; }
        .tc:hover { transform: translateY(-3px); border-color: var(--cb); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .tc-head { display: flex; align-items: center; gap: 8px; }
        .asset-icon { flex-shrink: 0; border-radius: 10px; overflow: hidden; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; }
        .asset-icon img { width: 100%; height: 100%; object-fit: contain; padding: 2px; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; }
        .asset-icon.sym { background: color-mix(in srgb, var(--ac) 22%, transparent); border: 1px solid color-mix(in srgb, var(--ac) 40%, transparent); }
        .asset-icon-sym { font-size: 13px; font-weight: 800; color: var(--ac); text-transform: uppercase; letter-spacing: .02em; }
        .tc-meta { flex: 1; min-width: 0; }
        .tc-sym { font-family: var(--fd); font-size: 13px; font-weight: 700; line-height: 1.1; }
        .tc-name { font-size: 8px; color: var(--td); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tc-badge { font-size: 7px; padding: 2px 5px; border-radius: 4px; letter-spacing: .08em; text-transform: uppercase; flex-shrink: 0; }
        .tc-badge.crypto { background: rgba(153,69,255,.15); color: #9945ff; }
        .tc-badge.fx { background: rgba(96,165,250,.12); color: #60a5fa; }
        .tc-badge.commodity { background: rgba(252,211,77,.12); color: #fcd34d; }
        .tc-badge.equity { background: rgba(226,232,240,.1); color: #e2e8f0; }
        .tc-price-row { display: flex; align-items: baseline; justify-content: space-between; gap: 4px; }
        .tc-price { font-family: var(--fd); font-size: 15px; font-weight: 700; color: var(--txx); font-variant-numeric: tabular-nums; }
        .tc-pct { font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 4px; }
        .tc-pct.up { color: var(--gn); background: rgba(52,211,153,.1); }
        .tc-pct.dn { color: var(--rd); background: rgba(248,113,113,.1); }
        .tc-spark-row { display: flex; align-items: center; justify-content: space-between; }
        .tc-pct24 { font-size: 8px; }
        .tc-pct24.up { color: var(--gn); } .tc-pct24.dn { color: var(--rd); }
        .tc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; border-top: 1px solid var(--cb2); padding-top: 6px; }
        .tc-stat { display: flex; gap: 4px; align-items: baseline; }
        .tc-sk { font-size: 8px; color: var(--tm); text-transform: uppercase; }
        .tc-sv { font-size: 9px; color: var(--td); font-variant-numeric: tabular-nums; }

        /* SKELETON */
        .tc-skeleton { pointer-events: none; }
        .tc-skeleton .sk-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(90deg,rgba(139,92,246,.15) 25%,rgba(139,92,246,.08) 50%,rgba(139,92,246,.15) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-meta { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .tc-skeleton .sk-line { height: 10px; border-radius: 4px; background: linear-gradient(90deg,rgba(139,92,246,.12) 25%,rgba(139,92,246,.06) 50%,rgba(139,92,246,.12) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-line.w6 { width: 35px; } .tc-skeleton .sk-line.w8 { width: 48px; } .tc-skeleton .sk-line.w10 { width: 55px; } .tc-skeleton .sk-line.w12 { width: 70px; } .tc-skeleton .sk-line.w14 { width: 72px; }
        .tc-skeleton .sk-badge { width: 40px; height: 14px; border-radius: 4px; background: linear-gradient(90deg,rgba(139,92,246,.1) 25%,rgba(139,92,246,.05) 50%,rgba(139,92,246,.1) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-spark { width: 80px; height: 32px; border-radius: 4px; background: linear-gradient(90deg,rgba(139,92,246,.08) 25%,rgba(139,92,246,.04) 50%,rgba(139,92,246,.08) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        .tc-skeleton .sk-stat { height: 12px; border-radius: 3px; background: linear-gradient(90deg,rgba(139,92,246,.08) 25%,rgba(139,92,246,.04) 50%,rgba(139,92,246,.08) 75%); background-size: 200% 100%; animation: shim .9s infinite; }
        @keyframes shim { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ERROR BANNER */
        .err-banner { display: flex; align-items: center; gap: 8px; padding: 10px 16px; margin-bottom: 12px; background: rgba(251,146,60,.12); border: 1px solid rgba(251,146,60,.35); border-radius: var(--r); color: #fb923c; font-size: 11px; }
        .err-banner-icon { font-size: 14px; }

        /* LEGEND */
        .leg { display: flex; align-items: center; gap: 5px; }
        .legbar { width: 60px; height: 6px; border-radius: 3px; background: linear-gradient(90deg,#f87171,rgba(139,92,246,.3),#34d399); }
        .leglb { font-size: 9px; font-weight: 700; }

        /* HEATMAP */
        .hmwrap { overflow-x: auto; padding: 10px; width: 100%; }
        .hm { border-collapse: separate; border-spacing: 2px; width: 100%; }
        .hm-corner { width: 72px; vertical-align: bottom; padding-bottom: 4px; }
        .hm-corner-txt { font-size: 7px; color: var(--tm); display: block; text-align: right; }
        .hm-cl { padding: 2px 1px; }
        .hm-cl-inner { writing-mode: vertical-lr; transform: rotate(180deg); display: flex; flex-direction: column; align-items: center; height: 56px; justify-content: flex-end; }
        .hm-cl-sym { font-size: 8px; font-weight: 700; letter-spacing: .03em; white-space: nowrap; }
        .hm-rl { padding-right: 6px; white-space: nowrap; }
        .hm-rl-inner { display: flex; align-items: center; gap: 5px; }
        .hm-rl-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .hm-cell { min-width: 44px; height: 40px; text-align: center; vertical-align: middle; font-size: 8px; font-weight: 700; border-radius: 5px; cursor: pointer; transition: filter .18s, transform .18s; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
        .hm-cell:hover { filter: brightness(1.4); transform: scale(1.08); z-index: 2; position: relative; }
        .hm-cell.diag { cursor: default; background: rgba(139,92,246,.04) !important; border: 1px solid rgba(139,92,246,.15); }
        .hm-cell.sel { outline: 2px solid rgba(255,255,255,.8); outline-offset: -1px; }
        .diag-sym { font-size: 8px; font-weight: 700; color: var(--td); }
        .xbtn { background: transparent; border: 1px solid var(--tm); color: var(--td); padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 10px; font-family: var(--fm); transition: all .2s; white-space: nowrap; }
        .xbtn:hover { border-color: var(--pud); color: var(--pul); }

        /* DETAIL PANEL */
        .detail-panel { animation: slideIn .28s ease both; }
        @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .dp-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
        .dp-left { padding: 16px; border-right: 1px solid var(--cb2); }
        .dp-right { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .dp-pair { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
        .dp-asset { text-align: center; }
        .dp-asset .asset-icon { margin: 0 auto; }
        .dp-asset .asset-icon-sym { font-size: 18px; }
        .dp-sym { font-family: var(--fd); font-size: 16px; font-weight: 800; margin-top: 4px; }
        .dp-aname { font-size: 9px; color: var(--td); margin-top: 2px; }
        .dp-mid { text-align: center; flex: 1; }
        .dp-corr { font-family: var(--fd); font-size: 42px; font-weight: 800; line-height: 1; transition: color .4s; }
        .dp-label { font-size: 9px; font-weight: 700; letter-spacing: .14em; margin-top: 4px; }
        .dp-desc { font-size: 9px; color: var(--td); margin-top: 4px; max-width: 140px; margin-left: auto; margin-right: auto; line-height: 1.4; }
        .dp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .dp-stat { background: rgba(0,0,0,.25); border: 1px solid var(--cb2); border-radius: var(--rs); padding: 7px 9px; }
        .dp-sk { font-size: 8px; color: var(--td); letter-spacing: .1em; text-transform: uppercase; margin-bottom: 3px; }
        .dp-sv { font-size: 11px; color: var(--tx); }
        .dp-chart-title { font-size: 9px; color: var(--td); letter-spacing: .1em; text-transform: uppercase; }
        .dp-prices { display: flex; flex-direction: column; gap: 6px; border-top: 1px solid var(--cb2); padding-top: 8px; }
        .dp-price-row { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 700; }
        .dp-pval { font-variant-numeric: tabular-nums; color: var(--tx); flex: 1; }

        /* RANKINGS */
        .rgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .rr { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border-bottom: 1px solid var(--cb2); cursor: pointer; transition: background .15s; position: relative; overflow: hidden; animation: fup .3s ease both; animation-delay: calc(var(--i)*50ms); }
        .rr-bar { position: absolute; left: 0; top: 0; height: 100%; transition: width .5s; pointer-events: none; }
        .rr:hover { background: rgba(139,92,246,.06); }
        .rr:last-child { border-bottom: none; }
        .rr-num { width: 16px; font-size: 9px; color: var(--tm); flex-shrink: 0; z-index: 1; }
        .rr-pair { flex: 1; display: flex; align-items: center; gap: 5px; z-index: 1; flex-wrap: wrap; }
        .rr-sym { font-size: 11px; font-weight: 700; }
        .rr-cat { font-size: 7px; color: var(--td); padding: 1px 4px; border: 1px solid var(--tm); border-radius: 3px; }
        .rr-vs { font-size: 8px; color: var(--tm); }
        .rr-val { font-family: var(--fd); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; z-index: 1; }
        .rr-val.pos { color: var(--gn); } .rr-val.neg { color: var(--rd); }
        .rr-str { font-size: 7px; color: var(--td); letter-spacing: .08em; z-index: 1; white-space: nowrap; }

        /* FOOTER */
        .foot { display: flex; align-items: center; justify-content: space-between; padding: 10px 24px; font-size: 10px; color: var(--tm); border-top: 1px solid var(--cb2); position: relative; z-index: 1; flex-wrap: wrap; gap: 8px; }
        .foot-l { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .foot-r { display: flex; align-items: center; gap: 10px; }
        .foot-sep { color: var(--tm); }
        .foot-info { font-size: 9px; color: var(--tm); }
        .fl { color: var(--pul); text-decoration: none; } .fl:hover { text-decoration: underline; }
        .fbk-btn { background: transparent; border: 1px solid var(--cb); color: var(--pul); padding: 5px 12px; border-radius: 20px; cursor: pointer; font-size: 10px; font-family: var(--fm); transition: all .2s; }
        .fbk-btn:hover { background: var(--pud); border-color: var(--pu); }

        /* MODAL */
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.65); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); animation: fadein .2s ease; }
        @keyframes fadein { from{opacity:0} to{opacity:1} }
        .modal { background: #0c0917; border: 1px solid var(--cb); border-radius: var(--r); width: min(500px, 94vw); overflow: hidden; animation: fup .22s ease; }
        .modal-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
        .fta { width: 100%; padding: 10px 12px; background: rgba(0,0,0,.4); border: 1px solid var(--cb); border-radius: var(--rs); color: var(--tx); font-family: var(--fm); font-size: 12px; resize: vertical; outline: none; transition: border-color .2s; }
        .fta:focus { border-color: var(--pu); }
        .fsend { padding: 10px; background: var(--pud); border: 1px solid var(--pu); border-radius: var(--rs); color: #fff; font-family: var(--fd); font-size: 13px; font-weight: 700; cursor: pointer; transition: all .2s; }
        .fsend:hover:not(:disabled) { background: var(--pu); }
        .fsend:disabled { opacity: .4; cursor: default; }
        .sent { padding: 28px; text-align: center; font-size: 16px; color: var(--gn); }

        /* SCROLLBAR */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--pud); border-radius: 2px; }

        /* RESPONSIVE */
        @media(max-width:1024px) {
          .dp-body { grid-template-columns: 1fr; }
          .dp-left { border-right: none; border-bottom: 1px solid var(--cb2); }
          .hdr-stats { display: none; }
        }
        @media(max-width:768px) {
          .main { padding: 10px 12px; }
          .hdr { padding: 10px 14px; }
          .fbar { padding: 7px 12px; }
          .rgrid { grid-template-columns: 1fr; }
          .hm-cell { width: 34px; height: 34px; font-size: 7px; }
          .hm-cl-inner { height: 44px; }
          .dp-corr { font-size: 32px; }
          .dp-sym { font-size: 14px; }
        }
        @media(max-width:480px) {
          .hdr-sub { display: none; }
          .tgrid { grid-template-columns: 1fr 1fr; }
          .hdr-upd { display: none; }
        }
      `}</style>
    </div>
  );
}

/* ─── CHART VIEW ─────────────────────────────────────────────────────────── */
const TF_LIST = ["1m","5m","15m","1h","4h","1d"];
const TF_SECS = {"1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1d":86400};
const BN_SYM  = {"BTC":"BTCUSDT","ETH":"ETHUSDT","SOL":"SOLUSDT","DOGE":"DOGEUSDT","USDC":"USDCUSDT","XAU/USD":"XAUUSDT","EUR/USD":"EURUSDT","GBP/USD":"GBPUSDT"};

function drawCandles(canvas, bars, chartType) {
  if (!canvas) return;
  const par = canvas.parentElement;
  if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#07050f"; ctx.fillRect(0,0,W,H);

  if (!bars || bars.length < 2) {
    ctx.fillStyle = "rgba(124,58,237,0.3)"; ctx.font = "12px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Loading data…", W/2, H/2);
    return;
  }

  const PAD = {t:12, r:80, b:32, l:8};
  const PH = (H - PAD.t - PAD.b) * 0.78;
  const VH = (H - PAD.t - PAD.b) * 0.14;
  const CW = W - PAD.l - PAD.r;
  const vis = bars.slice(-200);
  const N = vis.length;
  const colW = CW / N;

  const lo = Math.min(...vis.map(b=>b.l));
  const hi = Math.max(...vis.map(b=>b.h));
  const rng = hi - lo || hi * 0.002 || 1;
  const yMin = lo - rng*0.03, yMax = hi + rng*0.06;
  const toY = v => PAD.t + PH * (1 - (v-yMin)/(yMax-yMin));
  const toX = i => PAD.l + (i+0.5)*colW;

  // Grid lines + price labels
  const gridCount = 6;
  for (let i=0;i<=gridCount;i++) {
    const v = yMin + (yMax-yMin)/gridCount*i;
    const y = toY(v);
    if (y < PAD.t || y > PAD.t+PH) continue;
    // Grid line
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1; ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W-PAD.r, y); ctx.stroke();
    // Price label
    const s = v>=100000?v.toFixed(0):v>=10000?v.toFixed(0):v>=100?v.toFixed(2):v>=1?v.toFixed(4):v.toFixed(6);
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px 'Space Mono',monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(s, W-PAD.r+8, y);
  }

  // Volume bars
  const volTop = PAD.t + PH + (H-PAD.t-PAD.b)*0.05;
  const volBase = volTop + VH;
  const maxV = Math.max(...vis.map(b=>b.v||0), 1);
  vis.forEach((b,i)=>{
    const vh = ((b.v||0)/maxV) * VH;
    if (vh < 0.5) return;
    ctx.fillStyle = b.c>=b.o ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)";
    ctx.fillRect(toX(i)-colW*0.38, volBase-vh, colW*0.76, vh);
  });

  // Candles or Line
  if (chartType === "line") {
    const up = vis[vis.length-1].c >= vis[0].o;
    const col = up ? "#10b981" : "#ef4444";
    const grd = ctx.createLinearGradient(0,PAD.t,0,PAD.t+PH);
    grd.addColorStop(0, up?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)");
    grd.addColorStop(1,"rgba(0,0,0,0)");
    ctx.beginPath();
    vis.forEach((b,i)=>{ const x=toX(i),y=toY(b.c); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.lineTo(toX(N-1),PAD.t+PH); ctx.lineTo(toX(0),PAD.t+PH);
    ctx.closePath(); ctx.fillStyle=grd; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.lineJoin="round";
    ctx.beginPath();
    vis.forEach((b,i)=>{ const x=toX(i),y=toY(b.c); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    ctx.stroke();
  } else {
    const bw = Math.max(1, colW * 0.6);
    vis.forEach((b,i)=>{
      const x=toX(i), up=b.c>=b.o;
      const upCol = "#10b981", dnCol = "#ef4444";
      const col = up ? upCol : dnCol;
      // Wick
      ctx.strokeStyle = col; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, Math.max(PAD.t, toY(b.h)));
      ctx.lineTo(x, Math.min(PAD.t+PH, toY(b.l)));
      ctx.stroke();
      // Body
      const by = Math.max(PAD.t, Math.min(toY(b.o), toY(b.c)));
      const bh = Math.max(1, Math.min(Math.abs(toY(b.o)-toY(b.c)), PAD.t+PH-by));
      ctx.fillStyle = up ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)";
      ctx.fillRect(x-bw/2, by, bw, bh);
    });
  }

  // Time axis
  const step = Math.max(1, Math.floor(N/8));
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "8px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  vis.forEach((b,i)=>{
    if (i%step!==0) return;
    const d = new Date(b.t*1000);
    const tfs = b.tfs||60;
    const s = tfs>=86400
      ? d.toLocaleDateString("en",{month:"short",day:"numeric"})
      : d.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",hour12:false});
    ctx.fillText(s, toX(i), volBase+4);
  });

  // Current price line
  const last = vis[vis.length-1].c;
  const ly = toY(last);
  if (ly>=PAD.t && ly<=PAD.t+PH) {
    const up = last >= vis[0].o;
    ctx.strokeStyle = up ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)";
    ctx.lineWidth = 1; ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(PAD.l, ly); ctx.lineTo(W-PAD.r, ly); ctx.stroke();
    ctx.setLineDash([]);
    const s = last>=100000?last.toFixed(0):last>=10000?last.toFixed(0):last>=100?last.toFixed(2):last>=1?last.toFixed(4):last.toFixed(6);
    ctx.fillStyle = up ? "#10b981" : "#ef4444";
    ctx.fillRect(W-PAD.r+1, ly-8, PAD.r-3, 16);
    ctx.fillStyle = "#fff"; ctx.font = "bold 9px 'Space Mono',monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(s, W-PAD.r+6, ly);
  }

  // ── Watermark: Pyth logo + PythNetwork text ─────────────────────────────
  {
    ctx.save();
    const cx = PAD.l + CW * 0.5;
    const cy = PAD.t + PH * 0.5;
    const alpha = 0.055;

    // Draw "PythNetwork" text
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#ffffff";
    const fontSize = Math.min(CW * 0.06, 42);
    ctx.font = `700 ${fontSize}px 'Outfit','Space Mono',sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("PythNetwork", cx + fontSize * 1.4, cy);

    // Draw Pyth "P" circle logo shape to the left of text
    const r = fontSize * 0.9;
    const lx = cx - ctx.measureText("PythNetwork").width * 0.5;
    // Outer ring
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = r * 0.12;
    ctx.beginPath();
    ctx.arc(lx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // Inner ring
    ctx.lineWidth = r * 0.10;
    ctx.beginPath();
    ctx.arc(lx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    // Gap cut (mimics Pyth P shape)
    ctx.fillStyle = "#07050f";
    ctx.globalAlpha = alpha * 1.2;
    ctx.fillRect(lx - r*0.08, cy - r, r*0.16, r*0.7);

    ctx.restore();
  }
}


function ChartView({assets, prices, chartAsset, setChartAsset, chartTf, setChartTf, chartType, setChartType, chartHist, setChartHist, setActiveTab, status}) {
  const canvasRef = useRef();
  const barsRef   = useRef([]);
  const [, redraw] = useState(0);

  // Fetch Binance history
  useEffect(()=>{
    let dead = false;
    const sym = BN_SYM[chartAsset];
    if (!sym) return;
    fetch("https://api.binance.com/api/v3/klines?symbol="+sym+"&interval="+chartTf+"&limit=300")
      .then(r=>r.json())
      .then(raw=>{
        if (dead) return;
        const candles = raw.map(k=>({
          t:Math.floor(k[0]/1000), o:parseFloat(k[1]),
          h:parseFloat(k[2]), l:parseFloat(k[3]),
          c:parseFloat(k[4]), v:parseFloat(k[5]),
          tfs: TF_SECS[chartTf]||60
        }));
        setChartHist(p=>({...p,[chartAsset]:{...(p[chartAsset]||{}),[chartTf]:candles}}));
      })
      .catch(()=>{});
    return ()=>{dead=true;};
  },[chartAsset, chartTf]);

  // Merge live price into bars
  useEffect(()=>{
    const base = (chartHist[chartAsset]||{})[chartTf] || [];
    const price = prices[chartAsset];
    if (!base.length) { barsRef.current = []; return; }
    const secs = TF_SECS[chartTf]||60;
    const barT = Math.floor(Date.now()/1000/secs)*secs;
    const copy = base.map(b=>({...b}));
    const last = copy[copy.length-1];
    if (last && last.t===barT) {
      last.h=Math.max(last.h,price||last.h);
      last.l=Math.min(last.l,price||last.l);
      last.c=price||last.c;
    } else if (price && (!last||barT>last.t)) {
      const o=last?last.c:price;
      copy.push({t:barT,o,h:Math.max(o,price),l:Math.min(o,price),c:price,v:0,tfs:secs});
    }
    barsRef.current = copy;
    if (canvasRef.current) drawCandles(canvasRef.current, copy, chartType);
  },[chartHist, chartAsset, chartTf, prices, chartType]);

  // 1s redraw
  useEffect(()=>{
    const iv = setInterval(()=>{
      if (canvasRef.current) drawCandles(canvasRef.current, barsRef.current, chartType);
    }, 1000);
    return ()=>clearInterval(iv);
  },[chartType]);

  // Resize
  useEffect(()=>{
    const c = canvasRef.current; if (!c) return;
    const ro = new ResizeObserver(()=>drawCandles(c, barsRef.current, chartType));
    if (c.parentElement) ro.observe(c.parentElement);
    return ()=>ro.disconnect();
  },[chartType]);

  const cur = prices[chartAsset];
  const hist = (chartHist[chartAsset]||{})[chartTf]||[];
  const pct  = hist.length && cur ? (cur-hist[0].o)/hist[0].o*100 : null;
  const fmtP = v => !v?"–":v>=10000?"$"+v.toLocaleString(undefined,{maximumFractionDigits:0}):v>=100?"$"+v.toFixed(2):v>=1?"$"+v.toFixed(4):"$"+v.toFixed(6);
  const asset= assets.find(a=>a.symbol===chartAsset)||assets[0];
  const bars = barsRef.current || [];

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#07050f",fontFamily:"'Space Mono',monospace"}}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",height:48,padding:"0 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0b0917",flexShrink:0,gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <PythLogo size={22}/>
          <span style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
          <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>CHARTS</span>
        </div>
        <div style={{width:1,height:20,background:"rgba(255,255,255,0.08)"}}/>
        {/* Asset symbol + price + pct */}
        <div style={{display:"flex",alignItems:"baseline",gap:8}}>
          <span style={{fontSize:13,fontWeight:700,color:"#fff",letterSpacing:".04em"}}>{asset.symbol}</span>
          <span style={{fontSize:20,fontWeight:700,color:"#fff",letterSpacing:"-.01em"}}>{fmtP(cur)}</span>
          {pct!=null&&<span style={{fontSize:12,fontWeight:600,color:pct>=0?"#10b981":"#ef4444"}}>{pct>=0?"+":""}{pct.toFixed(2)}%</span>}
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:3,background:status==="live"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${status==="live"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:status==="live"?"#10b981":"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:status==="live"?"#10b981":"#ef4444"}}>{status==="live"?"LIVE":"DEMO"}</span>
          </div>
          <button onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:3,padding:"4px 12px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600,letterSpacing:".05em",transition:"all .15s"}}
            onMouseEnter={e=>{e.target.style.borderColor="rgba(124,58,237,0.6)";e.target.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.target.style.borderColor="rgba(255,255,255,0.12)";e.target.style.color="rgba(255,255,255,0.5)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* ── SYMBOL STRIP ────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",height:36,padding:"0 0",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#080614",flexShrink:0,overflowX:"auto",scrollbarWidth:"none"}}>
        {assets.map(a=>{
          const p=prices[a.symbol];
          const h=(chartHist[a.symbol]||{})[chartTf]||[];
          const pc=h.length&&p?(p-h[0].o)/h[0].o*100:null;
          const sel=chartAsset===a.symbol;
          return (
            <button key={a.symbol} onClick={()=>setChartAsset(a.symbol)} style={{flexShrink:0,display:"flex",alignItems:"center",gap:6,padding:"0 14px",height:"100%",background:sel?"rgba(124,58,237,0.12)":"transparent",border:"none",borderBottom:sel?"2px solid #7c3aed":"2px solid transparent",cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:11,fontWeight:700,color:sel?"#c4b5fd":"rgba(255,255,255,0.35)",letterSpacing:".03em"}}>{a.symbol}</span>
              {pc!=null&&<span style={{fontSize:9,color:pc>=0?"#10b981":"#ef4444",fontWeight:600}}>{pc>=0?"+":""}{pc.toFixed(2)}%</span>}
            </button>
          );
        })}
      </div>

      {/* ── CONTROLS ROW ────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",height:34,padding:"0 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#07050f",flexShrink:0,gap:2}}>
        {/* Timeframes */}
        {TF_LIST.map(tf=>(
          <button key={tf} onClick={()=>setChartTf(tf)} style={{background:chartTf===tf?"rgba(124,58,237,0.25)":"transparent",border:"none",borderRadius:2,cursor:"pointer",color:chartTf===tf?"#c4b5fd":"rgba(255,255,255,0.3)",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:chartTf===tf?700:500,letterSpacing:".04em",transition:"all .15s"}}>
            {tf}
          </button>
        ))}
        <div style={{width:1,height:16,background:"rgba(255,255,255,0.08)",margin:"0 8px"}}/>
        {/* Chart type */}
        {[["candle","Candles"],["line","Line"]].map(([k,label])=>(
          <button key={k} onClick={()=>setChartType(k)} style={{background:chartType===k?"rgba(124,58,237,0.25)":"transparent",border:"none",borderRadius:2,cursor:"pointer",color:chartType===k?"#c4b5fd":"rgba(255,255,255,0.3)",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:chartType===k?700:500,letterSpacing:".04em",transition:"all .15s"}}>
            {label}
          </button>
        ))}
        {/* Stats */}
        <div style={{marginLeft:"auto",display:"flex",gap:16,fontSize:9,letterSpacing:".04em"}}>
          {bars.length>0&&<span style={{color:"rgba(255,255,255,0.25)"}}>H: <span style={{color:"#10b981"}}>{fmtP(Math.max(...bars.map(b=>b.h)))}</span></span>}
          {bars.length>0&&<span style={{color:"rgba(255,255,255,0.25)"}}>L: <span style={{color:"#ef4444"}}>{fmtP(Math.min(...bars.map(b=>b.l)))}</span></span>}
          <span style={{color:"rgba(255,255,255,0.2)"}}>{bars.length} bars · Binance + Pyth</span>
        </div>
      </div>

      {/* ── CHART AREA ──────────────────────────────────────────────────── */}
      <div style={{flex:1,position:"relative",minHeight:0}}>
        <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>

      </div>

    </div>
  );
}


/* ─── CORRELATION VIEW ───────────────────────────────────────────────────── */
function drawCorrChart(canvas, ha, hb, symA, symB, colorA, colorB) {
  if (!canvas) return;
  const par = canvas.parentElement;
  if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07050f"; ctx.fillRect(0,0,W,H);

  const n = Math.min(ha.length, hb.length);
  if (n < 10) {
    ctx.fillStyle = "rgba(124,58,237,0.4)";
    ctx.font = "13px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Accumulating data… (" + n + "/10 ticks)", W/2, H/2);
    return;
  }

  const PAD = {t:40, r:60, b:50, l:60};
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;

  // Normalise both series to % returns
  const retA = ha.slice(-n).map((v,i,a)=> i===0 ? 0 : (v - a[i-1]) / a[i-1] * 100);
  const retB = hb.slice(-n).map((v,i,a)=> i===0 ? 0 : (v - a[i-1]) / a[i-1] * 100);
  const pts   = retA.slice(1).map((v,i)=>({x:v, y:retB[i+1]}));

  const minX = Math.min(...pts.map(p=>p.x));
  const maxX = Math.max(...pts.map(p=>p.x));
  const minY = Math.min(...pts.map(p=>p.y));
  const maxY = Math.max(...pts.map(p=>p.y));
  const padX = (maxX - minX) * 0.12 || 0.1;
  const padY = (maxY - minY) * 0.12 || 0.1;
  const xMin = minX - padX, xMax = maxX + padX;
  const yMin = minY - padY, yMax = maxY + padY;

  const toX = v => PAD.l + (v - xMin) / (xMax - xMin) * CW;
  const toY = v => PAD.t + CH - (v - yMin) / (yMax - yMin) * CH;

  // Grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 1;
  for (let i=0; i<=4; i++) {
    const xv = xMin + (xMax-xMin)/4*i, yv = yMin + (yMax-yMin)/4*i;
    ctx.beginPath(); ctx.moveTo(toX(xv), PAD.t); ctx.lineTo(toX(xv), PAD.t+CH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(PAD.l, toY(yv)); ctx.lineTo(PAD.l+CW, toY(yv)); ctx.stroke();
  }

  // Zero axes
  if (xMin < 0 && xMax > 0) {
    const x0 = toX(0);
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
    ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(x0, PAD.t); ctx.lineTo(x0, PAD.t+CH); ctx.stroke();
    ctx.setLineDash([]);
  }
  if (yMin < 0 && yMax > 0) {
    const y0 = toY(0);
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
    ctx.setLineDash([3,4]);
    ctx.beginPath(); ctx.moveTo(PAD.l, y0); ctx.lineTo(PAD.l+CW, y0); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Regression line
  const meanX = pts.reduce((s,p)=>s+p.x,0)/pts.length;
  const meanY = pts.reduce((s,p)=>s+p.y,0)/pts.length;
  const num   = pts.reduce((s,p)=>s+(p.x-meanX)*(p.y-meanY),0);
  const den   = pts.reduce((s,p)=>s+(p.x-meanX)**2,0);
  if (den !== 0) {
    const slope = num/den, intercept = meanY - slope*meanX;
    const x1=xMin, y1=slope*x1+intercept;
    const x2=xMax, y2=slope*x2+intercept;
    ctx.strokeStyle = "rgba(167,139,250,0.5)"; ctx.lineWidth = 1.5;
    ctx.setLineDash([6,4]);
    ctx.beginPath(); ctx.moveTo(toX(x1), toY(y1)); ctx.lineTo(toX(x2), toY(y2)); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Scatter dots — colour by time (old=dim, new=bright)
  pts.forEach((p, i) => {
    const age = i / (pts.length - 1);
    const alpha = 0.15 + age * 0.7;
    const r = 2.5 + age * 1.5;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = age > 0.7 ? colorA : "rgba(100,80,140,1)";
    ctx.beginPath(); ctx.arc(toX(p.x), toY(p.y), r, 0, Math.PI*2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Axis labels
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "9px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText(symA + " returns (%)", PAD.l + CW/2, PAD.t + CH + 18);
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  ctx.save(); ctx.translate(PAD.l - 28, PAD.t + CH/2);
  ctx.rotate(-Math.PI/2); ctx.fillText(symB + " returns (%)", 0, 0); ctx.restore();

  // Tick labels X
  ctx.textAlign = "center"; ctx.textBaseline = "top"; ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "8px 'Space Mono',monospace";
  for (let i=0; i<=4; i++) {
    const v = xMin + (xMax-xMin)/4*i;
    ctx.fillText(v.toFixed(1), toX(v), PAD.t+CH+4);
  }
  // Tick labels Y
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  for (let i=0; i<=4; i++) {
    const v = yMin + (yMax-yMin)/4*i;
    ctx.fillText(v.toFixed(1), PAD.l-6, toY(v));
  }
}

function drawRollingCorr(canvas, ha, hb, window=30) {
  if (!canvas) return;
  const par = canvas.parentElement;
  if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07050f"; ctx.fillRect(0,0,W,H);

  const n = Math.min(ha.length, hb.length);
  if (n < window + 2) {
    ctx.fillStyle = "rgba(124,58,237,0.3)"; ctx.font = "11px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Need " + (window+2) + " ticks for rolling corr", W/2, H/2);
    return;
  }

  const PAD = {t:16, r:60, b:28, l:40};
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;
  const toY = v => PAD.t + CH * (1 - (v+1)/2);
  const toX = i => PAD.l + (i / (pts.length-1)) * CW;

  const pts = [];
  for (let i = window; i <= n; i++) {
    const v = pearson(ha.slice(i-window, i), hb.slice(i-window, i));
    if (v !== null) pts.push(v);
  }
  if (pts.length < 2) return;

  // Bands
  [1, 0.5, 0, -0.5, -1].forEach(v => {
    const y = toY(v);
    ctx.strokeStyle = v===0 ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)";
    ctx.lineWidth = v===0 ? 1 : 1; ctx.setLineDash(v===0?[]:[3,4]);
    ctx.beginPath(); ctx.moveTo(PAD.l,y); ctx.lineTo(PAD.l+CW,y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.font = "8px 'Space Mono',monospace";
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(v.toFixed(1), PAD.l-4, y);
  });

  // Fill area
  const last = pts[pts.length-1];
  const grd = ctx.createLinearGradient(0,PAD.t,0,PAD.t+CH);
  grd.addColorStop(0, last>=0 ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  pts.forEach((v,i)=>{ const x=toX(i),y=toY(v); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.lineTo(toX(pts.length-1), toY(0)); ctx.lineTo(toX(0), toY(0));
  ctx.closePath(); ctx.fillStyle=grd; ctx.fill();

  // Line
  const lg = ctx.createLinearGradient(0,0,W,0);
  lg.addColorStop(0,"rgba(124,58,237,0.8)");
  lg.addColorStop(1, last>=0?"#10b981":"#ef4444");
  ctx.strokeStyle=lg; ctx.lineWidth=2; ctx.lineJoin="round";
  ctx.beginPath();
  pts.forEach((v,i)=>{ const x=toX(i),y=toY(v); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
  ctx.stroke();

  // Current dot + label
  const lx=toX(pts.length-1), ly=toY(last);
  ctx.fillStyle = last>=0?"#10b981":"#ef4444";
  ctx.beginPath(); ctx.arc(lx,ly,4,0,Math.PI*2); ctx.fill();
  ctx.fillRect(W-PAD.r+2,ly-8,PAD.r-4,16);
  ctx.fillStyle="#fff"; ctx.font="bold 9px 'Space Mono',monospace";
  ctx.textAlign="left"; ctx.textBaseline="middle";
  ctx.fillText(last.toFixed(3), W-PAD.r+5, ly);
}

/* ─── CORRELATION VIEW ───────────────────────────────────────────────────── */
const CORR_PAIRS = [
  ["BTC","ETH"],["BTC","SOL"],["BTC","DOGE"],
  ["ETH","SOL"],["ETH","DOGE"],["SOL","DOGE"],
  ["BTC","XAU/USD"],["BTC","EUR/USD"],
];
const BN_SYM2 = {
  "BTC":"BTCUSDT","ETH":"ETHUSDT","SOL":"SOLUSDT",
  "DOGE":"DOGEUSDT","USDC":"USDCUSDT",
  // XAU/EUR/GBP/WTI/AAPL blocked by Binance CORS from Vercel — use Pyth ticks only
};

async function fetchCloses(sym, tf="1m", limit=300) {
  const bn = BN_SYM2[sym];
  if (!bn) return [];
  // Try multiple endpoints for CORS compatibility
  const direct = `https://api.binance.com/api/v3/klines?symbol=${bn}&interval=${tf}&limit=${limit}`;
  const proxy  = `https://api.allorigins.win/raw?url=${encodeURIComponent(direct)}`;
  const urls = [direct, proxy];
  for (const url of urls) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const d = await r.json();
      if (!Array.isArray(d) || !d.length) continue;
      return d.map(k => parseFloat(k[4]));
    } catch(e) { continue; }
  }
  return []; // fall back to Pyth ticks only
}

function pctReturns(closes) {
  const r = [];
  for (let i=1;i<closes.length;i++) r.push((closes[i]-closes[i-1])/closes[i-1]*100);
  return r;
}

function rollingPearson(ra, rb, win) {
  const n = Math.min(ra.length, rb.length);
  const pts = [];
  for (let i=win; i<=n; i++) {
    const v = pearson(ra.slice(i-win,i), rb.slice(i-win,i));
    if (v !== null) pts.push(v);
  }
  return pts;
}

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

function drawRolling(canvas, pts) {
  if (!canvas) return;
  const par=canvas.parentElement; if(!par) return;
  const W=par.clientWidth, H=par.clientHeight;
  if(W<10||H<10) return;
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#07050f"; ctx.fillRect(0,0,W,H);

  if(!pts||pts.length<2){
    ctx.fillStyle="rgba(124,58,237,0.3)"; ctx.font="11px 'Space Mono',monospace";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("Accumulating…",W/2,H/2); return;
  }

  const PAD={t:16,r:60,b:28,l:40};
  const CW=W-PAD.l-PAD.r, CH=H-PAD.t-PAD.b;
  const toY=v=>PAD.t+CH*(1-(v+1)/2);
  const toX=i=>PAD.l+(i/(pts.length-1))*CW;

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

  const last=pts[pts.length-1];
  const col=last>=0.7?"#10b981":last>=0?"#f59e0b":"#ef4444";

  // Fill
  const grd=ctx.createLinearGradient(0,PAD.t,0,PAD.t+CH);
  grd.addColorStop(0,last>=0?"rgba(16,185,129,0.18)":"rgba(239,68,68,0.18)");
  grd.addColorStop(1,"rgba(0,0,0,0)");
  ctx.beginPath();
  pts.forEach((v,i)=>{const x=toX(i),y=toY(v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.lineTo(toX(pts.length-1),toY(0));ctx.lineTo(toX(0),toY(0));
  ctx.closePath();ctx.fillStyle=grd;ctx.fill();

  // Line
  const lg=ctx.createLinearGradient(0,0,W,0);
  lg.addColorStop(0,"rgba(124,58,237,0.7)");lg.addColorStop(1,col);
  ctx.strokeStyle=lg;ctx.lineWidth=2;ctx.lineJoin="round";
  ctx.beginPath();
  pts.forEach((v,i)=>{const x=toX(i),y=toY(v);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.stroke();

  // Current badge
  const lx=toX(pts.length-1),ly=toY(last);
  ctx.fillStyle=col; ctx.beginPath();ctx.arc(lx,ly,4,0,Math.PI*2);ctx.fill();
  ctx.fillRect(W-PAD.r+2,ly-8,PAD.r-4,16);
  ctx.fillStyle="#fff"; ctx.font="bold 9px 'Space Mono',monospace";
  ctx.textAlign="left"; ctx.textBaseline="middle";
  ctx.fillText(last.toFixed(3),W-PAD.r+5,ly);
}

function CorrView({histRef, prices, assets, setActiveTab, status}) {
  const scatterRef = useRef();
  const rollingRef = useRef();
  const [activePair, setActivePair] = useState(0);
  const [closes, setCloses] = useState({});   // {SYM: float[]}
  const [loading, setLoading] = useState(false);
  const [, tick] = useState(0);

  const [symA, symB] = CORR_PAIRS[activePair];

  // Fetch Binance closes for active pair
  useEffect(()=>{
    let dead=false;
    const toFetch=[symA,symB].filter(s=>!closes[s]);
    if(!toFetch.length) return;
    setLoading(true);
    Promise.all(toFetch.map(s=>fetchCloses(s,"1m",300)))
      .then(results=>{
        if(dead) return;
        const upd={};
        toFetch.forEach((s,i)=>{upd[s]=results[i];});
        setCloses(p=>({...p,...upd}));
      })
      .catch(()=>{})
      .finally(()=>{if(!dead)setLoading(false);});
    return()=>{dead=true;};
  },[symA,symB]);

  // Merge live Pyth ticks into closes
  const getCloses = (sym) => {
    const base = closes[sym] || [];
    const live = histRef.current[sym] || [];
    if (!base.length) return live;
    // append recent live ticks not yet in base
    return [...base, ...live].slice(-300);
  };

  // Redraw every 2s
  useEffect(()=>{
    const iv=setInterval(()=>tick(n=>n+1),2000);
    return()=>clearInterval(iv);
  },[]);

  // Draw
  useEffect(()=>{
    const cA=getCloses(symA), cB=getCloses(symB);
    const ra=pctReturns(cA), rb=pctReturns(cB);
    const aAsset=assets.find(a=>a.symbol===symA)||assets[0];
    drawScatter(scatterRef.current, ra, rb, symA, symB, aAsset.color, "#a78bfa");
    const WIN=20;
    const rpts=rollingPearson(ra,rb,WIN);
    drawRolling(rollingRef.current, rpts);
  });

  // Resize observers
  useEffect(()=>{
    const redraw=()=>{
      const cA=getCloses(symA),cB=getCloses(symB);
      const ra=pctReturns(cA),rb=pctReturns(cB);
      const aAsset=assets.find(a=>a.symbol===symA)||assets[0];
      drawScatter(scatterRef.current,ra,rb,symA,symB,aAsset.color,"#a78bfa");
      drawRolling(rollingRef.current,rollingPearson(ra,rb,20));
    };
    const ro1=new ResizeObserver(redraw),ro2=new ResizeObserver(redraw);
    if(scatterRef.current?.parentElement) ro1.observe(scatterRef.current.parentElement);
    if(rollingRef.current?.parentElement) ro2.observe(rollingRef.current.parentElement);
    return()=>{ro1.disconnect();ro2.disconnect();};
  },[activePair,closes]);

  const cA=getCloses(symA),cB=getCloses(symB);
  const ra=pctReturns(cA),rb=pctReturns(cB);
  const n=Math.min(ra.length,rb.length);
  const corrVal=n>=4?pearson(ra.slice(-Math.min(n,60)),rb.slice(-Math.min(n,60))):null;
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
        <span style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>CORRELATION</span>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {loading&&<span style={{fontSize:9,color:"rgba(124,58,237,0.6)",letterSpacing:".06em"}}>LOADING…</span>}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:3,background:status==="live"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${status==="live"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:status==="live"?"#10b981":"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,letterSpacing:".08em",color:status==="live"?"#10b981":"#ef4444"}}>{status==="live"?"LIVE":"DEMO"}</span>
          </div>
          <button onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:3,padding:"4px 12px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600,letterSpacing:".05em"}}
            onMouseEnter={e=>{e.target.style.borderColor="rgba(124,58,237,0.6)";e.target.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.target.style.borderColor="rgba(255,255,255,0.12)";e.target.style.color="rgba(255,255,255,0.5)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* Pair selector */}
      <div style={{display:"flex",alignItems:"center",height:38,padding:"0 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#080614",flexShrink:0,gap:2,overflowX:"auto",scrollbarWidth:"none"}}>
        {CORR_PAIRS.map(([a,b],i)=>{
          const sel=i===activePair;
          const aA=assets.find(x=>x.symbol===a)||assets[0];
          return (
            <button key={i} onClick={()=>setActivePair(i)} style={{flexShrink:0,background:sel?"rgba(124,58,237,0.2)":"transparent",border:"none",borderRadius:3,padding:"3px 14px",cursor:"pointer",fontSize:10,fontWeight:sel?700:500,color:sel?"#c4b5fd":"rgba(255,255,255,0.3)",fontFamily:"inherit",letterSpacing:".04em",borderBottom:sel?"2px solid #7c3aed":"2px solid transparent"}}>
              <span style={{color:sel?aA.color:"inherit"}}>{a}</span> / {b}
            </button>
          );
        })}
      </div>

      {/* Stats bar */}
      <div style={{display:"flex",alignItems:"center",gap:0,padding:"0 16px",height:56,borderBottom:"1px solid rgba(255,255,255,0.04)",flexShrink:0}}>
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
        {/* Correlation gauge */}
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
        {/* Mini correlation bar */}
        {corrVal!==null&&<div style={{marginLeft:"auto",width:120,height:6,borderRadius:3,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
          <div style={{width:`${((corrVal+1)/2)*100}%`,height:"100%",background:`linear-gradient(90deg,#ef4444,#f59e0b,#10b981)`,borderRadius:3}}/>
        </div>}
      </div>

      {/* Charts side by side */}
      <div style={{flex:1,display:"flex",gap:1,minHeight:0}}>
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
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>ROLLING CORRELATION (win=20)</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.15)"}}>{rollingPearson(pctReturns(cA),pctReturns(cB),20).length} pts</span>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={rollingRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENTROPY MODULE
   Pipeline: Binance closes → pct returns → quantile bins →
             Shannon H(X) → MI(X,Y) → NMI → Bootstrap CI
             Seed: mulberry32 PRNG seeded from Pyth live prices + timestamp
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Math helpers ─────────────────────────────────────────────────────────── */
function mulberry32(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pythSeed(prices) {
  const syms = ["BTC","ETH","SOL","DOGE","XAU/USD"];
  let h = Date.now() & 0xFFFFFF;
  for (const s of syms) {
    const v = prices[s];
    if (v) h = Math.imul(h ^ 0x9e3779b9, Math.floor(v * 100) | 0);
  }
  return h >>> 0;
}

// ── Gaussian Differential Entropy: H = 0.5·ln(2πe·σ²)
// Physically meaningful, gives clear separation between assets:
// USDC (σ≈0.001%) → very low H; BTC/DOGE (σ≈2-3%) → high H
function gaussianEntropy(arr) {
  if (!arr || arr.length < 4) return null;
  const mean = arr.reduce((s,v)=>s+v,0)/arr.length;
  const variance = arr.reduce((s,v)=>s+(v-mean)**2,0)/arr.length;
  if (variance <= 0) return 0;
  return 0.5 * Math.log(2 * Math.PI * Math.E * variance);
}

// ── Quantile bins on POPULATION edges (for MI/NMI computation only)
function quantileBins(arr, nBins = 8) {
  const sorted = [...arr].sort((a,b)=>a-b);
  const n = sorted.length;
  const edges = [];
  for (let i=1; i<nBins; i++) edges.push(sorted[Math.min(Math.floor(i/nBins*n), n-1)]);
  return arr.map(v => { let b=0; for(const e of edges){if(v>e)b++;else break;} return b; });
}

function shannonH(bins, nBins = 8) {
  const counts = new Array(nBins).fill(0);
  for (const b of bins) counts[b]++;
  let H = 0;
  for (const c of counts) { if(c>0){const p=c/bins.length; H-=p*Math.log2(p);} }
  return H;
}

function jointH(binsX, binsY, nBins = 8) {
  const counts = {};
  for (let i=0; i<binsX.length; i++) {
    const k = binsX[i]*nBins+binsY[i];
    counts[k] = (counts[k]||0)+1;
  }
  let H=0;
  for (const c of Object.values(counts)){const p=c/binsX.length; H-=p*Math.log2(p);}
  return H;
}

function computeMI(ra, rb, nBins = 8) {
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

// ── Bootstrap Gaussian Entropy
// Point estimate = gaussianEntropy of FULL returns series (stable, asset-specific)
// CI = variation across bootstrap resamples (with-replacement, per-asset RNG)
function bootstrapEntropy(returns, seed, nIter = 60) {
  const syms = Object.keys(returns);
  const out = {};

  for (let si = 0; si < syms.length; si++) {
    const s = syms[si];
    const arr = returns[s];
    if (!arr || arr.length < 10) { out[s] = null; continue; }
    const n = arr.length;

    // Point estimate: gaussian differential entropy of full series
    // H = 0.5 * ln(2πe * σ²) — meaningful, asset-specific
    const hFull = gaussianEntropy(arr);
    if (hFull === null) { out[s] = null; continue; }

    // Per-asset RNG: seed xored with asset index → independent streams
    const rng = mulberry32((seed ^ (si * 0x9E3779B9)) >>> 0);

    // Bootstrap CI: with-replacement resamples to estimate uncertainty
    const resampleSize = Math.min(150, Math.max(20, Math.floor(n * 0.7)));
    const hVals = [];
    for (let iter = 0; iter < nIter; iter++) {
      // Sample WITH replacement — true bootstrap
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
      mean: hFull,  // point estimate from full data
      std: hStd,
      ci95lo: sorted[Math.floor(hVals.length*0.025)] ?? hFull - hStd*1.96,
      ci95hi: sorted[Math.floor(hVals.length*0.975)] ?? hFull + hStd*1.96,
    };
  }
  return out;
}

/* ── Canvas draws ─────────────────────────────────────────────────────────── */
function drawEntropyBars(canvas, ranking, assets, minH, maxH) {
  if (minH === undefined) { minH = 0; }
  if (!canvas) return;
  const par = canvas.parentElement; if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07050f"; ctx.fillRect(0, 0, W, H);

  if (!ranking.length) {
    ctx.fillStyle = "rgba(124,58,237,0.4)"; ctx.font = "12px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("Computing…", W / 2, H / 2); return;
  }
  // Filter out zero-entropy assets (no data) for display purposes
  // They show as greyed-out rows at top

  const PAD = { t: 16, r: 20, b: 24, l: 64 };
  const CW = W - PAD.l - PAD.r;
  const rowH = (H - PAD.t - PAD.b) / ranking.length;
  const barH = Math.min(rowH * 0.55, 18);

  ranking.forEach(({ sym, data }, i) => {
    if (!data) return;
    const asset = assets.find(a => a.symbol === sym);
    const y = PAD.t + i * rowH + rowH / 2;
    const noData = (data.std === 0 && data.mean === data.ci95lo && data.mean === data.ci95hi);

    // Rank number
    ctx.fillStyle = noData ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.15)";
    ctx.font = `700 9px 'Space Mono',monospace`;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(`#${i + 1}`, PAD.l - 44, y);

    // Symbol label
    ctx.fillStyle = noData ? "rgba(255,255,255,0.15)" : (asset?.color || "#a78bfa");
    ctx.font = `700 10px 'Space Mono',monospace`;
    ctx.fillText(sym, PAD.l - 6, y);

    // Bar background track
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fillRect(PAD.l, y - barH / 2, CW, barH);

    if (noData) {
      // No data — show placeholder
      ctx.fillStyle = "rgba(255,255,255,0.07)";
      ctx.font = `8px 'Space Mono',monospace`;
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText("awaiting Pyth ticks…", PAD.l + 6, y);
      return;
    }

    const range = maxH - minH || 1;
    const barW = Math.max(0, (data.mean - minH) / range * CW);
    const ciLo = Math.max(0, (data.ci95lo - minH) / range * CW);
    const ciHi = Math.max(0, (data.ci95hi - minH) / range * CW);

    // Bar fill — gradient low=green(predictable) high=red(chaotic)
    const t = data.mean / maxH;
    const r = Math.floor(16 + t * 223), g = Math.floor(185 - t * 117), b2 = Math.floor(129 - t * 95);
    const grad = ctx.createLinearGradient(PAD.l, 0, PAD.l + barW, 0);
    grad.addColorStop(0, `rgba(${r},${g},${b2},0.9)`);
    grad.addColorStop(1, `rgba(${r},${g},${b2},0.5)`);
    ctx.fillStyle = grad;
    ctx.fillRect(PAD.l, y - barH / 2, barW, barH);

    // CI band (only meaningful if std > 0)
    if (data.std > 0.01) {
      ctx.fillStyle = "rgba(255,255,255,0.10)";
      ctx.fillRect(PAD.l + ciLo, y - barH / 2 - 2, Math.max(ciHi - ciLo, 2), barH + 4);
      ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(PAD.l + ciLo, y - barH / 2 - 3); ctx.lineTo(PAD.l + ciLo, y + barH / 2 + 3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.l + ciHi, y - barH / 2 - 3); ctx.lineTo(PAD.l + ciHi, y + barH / 2 + 3); ctx.stroke();
    }

    // Value label
    const ciStr = data.std > 0.01 ? ` ±${data.std.toFixed(2)}` : "";
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = `9px 'Space Mono',monospace`;
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(`${data.mean.toFixed(2)}${ciStr}`, PAD.l + barW + 6, y);
  });

  // X axis labels
  ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "8px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  const range2 = maxH - minH || 1;
  for (let i = 0; i <= 4; i++) {
    const v = minH + range2 / 4 * i;
    ctx.fillText(v.toFixed(1), PAD.l + (i / 4) * CW, H - PAD.b + 4);
  }
  ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.font = "8px 'Space Mono',monospace";
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  ctx.fillText("H(X) = ½·ln(2πeσ²)  nats   ←  predictable · · · chaotic  →", PAD.l + CW / 2, H - PAD.b + 14);
}

function drawNMIHeatmap(canvas, assets, nmiMatrix) {
  if (!canvas) return;
  const par = canvas.parentElement; if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07050f"; ctx.fillRect(0, 0, W, H);

  const n = assets.length;
  const PAD = { t: 28, r: 8, b: 8, l: 48 };
  const cellW = (W - PAD.l - PAD.r) / n;
  const cellH = (H - PAD.t - PAD.b) / n;

  // Column headers
  ctx.font = `700 ${Math.min(cellW * 0.35, 9)}px 'Space Mono',monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  assets.forEach((a, j) => {
    ctx.fillStyle = a.color || "#a78bfa";
    ctx.fillText(a.symbol.replace("/USD", ""), PAD.l + j * cellW + cellW / 2, PAD.t - 3);
  });

  // Row labels
  ctx.textAlign = "right"; ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.min(cellH * 0.4, 9)}px 'Space Mono',monospace`;
  assets.forEach((a, i) => {
    ctx.fillStyle = a.color || "#a78bfa";
    ctx.fillText(a.symbol.replace("/USD", ""), PAD.l - 3, PAD.t + i * cellH + cellH / 2);
  });

  // Cells
  assets.forEach((aI, i) => {
    assets.forEach((aJ, j) => {
      const v = nmiMatrix[i]?.[j] ?? 0;
      const diag = i === j;
      const x = PAD.l + j * cellW, y = PAD.t + i * cellH;

      if (diag) {
        ctx.fillStyle = "rgba(124,58,237,0.25)";
        ctx.fillRect(x, y, cellW - 1, cellH - 1);
        ctx.fillStyle = "#c4b5fd"; ctx.font = `700 ${Math.min(cellW * 0.3, 9)}px 'Space Mono',monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("—", x + cellW / 2, y + cellH / 2);
        return;
      }

      // Color: 0=dark, 0.5=purple, 1=bright green
      const alpha = 0.08 + v * 0.8;
      const r = Math.floor(16 + (1 - v) * 100);
      const g2 = Math.floor(v * 185);
      const b2 = Math.floor(129 + (1 - v) * 80);
      ctx.fillStyle = v > 0.5
        ? `rgba(16,${Math.floor(v * 185)},${Math.floor(129 * (1 - v) + 80 * v)},${alpha})`
        : `rgba(${100 + Math.floor(v * 100)},${Math.floor(v * 100)},${180 - Math.floor(v * 60)},${alpha})`;
      ctx.fillRect(x, y, cellW - 1, cellH - 1);

      // Value text
      if (cellW > 30) {
        ctx.fillStyle = v > 0.4 ? `rgba(255,255,255,0.85)` : `rgba(255,255,255,0.35)`;
        ctx.font = `${Math.min(cellW * 0.28, 9)}px 'Space Mono',monospace`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(v > 0 ? v.toFixed(2) : "–", x + cellW / 2, y + cellH / 2);
      }

      // Highlight border for high NMI where Pearson is low (hidden connections)
      if (v > 0.4) {
        ctx.strokeStyle = `rgba(167,139,250,${(v - 0.4) * 0.8})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellW - 1, cellH - 1);
      }
    });
  });
}

function drawHiddenConnections(canvas, assets, nmiMatrix, pearsonMatrix) {
  if (!canvas) return;
  const par = canvas.parentElement; if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07050f"; ctx.fillRect(0, 0, W, H);

  // Find pairs where |pearson| < 0.3 but NMI > 0.35
  const hidden = [];
  for (let i = 0; i < assets.length; i++) {
    for (let j = i + 1; j < assets.length; j++) {
      const nmi = nmiMatrix[i]?.[j] ?? 0;
      const r = Math.abs(pearsonMatrix[i]?.[j] ?? 0);
      if (nmi > 0.30 && r < 0.35) {
        hidden.push({ i, j, nmi, r, symA: assets[i].symbol, symB: assets[j].symbol });
      }
    }
  }
  hidden.sort((a, b) => (b.nmi - b.r) - (a.nmi - a.r));

  if (!hidden.length) {
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "11px 'Space Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("No hidden connections detected", W / 2, H / 2);
    ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.font = "9px 'Space Mono',monospace";
    ctx.fillText("(all high-NMI pairs also have high Pearson r)", W / 2, H / 2 + 20);
    return;
  }

  const rowH = Math.min((H - 16) / Math.min(hidden.length, 6), 36);
  const maxShow = Math.min(hidden.length, Math.floor((H - 16) / rowH));

  hidden.slice(0, maxShow).forEach(({ symA, symB, nmi, r }, idx) => {
    const y = 16 + idx * rowH;
    const strength = nmi - r;

    // Row bg
    ctx.fillStyle = idx % 2 === 0 ? "rgba(124,58,237,0.05)" : "transparent";
    ctx.fillRect(0, y, W, rowH);

    // Lightning bolt icon
    ctx.fillStyle = "#f59e0b"; ctx.font = "12px sans-serif";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText("⚡", 10, y + rowH / 2);

    // Pair names
    const aAsset = assets.find(a => a.symbol === symA);
    const bAsset = assets.find(a => a.symbol === symB);
    ctx.font = `700 10px 'Space Mono',monospace`;
    ctx.fillStyle = aAsset?.color || "#a78bfa";
    ctx.fillText(symA, 30, y + rowH / 2 - 6);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `9px 'Space Mono',monospace`;
    ctx.fillText("/", 30 + ctx.measureText(symA).width + 2, y + rowH / 2 - 6);
    ctx.fillStyle = bAsset?.color || "#7c3aed";
    ctx.font = `700 10px 'Space Mono',monospace`;
    ctx.fillText(symB, 30 + ctx.measureText(symA).width + 10, y + rowH / 2 - 6);

    // Metrics row
    ctx.font = `8px 'Space Mono',monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(`r=${r.toFixed(2)}`, 30, y + rowH / 2 + 6);
    ctx.fillStyle = "#a78bfa";
    ctx.fillText(`NMI=${nmi.toFixed(2)}`, 80, y + rowH / 2 + 6);

    // Strength bar
    const barX = 160, barW = W - barX - 80;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(barX, y + rowH / 2 - 3, barW, 6);
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, "rgba(124,58,237,0.8)");
    grad.addColorStop(1, "#f59e0b");
    ctx.fillStyle = grad;
    ctx.fillRect(barX, y + rowH / 2 - 3, Math.min(strength / 0.6, 1) * barW, 6);

    // Label
    const label = nmi > 0.6 ? "strong nonlinear" : nmi > 0.45 ? "regime corr" : "weak nonlinear";
    ctx.fillStyle = "rgba(245,158,11,0.7)"; ctx.font = `700 8px 'Space Mono',monospace`;
    ctx.textAlign = "right";
    ctx.fillText(label, W - 6, y + rowH / 2);
    ctx.textAlign = "left";
  });
}

/* ── EntropyView component ────────────────────────────────────────────────── */
function EntropyView({ histRef, prices, assets, setActiveTab, status }) {
  const barRef     = useRef();
  const heatRef    = useRef();
  const hiddenRef  = useRef();
  const [entropyData, setEntropyData] = useState(null); // bootstrap results
  const [nmiMatrix,   setNmiMatrix]   = useState([]);
  const [pearsonMat,  setPearsonMat]  = useState([]);
  const [closes,      setCloses]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [seedInfo,    setSeedInfo]    = useState(null);
  const [lastRun,     setLastRun]     = useState(null);
  const [autoRun,     setAutoRun]     = useState(true);
  const [, tick]                      = useState(0);

  const BINS = 8, N_ITER = 40, SAMPLE = 120;

  // Fetch Binance closes for all assets
  useEffect(() => {
    let dead = false;
    const needed = assets.filter(a => !closes[a.symbol] && BN_SYM2[a.symbol]);
    if (!needed.length) return;
    setLoading(true);
    Promise.all(needed.map(a => fetchCloses(a.symbol, "1m", 300)))
      .then(results => {
        if (dead) return;
        const upd = {};
        needed.forEach((a, i) => { upd[a.symbol] = results[i]; });
        setCloses(p => ({ ...p, ...upd }));
      })
      .catch(() => {})
      .finally(() => { if (!dead) setLoading(false); });
    return () => { dead = true; };
  }, []);

  // Merge Binance + live Pyth ticks
  const getReturns = () => {
    const ret = {};
    for (const a of assets) {
      const base  = closes[a.symbol] || [];
      const live  = histRef.current[a.symbol] || [];
      const merged = base.length ? [...base, ...live].slice(-300) : live;
      if (merged.length >= 10) ret[a.symbol] = pctReturns(merged);
    }
    return ret;
  };

  // Run analysis
  const runAnalysis = () => {
    const returns = getReturns();
    if (Object.keys(returns).length < 2) return;
    const seed = pythSeed(prices);
    setSeedInfo({ value: seed, hex: seed.toString(16).padStart(8,"0").toUpperCase(), ts: new Date() });
    const bsResult = bootstrapEntropy(returns, seed, N_ITER);
    const validSyms = Object.keys(bsResult).filter(s => bsResult[s]);
    const ranking = validSyms
      .map(sym => ({ sym, data: bsResult[sym] }))
      .sort((a, b) => a.data.mean - b.data.mean);
    setEntropyData(ranking);
    const n = assets.length;
    const nmi  = Array.from({ length: n }, () => new Array(n).fill(0));
    const pears = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) { nmi[i][j] = 1; pears[i][j] = 1; continue; }
        const rA = returns[assets[i].symbol], rB = returns[assets[j].symbol];
        if (!rA || !rB) continue;
        const mi = computeMI(rA, rB, BINS);
        nmi[i][j]  = mi?.nmi ?? 0;
        pears[i][j] = Math.abs(pearson(rA, rB) ?? 0);
      }
    }
    setNmiMatrix(nmi);
    setPearsonMat(pears);
    setLastRun(new Date());
  };;

  // Auto-run when data loads, or after timeout fallback
  useEffect(() => {
    if (!loading && autoRun) {
      // Run even if some Binance fetches failed — use Pyth ticks as fallback
      setTimeout(() => {
        const ret = getReturns();
        if (Object.keys(ret).length >= 2) { runAnalysis(); setAutoRun(false); }
      }, 200);
    }
  }, [loading, closes]);

  // Safety: run after 4s even if still loading (CORS blocked some assets)
  useEffect(() => {
    const t = setTimeout(() => {
      const ret = getReturns();
      if (Object.keys(ret).length >= 2 && !entropyData) { runAnalysis(); }
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  // Redraw on data change
  useEffect(() => {
    if (!entropyData) return;
    // Gaussian entropy range: compute from actual data
    const allH = entropyData.filter(d=>d.data).map(d=>d.data.mean);
    const minH = allH.length ? Math.min(...allH) : -6;
    const maxH = allH.length ? Math.max(...allH) + 0.5 : 4;
    drawEntropyBars(barRef.current, entropyData, assets, minH, maxH);
    drawNMIHeatmap(heatRef.current, assets, nmiMatrix);
    drawHiddenConnections(hiddenRef.current, assets, nmiMatrix, pearsonMat);
  }, [entropyData, nmiMatrix]);

  // Resize observers
  useEffect(() => {
    if (!entropyData) return;
    const allH = entropyData.filter(d=>d.data).map(d=>d.data.mean);
    const minH = allH.length ? Math.min(...allH) : -6;
    const maxH = allH.length ? Math.max(...allH) + 0.5 : 4;
    const redraw = () => {
      drawEntropyBars(barRef.current, entropyData, assets, minH, maxH);
      drawNMIHeatmap(heatRef.current, assets, nmiMatrix);
      drawHiddenConnections(hiddenRef.current, assets, nmiMatrix, pearsonMat);
    };
    const obs = [barRef, heatRef, hiddenRef].map(r => {
      const ro = new ResizeObserver(redraw);
      if (r.current?.parentElement) ro.observe(r.current.parentElement);
      return ro;
    });
    return () => obs.forEach(ro => ro.disconnect());
  }, [entropyData, nmiMatrix]);

  // Live tick
  useEffect(() => {
    const iv = setInterval(() => tick(n => n + 1), 3000);
    return () => clearInterval(iv);
  }, []);

  const returns = getReturns();
  const nAssets = Object.keys(returns).length;

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#07050f",fontFamily:"'Space Mono',monospace",overflow:"hidden"}}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",height:48,padding:"0 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0b0917",flexShrink:0,gap:12}}>
        <PythLogo size={22}/>
        <span style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>ENTROPY</span>
        <div style={{height:16,width:1,background:"rgba(255,255,255,0.08)"}}/>
        {seedInfo && (
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"2px 8px",borderRadius:3,background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
            <span style={{fontSize:8,color:"rgba(167,139,250,0.6)",letterSpacing:".08em"}}>SEED</span>
            <span style={{fontSize:10,fontWeight:700,color:"#c4b5fd",letterSpacing:".04em"}}>0x{seedInfo.hex}</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>Pyth live</span>
          </div>
        )}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {loading && <span style={{fontSize:9,color:"rgba(124,58,237,0.6)",letterSpacing:".06em",animation:"pulse 1s infinite"}}>LOADING DATA…</span>}
          {lastRun && <span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>ran {lastRun.toLocaleTimeString()}</span>}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:3,background:status==="live"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${status==="live"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:status==="live"?"#10b981":"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,color:status==="live"?"#10b981":"#ef4444"}}>{status==="live"?"LIVE":"DEMO"}</span>
          </div>
          <button onClick={runAnalysis} style={{background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.4)",borderRadius:3,padding:"4px 14px",color:"#c4b5fd",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:700,letterSpacing:".06em"}}
            onMouseEnter={e=>{e.target.style.background="rgba(124,58,237,0.35)";}}
            onMouseLeave={e=>{e.target.style.background="rgba(124,58,237,0.2)";}}>
            ▶ RUN
          </button>
          <button onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:3,padding:"4px 12px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:600,letterSpacing:".05em"}}
            onMouseEnter={e=>{e.target.style.borderColor="rgba(124,58,237,0.6)";e.target.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.target.style.borderColor="rgba(255,255,255,0.12)";e.target.style.color="rgba(255,255,255,0.5)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* ── Config bar ──────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",gap:20,padding:"6px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"#080614",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>BOOTSTRAP</span>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{N_ITER} iter × {SAMPLE} samples</span>
        </div>
        <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>BINS</span>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{BINS} quantile</span>
        </div>
        <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>ASSETS</span>
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{nAssets} / {assets.length} ready</span>
        </div>
        <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>SEED SOURCE</span>
          <span style={{fontSize:10,fontWeight:700,color:"#a78bfa"}}>Pyth price ticks</span>
        </div>
        <div style={{marginLeft:"auto",fontSize:8,color:"rgba(255,255,255,0.15)"}}>
          MI(X,Y) = H(X)+H(Y)−H(X,Y) · NMI = MI/√(H(X)·H(Y))
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────── */}
      <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 200px",gap:1,minHeight:0,background:"rgba(255,255,255,0.04)"}}>

        {/* Entropy Ranking bar chart */}
        <div style={{display:"flex",flexDirection:"column",background:"#07050f",minHeight:0}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>ENTROPY RANKING — H(X) bits</span>
            <div style={{display:"flex",gap:8,fontSize:8,color:"rgba(255,255,255,0.2)"}}>
              <span style={{color:"#10b981"}}>■ low = predictable</span>
              <span style={{color:"#ef4444"}}>■ high = chaotic</span>
            </div>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={barRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>

        {/* NMI Heatmap */}
        <div style={{display:"flex",flexDirection:"column",background:"#07050f",minHeight:0}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>NMI HEATMAP — normalized mutual information</span>
            <div style={{display:"flex",gap:8,fontSize:8,color:"rgba(255,255,255,0.2)"}}>
              <span style={{color:"rgba(100,80,180,0.8)"}}>■ 0.0</span>
              <span style={{color:"#a78bfa"}}>■ 0.5</span>
              <span style={{color:"#10b981"}}>■ 1.0</span>
            </div>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={heatRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>

        {/* Hidden connections — spans full width */}
        <div style={{display:"flex",flexDirection:"column",background:"#07050f",minHeight:0,gridColumn:"1 / -1"}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>⚡ HIDDEN CONNECTIONS</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.15)"}}>pairs where |Pearson r| &lt; 0.35 but NMI &gt; 0.30 — non-linear dependency not captured by correlation</span>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={hiddenRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>

      </div>
    </div>
  );
}
