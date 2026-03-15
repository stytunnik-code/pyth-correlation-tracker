import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SmokeBackground from "./SmokeBackground";

const ASSETS = [
  { id: "e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43", symbol: "BTC",     name: "Bitcoin",      category: "crypto",    color: "#F7931A", icon: "₿", logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
  { id: "ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace", symbol: "ETH",     name: "Ethereum",     category: "crypto",    color: "#8B9FFF", icon: "Ξ", logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
  { id: "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d", symbol: "SOL",     name: "Solana",       category: "crypto",    color: "#14F195", icon: "◎", logo: "https://assets.coingecko.com/coins/images/4128/large/solana.png" },
  { id: "dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c", symbol: "DOGE",    name: "Dogecoin",     category: "crypto",    color: "#C8A84B", icon: "Ð", logo: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png" },
  { id: "eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a", symbol: "USDC",    name: "USD Coin",     category: "crypto",    color: "#2775CA", icon: "$", logo: "https://assets.coingecko.com/coins/images/6319/large/usdc.png" },
  { id: "a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b", symbol: "EUR/USD", name: "Euro",         category: "fx",        color: "#60A5FA", icon: "€", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23003399'/%3E%3Ccircle cx='32' cy='14' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='41' cy='16.4' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='47.6' cy='23' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='50' cy='32' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='47.6' cy='41' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='41' cy='47.6' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='32' cy='50' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='23' cy='47.6' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='16.4' cy='41' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='14' cy='32' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='16.4' cy='23' r='3' fill='%23FFCC00'/%3E%3Ccircle cx='23' cy='16.4' r='3' fill='%23FFCC00'/%3E%3C/svg%3E" },
  { id: "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1", symbol: "GBP/USD", name: "Pound",        category: "fx",        color: "#34D399", icon: "£", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3CclipPath id='c'%3E%3Ccircle cx='32' cy='32' r='32'/%3E%3C/clipPath%3E%3C/defs%3E%3Ccircle cx='32' cy='32' r='32' fill='%23012169'/%3E%3Cg clip-path='url(%23c)'%3E%3Cpath d='M0 0 L64 64 M64 0 L0 64' stroke='white' stroke-width='13'/%3E%3Cpath d='M0 0 L64 64 M64 0 L0 64' stroke='%23C8102E' stroke-width='7'/%3E%3Cpath d='M32 0 L32 64 M0 32 L64 32' stroke='white' stroke-width='18'/%3E%3Cpath d='M32 0 L32 64 M0 32 L64 32' stroke='%23C8102E' stroke-width='11'/%3E%3C/g%3E%3C/svg%3E" },
  { id: "765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2", symbol: "XAU/USD", name: "Gold",         category: "commodity", color: "#FCD34D", icon: "Au", logo: "https://assets.coingecko.com/coins/images/10481/large/Tether_Gold.png" },
  { id: "925ca92ff005ae943c158e3563f59698ce7e75c5a8c8dd43303a0a154887b3e6", symbol: "WTI",     name: "Oil (WTI)",    category: "commodity", color: "#FB923C", icon: "⛽", logo: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23FB923C'/%3E%3Cpath d='M32 10C22 24 15 32 15 41C15 51.5 22.5 57 32 57C41.5 57 49 51.5 49 41C49 32 42 24 32 10Z' fill='white' fill-opacity='0.88'/%3E%3C/svg%3E" },
  { id: "49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688", symbol: "AAPL",   name: "Apple Inc",    category: "equity",    color: "#E2E8F0", icon: "", logo: "https://icons.duckduckgo.com/ip3/apple.com.ico" },
  { id: "19e09bb805456ada3979a7d1cbb4b6d63babc3a0f8e8a9509f68afa5c4c11cd5", symbol: "SPY",    name: "S&P 500 ETF",  category: "index",     color: "#38BDF8", icon: "S", logo: "https://icons.duckduckgo.com/ip3/www.ssga.com.ico" },
  { id: "9695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d", symbol: "QQQ",    name: "NASDAQ 100",   category: "index",     color: "#818CF8", icon: "Q", logo: "https://icons.duckduckgo.com/ip3/www.invesco.com.ico" },
  { id: "57cff3a9a4d4c87b595a2d1bd1bac0240400a84677366d632ab838bbbe56f763", symbol: "DIA",    name: "Dow Jones ETF",category: "index",     color: "#34D399", icon: "D", logo: "https://icons.duckduckgo.com/ip3/www.ssga.com.ico" },
  { id: "eff690a187797aa225723345d4612abec0bf0cec1ae62347c0e7b1905d730879", symbol: "IWM",    name: "Russell 2000", category: "index",     color: "#FB7185", icon: "R", logo: "https://icons.duckduckgo.com/ip3/www.ishares.com.ico" },
  { id: "93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7", symbol: "AVAX",    name: "Avalanche",    category: "crypto",    color: "#E84142", icon: "A", logo: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png" },
  { id: "2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d", symbol: "ADA",     name: "Cardano",      category: "crypto",    color: "#0033AD", icon: "₳", logo: "https://assets.coingecko.com/coins/images/975/large/cardano.png" },
  { id: "8ac0c70fff57e9aefdf5edf44b51d62c2d433653cbb2cf5cc06bb115af04d221", symbol: "LINK",    name: "Chainlink",    category: "crypto",    color: "#2A5ADA", icon: "⬡", logo: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png" },
  { id: "78d185a741d07edb3412b09008b7c5cfb9bbbd7d568bf00ba737b456ba171501", symbol: "UNI",     name: "Uniswap",      category: "crypto",    color: "#FF007A", icon: "🦄", logo: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png" },
  { id: "6e3f3fa8253588df9326580180233eb791e03b443a3ba7a1d892e73874e19a54", symbol: "LTC",     name: "Litecoin",     category: "crypto",    color: "#BFBBBB", icon: "Ł", logo: "https://assets.coingecko.com/coins/images/2/large/litecoin.png" },
  { id: "ca3eed9b267293f6595901c734c7525ce8ef49adafe8284606ceb307afa2ca5b", symbol: "DOT",     name: "Polkadot",     category: "crypto",    color: "#E6007A", icon: "●", logo: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png" },
  { id: "67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b", symbol: "TRX",     name: "TRON",         category: "crypto",    color: "#EF0027", icon: "T", logo: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png" },
  { id: "03ae4db29ed4ae33d323568895aa00337e658e348b37509f5372ae51f0af00d5", symbol: "APT",     name: "Aptos",        category: "crypto",    color: "#2DD8A3", icon: "A", logo: "https://assets.coingecko.com/coins/images/26455/large/aptos_round.png" },
  { id: "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744", symbol: "SUI",     name: "Sui",          category: "crypto",    color: "#6FBCF0", icon: "S", logo: "https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg" },
  { id: "d69731a2e74ac1ce884fc3890f7ee324b6deb66147055249568869ed700882e4", symbol: "PEPE",    name: "Pepe",         category: "crypto",    color: "#00A83C", icon: "🐸", logo: "https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg" },
  { id: "c415de8d2eba7db216527dff4b60e8f3a5311c740dadb233e13e12547e226750", symbol: "NEAR",    name: "NEAR Protocol", category: "crypto",   color: "#00C1DE", icon: "N", logo: "https://assets.coingecko.com/coins/images/10365/large/near.jpg" },
  { id: "b00b60f88b03a6a625a8d1c048c3f66653edf217439983d037e7222c4e612819", symbol: "ATOM",    name: "Cosmos",       category: "crypto",    color: "#6F7390", icon: "⚛", logo: "https://assets.coingecko.com/coins/images/1481/large/cosmos_hub.png" },
  { id: "ffd11c5a1cfd42f80afb2df4d9f264c15f956d68153335374ec10722edd70472", symbol: "POL",     name: "POL (MATIC)",  category: "crypto",    color: "#8247E5", icon: "P", logo: "https://assets.coingecko.com/coins/images/32440/large/polygon.png" },
  { id: "2837a61ae8165c018b0e406ac32b1527270e57b81f0069260afbef71b9cf8ffe", symbol: "HYPE",    name: "Hyperliquid",  category: "crypto",    color: "#00FF95", icon: "H", logo: "https://assets.coingecko.com/coins/images/36822/large/HYPE.jpg" },
];

const SEED = { BTC:65000,ETH:3200,SOL:140,DOGE:0.15,USDC:1,"EUR/USD":1.085,"GBP/USD":1.265,"XAU/USD":2320,WTI:78,AAPL:185,SPY:560,QQQ:480,DIA:420,IWM:200,AVAX:20,ADA:0.63,LINK:13,UNI:6,LTC:80,DOT:4,TRX:0.24,APT:5,SUI:2.2,PEPE:0.000008,NEAR:2.5,ATOM:4.5,POL:0.22,HYPE:18 };
const CAT_COLORS = { crypto:"#9945FF", fx:"#60A5FA", commodity:"#FCD34D", equity:"#E2E8F0", index:"#38BDF8" };

function pearson(a,b){
  const n=Math.min(a.length,b.length);if(n<4)return null;
  const ax=a.slice(-n),bx=b.slice(-n);
  const ma=ax.reduce((s,v)=>s+v,0)/n,mb=bx.reduce((s,v)=>s+v,0)/n;
  let num=0,da=0,db=0;
  for(let i=0;i<n;i++){const ai=ax[i]-ma,bi=bx[i]-mb;num+=ai*bi;da+=ai*ai;db+=bi*bi;}
  const d=Math.sqrt(da*db);return d===0?0:Math.max(-1,Math.min(1,num/d));
}

function corrBg(v){
  if(v===null) return "rgba(255,255,255,0.02)";
  const a=Math.abs(v), op=(0.12+a*0.68).toFixed(2);
  if(v>=0.65)  return `rgba(16,185,129,${op})`;          // strong positive → green
  if(v>=0.30)  return `rgba(234,179,8,${op})`;            // medium positive → yellow
  if(v>=0)     return `rgba(167,139,250,${(a*0.22).toFixed(2)})`; // weak positive → faint violet
  if(v>=-0.30) return `rgba(251,146,60,${(a*0.25).toFixed(2)})`; // weak negative → faint orange
  if(v>=-0.65) return `rgba(239,68,68,${op})`;            // medium negative → red
  return        `rgba(220,38,38,${Math.min(+op+0.1,0.9).toFixed(2)})`; // strong negative → deep red
}
function corrFg(v){if(v===null)return"#2a1f40";return Math.abs(v)>0.28?"#fff":"#c4b5fd";}
function corrTipLabel(v){
  if(v===null) return "Computing…";
  const a=Math.abs(v), d=v>=0?"positive":"negative";
  if(a>=0.8) return `Very strong ${d} correlation`;
  if(a>=0.6) return `Strong ${d} correlation`;
  if(a>=0.3) return `Moderate ${d} correlation`;
  if(a>=0.1) return `Weak ${d} correlation`;
  return "No significant correlation";
}

/* ── SHARE IMAGE GENERATOR ──────────────────────────────────────────────── */
function generateShareImage(symA, symB, corrVal, colorA, colorB) {
  const S = 1200;
  const cv = document.createElement('canvas');
  cv.width = S; cv.height = S;
  const ctx = cv.getContext('2d');

  const corrColor = corrVal === null ? '#a78bfa'
    : corrVal >= 0.65 ? '#10b981' : corrVal >= 0.30 ? '#eab308'
    : corrVal >= 0    ? '#a78bfa' : corrVal >= -0.30 ? '#fb923c'
    : corrVal >= -0.65? '#ef4444' : '#dc2626';

  const h2r = (hex, a) => {
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };

  // BG
  ctx.fillStyle = '#07050f';
  ctx.fillRect(0, 0, S, S);

  // Radial glow under number
  const gl = ctx.createRadialGradient(S/2, 560, 0, S/2, 560, 600);
  gl.addColorStop(0, h2r(corrColor, 0.18));
  gl.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(0, 0, S, S);

  // Top border line
  const tl = ctx.createLinearGradient(0, 0, S, 0);
  tl.addColorStop(0,   'rgba(124,58,237,0)');
  tl.addColorStop(0.3, '#7c3aed');
  tl.addColorStop(0.7, '#67e8f9');
  tl.addColorStop(1,   'rgba(103,232,249,0)');
  ctx.fillStyle = tl;
  ctx.fillRect(0, 0, S, 4);

  // Badge
  ctx.save();
  ctx.font = '600 26px "Space Mono", monospace';
  ctx.textAlign = 'center';
  const bt = '● LIVE  ·  PYTH ORACLE';
  const bw = ctx.measureText(bt).width + 56;
  const bx = S/2 - bw/2;
  ctx.beginPath(); ctx.roundRect(bx, 88, bw, 52, 26);
  ctx.fillStyle = 'rgba(124,58,237,0.15)'; ctx.fill();
  ctx.strokeStyle = 'rgba(124,58,237,0.42)'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(196,181,253,0.9)';
  ctx.fillText(bt, S/2, 124);
  ctx.restore();

  // Asset names — dynamic font size for long symbols
  const maxLen = Math.max(symA.length, symB.length);
  const nameFsz = maxLen <= 4 ? 130 : maxLen <= 6 ? 100 : 80;
  const pairY = 390;

  ctx.save();
  ctx.font = `bold ${nameFsz}px "Outfit", sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = colorA || '#a78bfa';
  ctx.fillText(symA, S/2 - 28, pairY);
  ctx.restore();

  ctx.save();
  ctx.font = `300 ${Math.round(nameFsz*0.8)}px "Outfit", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillText('/', S/2, pairY);
  ctx.restore();

  ctx.save();
  ctx.font = `bold ${nameFsz}px "Outfit", sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillStyle = colorB || '#67e8f9';
  ctx.fillText(symB, S/2 + 28, pairY);
  ctx.restore();

  // Big correlation number
  const corrStr = corrVal === null ? '–' : (corrVal >= 0 ? '+' : '') + corrVal.toFixed(2);
  ctx.save();
  ctx.font = 'bold 260px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = corrColor;
  ctx.fillText(corrStr, S/2, 680);
  ctx.restore();

  // Strength label
  ctx.save();
  ctx.font = '700 28px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = corrColor;
  ctx.globalAlpha = 0.72;
  ctx.fillText(corrTipLabel(corrVal).toUpperCase(), S/2, 730);
  ctx.restore();

  // Correlation bar
  const bW = 640, bH = 14, bX = S/2 - bW/2, bY = 810;
  const barG = ctx.createLinearGradient(bX, 0, bX + bW, 0);
  barG.addColorStop(0,    '#dc2626');
  barG.addColorStop(0.35, '#ef4444');
  barG.addColorStop(0.5,  'rgba(139,92,246,0.55)');
  barG.addColorStop(0.65, '#eab308');
  barG.addColorStop(1,    '#10b981');
  ctx.save();
  ctx.beginPath(); ctx.roundRect(bX, bY, bW, bH, bH/2);
  ctx.fillStyle = barG; ctx.fill();
  ctx.restore();

  // Marker
  if (corrVal !== null) {
    const mx = bX + bW * ((corrVal + 1) / 2);
    ctx.save();
    ctx.beginPath(); ctx.arc(mx, bY + bH/2, 15, 0, Math.PI*2);
    ctx.fillStyle = corrColor; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
  }

  // Bar axis labels
  ctx.save();
  ctx.font = '500 20px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'left';  ctx.fillText('−1', bX, bY + bH + 32);
  ctx.textAlign = 'center'; ctx.fillText('0', S/2, bY + bH + 32);
  ctx.textAlign = 'right';  ctx.fillText('+1', bX + bW, bY + bH + 32);
  ctx.restore();

  // Footer note
  ctx.save();
  ctx.font = '400 20px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.20)';
  ctx.fillText('Pearson correlation  ·  rolling 200 ticks  ·  Pyth Oracle data', S/2, 960);
  ctx.restore();

  // Domain
  ctx.save();
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(167,139,250,0.62)';
  ctx.fillText('pythcorrelation.com', S/2, 1090);
  ctx.restore();

  // Bottom border line
  const bl = ctx.createLinearGradient(0, 0, S, 0);
  bl.addColorStop(0, 'rgba(124,58,237,0)');
  bl.addColorStop(0.5, 'rgba(124,58,237,0.5)');
  bl.addColorStop(1, 'rgba(124,58,237,0)');
  ctx.fillStyle = bl;
  ctx.fillRect(0, S - 4, S, 4);

  return cv;
}

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
  // gradient fill
  const grad=ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,up?"rgba(52,211,153,0.28)":"rgba(248,113,113,0.28)");
  grad.addColorStop(1,"rgba(0,0,0,0)");
  ctx.beginPath();
  xs.forEach((x,i)=>i===0?ctx.moveTo(x,ys[i]):ctx.lineTo(x,ys[i]));
  ctx.lineTo(xs[xs.length-1],h);ctx.lineTo(xs[0],h);ctx.closePath();
  ctx.fillStyle=grad;ctx.fill();
  // line
  ctx.beginPath();
  xs.forEach((x,i)=>i===0?ctx.moveTo(x,ys[i]):ctx.lineTo(x,ys[i]));
  ctx.strokeStyle=sc;ctx.lineWidth=1.5;ctx.lineJoin="round";ctx.lineCap="round";ctx.stroke();
}

function Spark({data,color,h=28,w=72}){
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
      const ease=1-Math.pow(1-t,3); // cubic ease-out
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
   DOCS VIEW — Documentation, Legal & Attribution
   © 2025 rustrell. All rights reserved.
   ══════════════════════════════════════════════════════════════════════════ */
function DocsView({ setActiveTab }) {
  const [section, setSection] = useState("overview");

  const NAV = [
    { id: "overview",     label: "Overview" },
    { id: "features",     label: "Features" },
    { id: "methodology",  label: "Methodology" },
    { id: "data",         label: "Data Sources" },
    { id: "disclaimer",   label: "Disclaimer" },
    { id: "legal",        label: "Legal & Rights" },
    { id: "attribution",  label: "Attribution" },
  ];

  const S = {
    page: {
      display: "flex", flexDirection: "column", height: "100%",
      background: "#06030f", fontFamily: "'Space Mono', monospace",
      color: "rgba(255,255,255,0.82)", overflow: "hidden",
    },
    topbar: {
      display: "flex", alignItems: "center", gap: 12,
      padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "#07040f", flexShrink: 0,
    },
    body: { display: "flex", flex: 1, overflow: "hidden" },
    sidebar: {
      width: 180, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.05)",
      padding: "20px 0", display: "flex", flexDirection: "column", gap: 2,
      overflowY: "auto",
    },
    navItem: (active) => ({
      padding: "8px 20px", fontSize: 11, letterSpacing: ".05em",
      cursor: "pointer", background: active ? "rgba(167,139,250,0.08)" : "transparent",
      borderLeft: active ? "2px solid #a78bfa" : "2px solid transparent",
      color: active ? "#a78bfa" : "rgba(255,255,255,0.35)",
      transition: "all .15s",
    }),
    content: {
      flex: 1, overflowY: "auto", padding: "32px 48px", maxWidth: 860,
    },
    h1: {
      fontSize: 22, fontWeight: 700, color: "#fff",
      letterSpacing: ".04em", marginBottom: 8, lineHeight: 1.3,
    },
    h2: {
      fontSize: 14, fontWeight: 700, color: "#a78bfa",
      letterSpacing: ".06em", marginTop: 32, marginBottom: 12,
      borderBottom: "1px solid rgba(167,139,250,0.15)", paddingBottom: 6,
    },
    h3: {
      fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)",
      letterSpacing: ".08em", marginTop: 20, marginBottom: 6,
    },
    p: { fontSize: 12, lineHeight: 1.9, color: "rgba(255,255,255,0.5)", marginBottom: 12 },
    tag: {
      display: "inline-block", padding: "2px 8px", borderRadius: 3,
      background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)",
      color: "#c4b5fd", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", marginRight: 6,
    },
    tagGreen: {
      display: "inline-block", padding: "2px 8px", borderRadius: 3,
      background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
      color: "#34d399", fontSize: 10, fontWeight: 700, letterSpacing: ".06em", marginRight: 6,
    },
    code: {
      display: "block", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 4, padding: "12px 16px", fontSize: 11, color: "#22c55e",
      lineHeight: 1.8, marginBottom: 16, overflowX: "auto",
    },
    inlineCode: {
      background: "rgba(167,139,250,0.1)", borderRadius: 3, padding: "1px 5px",
      color: "#c4b5fd", fontSize: 11,
    },
    warn: {
      background: "rgba(251,146,60,0.07)", border: "1px solid rgba(251,146,60,0.2)",
      borderRadius: 4, padding: "12px 16px", marginBottom: 16, fontSize: 11,
      color: "rgba(251,146,60,0.85)", lineHeight: 1.8,
    },
    info: {
      background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)",
      borderRadius: 4, padding: "12px 16px", marginBottom: 16, fontSize: 11,
      color: "rgba(167,139,250,0.75)", lineHeight: 1.8,
    },
    table: { width: "100%", borderCollapse: "collapse", marginBottom: 16, fontSize: 11 },
    th: {
      textAlign: "left", padding: "7px 12px", fontSize: 9, letterSpacing: ".08em",
      color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    td: {
      padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.04)",
      color: "rgba(255,255,255,0.55)", verticalAlign: "top", lineHeight: 1.7,
    },
    divider: { height: 1, background: "rgba(255,255,255,0.05)", margin: "24px 0" },
    copy: {
      display: "flex", alignItems: "center", gap: 8, marginTop: 32,
      padding: "14px 20px", background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4,
    },
  };

  const sections = {

    overview: (
      <div>
        <div style={S.h1}>Pyth Correlation Tracker</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24, letterSpacing: ".04em" }}>
          Real-time multi-asset analytics powered by Pyth Network oracles
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {["Real-time", "10 Assets", "4 Modules", "Pyth Oracle", "Open Access"].map(t => (
            <span key={t} style={S.tag}>{t}</span>
          ))}
        </div>

        <div style={S.h2}>WHAT IS THIS</div>
        <div style={S.p}>
          Pyth Correlation Tracker is a real-time financial analytics dashboard that streams
          live price data from the Pyth Network oracle and computes statistical relationships
          between 10 major assets across crypto, forex, metals, and equities.
        </div>
        <div style={S.p}>
          Unlike traditional charting tools that show prices in isolation, this platform
          reveals hidden connections between markets — how BTC moves with gold, whether ETH
          leads or lags SOL, and how macro assets like EUR/USD relate to crypto during
          different market regimes.
        </div>

        <div style={S.h2}>ASSETS TRACKED</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>SYMBOL</th>
              <th style={S.th}>NAME</th>
              <th style={S.th}>CLASS</th>
              <th style={S.th}>PYTH FEED</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["BTC", "Bitcoin",     "Crypto",  "Crypto.BTC/USD"],
              ["ETH", "Ethereum",    "Crypto",  "Crypto.ETH/USD"],
              ["SOL", "Solana",      "Crypto",  "Crypto.SOL/USD"],
              ["DOGE","Dogecoin",    "Crypto",  "Crypto.DOGE/USD"],
              ["USDC","USD Coin",    "Stablecoin","Crypto.USDC/USD"],
              ["XAU/USD","Gold",     "Metal",   "Metal.XAU/USD"],
              ["EUR/USD","Euro",     "Forex",   "FX.EUR/USD"],
              ["GBP/USD","Pound",    "Forex",   "FX.GBP/USD"],
              ["AAPL","Apple Inc.",  "Equity",  "Equity.US.AAPL/USD"],
              ["WTI/USD","Crude Oil","Energy",  "Commodities.USOILSPOT"],
            ].map(([sym, name, cls, feed]) => (
              <tr key={sym}>
                <td style={{...S.td, color:"#c4b5fd", fontWeight:700}}>{sym}</td>
                <td style={S.td}>{name}</td>
                <td style={S.td}>{cls}</td>
                <td style={{...S.td, color:"rgba(34,197,94,0.7)", fontSize:10}}>{feed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),

    features: (
      <div>
        <div style={S.h1}>Features</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Four analytical modules</div>

        {[
          {
            tab: "MATRIX",
            color: "#a78bfa",
            desc: "The main dashboard. Shows live Pyth prices for all 10 assets with 1-minute rolling Pearson correlation matrix. Color-coded heatmap reveals which assets move together in real time.",
            features: [
              "Live price ticks from Pyth oracle (~400ms latency)",
              "Pearson correlation computed over last 200 ticks",
              "Color-coded matrix: green = positive, red = negative",
              "Sparklines showing recent price trajectory per asset",
              "Filter by asset class: All / Crypto / Forex / Metals / Equity",
            ],
          },
          {
            tab: "CHARTS",
            color: "#22c55e",
            desc: "Full OHLCV candlestick charts for any asset. Data sourced from Pyth Benchmarks API — the same oracle data, historically reconstructed.",
            features: [
              "Candlestick, line, and bar chart modes",
              "Timeframes: 1m · 5m · 15m · 1h · 4h · 1D",
              "300 historical bars from Pyth Benchmarks",
              "Live candle updates from Pyth ticks",
              "All 10 assets including XAU, EUR, AAPL",
            ],
          },
          {
            tab: "CORRELATION",
            color: "#f59e0b",
            desc: "Deep-dive correlation analysis between asset pairs. Scatter plot of returns + rolling Pearson correlation over time.",
            features: [
              "13 cross-asset pairs (crypto + macro + equity)",
              "Scatter plot with linear regression line",
              "Rolling 20-period Pearson correlation",
              "Time-colored dots (recent = brighter)",
              "Pearson r coefficient with significance color",
            ],
          },
          {
            tab: "ENTROPY",
            color: "#ef4444",
            desc: "Information-theoretic analysis of asset return distributions. Measures market predictability using Gaussian differential entropy and mutual information.",
            features: [
              "Gaussian Differential Entropy H = ½·ln(2πeσ²)",
              "Bootstrap confidence intervals (60 iterations)",
              "Normalized Mutual Information (NMI) 10×10 heatmap",
              "Hidden connections: low correlation but high NMI",
              "Pyth live seed for PRNG bootstrap",
            ],
          },
        ].map(({ tab, color, desc, features }) => (
          <div key={tab} style={{ marginBottom: 28, padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: `1px solid ${color}18`, borderRadius: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: ".08em", marginBottom: 8 }}>{tab}</div>
            <div style={S.p}>{desc}</div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {features.map(f => (
                <li key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 2 }}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),

    methodology: (
      <div>
        <div style={S.h1}>Methodology</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Mathematical foundations</div>

        <div style={S.h2}>PEARSON CORRELATION</div>
        <div style={S.p}>
          The correlation matrix uses the Pearson product-moment coefficient computed over
          rolling windows of live Pyth price ticks. For assets A and B with return series
          r_A and r_B:
        </div>
        <div style={S.code}>{`r(A,B) = Σ[(rA - μA)(rB - μB)] / √[Σ(rA-μA)² · Σ(rB-μB)²]

Range: -1.0 (perfect inverse) → 0 (no linear relation) → +1.0 (perfect positive)
Window: last 200 price ticks (~3-4 minutes of live data)`}</div>

        <div style={S.h2}>PERCENT RETURNS</div>
        <div style={S.p}>
          All correlation and entropy calculations use percent returns rather than raw prices,
          to remove non-stationarity and make assets comparable across different price scales.
        </div>
        <div style={S.code}>{`r_t = (P_t - P_{t-1}) / P_{t-1} × 100

Example: BTC $83,000 → $83,166 gives r_t = +0.2%`}</div>

        <div style={S.h2}>GAUSSIAN DIFFERENTIAL ENTROPY</div>
        <div style={S.p}>
          The Entropy module measures the statistical complexity of each asset's return
          distribution. Gaussian differential entropy is a continuous analog of Shannon
          entropy that captures the spread/volatility of returns:
        </div>
        <div style={S.code}>{`H(X) = ½ · ln(2πe · σ²)   [nats]

where σ² = variance of percent returns over 300 historical bars

Interpretation:
  USDC  → H ≈ -9 nats  (very predictable, near-zero variance)
  EUR   → H ≈ -3 nats  (moderate)
  BTC   → H ≈ -1 nats  (volatile, higher entropy)
  DOGE  → H ≈  0 nats  (most chaotic, fat-tailed distribution)`}</div>

        <div style={S.h2}>BOOTSTRAP CONFIDENCE INTERVALS</div>
        <div style={S.p}>
          To quantify uncertainty in the entropy estimate, we use bootstrap resampling.
          60 iterations of with-replacement sampling (70% of data) produce a distribution
          of H values, from which we extract 95% confidence intervals.
        </div>
        <div style={S.code}>{`For each bootstrap iteration i = 1..60:
  - Draw resampleSize = min(150, n×0.7) indices with replacement
  - Compute H_i = ½ · ln(2πe · σ²_i)

CI₉₅ = [percentile(H, 2.5%), percentile(H, 97.5%)]
Seed: mulberry32 PRNG seeded from live Pyth prices XOR asset index`}</div>

        <div style={S.h2}>NORMALIZED MUTUAL INFORMATION</div>
        <div style={S.p}>
          The NMI heatmap captures non-linear dependencies between assets that Pearson
          correlation misses. MI is computed via quantile binning (8 bins) of return series.
        </div>
        <div style={S.code}>{`MI(X,Y) = H(X) + H(Y) - H(X,Y)
NMI(X,Y) = MI(X,Y) / √[H(X) · H(Y)]   ∈ [0, 1]

Hidden connections: pairs where |Pearson r| < 0.35 but NMI > 0.30
indicate non-linear dependency not captured by linear correlation.`}</div>

        <div style={S.h2}>ROLLING CORRELATION (CORRELATION TAB)</div>
        <div style={S.code}>{`Window = 20 periods of 1-minute returns
At each step t: r_t = Pearson(A_{t-20..t}, B_{t-20..t})
Data: 300 bars from Pyth Benchmarks + live Pyth ticks merged`}</div>
      </div>
    ),

    data: (
      <div>
        <div style={S.h1}>Data Sources</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>100% Pyth Network</div>

        <div style={S.info}>
          As of the current version, all price data is sourced exclusively from Pyth Network.
          No Binance, no third-party proxies. One oracle, all asset classes.
        </div>

        <div style={S.h2}>PYTH HERMES — LIVE PRICES</div>
        <div style={S.p}>
          Real-time price feeds are pulled from Pyth's Hermes aggregation service every ~3 seconds.
          Hermes aggregates prices from multiple professional market makers and data providers,
          delivering sub-second latency oracle prices on-chain and off-chain.
        </div>
        <div style={S.code}>{`Endpoint: https://hermes.pyth.network/v2/updates/price/latest
Method:   GET ?ids[]=<feed_id>&parsed=true
Latency:  ~400ms from oracle publish to dashboard update
Update:   Every 3 seconds (setInterval)`}</div>

        <div style={S.h2}>PYTH BENCHMARKS — HISTORICAL OHLCV</div>
        <div style={S.p}>
          Historical candlestick data comes from Pyth Benchmarks, a TradingView-compatible
          REST API that serves OHLCV bars reconstructed from Pyth oracle price history.
        </div>
        <div style={S.code}>{`Endpoint: https://benchmarks.pyth.network/v1/shims/tradingview/history
Params:   symbol, resolution, from, to, countback
Response: { s, t[], o[], h[], l[], c[], v[] }

Resolutions: 1 (1m), 5, 15, 60 (1h), 240 (4h), D (daily)
Countback:   300 bars per request`}</div>

        <div style={S.h2}>PYTH SYMBOL MAP</div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>ASSET</th>
              <th style={S.th}>BENCHMARKS SYMBOL</th>
              <th style={S.th}>HERMES FEED ID (first 16 chars)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["BTC",     "Crypto.BTC/USD",        "e62df6c8b4a85fe1"],
              ["ETH",     "Crypto.ETH/USD",        "ff61491a93111..."],
              ["SOL",     "Crypto.SOL/USD",        "ef0d8b6fda2ceb..."],
              ["DOGE",    "Crypto.DOGE/USD",       "dcef50bb04848..."],
              ["USDC",    "Crypto.USDC/USD",       "eaa020c61cc479..."],
              ["XAU/USD", "Metal.XAU/USD",         "765d2ba906dbc3..."],
              ["EUR/USD", "FX.EUR/USD",            "a995d00bb36a63..."],
              ["GBP/USD", "FX.GBP/USD",            "84c2dde9633d3d..."],
              ["AAPL",    "Equity.US.AAPL/USD",    "49f6b65cb7d95..."],
              ["WTI/USD", "Commodities.USOILSPOT",  "6b1381ce7e5e..."],
            ].map(([sym, bench, feed]) => (
              <tr key={sym}>
                <td style={{...S.td, color:"#c4b5fd", fontWeight:700}}>{sym}</td>
                <td style={{...S.td, color:"rgba(34,197,94,0.7)", fontSize:10}}>{bench}</td>
                <td style={{...S.td, fontSize:10, fontFamily:"monospace"}}>{feed}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={S.h2}>DATA FRESHNESS & LIMITATIONS</div>
        <div style={S.p}>
          Live prices update every 3 seconds. Historical bars are fetched once on tab/pair
          load and cached in-session. Equity data (AAPL) may have limited availability
          outside US market hours. Energy (WTI) and metals (XAU) trade nearly 24/5.
        </div>
      </div>
    ),

    disclaimer: (
      <div>
        <div style={S.h1}>Disclaimer</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Please read carefully</div>

        <div style={S.warn}>
          ⚠ This platform is for informational and educational purposes only.
          Nothing on this site constitutes financial, investment, trading, or legal advice.
        </div>

        <div style={S.h2}>NOT FINANCIAL ADVICE</div>
        <div style={S.p}>
          All data, analytics, correlations, entropy metrics, and visualizations displayed
          on Pyth Correlation Tracker are provided for informational purposes only. The
          information does not constitute, and should not be construed as, financial advice,
          investment recommendations, or solicitation to buy or sell any asset.
        </div>
        <div style={S.p}>
          Past correlations do not predict future price movements. Statistical relationships
          between assets can and do change rapidly, especially during market stress events,
          black swans, or structural market shifts.
        </div>

        <div style={S.h2}>NO INVESTMENT RECOMMENDATIONS</div>
        <div style={S.p}>
          rustrell and the Pyth Correlation Tracker project do not recommend or endorse
          any specific investment strategy, asset allocation, or trading decision based on
          the metrics shown on this platform. Users are solely responsible for their own
          investment and trading decisions.
        </div>

        <div style={S.h2}>DATA ACCURACY</div>
        <div style={S.p}>
          While price data is sourced from Pyth Network — a decentralized oracle aggregating
          data from professional market makers — we make no representations or warranties
          regarding the accuracy, completeness, timeliness, or reliability of any data
          displayed. Oracle data may experience latency, gaps, or errors.
        </div>

        <div style={S.h2}>RISK WARNING</div>
        <div style={S.p}>
          Cryptocurrency, forex, commodity, and equity markets carry substantial risk of loss.
          Prices can be highly volatile. You may lose some or all of your invested capital.
          Never trade or invest more than you can afford to lose. Consult a licensed financial
          advisor before making investment decisions.
        </div>

        <div style={S.h2}>JURISDICTION</div>
        <div style={S.p}>
          This platform is not directed at residents of jurisdictions where the display of
          financial data or analytics tools is restricted or prohibited. It is the user's
          responsibility to ensure compliance with applicable local laws and regulations.
        </div>

        <div style={S.divider}/>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", lineHeight: 1.9 }}>
          Last updated: March 2025. Subject to change without notice.
          By using this platform you acknowledge that you have read,
          understood, and agree to this disclaimer.
        </div>
      </div>
    ),

    legal: (
      <div>
        <div style={S.h1}>Legal & Rights</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Intellectual property and terms of use</div>

        <div style={S.h2}>COPYRIGHT</div>
        <div style={{ ...S.info, fontSize: 13, letterSpacing: ".02em" }}>
          © 2025 rustrell. All rights reserved.
        </div>
        <div style={S.p}>
          The design, source code, visual presentation, analytical methodology, user interface,
          and all original content of Pyth Correlation Tracker are the exclusive intellectual
          property of <strong style={{ color: "rgba(255,255,255,0.7)" }}>rustrell</strong>.
        </div>
        <div style={S.p}>
          Unauthorized reproduction, distribution, modification, reverse engineering, or
          commercial use of any part of this platform — including but not limited to its
          code, design, algorithms, or visual assets — is strictly prohibited without
          prior written consent from the author.
        </div>

        <div style={S.h2}>PERMITTED USE</div>
        <div style={S.p}>
          You are permitted to:
        </div>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 20 }}>
          {[
            "Access and use the platform for personal, non-commercial analysis",
            "Share screenshots or links to the platform with attribution",
            "Reference the methodology in academic or educational work with citation",
          ].map(item => (
            <li key={item} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 2 }}>{item}</li>
          ))}
        </ul>
        <div style={S.p}>You are NOT permitted to:</div>
        <ul style={{ margin: "0 0 16px 0", paddingLeft: 20 }}>
          {[
            "Copy, clone, or redistribute the source code for commercial purposes",
            "Create derivative works without written permission",
            "Scrape or systematically extract data from the platform",
            "Remove or obscure copyright notices or attributions",
            "Use the platform's name, branding, or identity without consent",
          ].map(item => (
            <li key={item} style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 2 }}>{item}</li>
          ))}
        </ul>

        <div style={S.h2}>CONTACT FOR LICENSING</div>
        <div style={S.p}>
          For licensing inquiries, collaborations, or permissions beyond the scope above,
          contact:
        </div>
        <div style={{ ...S.code, color: "#a78bfa" }}>
          {`Email:   stytunnik@gmail.com
Twitter: https://x.com/xzolmoney`}
        </div>

        <div style={S.h2}>GOVERNING LAW</div>
        <div style={S.p}>
          These terms are governed by applicable international intellectual property law.
          Any disputes shall be resolved through good-faith negotiation between parties.
        </div>

        <div style={S.divider}/>
        <div style={S.copy}>
          <span style={{ fontSize: 18 }}>©</span>
          <div>
            <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>2025 rustrell</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>
              Pyth Correlation Tracker · All rights reserved
            </div>
          </div>
        </div>
      </div>
    ),

    attribution: (
      <div>
        <div style={S.h1}>Attribution</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>Third-party services and open-source credits</div>

        <div style={S.h2}>PYTH NETWORK</div>
        <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#fff", fontWeight: 700, marginBottom: 6 }}>Pyth Network</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>
            Real-time and historical price data provided by Pyth Network oracle.<br/>
            Pyth is a first-party financial oracle network publishing high-fidelity market data on-chain.<br/>
            All price feeds used under Pyth Network's Terms of Service.
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
            <a href="https://pyth.network" target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#a78bfa" }}>pyth.network</a>
            <a href="https://pyth.network/terms-of-use" target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#a78bfa" }}>Terms of Use</a>
            <a href="https://docs.pyth.network" target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#a78bfa" }}>Documentation</a>
          </div>
        </div>

        {[
          {
            name: "React",
            desc: "UI framework. Copyright © Meta Platforms, Inc. and affiliates.",
            license: "MIT License",
            url: "https://react.dev",
          },
          {
            name: "Vite",
            desc: "Build tooling and development server.",
            license: "MIT License",
            url: "https://vitejs.dev",
          },
          {
            name: "Space Mono",
            desc: "Monospace typeface by Colophon Foundry via Google Fonts.",
            license: "SIL Open Font License 1.1",
            url: "https://fonts.google.com/specimen/Space+Mono",
          },
          {
            name: "Syne",
            desc: "Display typeface by Bonjour Monde via Google Fonts.",
            license: "SIL Open Font License 1.1",
            url: "https://fonts.google.com/specimen/Syne",
          },
        ].map(({ name, desc, license, url }) => (
          <div key={name} style={{ padding: "12px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 4, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#fff", fontWeight: 700, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>{desc}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span style={S.tagGreen}>{license}</span>
              <div style={{ marginTop: 6 }}>
                <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "rgba(167,139,250,0.6)" }}>{url.replace("https://","")}</a>
              </div>
            </div>
          </div>
        ))}

        <div style={S.h2}>MATHEMATICAL REFERENCES</div>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {[
            "Shannon, C.E. (1948). A Mathematical Theory of Communication. Bell System Technical Journal.",
            "Bandt, C. & Pompe, B. (2002). Permutation Entropy. Physical Review Letters.",
            "Pearson, K. (1895). Notes on regression and inheritance. Proceedings of the Royal Society of London.",
            "Mulberry32 PRNG by Tommy Ettinger — public domain fast hash-based PRNG.",
          ].map(ref => (
            <li key={ref} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", lineHeight: 2.2 }}>{ref}</li>
          ))}
        </ul>
      </div>
    ),

  };

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topbar}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa", letterSpacing: ".06em" }}>DOCS</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.2)" }}>& LEGAL</span>
        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.07)" }}/>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Pyth Correlation Tracker · © 2025 rustrell</span>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => setActiveTab("matrix")}
            style={{ padding: "4px 14px", borderRadius: 3, cursor: "pointer", fontSize: 10, fontFamily: "inherit", fontWeight: 700, letterSpacing: ".06em", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; e.currentTarget.style.color = "#a78bfa"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={S.body}>
        {/* Sidebar nav */}
        <div style={S.sidebar}>
          {NAV.map(({ id, label }) => (
            <div
              key={id}
              style={S.navItem(section === id)}
              onClick={() => setSection(id)}
              onMouseEnter={e => { if (section !== id) { e.currentTarget.style.color = "rgba(167,139,250,0.6)"; e.currentTarget.style.background = "rgba(167,139,250,0.04)"; } }}
              onMouseLeave={e => { if (section !== id) { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; } }}>
              {label}
            </div>
          ))}
          <div style={{ margin: "auto 0 16px 0", padding: "0 20px" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", lineHeight: 1.9 }}>
              © 2025 rustrell<br/>
              All rights reserved
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={S.content}>
          {sections[section]}
        </div>
      </div>
    </div>
  );
}



const NFT_IMGS=[
  "data:image/png;base64,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",
  "data:image/png;base64,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",
  "data:image/png;base64,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",
  "data:image/png;base64,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"
];
/* ── LOADING CANVAS ─────────────────────────────────────────────────────── */
function LoadingCanvas(){
  const canvasRef=useRef();
  useEffect(()=>{
    const el=canvasRef.current;
    if(!el) return;
    const W=el.width=window.innerWidth;
    const H=el.height=window.innerHeight;
    const ctx=el.getContext("2d");

    // pre-draw bg+grid offscreen
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

    // chart lines
    const lines=Array.from({length:7},(_,i)=>({
      pts:Array.from({length:120},(_,j)=>
        H*(0.15+i*0.12)+Math.sin(j*0.12+i*1.3)*28+Math.sin(j*0.05+i*0.7)*16+Math.sin(j*0.22+i*2.1)*8
      ),
      color:["rgba(124,58,237,","rgba(167,139,250,","rgba(99,102,241,","rgba(52,211,153,","rgba(248,113,113,","rgba(251,191,36,","rgba(103,232,249,"][i],
      alpha:0.05+i*0.018, speed:0.18+i*0.09, offset:i*17
    }));

    // dots
    const COLORS=["rgba(124,58,237,","rgba(167,139,250,","rgba(99,102,241,","rgba(52,211,153,","rgba(196,181,253,"];
    const dots=Array.from({length:60},(_,i)=>({
      x:Math.random()*W, y:Math.random()*H,
      r:1+Math.random()*2.5,
      baseAlpha:0.12+Math.random()*0.18,
      color:COLORS[i%COLORS.length],
      phase:Math.random()*Math.PI*2,
      phaseSpeed:0.008+Math.random()*0.012
    }));

    // crypto symbols
    const SYMS=["₿","Ξ","◎","$","€","Au","Ð","⊕","◆","▲","∑","λ"];
    const particles=Array.from({length:18},(_,i)=>({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*0.28, vy:(Math.random()-.5)*0.28,
      sym:SYMS[i%SYMS.length],
      color:COLORS[i%COLORS.length],
      baseAlpha:0.18+Math.random()*0.22,
      size:14+Math.random()*22,
      phase:Math.random()*Math.PI*2,
      phaseSpeed:0.012+Math.random()*0.008
    }));

    // NFT runners — load images, stagger positions
    const SIZE=110;
    const runners=NFT_IMGS.map((src,i)=>{
      const img=new Image();
      img.src=src;
      return {
        img,
        x: -SIZE - i*320,   // start off-screen left, staggered
        y: H*0.62 - SIZE/2,
        speed: 2.2 + i*0.3,
        bobPhase: i*1.1,
        bobSpeed: 0.055,
        loaded: false,
        scaleDir: 1,
        squish: 1,
      };
    });
    runners.forEach(r=>{ r.img.onload=()=>{ r.loaded=true; }; });

    let raf;
    function draw(){
      ctx.drawImage(offBg,0,0);

      // chart lines
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

      // symbols
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

      // ground line
      ctx.strokeStyle="rgba(167,139,250,0.12)";
      ctx.lineWidth=1;
      ctx.setLineDash([6,8]);
      ctx.beginPath();
      ctx.moveTo(0, H*0.62+SIZE*0.48);
      ctx.lineTo(W, H*0.62+SIZE*0.48);
      ctx.stroke();
      ctx.setLineDash([]);

      // NFT runners
      runners.forEach((r,ri)=>{
        r.x += r.speed;
        if(r.x > W+SIZE) r.x = -SIZE - Math.random()*200;
        r.bobPhase += r.bobSpeed;
        // bob up/down like running
        const bob = Math.sin(r.bobPhase*2)*5;
        // leg squish
        r.squish = 1 + Math.sin(r.bobPhase*2)*0.04;

        if(!r.loaded) return;

        const drawX = r.x;
        const drawY = r.y + bob;

        // shadow
        ctx.save();
        ctx.globalAlpha=0.18;
        ctx.fillStyle="rgba(124,58,237,0.8)";
        ctx.beginPath();
        ctx.ellipse(drawX+SIZE/2, H*0.62+SIZE*0.5, SIZE*0.35, 8, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();

        // draw character with slight squish
        ctx.save();
        ctx.translate(drawX+SIZE/2, drawY+SIZE/2);
        ctx.scale(r.squish, 2-r.squish);
        ctx.drawImage(r.img, -SIZE/2, -SIZE/2, SIZE, SIZE);
        ctx.restore();
      });

      raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={canvasRef} className="loading-canvas"/>;
}


export default function App(){
  const [prices,setPrices]=useState({});
  const [history,setHistory]=useState({});
  const [corr,setCorr]=useState({});
  const [prevPrices,setPrevPrices]=useState({});
  const [status,setStatus]=useState("connecting");
  const [filter,setFilter]=useState("all");
  const [sortBy,setSortBy]=useState("default");
  const [selected,setSelected]=useState(null);
  const [hmTooltip,setHmTooltip]=useState(null); // {x,y,symA,symB,val}
  const [mounted,setMounted]=useState(false);
  const [mobileTab,setMobileTab]=useState("heatmap");
  const [activeTab,setActiveTab]=useState("matrix");
  const [showLanding,setShowLanding]=useState(false);
  const [landingExiting,setLandingExiting]=useState(false);
  const [showLoading,setShowLoading]=useState(true);
  const [loadingPhase,setLoadingPhase]=useState(0);
  const LOADING_PHRASES=[
    "PARSING WHALE WALLETS...",
    "INITIALIZING AI SENTIMENT MODEL...",
    "LOADING PYTH ORACLE FEEDS...",
    "COMPUTING CORRELATION MATRIX...",
    "CALIBRATING ENTROPY ENGINE...",
  ];
  useEffect(()=>{
    let phase=0;
    const iv=setInterval(()=>{
      phase++;
      if(phase<LOADING_PHRASES.length){ setLoadingPhase(phase); }
      else {
        clearInterval(iv);
        setShowLanding(true);
        requestAnimationFrame(()=>requestAnimationFrame(()=>setShowLoading(false)));
      }
    }, 520);
    return ()=>clearInterval(iv);
  },[]);
  const goFromLanding=(tab="matrix")=>{
    setLandingExiting(true);
    setTimeout(()=>{ setShowLanding(false); if(tab!=="matrix") setActiveTab(tab); }, 420);
  };
  const handleShareApp=()=>{
    const btc=ASSETS.find(a=>a.symbol==="BTC");
    const eth=ASSETS.find(a=>a.symbol==="ETH");
    const btcPrice=prices[btc?.id];
    const ethPrice=prices[eth?.id];
    let lines=["📊 Live Cross-Asset Correlation Matrix"];
    if(btcPrice!=null) lines.push(`BTC $${Math.round(btcPrice).toLocaleString()}`);
    if(ethPrice!=null) lines.push(`ETH $${Math.round(ethPrice).toLocaleString()}`);
    // find top positive corr pair
    let best=null, bestVal=-Infinity;
    ASSETS.forEach((a,i)=>ASSETS.forEach((b,j)=>{
      if(i>=j) return;
      const v=corr[`${a.id}|${b.id}`]??corr[`${b.id}|${a.id}`];
      if(v!=null&&v>bestVal){bestVal=v;best=[a.symbol,b.symbol,v];}
    }));
    if(best) lines.push(`Top pair: ${best[0]}/${best[1]} ${best[2]>=0?"+":""}${best[2].toFixed(2)}`);
    lines.push("","Powered by @PythNetwork","pythcorrelation.com");
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(lines.join("\n"))}`,"_blank");
  };
  const handleShareCorr=(assetA, assetB, corrVal)=>{
    if(corrVal===null) return;
    const txt=`${assetA.symbol}/${assetB.symbol} correlation: ${corrVal>=0?'+':''}${corrVal.toFixed(2)}\n\nPowered by @PythNetwork\npythcorrelation.com`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}`,'_blank');
  };
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
  const [entropyLiveRun,setEntropyLiveRun]=useState(false);
  const [corrAlertEnabled,setCorrAlertEnabled]=useState(false);
  const [corrAlertPair,setCorrAlertPair]=useState("BTC-ETH");
  const [corrAlertThreshold,setCorrAlertThreshold]=useState(0.8);
  const [corrAlertHit,setCorrAlertHit]=useState(false);
  const DEFAULT_COINS=new Set(["BTC","ETH","SOL","DOGE","AVAX","ADA","LINK","SUI","NEAR","HYPE"]);
  const [selectedCoins,setSelectedCoins]=useState(()=>{
    try{const s=localStorage.getItem("sc");return s?new Set(JSON.parse(s)):new Set(DEFAULT_COINS);}catch{return new Set(DEFAULT_COINS);}
  });
  const [pickerOpen,setPickerOpen]=useState(false);
  const pickerRef=useRef(null);
  const histRef=useRef({});
  const corrTraceRef=useRef({});

  useEffect(()=>{setTimeout(()=>setMounted(true),80);},[]);

  // Save coin selection to localStorage
  useEffect(()=>{
    if(selectedCoins===null) localStorage.removeItem("sc");
    else localStorage.setItem("sc",JSON.stringify([...selectedCoins]));
  },[selectedCoins]);

  // Close picker on outside click
  useEffect(()=>{
    if(!pickerOpen)return;
    const handler=(e)=>{if(pickerRef.current&&!pickerRef.current.contains(e.target))setPickerOpen(false);};
    document.addEventListener("mousedown",handler);
    return()=>document.removeEventListener("mousedown",handler);
  },[pickerOpen]);

  function push(sym,price){
    if(!histRef.current[sym])histRef.current[sym]=[];
    histRef.current[sym].push(price);
    if(histRef.current[sym].length>200)histRef.current[sym].shift();
  }

  // Prefetch 60 historical closes so correlation matrix is ready on load
  const prefetchHistory = useCallback(async () => {
    const PYTH_SYM = {
      "BTC":"Crypto.BTC/USD","ETH":"Crypto.ETH/USD","SOL":"Crypto.SOL/USD",
      "DOGE":"Crypto.DOGE/USD","USDC":"Crypto.USDC/USD",
      "EUR/USD":"FX.EUR/USD","GBP/USD":"FX.GBP/USD",
      "XAU/USD":"Metal.XAU/USD","WTI":"Commodities.USOILSPOT",
      "AAPL":"Equity.US.AAPL/USD",
      "SPY":"Equity.US.SPY/USD","QQQ":"Equity.US.QQQ/USD",
      "DIA":"Equity.US.DIA/USD","IWM":"Equity.US.IWM/USD",
      "AVAX":"Crypto.AVAX/USD","ADA":"Crypto.ADA/USD","LINK":"Crypto.LINK/USD",
      "UNI":"Crypto.UNI/USD","LTC":"Crypto.LTC/USD","DOT":"Crypto.DOT/USD",
      "TRX":"Crypto.TRX/USD","APT":"Crypto.APT/USD","SUI":"Crypto.SUI/USD",
      "PEPE":"Crypto.PEPE/USD","NEAR":"Crypto.NEAR/USD","ATOM":"Crypto.ATOM/USD",
      "POL":"Crypto.POL/USD","HYPE":"Crypto.HYPE/USD",
    };
    const now = Math.floor(Date.now()/1000);
    const from = now - 60*3600; // last 60 hours
    await Promise.allSettled(
      ASSETS.map(async a => {
        const sym = PYTH_SYM[a.symbol];
        if (!sym) return;
        try {
          const res = await fetch(`/api/benchmarks?symbol=${encodeURIComponent(sym)}&resolution=60&from=${from}&to=${now}&countback=60`);
          if (!res.ok) return;
          const d = await res.json();
          if (d.s==="ok" && d.c?.length) {
            histRef.current[a.symbol] = d.c.slice(-60);
          }
        } catch {}
      })
    );
  }, []);

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
        const BATCH=10;
        const batches=[];
        for(let i=0;i<ASSETS.length;i+=BATCH)batches.push(ASSETS.slice(i,i+BATCH));
        const results=await Promise.all(batches.map(async batch=>{
          const params=new URLSearchParams();
          batch.forEach(a=>params.append("ids[]",a.id));
          params.set("parsed","true");params.set("binary","false");params.set("ignore_invalid_price_ids","true");
          const r=await fetch(`https://hermes.pyth.network/v2/updates/price/latest?${params}`);
          if(!r.ok)return[];
          const d=await r.json();
          return d.parsed||[];
        }));
        const np2={};
        results.flat().forEach(item=>{
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

  useEffect(()=>{
    // Start live prices immediately — don't wait for history
    fetchPrices();
    const iv=setInterval(fetchPrices,3000);
    prefetchHistory().then(()=>setHistory({...histRef.current})); // load history in background

    // Prefetch BTC + ETH on all timeframes at startup (12 requests)
    // These are the most viewed assets and used as benchmarks for all crypto
    const tfs = ["1m","5m","15m","1h","4h","1d"];
    let delay = 0;
    for(const sym of ["BTC","ETH"]){
      for(const tf of tfs){
        const d = delay;
        setTimeout(()=>{
          fetchPyth(sym, tf, CHART_FETCH_BARS).then(candles=>{
            if(!candles?.length) return;
            setChartHist(p=>({...p,[sym]:{...(p[sym]||{}),[tf]:candles}}));
          });
        }, d);
        delay += 200;
      }
    }
    return ()=>clearInterval(iv);
  },[prefetchHistory,fetchPrices]);

  useEffect(()=>{
    const nc={};
    ASSETS.forEach((a,i)=>ASSETS.forEach((b,j)=>{
      if(i===j){nc[`${a.symbol}-${b.symbol}`]=1;return;}
      nc[`${a.symbol}-${b.symbol}`]=pearson(histRef.current[a.symbol]||[],histRef.current[b.symbol]||[]);
    }));
    setCorr(nc);

    for(let i=0;i<ASSETS.length;i++)for(let j=i+1;j<ASSETS.length;j++){
      const key=`${ASSETS[i].symbol}-${ASSETS[j].symbol}`;
      const v=nc[key];
      if(v==null || !isFinite(v)) continue;
      if(!corrTraceRef.current[key]) corrTraceRef.current[key]=[];
      corrTraceRef.current[key].push(v);
      if(corrTraceRef.current[key].length>24) corrTraceRef.current[key].shift();
    }
  },[history]);

  useEffect(()=>{
    if(!corrAlertEnabled){ setCorrAlertHit(false); return; }
    const series = corrTraceRef.current[corrAlertPair] || [];
    const recent = series.slice(-6);
    if(recent.length < 6) { setCorrAlertHit(false); return; }
    const min = Math.min(...recent), max = Math.max(...recent);
    const avgAbs = recent.reduce((s,v)=>s+Math.abs(v),0)/recent.length;
    setCorrAlertHit(max - min <= 0.04 && avgAbs >= corrAlertThreshold);
  },[corr, corrAlertEnabled, corrAlertPair, corrAlertThreshold]);

  const visCat=filter==="all"?ASSETS:ASSETS.filter(a=>a.category===filter);
  // If selectedCoins is null → all enabled; if empty Set → fallback to all (avoid empty grid)
  const vis=(!selectedCoins||selectedCoins.size===0)?visCat:visCat.filter(a=>selectedCoins.has(a.symbol));

  const sortedVis=useMemo(()=>{
    const arr=[...vis];
    if(sortBy==="price_desc") return arr.sort((a,b)=>(prices[b.symbol]||0)-(prices[a.symbol]||0));
    if(sortBy==="price_asc")  return arr.sort((a,b)=>(prices[a.symbol]||0)-(prices[b.symbol]||0));
    if(sortBy==="corr_desc"||sortBy==="corr_asc"){
      const avgCorr=a=>{
        const vals=vis.filter(b=>b.symbol!==a.symbol).map(b=>{
          const v=corr[`${a.symbol}-${b.symbol}`]??corr[`${b.symbol}-${a.symbol}`]??null;
          return v;
        }).filter(v=>v!==null&&isFinite(v));
        return vals.length?vals.reduce((s,v)=>s+Math.abs(v),0)/vals.length:null;
      };
      return arr.sort((a,b)=>{
        const pa=avgCorr(a),pb=avgCorr(b);
        if(pa===null&&pb===null)return 0;if(pa===null)return 1;if(pb===null)return -1;
        return sortBy==="corr_desc"?pb-pa:pa-pb;
      });
    }
    return arr;
  },[vis,sortBy,prices,corr]);
  // visAll = selectedCoins filtered without category (for Charts / Entropy / Correlation tabs)
  const visAll=(!selectedCoins||selectedCoins.size===0)?ASSETS:ASSETS.filter(a=>selectedCoins.has(a.symbol));
  const corrAlertOptions = [];
  for(let i=0;i<ASSETS.length;i++) for(let j=i+1;j<ASSETS.length;j++) {
    corrAlertOptions.push({
      key:`${ASSETS[i].symbol}-${ASSETS[j].symbol}`,
      label:`${ASSETS[i].symbol} / ${ASSETS[j].symbol}`
    });
  }

  function topPairs(dir){
    const pairs=[];
    for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){
      const v=corr[`${vis[i].symbol}-${vis[j].symbol}`];
      if(v!=null&&isFinite(v))pairs.push({a:vis[i],b:vis[j],v});
    }
    return dir==="pos"?pairs.sort((x,y)=>y.v-x.v).slice(0,6):pairs.sort((x,y)=>x.v-y.v).slice(0,6);
  }

  // Stats — based on visible (selected) assets only
  const validCorrs=[];
  for(let i=0;i<vis.length;i++)for(let j=i+1;j<vis.length;j++){
    const v=corr[`${vis[i].symbol}-${vis[j].symbol}`];
    if(v!==null&&v!==undefined&&isFinite(v)&&vis[i].symbol!==vis[j].symbol)validCorrs.push(v);
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
    <>
    <div className={`app${mounted?" on":""}`} style={{visibility:showLoading?"hidden":"visible"}}>
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
            {[["matrix","Matrix"],["charts","Charts"],["corr","Correlation"],["leadlag","Lead-Lag"],["entropy","Entropy"],["docs","Docs"]].map(([k,l])=>(
              <button key={k} onClick={()=>setActiveTab(k)} style={{background:activeTab===k?"rgba(139,92,246,0.35)":"transparent",border:"none",borderRadius:4,padding:"4px 12px",fontFamily:"inherit",fontSize:11,fontWeight:600,color:activeTab===k?"#e2d9f3":"rgba(139,92,246,0.5)",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {/* Coin picker — always visible in header */}
          <div ref={pickerRef} style={{position:"relative",marginRight:6}}>
            <button onClick={()=>setPickerOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:5,background:(selectedCoins&&selectedCoins.size<ASSETS.length)?"rgba(124,58,237,0.22)":"rgba(255,255,255,0.05)",border:`1px solid ${(selectedCoins&&selectedCoins.size<ASSETS.length)?"rgba(124,58,237,0.5)":"rgba(255,255,255,0.1)"}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",color:(selectedCoins&&selectedCoins.size<ASSETS.length)?"#c4b5fd":"rgba(255,255,255,0.5)",fontFamily:"inherit",fontSize:11,fontWeight:600,letterSpacing:".04em",transition:"all .15s"}}>
              <span style={{fontSize:13}}>⊞</span>
              {(!selectedCoins||selectedCoins.size===0||selectedCoins.size>=ASSETS.length)?`All ${ASSETS.length}`:`${selectedCoins.size} / ${ASSETS.length}`}
              <span style={{fontSize:9,opacity:.7,marginLeft:1}}>{pickerOpen?"▲":"▼"}</span>
            </button>
            {pickerOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,zIndex:9999,background:"#0f0b1e",border:"1px solid rgba(124,58,237,0.35)",borderRadius:10,padding:"14px",minWidth:320,maxHeight:"70vh",overflowY:"auto",boxShadow:"0 12px 48px rgba(0,0,0,0.85)",backdropFilter:"blur(16px)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,paddingBottom:10,borderBottom:"1px solid rgba(124,58,237,0.2)"}}>
                  <span style={{color:"#e2d9f3",fontSize:12,fontWeight:700,letterSpacing:".08em"}}>SELECT COINS</span>
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>setSelectedCoins(new Set(DEFAULT_COINS))} style={{background:"rgba(124,58,237,0.18)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:4,padding:"3px 9px",cursor:"pointer",color:"#c4b5fd",fontSize:10,fontFamily:"inherit",fontWeight:600}}>Default</button>
                    <button onClick={()=>setSelectedCoins(new Set(ASSETS.map(a=>a.symbol)))} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:4,padding:"3px 9px",cursor:"pointer",color:"rgba(255,255,255,0.55)",fontSize:10,fontFamily:"inherit",fontWeight:600}}>All</button>
                    <button onClick={()=>setSelectedCoins(new Set())} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,padding:"3px 9px",cursor:"pointer",color:"rgba(255,255,255,0.35)",fontSize:10,fontFamily:"inherit",fontWeight:600}}>None</button>
                  </div>
                </div>
                {["crypto","fx","commodity","equity","index"].map(cat=>{
                  const catAssets=ASSETS.filter(a=>a.category===cat);
                  if(!catAssets.length)return null;
                  const allOn=catAssets.every(a=>!selectedCoins||selectedCoins.size===0||selectedCoins.has(a.symbol));
                  return(
                    <div key={cat} style={{marginBottom:10}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5,paddingBottom:4,borderBottom:"1px solid rgba(124,58,237,0.15)"}}>
                        <span style={{color:"rgba(124,58,237,0.7)",fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase"}}>
                          {cat==="fx"?"FX Pairs":cat==="commodity"?"Commodities":cat==="equity"?"Equities":cat==="index"?"Indices":"Crypto"}
                        </span>
                        <button onClick={()=>{
                          const syms=catAssets.map(a=>a.symbol);
                          const cur=selectedCoins&&selectedCoins.size>0?new Set(selectedCoins):new Set(ASSETS.map(a=>a.symbol));
                          const allSel=syms.every(s=>cur.has(s));
                          const next=new Set(cur);
                          if(allSel) syms.forEach(s=>next.delete(s)); else syms.forEach(s=>next.add(s));
                          setSelectedCoins(next.size>=ASSETS.length?new Set(ASSETS.map(a=>a.symbol)):next);
                        }} style={{background:"transparent",border:"none",cursor:"pointer",color:"rgba(124,58,237,0.6)",fontSize:9,fontFamily:"inherit",textDecoration:"underline",padding:0}}>
                          {allOn?"deselect all":"select all"}
                        </button>
                      </div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {catAssets.map(a=>{
                          const on=!selectedCoins||selectedCoins.size===0||selectedCoins.has(a.symbol);
                          return(
                            <button key={a.symbol} onClick={()=>{
                              const cur=selectedCoins&&selectedCoins.size>0?new Set(selectedCoins):new Set(ASSETS.map(a=>a.symbol));
                              const next=new Set(cur);
                              if(on) next.delete(a.symbol); else next.add(a.symbol);
                              setSelectedCoins(next);
                            }} style={{display:"flex",alignItems:"center",gap:4,background:on?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.04)",border:`1px solid ${on?"rgba(124,58,237,0.4)":"rgba(255,255,255,0.08)"}`,borderRadius:5,padding:"3px 8px",cursor:"pointer",color:on?a.color:"rgba(255,255,255,0.3)",fontFamily:"inherit",fontSize:11,fontWeight:700,transition:"all .12s"}}>
                              {on&&<span style={{color:"rgba(124,58,237,0.8)",fontSize:9}}>✓</span>}
                              {a.symbol}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className={`pill ${status}`}><span className="dot"/>{status==="live"?"LIVE":"DEMO"}</div>
          <div className="tick-badge">#{tickCount}</div>
        </div>
      </header>

      {/* ══ FILTER BAR ══════════════════════════════════════════════════ */}
      <div className="fbar" style={{display:activeTab==="charts"||activeTab==="corr"||activeTab==="leadlag"||activeTab==="entropy"||activeTab==="docs"?"none":"flex"}}>
        {["all","crypto","fx","commodity","equity","index"].map(c=>{
          const base=c==="all"?ASSETS:ASSETS.filter(a=>a.category===c);
          const cnt=(!selectedCoins||selectedCoins.size===0)?base.length:base.filter(a=>selectedCoins.has(a.symbol)).length;
          return(
            <button key={c} className={`fbtn${filter===c?" a":""}`} onClick={()=>setFilter(c)}>
              {c==="all"?"All Assets":c==="fx"?"FX Pairs":c==="commodity"?"Commodities":c==="index"?"Indices":c==="equity"?"Equity":"Crypto"}
              <span className="fbtn-count">{cnt}</span>
            </button>
          );
        })}
        <div className="fbar-right">
          <div className="sort-wrap">
            <span className="sort-label">Sort:</span>
            {[
              {k:"default",    t:"Default"},
              {k:"price_desc", t:"Price ↓"},
              {k:"price_asc",  t:"Price ↑"},
              {k:"corr_desc",  t:"Corr ↓"},
              {k:"corr_asc",   t:"Corr ↑"},
            ].map(({k,t})=>(
              <button key={k} className={`sbtn${sortBy===k?" a":""}`} onClick={()=>setSortBy(k)}>{t}</button>
            ))}
          </div>
          <div className="window-badge">⏱ 200-tick · 3s</div>
        </div>
      </div>

      <main className="main" style={{display:activeTab==="charts"||activeTab==="corr"||activeTab==="entropy"||activeTab==="docs"?"none":"block"}}>
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
              sortedVis.map((_,i)=><TickerSkeleton key={i}/>)
            ):sortedVis.map((asset,i)=>{
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
            <div className="hmwrap" onMouseLeave={()=>setHmTooltip(null)}>
              <table className="hm">
                <thead>
                  <tr>
                    <th className="hm-corner"><span className="hm-corner-txt">↓ row vs col →</span></th>
                    {vis.map(a=>{
                      const base=a.symbol.split("/")[0];
                      const quote=a.symbol.includes("/")?"/"+a.symbol.split("/")[1]:null;
                      return(
                        <th key={a.symbol} className="hm-cl">
                          <div className="hm-cl-inner" style={{color:a.color}}>
                            <div className="hm-cl-sym">{base}<span style={{opacity:.35,fontWeight:400}}>{quote}</span></div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {vis.map(rA=>(
                    <tr key={rA.symbol}>
                      <td className="hm-rl">
                        <div className="hm-rl-inner">
                          <span className="hm-rl-dot" style={{background:rA.color}}/>
                          <span style={{color:rA.color}}>{rA.symbol.split("/")[0]}</span>
                          {rA.symbol.includes("/")&&<span style={{color:"rgba(255,255,255,0.22)",fontSize:7}}>/{rA.symbol.split("/")[1]}</span>}
                        </div>
                      </td>
                      {vis.map(cB=>{
                        const key=`${rA.symbol}-${cB.symbol}`,val=corr[key]??null;
                        const diag=rA.symbol===cB.symbol;
                        const sel=selected&&((selected.a===rA.symbol&&selected.b===cB.symbol)||(selected.a===cB.symbol&&selected.b===rA.symbol));
                        return(
                          <td key={cB.symbol}
                            onClick={()=>!diag&&setSelected(sel?null:{a:rA.symbol,b:cB.symbol})}
                            onMouseEnter={(e)=>{
                              if(diag) return;
                              const r=e.currentTarget.getBoundingClientRect();
                              const flip=r.right+200>window.innerWidth;
                              setHmTooltip({x:flip?r.left-208:r.right+8, y:r.top+r.height/2-52, symA:rA.symbol,symB:cB.symbol,val});
                            }}
                            onMouseLeave={()=>setHmTooltip(null)}
                            className={`hm-cell${diag?" diag":""}${sel?" sel":""}`}
                            style={{background:diag?"transparent":corrBg(val),color:diag?"#2a1f40":corrFg(val),position:"relative"}}>
                            {diag?<span className="diag-sym" style={{color:rA.color}}>{rA.symbol.split("/")[0]}</span>:
                             val!==null?val.toFixed(2):"…"}
                            {!diag&&val!==null&&(
                              <button className="hm-share-btn" title="Share on X" onClick={(e)=>{e.stopPropagation();handleShareCorr(rA,cB,val);}}>
                                <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── HEATMAP TOOLTIP ───────────────────────────────────── */}
            {hmTooltip&&(()=>{
              const si=strengthInfo(hmTooltip.val);
              const lbl=corrTipLabel(hmTooltip.val);
              return(
                <div className="hm-tooltip" style={{left:hmTooltip.x,top:hmTooltip.y}}>
                  <div className="hm-tt-pair">{hmTooltip.symA} <span style={{opacity:.4}}>/</span> {hmTooltip.symB}</div>
                  <div className="hm-tt-val" style={{color:si.color}}>
                    {hmTooltip.val!==null?hmTooltip.val.toFixed(3):"–"}
                  </div>
                  <div className="hm-tt-lbl" style={{color:si.color}}>{lbl}</div>
                </div>
              );
            })()}
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

        {/* ══ CORRELATION EXPLANATION ════════════════════════════════════ */}
        <section className="sec" id="sec-corr-explain">
          <div className="ce-grid">
            {[
              {
                val:"+1.0", color:"#10b981", bg:"rgba(16,185,129,0.07)", border:"rgba(16,185,129,0.22)",
                title:"Move Together",
                desc:"Both assets rise and fall in sync. A portfolio of two such assets offers no diversification benefit.",
                lines:[
                  {d:"M0,32 C12,26 24,16 36,10 S52,6 60,3", color:"#10b981", w:1.8, dash:""},
                  {d:"M0,34 C12,28 24,18 36,12 S52,8 60,5", color:"rgba(255,255,255,0.35)", w:1.4, dash:"4 2"},
                ],
              },
              {
                val:"0.0", color:"#a78bfa", bg:"rgba(124,58,237,0.07)", border:"rgba(124,58,237,0.22)",
                title:"No Relationship",
                desc:"Assets move independently of each other. Combining uncorrelated assets reduces overall portfolio risk.",
                lines:[
                  {d:"M0,20 C10,8 20,30 30,18 S46,10 60,22",  color:"#a78bfa", w:1.8, dash:""},
                  {d:"M0,18 C12,30 22,10 32,24 S48,28 60,14", color:"rgba(255,255,255,0.35)", w:1.4, dash:"4 2"},
                ],
              },
              {
                val:"−1.0", color:"#ef4444", bg:"rgba(239,68,68,0.07)", border:"rgba(239,68,68,0.22)",
                title:"Move Opposite",
                desc:"When one asset rises, the other falls. A perfect hedge — rare to find in real markets.",
                lines:[
                  {d:"M0,33 C15,26 30,18 45,10 L60,3",  color:"#ef4444", w:1.8, dash:""},
                  {d:"M0,3  C15,10 30,18 45,26 L60,33", color:"rgba(255,255,255,0.35)", w:1.4, dash:"4 2"},
                ],
              },
            ].map(({val,color,bg,border,title,desc,lines})=>(
              <div key={val} className="ce-card" style={{"--cc":color,"--cbg":bg,"--cbr":border}}>
                <div className="ce-top">
                  <div className="ce-val">{val}</div>
                  <svg className="ce-chart" viewBox="0 0 60 36" fill="none">
                    {lines.map((l,i)=>(
                      <path key={i} d={l.d} stroke={l.color} strokeWidth={l.w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={l.dash||undefined}/>
                    ))}
                  </svg>
                </div>
                <div className="ce-title">{title}</div>
                <div className="ce-desc">{desc}</div>
              </div>
            ))}
          </div>
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

      {activeTab==="charts"&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#070512",zIndex:200,display:"flex",flexDirection:"column",fontFamily:"'Space Mono',monospace",animation:"fadein .22s ease"}}>
        <ChartView assets={ASSETS} prices={prices} chartAsset={chartAsset} setChartAsset={setChartAsset} chartTf={chartTf} setChartTf={setChartTf} chartType={chartType} setChartType={setChartType} chartHist={chartHist} setChartHist={setChartHist} setActiveTab={setActiveTab} status={status} histRef={histRef}/>
      </div>}

      {activeTab==="corr"&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#07050f",zIndex:200,display:"flex",flexDirection:"column",animation:"fadein .22s ease"}}>
        <CorrView histRef={histRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status}/>
      </div>}
      {activeTab==="leadlag"&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#07050f",zIndex:200,display:"flex",flexDirection:"column",animation:"fadein .22s ease"}}>
        <LeadLagView histRef={histRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status}/>
      </div>}

      <div className={activeTab==="entropy"?"tab-overlay-enter":""} style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"#07050f",zIndex:200,display:activeTab==="entropy"?"flex":"none",flexDirection:"column"}}>
        <EntropyView histRef={histRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status} liveRun={entropyLiveRun} setLiveRun={setEntropyLiveRun} corrAlertEnabled={corrAlertEnabled} setCorrAlertEnabled={setCorrAlertEnabled} corrAlertPair={corrAlertPair} setCorrAlertPair={setCorrAlertPair} corrAlertThreshold={corrAlertThreshold} setCorrAlertThreshold={setCorrAlertThreshold} corrAlertHit={corrAlertHit} corrAlertOptions={corrAlertOptions}/>
      </div>

      {activeTab==="docs" && <div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",animation:"fadein .22s ease"}}>
        <DocsView setActiveTab={setActiveTab}/>
      </div>}

      {/* ══ LANDING ═════════════════════════════════════════════════════ */}
      {showLanding&&(
        <div className={`landing-ov${landingExiting?" landing-ov-out":""}`}>
          <div className="landing-inner">
            <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
              <PythLogo size={64}/>
            </div>
            <div className="hero-badge">
              <span className="dot" style={{color:"#a78bfa"}}/> Live · Pyth Oracle
            </div>
            <h1 className="hero-title">
              Real-Time Crypto Correlation<br/>
              <span className="hero-title-hi">Powered by Pyth Oracle Data</span>
            </h1>
            <p className="hero-sub">Explore how crypto assets move together using live market data.</p>
            <div className="hero-btns">
              <button className="hero-btn-p" onClick={()=>goFromLanding("matrix")}>Start analysis</button>
              <button className="hero-btn-s" onClick={()=>goFromLanding("corr")}>View correlation heatmap</button>
            </div>
          </div>
        </div>
      )}



      {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
      <footer className="foot">
        <div className="foot-l">
          <PythLogo size={18}/>
          <span>Powered by <a href="https://pyth.network" target="_blank" rel="noreferrer" className="fl">Pyth Network</a></span>
          <span className="foot-sep">·</span>
          <span style={{color:"rgba(255,255,255,0.35)"}}>© 2025 rustrell. All rights reserved.</span>
          <span className="foot-sep">·</span>
          <a href="mailto:stytunnik@gmail.com" style={{color:"rgba(255,255,255,0.3)",textDecoration:"none",fontSize:11}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>stytunnik@gmail.com</a>
          <span className="foot-sep">·</span>
          <a href="https://x.com/xzolmoney" target="_blank" rel="noreferrer" style={{color:"rgba(255,255,255,0.3)",textDecoration:"none",fontSize:11}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>𝕏 @xzolmoney</a>
          <span className="foot-sep">·</span>
          <button onClick={()=>setActiveTab("docs")} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:11,fontFamily:"inherit",padding:0}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.25)"}>Docs & Legal</button>
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

        /* ── LOADING SCREEN ─────────────────────────────────────────── */
        /* ── LOADING SCREEN ─────────────────────────────────────────── */
        .loading-ov {
          position: fixed; inset: 0; z-index: 9999;
          background: #06030f;
          animation: loading-fade-in .3s ease forwards;
          overflow: hidden;
        }
        .loading-canvas {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
        }
        .loading-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 100%; gap: 20px;
        }
        .loading-logo {
          width: 64px; height: 64px;
          border-radius: 16px;
          object-fit: contain;
          filter: drop-shadow(0 0 18px rgba(124,58,237,0.7));
          animation: logo-pulse 2s ease-in-out infinite;
        }
        @keyframes logo-pulse {
          0%,100% { filter: drop-shadow(0 0 14px rgba(124,58,237,0.6)); transform: scale(1); }
          50%      { filter: drop-shadow(0 0 28px rgba(167,139,250,0.9)); transform: scale(1.04); }
        }
        .loading-brand {
          font-family: 'Space Mono', monospace;
          font-size: 13px; font-weight: 700;
          letter-spacing: .18em;
          margin-top: -6px;
        }
        .loading-brand-pyth { color: #a78bfa; }
        .loading-brand-sep  { color: rgba(255,255,255,0.2); }
        .loading-brand-rs   { color: rgba(255,255,255,0.45); }
        @keyframes loading-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .loading-spinner {
          width: 36px; height: 36px;
          border: 2px solid rgba(167,139,250,0.1);
          border-top-color: #a78bfa;
          border-right-color: rgba(167,139,250,0.35);
          border-radius: 50%;
          animation: spin .85s cubic-bezier(.4,0,.6,1) infinite;
          filter: drop-shadow(0 0 6px rgba(167,139,250,0.5));
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: .2em;
          color: rgba(196,181,253,0.5);
          text-transform: uppercase;
          animation: text-appear .4s cubic-bezier(.4,0,.2,1) forwards;
        }
        @keyframes text-appear {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .loading-bar-wrap {
          position: relative;
          width: 200px; height: 2px;
          border-radius: 2px; overflow: hidden;
        }
        .loading-bar-bg {
          position: absolute; inset: 0;
          background: rgba(139,92,246,0.08);
        }
        .loading-bar-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd);
          border-radius: 2px;
          transition: width .5s cubic-bezier(.4,0,.2,1);
          box-shadow: 0 0 10px rgba(167,139,250,0.7);
        }

        :root {
          --bg: #060410;
          --bg2: #0a0718;
          --card: rgba(255,255,255,0.028);
          --cb: rgba(139,92,246,0.14);
          --cb2: rgba(139,92,246,0.07);
          --pu: #8b5cf6; --pul: #a78bfa; --pud: rgba(139,92,246,0.22);
          --tx: #e2d9f3; --td: #a090c8; --tm: #6b5c8a; --txx: #f0eaff;
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
        .x-share-btn { display: flex; align-items: center; gap: 5px; padding: 5px 11px; background: rgba(0,0,0,0.45); border: 1px solid rgba(139,92,246,0.35); border-radius: 20px; color: rgba(200,190,230,0.8); font-size: 10px; font-weight: 600; font-family: inherit; letter-spacing: .06em; cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
        .x-share-btn:hover { background: rgba(139,92,246,0.2); border-color: rgba(139,92,246,0.7); color: #e2d9f3; }

        /* FILTER BAR */
        .fbar { display: flex; align-items: center; gap: 5px; padding: 8px 24px; border-bottom: 1px solid var(--cb2); background: rgba(6,4,16,.7); overflow-x: auto; scrollbar-width: none; position: relative; z-index: 1; }
        .fbar::-webkit-scrollbar { display: none; }
        .fbtn { display: flex; align-items: center; gap: 6px; flex-shrink: 0; padding: 5px 12px; border-radius: 20px; border: 1px solid var(--tm); background: transparent; color: var(--td); font-size: 10px; font-family: var(--fm); cursor: pointer; transition: all .15s; white-space: nowrap; }
        .fbtn:hover { border-color: var(--pud); color: var(--pul); }
        .fbtn.a { background: var(--pud); border-color: var(--pu); color: #fff; }
        .fbtn-count { background: rgba(255,255,255,0.1); border-radius: 10px; padding: 1px 6px; font-size: 8px; }
        .fbar-right { margin-left: auto; flex-shrink: 0; display: flex; align-items: center; gap: 8px; }
        .sort-wrap { display: flex; align-items: center; gap: 3px; padding: 0 6px; border-left: 1px solid var(--cb2); }
        .sort-label { font-size: 9px; color: rgba(255,255,255,0.55); letter-spacing: .06em; margin-right: 2px; white-space: nowrap; }
        .sbtn { display: flex; align-items: center; padding: 3px 8px; border-radius: 12px; border: 1px solid var(--cb2); background: transparent; color: rgba(255,255,255,0.6); font-size: 9px; font-family: var(--fm); cursor: pointer; transition: all .15s; white-space: nowrap; letter-spacing: .04em; }
        .sbtn:hover { border-color: var(--pud); color: var(--pul); }
        .sbtn.a { background: rgba(124,58,237,0.2); border-color: var(--pu); color: #c4b5fd; }
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

        /* LANDING OVERLAY */
        .landing-ov { position: fixed; inset: 0; z-index: 500; background: #070512; display: flex; align-items: center; justify-content: center; animation: fadein .5s ease; }
        .landing-ov-out { animation: landing-out .42s ease forwards; }
        .landing-inner { text-align: center; padding: 32px 24px; max-width: 600px; width: 100%; }
        @keyframes landing-out { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-28px) scale(0.97)} }

        /* HERO */
        .hero-section { padding: 36px 8px 28px; text-align: center; position: relative; animation: fup .55s ease both; }
        .hero-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.28); color: rgba(196,181,253,0.85); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 18px; }
        .hero-title { font-family: var(--fd); font-size: clamp(20px, 2.6vw, 36px); font-weight: 800; color: #fff; line-height: 1.2; margin: 0 0 14px; letter-spacing: -.025em; }
        .hero-title-hi { background: linear-gradient(125deg, #a78bfa 0%, #67e8f9 50%, #34d399 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-sub { font-size: 13px; color: rgba(255,255,255,0.62); margin: 0 auto 26px; max-width: 420px; line-height: 1.6; font-family: var(--fm); }
        .hero-btns { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .hero-btn-p { padding: 11px 26px; border-radius: 8px; background: linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%); border: 1px solid rgba(139,92,246,0.5); color: #fff; font-size: 12px; font-weight: 700; font-family: var(--fm); cursor: pointer; letter-spacing: .05em; transition: all .18s; box-shadow: 0 4px 18px rgba(124,58,237,0.35); }
        .hero-btn-p:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }
        .hero-btn-s { padding: 11px 26px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; font-family: var(--fm); cursor: pointer; letter-spacing: .04em; transition: all .18s; }
        .hero-btn-s:hover { border-color: rgba(124,58,237,0.5); color: #c4b5fd; transform: translateY(-2px); background: rgba(124,58,237,0.08); }

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
        .tc-badge.index { background: rgba(56,189,248,.12); color: #38bdf8; }
        .tc-price-row { display: flex; align-items: baseline; justify-content: space-between; gap: 4px; }
        .tc-price { font-family: var(--fd); font-size: 15px; font-weight: 700; color: var(--txx); font-variant-numeric: tabular-nums; transition: color 0.35s ease; }
        .tc-pct { font-size: 10px; font-weight: 700; padding: 2px 5px; border-radius: 4px; transition: color 0.3s ease, background 0.3s ease; }
        .tc-pct.up { color: var(--gn); background: rgba(52,211,153,.1); }
        .tc-pct.dn { color: var(--rd); background: rgba(248,113,113,.1); }
        .tc-spark-row { display: flex; align-items: center; justify-content: space-between; }
        .tc-pct24 { font-size: 8px; transition: color 0.35s ease; }
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
        .hm-corner { width: 72px; vertical-align: middle; padding-bottom: 0; }
        .hm-corner-txt { font-size: 7px; color: var(--tm); display: block; text-align: right; }
        .hm-cl { padding: 2px 3px 8px; min-width: 64px; vertical-align: bottom; }
        .hm-cl-inner { display: flex; flex-direction: row; align-items: flex-end; justify-content: center; min-height: 22px; }
        .hm-cl-sym { font-size: 8px; font-weight: 700; letter-spacing: .03em; white-space: nowrap; text-align: center; }
        .hm-rl { padding-right: 6px; white-space: nowrap; }
        .hm-rl-inner { display: flex; align-items: center; gap: 5px; }
        .hm-rl-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .hm-cell { min-width: 44px; height: 40px; text-align: center; vertical-align: middle; font-size: 8px; font-weight: 700; border-radius: 5px; cursor: pointer; transition: filter .18s, transform .18s, background 0.55s ease, color 0.35s ease; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
        .hm-cell:not(.diag):hover { filter: brightness(1.35); transform: scale(1.10); z-index: 3; position: relative; box-shadow: 0 4px 16px rgba(0,0,0,0.5); }
        .hm-cell.diag { cursor: default; background: rgba(139,92,246,.04) !important; border: 1px solid rgba(139,92,246,.15); }
        .hm-cell.sel { outline: 2px solid rgba(255,255,255,.8); outline-offset: -1px; }
        /* HEATMAP SHARE BUTTON */
        .hm-share-btn { position: absolute; top: 3px; right: 3px; width: 16px; height: 16px; background: rgba(0,0,0,0.5); border: none; border-radius: 4px; color: rgba(255,255,255,0.9); font-size: 7px; cursor: pointer; opacity: 0; transition: opacity .15s, background .15s; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; pointer-events: auto; }
        .hm-cell:not(.diag):hover .hm-share-btn { opacity: 1; }
        .hm-share-btn:hover { background: rgba(124,58,237,0.7) !important; opacity: 1 !important; }
        /* HEATMAP TOOLTIP */
        .hm-tooltip { position: fixed; pointer-events: none; z-index: 999; background: rgba(7,5,15,0.97); border: 1px solid rgba(124,58,237,0.35); border-radius: 10px; padding: 11px 14px; min-width: 170px; box-shadow: 0 8px 36px rgba(0,0,0,0.65); backdrop-filter: blur(16px); animation: fadein .1s ease; }
        .hm-tt-pair { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.75); margin-bottom: 6px; letter-spacing: -.01em; }
        .hm-tt-val { font-size: 28px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.03em; line-height: 1; margin-bottom: 5px; }
        .hm-tt-lbl { font-size: 9px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
        .diag-sym { font-size: 8px; font-weight: 700; color: var(--td); }
        .xbtn { background: transparent; border: 1px solid var(--tm); color: var(--td); padding: 4px 10px; border-radius: 5px; cursor: pointer; font-size: 10px; font-family: var(--fm); transition: all .2s; white-space: nowrap; }
        .xbtn:hover { border-color: var(--pud); color: var(--pul); }
        .chart-back-btn { position: relative; overflow: hidden; isolation: isolate; }
        .chart-back-btn::before {
          content: "";
          position: absolute;
          inset: -1px;
          background: linear-gradient(115deg, transparent 0%, rgba(124,58,237,0.0) 18%, rgba(124,58,237,0.3) 38%, rgba(59,130,246,0.35) 50%, rgba(16,185,129,0.22) 62%, rgba(124,58,237,0.0) 82%, transparent 100%);
          transform: translateX(-140%);
          opacity: 0;
          transition: opacity .18s ease;
          z-index: -1;
        }
        .chart-back-btn:hover::before {
          opacity: 1;
          animation: chartBackWave 1.05s ease forwards;
        }
        @keyframes chartBackWave {
          0% { transform: translateX(-140%); }
          100% { transform: translateX(140%); }
        }

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
        /* CORRELATION EXPLANATION */
        .ce-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
        .ce-card { background: var(--cbg,rgba(124,58,237,0.06)); border: 1px solid var(--cbr,rgba(124,58,237,0.18)); border-top: 2px solid var(--cc,#a78bfa); border-radius: var(--r); padding: 16px 18px; animation: fup .45s ease both; }
        .ce-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; gap: 8px; }
        .ce-val { font-family: var(--fd); font-size: 30px; font-weight: 800; color: var(--cc); font-variant-numeric: tabular-nums; letter-spacing: -.03em; line-height: 1; flex-shrink: 0; }
        .ce-chart { width: 80px; height: 44px; flex-shrink: 0; overflow: visible; }
        .ce-title { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.88); margin-bottom: 5px; }
        .ce-desc { font-size: 10px; color: rgba(255,255,255,0.38); line-height: 1.6; }
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
        @keyframes tabIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .tab-overlay-enter { animation: tabIn .22s ease both; }
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
          .hm-cl { min-width: 56px; }
          .hm-cl-inner { min-height: 28px; }
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

      {showLoading&&(
        <div className="loading-ov">
          <LoadingCanvas/>
          <div className="loading-content">
            <img src="/pyth-logo.png" alt="Pyth" className="loading-logo"/>
            <div className="loading-brand">
              <span className="loading-brand-pyth">PYTH</span>
              <span className="loading-brand-sep"> × </span>
              <span className="loading-brand-rs">rustrell</span>
            </div>
            <div className="loading-spinner"/>
            <div key={loadingPhase} className="loading-text">{LOADING_PHRASES[loadingPhase]}</div>
            <div className="loading-bar-wrap">
              <div className="loading-bar-bg"/>
              <div className="loading-bar-fill" style={{width:`${((loadingPhase+1)/LOADING_PHRASES.length)*100}%`}}/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── CHART VIEW ─────────────────────────────────────────────────────────── */
const TF_LIST = ["1m","5m","15m","1h","4h","1d"];
const TF_SECS = {"1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1d":86400};

// Pyth Benchmarks symbol map — covers ALL assets (crypto + forex + metals + stocks)
const PYTH_SYM = {
  "BTC":     "Crypto.BTC/USD",
  "ETH":     "Crypto.ETH/USD",
  "SOL":     "Crypto.SOL/USD",
  "DOGE":    "Crypto.DOGE/USD",
  "USDC":    "Crypto.USDC/USD",
  "XAU/USD": "Metal.XAU/USD",
  "EUR/USD": "FX.EUR/USD",
  "GBP/USD": "FX.GBP/USD",
  "WTI":     "Commodities.USOILSPOT",
  "AAPL":    "Equity.US.AAPL/USD",
  "SPY":     "Equity.US.SPY/USD",
  "QQQ":     "Equity.US.QQQ/USD",
  "DIA":     "Equity.US.DIA/USD",
  "IWM":     "Equity.US.IWM/USD",
  "AVAX":    "Crypto.AVAX/USD",
  "ADA":     "Crypto.ADA/USD",
  "LINK":    "Crypto.LINK/USD",
  "UNI":     "Crypto.UNI/USD",
  "LTC":     "Crypto.LTC/USD",
  "DOT":     "Crypto.DOT/USD",
  "TRX":     "Crypto.TRX/USD",
  "APT":     "Crypto.APT/USD",
  "SUI":     "Crypto.SUI/USD",
  "PEPE":    "Crypto.PEPE/USD",
  "NEAR":    "Crypto.NEAR/USD",
  "ATOM":    "Crypto.ATOM/USD",
  "POL":     "Crypto.POL/USD",
  "HYPE":    "Crypto.HYPE/USD",
};

// Pyth Benchmarks resolution map (TradingView-compatible)
const PYTH_RES = {"1m":"1","5m":"5","15m":"15","1h":"60","4h":"240","1d":"D"};

// Fetch OHLCV from Pyth Benchmarks API
// Returns [{t,o,h,l,c,v,tfs}] same shape as Binance klines
async function fetchPyth(symbol, tf = "1m", countback = 300) {
  const pythSym = PYTH_SYM[symbol];
  if (!pythSym) return [];
  const res  = PYTH_RES[tf] || "1";
  // Pyth Benchmarks caps daily resolution at 365 bars
  const cap  = res === "D" ? Math.min(countback, 365) : countback;
  const now  = Math.floor(Date.now() / 1000);
  const from = now - TF_SECS[tf] * cap;
  const qs = `?symbol=${encodeURIComponent(pythSym)}&resolution=${res}&from=${from}&to=${now}&countback=${cap}`;
  const tryFetch = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };
  try {
    let d;
    try {
      d = await tryFetch(`/api/benchmarks${qs}`);
    } catch {
      d = await tryFetch(`https://benchmarks.pyth.network/v1/shims/tradingview/history${qs}`);
    }
    if (d.s !== "ok" || !d.t?.length) return [];
    const tfs = TF_SECS[tf] || 60;
    return d.t.map((t, i) => ({
      t, tfs,
      o: d.o[i], h: d.h[i], l: d.l[i], c: d.c[i],
      v: d.v?.[i] ?? 0,
    }));
  } catch(e) {
    console.warn("fetchPyth error:", symbol, e.message);
    return [];
  }
}

const CHART_VISIBLE_BARS = 180;
const CHART_FETCH_BARS = 200;
const CHART_RIGHT_PAD_RATIO = 0;
const CHART_MIN_VISIBLE_BARS = 30;
const CHART_MAX_VISIBLE_BARS = 400;
const CHART_OVERSCROLL_BARS = 80;

function drawCandles(canvas, bars, chartType, view = {}) {
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

  // PYTH watermark — logo image + "PYTH" text, shown only after data loads
  {
    const wH = Math.min(H * 0.10, 62);
    const fontSize = wH * 0.88;
    ctx.save();
    ctx.globalAlpha = 0.065;
    ctx.fillStyle = "#fff";
    ctx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
    const textW = ctx.measureText("PYTH").width;
    const iconW = wH;
    const gap   = wH * 0.38;
    const ox = (W - iconW - gap - textW) / 2;
    const oy = H / 2;
    // Logo image
    const img = drawCandles._logoImg;
    if (img?.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, ox, oy - wH / 2, iconW, wH);
    } else if (!drawCandles._logoImg) {
      const i = new Image();
      i.src = "/pyth-logo.png";
      i.onload = () => { drawCandles._logoImg = i; };
      drawCandles._logoImg = i;
    }
    // PYTH text
    ctx.textBaseline = "middle";
    ctx.textAlign    = "left";
    ctx.fillText("PYTH", ox + iconW + gap, oy);
    ctx.restore();
  }

  const PAD = {t:12, r:80, b:32, l:8};
  const PH = (H - PAD.t - PAD.b) * 0.78;
  const VH = (H - PAD.t - PAD.b) * 0.14;
  const CW = W - PAD.l - PAD.r;
  const visibleCount = Math.max(20, Math.min(view.visibleCount || CHART_VISIBLE_BARS, bars.length));
  const maxOffset = Math.max(0, bars.length - visibleCount);
  const overscrollBars = Math.max(0, view.overscrollBars ?? CHART_OVERSCROLL_BARS);
  const panBars = Math.max(0, Math.min(view.offset || 0, maxOffset + overscrollBars));
  const historyOffset = Math.max(0, Math.min(maxOffset, panBars));
  const end = Math.max(visibleCount, bars.length - historyOffset);
  const start = Math.max(0, end - visibleCount);
  const vis = bars.slice(start, end);
  const N = vis.length;
  const overscrollShiftBars = historyOffset - panBars;
  const totalSlots = Math.max(visibleCount, 1);
  const colW = CW / totalSlots;

  const lo = Math.min(...vis.map(b=>b.l));
  const hi = Math.max(...vis.map(b=>b.h));
  const rng = hi - lo || hi * 0.002 || 1;
  const yMin = lo - rng*0.03, yMax = hi + rng*0.06;
  const toY = v => PAD.t + PH * (1 - (v-yMin)/(yMax-yMin));
  const toX = i => PAD.l + (i + 0.5 - overscrollShiftBars) * colW;

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
    const up = vis.length > 1 ? last >= vis[Math.max(0, vis.length - 2)].c : last >= vis[0].o;
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

  if (historyOffset > 0) {
    ctx.fillStyle = "rgba(7,5,15,0.9)";
    ctx.fillRect(PAD.l + 8, PAD.t + 8, 136, 22);
    ctx.strokeStyle = "rgba(124,58,237,0.35)";
    ctx.strokeRect(PAD.l + 8.5, PAD.t + 8.5, 135, 21);
    ctx.fillStyle = "#c4b5fd";
    ctx.font = "10px 'Space Mono',monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${historyOffset} bars back`, PAD.l + 16, PAD.t + 19);
  }

  // ── Watermark: Pyth logo + "PythNetwork" text ───────────────────────────
}


function ChartView({assets, prices, chartAsset, setChartAsset, chartTf, setChartTf, chartType, setChartType, chartHist, setChartHist, setActiveTab, status, histRef}) {
  const canvasRef = useRef();
  const corrCanvasRef = useRef();
  const barsRef   = useRef([]);
  const dragRef   = useRef({ active:false, pointerId:null, startX:0, startOffset:0 });
  const [viewOffset, setViewOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomBars, setZoomBars] = useState(CHART_VISIBLE_BARS);
  const [crosshairActive, setCrosshairActive] = useState(false);
  const [crosshairX, setCrosshairX] = useState(null);
  const [showCorrHelp, setShowCorrHelp] = useState(false);
  const [corrHeight, setCorrHeight] = useState(176);
  const [corrInfoHovered, setCorrInfoHovered] = useState(false);
  const corrResizeRef = useRef({ active:false, startY:0, startH:0 });
  const visibleBars = zoomBars;
  const benchmarkSymbol = ({
    "BTC":"ETH","ETH":"BTC","SOL":"BTC","DOGE":"BTC","USDC":"BTC",
    "EUR/USD":"GBP/USD","GBP/USD":"EUR/USD",
    "XAU/USD":"WTI","WTI":"XAU/USD",
    "AAPL":"SPY",
    "SPY":"QQQ","QQQ":"SPY","DIA":"SPY","IWM":"SPY",
  })[chartAsset] ?? "BTC";
  const renderChart = useCallback(() => {
    if (!canvasRef.current) return;
    drawCandles(canvasRef.current, barsRef.current, chartType, { offset:viewOffset, visibleCount:visibleBars, overscrollBars:CHART_OVERSCROLL_BARS });
  }, [chartType, viewOffset, visibleBars]);
  const renderCorrChart = useCallback(() => {
    if (!corrCanvasRef.current) return;
    const benchmarkBars = (chartHist[benchmarkSymbol] || {})[chartTf] || [];
    drawRollingCorrTimeline(corrCanvasRef.current, barsRef.current, benchmarkBars, { offset:viewOffset, visibleCount:visibleBars, overscrollBars:CHART_OVERSCROLL_BARS });
  }, [benchmarkSymbol, chartHist, chartTf, viewOffset, visibleBars]);

  // Prefetch BTC + ETH on mount for all timeframes — warms cache for benchmark and most-viewed assets
  useEffect(()=>{
    let dead = false;
    const warmTfs = ["1m","5m","15m","1h","4h","1d"];
    warmTfs.forEach(tf=>{
      ["BTC","ETH"].forEach(sym=>{
        if((chartHist[sym]||{})[tf]?.length) return;
        fetchPyth(sym, tf, CHART_FETCH_BARS).then(candles=>{
          if(dead||!candles?.length) return;
          setChartHist(p=>({...p,[sym]:{...(p[sym]||{}),[tf]:candles}}));
        });
      });
    });
    return ()=>{dead=true;};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // Fetch history from Pyth Benchmarks (all assets: crypto + metals + forex + stocks)
  useEffect(()=>{
    let dead = false;
    setViewOffset(0);
    setZoomBars(CHART_VISIBLE_BARS);
    // Load main + benchmark in parallel — skip if already cached
    const fetches = [];
    if (!((chartHist[chartAsset]||{})[chartTf]?.length)) {
      fetches.push(
        fetchPyth(chartAsset, chartTf, CHART_FETCH_BARS).then(candles => {
          if (dead||!candles?.length) return;
          setChartHist(p=>({...p,[chartAsset]:{...(p[chartAsset]||{}),[chartTf]:candles}}));
        })
      );
    }
    if (!((chartHist[benchmarkSymbol]||{})[chartTf]?.length)) {
      fetches.push(
        fetchPyth(benchmarkSymbol, chartTf, CHART_FETCH_BARS).then(candles => {
          if (dead||!candles?.length) return;
          setChartHist(p=>({...p,[benchmarkSymbol]:{...(p[benchmarkSymbol]||{}),[chartTf]:candles}}));
        })
      );
    }
    // Prefetch remaining timeframes for current asset in background
    TF_LIST.forEach(tf=>{
      if(tf===chartTf) return;
      if((chartHist[chartAsset]||{})[tf]?.length) return;
      fetchPyth(chartAsset, tf, CHART_FETCH_BARS).then(candles=>{
        if(dead||!candles?.length) return;
        setChartHist(p=>({...p,[chartAsset]:{...(p[chartAsset]||{}),[tf]:candles}}));
      });
    });
    return ()=>{dead=true;};
  },[chartAsset, chartTf, benchmarkSymbol]);

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
    const maxOffset = Math.max(0, copy.length - visibleBars);
    const minOffset = 0;
    const maxPanOffset = maxOffset + CHART_OVERSCROLL_BARS;
    if (viewOffset < minOffset || viewOffset > maxPanOffset) {
      setViewOffset(Math.max(minOffset, Math.min(viewOffset, maxPanOffset)));
      return;
    }
    renderChart();
    renderCorrChart();
  },[chartHist, chartAsset, chartTf, prices, visibleBars, viewOffset, renderChart, renderCorrChart]);

  // 1s redraw
  useEffect(()=>{
    const iv = setInterval(()=>{
      renderChart();
      renderCorrChart();
    }, 1000);
    return ()=>clearInterval(iv);
  },[renderChart, renderCorrChart]);

  // Resize
  useEffect(()=>{
    const c = canvasRef.current; if (!c) return;
    const ro = new ResizeObserver(()=>{
      renderChart();
      renderCorrChart();
    });
    if (c.parentElement) ro.observe(c.parentElement);
    if (corrCanvasRef.current?.parentElement) ro.observe(corrCanvasRef.current.parentElement);
    return ()=>ro.disconnect();
  },[renderChart, renderCorrChart]);

  useEffect(()=>{
    renderChart();
    renderCorrChart();
  },[renderChart, renderCorrChart]);

  const stopDragging = useCallback((e) => {
    if (dragRef.current.pointerId != null && e?.currentTarget?.hasPointerCapture?.(dragRef.current.pointerId)) {
      e.currentTarget.releasePointerCapture(dragRef.current.pointerId);
    }
    dragRef.current = { active:false, pointerId:null, startX:0, startOffset:0 };
    setIsDragging(false);
  }, []);

  const updateCrosshair = useCallback((e) => {
    if (!crosshairActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setCrosshairX(e.clientX - rect.left);
  }, [crosshairActive]);

  const clearCrosshair = useCallback(() => {
    setCrosshairActive(false);
    setCrosshairX(null);
  }, []);

  const onChartPointerDown = useCallback((e) => {
    if ((e.pointerType === "mouse" && e.button !== 0) || barsRef.current.length <= visibleBars) return;
    setCrosshairActive(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setCrosshairX(e.clientX - rect.left);
    dragRef.current = { active:true, pointerId:e.pointerId, startX:e.clientX, startOffset:viewOffset };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, [viewOffset, visibleBars]);

  const onChartPointerMove = useCallback((e) => {
    if (!dragRef.current.active) return;
    const bars = barsRef.current;
    const maxOffset = Math.max(0, bars.length - visibleBars);
    const minOffset = 0;
    const maxPanOffset = maxOffset + CHART_OVERSCROLL_BARS;
    if (maxOffset <= 0) return;
    const plotWidth = Math.max(120, (canvasRef.current?.parentElement?.clientWidth || 0) - 88);
    const pxPerBar = plotWidth / visibleBars;
    const deltaBars = Math.round((e.clientX - dragRef.current.startX) / Math.max(pxPerBar, 1));
    const nextOffset = Math.max(minOffset, Math.min(maxPanOffset, dragRef.current.startOffset + deltaBars));
    setViewOffset(prev => prev === nextOffset ? prev : nextOffset);
  }, [visibleBars]);

  const onChartWheel = useCallback((e) => {
    e.preventDefault();
    const bars = barsRef.current;
    if (!bars.length) return;
    const direction = e.deltaY > 0 ? 1 : -1;
    const step = Math.max(8, Math.round(visibleBars * 0.12));
    const nextVisible = Math.max(
      CHART_MIN_VISIBLE_BARS,
      Math.min(CHART_MAX_VISIBLE_BARS, bars.length, visibleBars + direction * step)
    );
    if (nextVisible === visibleBars) return;
    setZoomBars(nextVisible);
    const nextMaxOffset = Math.max(0, bars.length - nextVisible);
    setViewOffset(prev => Math.max(0, Math.min(prev, nextMaxOffset + CHART_OVERSCROLL_BARS)));
  }, [visibleBars]);

  const cur = prices[chartAsset];
  const hist = (chartHist[chartAsset]||{})[chartTf]||[];
  const pct  = hist.length && cur ? (cur-hist[0].o)/hist[0].o*100 : null;
  const fmtP = v => !v?"–":v>=10000?"$"+v.toLocaleString(undefined,{maximumFractionDigits:0}):v>=100?"$"+v.toFixed(2):v>=1?"$"+v.toFixed(4):"$"+v.toFixed(6);
  const asset= assets.find(a=>a.symbol===chartAsset)||assets[0];
  const bars = barsRef.current || [];
  const benchmarkAsset = assets.find(a=>a.symbol===benchmarkSymbol) || assets[0];
  const corrA = histRef?.current?.[chartAsset] || [];
  const corrB = histRef?.current?.[benchmarkSymbol] || [];
  const liveCorr = pearson(corrA.slice(-60), corrB.slice(-60));

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
          <button className="chart-back-btn" onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"6px 15px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,letterSpacing:".05em",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.6)";e.currentTarget.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
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
            <button key={a.symbol} onClick={()=>{setChartAsset(a.symbol);if(a.category!=="crypto"&&(chartTf==="1m"||chartTf==="5m"))setChartTf("15m");}} style={{flexShrink:0,display:"flex",alignItems:"center",gap:6,padding:"0 14px",height:"100%",background:sel?"rgba(124,58,237,0.12)":"transparent",border:"none",borderBottom:sel?"2px solid #7c3aed":"2px solid transparent",cursor:"pointer",transition:"all .15s"}}>
              <span style={{fontSize:11,fontWeight:700,color:sel?"#c4b5fd":"rgba(255,255,255,0.35)",letterSpacing:".03em"}}>{a.symbol}</span>
              {pc!=null&&<span style={{fontSize:9,color:pc>=0?"#10b981":"#ef4444",fontWeight:600}}>{pc>=0?"+":""}{pc.toFixed(2)}%</span>}
            </button>
          );
        })}
      </div>

      {/* ── CONTROLS ROW ────────────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",height:34,padding:"0 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#07050f",flexShrink:0,gap:2}}>
        {/* Timeframes */}
        {TF_LIST.filter(tf=>{
          const cat=assets.find(a=>a.symbol===chartAsset)?.category;
          return cat==="crypto"||(tf!=="1m"&&tf!=="5m");
        }).map(tf=>(
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
        {viewOffset > 0 && (
          <button onClick={()=>setViewOffset(0)} style={{marginLeft:8,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:3,cursor:"pointer",color:"#10b981",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:700,letterSpacing:".04em"}}>
            Latest
          </button>
        )}
        <button onClick={()=>setZoomBars(CHART_VISIBLE_BARS)} style={{marginLeft:8,background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:3,cursor:"pointer",color:"rgba(255,255,255,0.5)",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:700,letterSpacing:".04em"}}>
          Reset Zoom
        </button>
        {/* Stats */}
        <div style={{marginLeft:"auto",display:"flex",gap:16,fontSize:9,letterSpacing:".04em"}}>
          {bars.length>0&&<span style={{color:"rgba(255,255,255,0.25)"}}>H: <span style={{color:"#10b981"}}>{fmtP(Math.max(...bars.map(b=>b.h)))}</span></span>}
          {bars.length>0&&<span style={{color:"rgba(255,255,255,0.25)"}}>L: <span style={{color:"#ef4444"}}>{fmtP(Math.min(...bars.map(b=>b.l)))}</span></span>}
          <span style={{color:"rgba(255,255,255,0.2)"}}>{visibleBars} visible · {bars.length} bars</span>
        </div>
      </div>

      {/* ── CHART AREA ──────────────────────────────────────────────────── */}
      <div style={{flex:1,position:"relative",minHeight:0}}>
        <canvas
          ref={canvasRef}
          onPointerDown={onChartPointerDown}
          onPointerMove={onChartPointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onPointerLeave={(e)=>{ stopDragging(e); clearCrosshair(); }}
          onPointerMoveCapture={updateCrosshair}
          onWheel={onChartWheel}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",cursor:isDragging?"grabbing":"grab",touchAction:"none"}}
        />
        {crosshairActive && crosshairX != null && (
          <div style={{position:"absolute",top:0,bottom:0,left:crosshairX,width:1,background:"rgba(196,181,253,0.45)",pointerEvents:"none",boxShadow:"0 0 0 1px rgba(124,58,237,0.08)"}}/>
        )}
        <div style={{position:"absolute",left:16,bottom:12,padding:"4px 8px",background:"rgba(7,5,15,0.72)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:4,color:"rgba(255,255,255,0.38)",fontSize:9,letterSpacing:".04em",pointerEvents:"none"}}>
          Drag to pan · Wheel to zoom
        </div>

      </div>

      {/* ── RESIZE HANDLE ────────────────────────────────────────────────── */}
      <div
        onPointerDown={(e) => {
          corrResizeRef.current = { active:true, startY:e.clientY, startH:corrHeight };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!corrResizeRef.current.active) return;
          const delta = corrResizeRef.current.startY - e.clientY;
          setCorrHeight(Math.max(60, Math.min(520, corrResizeRef.current.startH + delta)));
        }}
        onPointerUp={(e) => {
          corrResizeRef.current.active = false;
          if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        style={{height:8,flexShrink:0,cursor:"row-resize",display:"flex",alignItems:"center",justifyContent:"center",
          borderTop:"1px solid rgba(255,255,255,0.07)",borderBottom:"1px solid rgba(255,255,255,0.04)",
          background:"rgba(255,255,255,0.02)",userSelect:"none",zIndex:5}}
        onPointerEnter={(e)=>{ e.currentTarget.style.background="rgba(124,58,237,0.18)"; }}
        onPointerLeave={(e)=>{ e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}
      >
        <div style={{width:32,height:2,borderRadius:2,background:"rgba(255,255,255,0.15)"}}/>
      </div>

      {/* ── CORRELATION TIMELINE ─────────────────────────────────────────── */}
      <div style={{height:corrHeight,flexShrink:0,background:"#080614",minHeight:0,position:"relative",overflow:"hidden"}}>
        {/* Canvas — full width, same as main chart → crosshair aligns 1:1 */}
        <canvas ref={corrCanvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>

        {/* ── Info overlay: compact number by default, full panel on hover ── */}
        <div
          onMouseEnter={() => setCorrInfoHovered(true)}
          onMouseLeave={() => setCorrInfoHovered(false)}
          style={{position:"absolute",top:0,left:0,
            background:"rgba(6,4,16,0.82)",
            borderRight:"1px solid rgba(124,58,237,0.20)",
            borderBottom:"1px solid rgba(124,58,237,0.20)",
            borderRadius:"0 0 10px 0",
            backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",
            zIndex:2,cursor:"default",overflow:"hidden",
            transition:"all .18s ease",
          }}
        >
          {/* accent line */}
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,${liveCorr==null?"rgba(196,181,253,0.5)":liveCorr>=0?"#10b981":"#ef4444"} 0%,transparent 100%)`}}/>
          {corrInfoHovered ? (
            /* ── expanded (hover) ── */
            <div style={{padding:"9px 13px 10px"}}>
              <div style={{fontSize:8,fontWeight:700,color:"rgba(196,181,253,0.50)",letterSpacing:".14em",textTransform:"uppercase",marginBottom:3}}>Corr Timeline</div>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.70)",letterSpacing:"-.01em",marginBottom:6}}>
                {chartAsset} <span style={{color:"rgba(255,255,255,0.28)",fontWeight:400}}>vs</span> {benchmarkSymbol}
              </div>
              <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                <span style={{fontSize:26,fontWeight:800,fontVariantNumeric:"tabular-nums",letterSpacing:"-.02em",lineHeight:1,color:liveCorr==null?"rgba(255,255,255,0.20)":liveCorr>=0?"#34d399":"#f87171"}}>
                  {liveCorr==null?"–":liveCorr.toFixed(3)}
                </span>
                {liveCorr!=null&&(
                  <span style={{fontSize:8,fontWeight:700,letterSpacing:".06em",color:Math.abs(liveCorr)>=0.7?"#34d399":Math.abs(liveCorr)>=0.4?"#a78bfa":"rgba(255,255,255,0.30)"}}>
                    {Math.abs(liveCorr)>=0.7?"STRONG":Math.abs(liveCorr)>=0.4?"MODERATE":"WEAK"}
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* ── compact (default) — just the number ── */
            <div style={{padding:"6px 10px 7px"}}>
              <div style={{fontSize:13,fontWeight:800,fontVariantNumeric:"tabular-nums",letterSpacing:"-.01em",lineHeight:1,color:liveCorr==null?"rgba(255,255,255,0.20)":liveCorr>=0?"#34d399":"#f87171"}}>
                {liveCorr==null?"–":liveCorr.toFixed(3)}
              </div>
            </div>
          )}
        </div>

        {/* ── Crosshair — same x as main chart, zero remapping ── */}
        {crosshairActive && crosshairX != null && (
          <div style={{position:"absolute",top:0,bottom:0,left:crosshairX,width:1,background:"rgba(196,181,253,0.45)",pointerEvents:"none",zIndex:3}}/>
        )}
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

function buildRollingCorrelationSeries(primaryBars, secondaryBars, window = 30) {
  if (!primaryBars?.length || !secondaryBars?.length) return [];
  const secondaryMap = new Map(secondaryBars.map(b => [b.t, b.c]));
  const aligned = primaryBars
    .filter(b => secondaryMap.has(b.t))
    .map(b => ({ t: b.t, a: b.c, b: secondaryMap.get(b.t) }));
  if (aligned.length < window + 2) return [];

  const series = [];
  for (let i = window - 1; i < aligned.length; i++) {
    const slice = aligned.slice(i - window + 1, i + 1);
    const value = pearson(slice.map(p => p.a), slice.map(p => p.b));
    if (value !== null) series.push({ t: aligned[i].t, v: value });
  }
  return series;
}

function drawRollingCorrTimeline(canvas, primaryBars, secondaryBars, view = {}) {
  if (!canvas) return;
  const par = canvas.parentElement;
  if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#07050f";
  ctx.fillRect(0, 0, W, H);

  if (!primaryBars?.length || !secondaryBars?.length) {
    ctx.fillStyle = "rgba(124,58,237,0.3)";
    ctx.font = "11px 'Space Mono',monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Loading correlation history...", W / 2, H / 2);
    return;
  }

  const PAD = { t: 14, r: 80, b: 28, l: 8 };
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;
  const visibleCount = Math.max(20, Math.min(view.visibleCount || CHART_VISIBLE_BARS, primaryBars.length));
  const maxOffset = Math.max(0, primaryBars.length - visibleCount);
  const overscrollBars = Math.max(0, view.overscrollBars ?? CHART_OVERSCROLL_BARS);
  const panBars = Math.max(0, Math.min(view.offset || 0, maxOffset + overscrollBars));
  const historyOffset = Math.max(0, Math.min(maxOffset, panBars));
  const end = Math.max(visibleCount, primaryBars.length - historyOffset);
  const start = Math.max(0, end - visibleCount);
  const visibleBars = primaryBars.slice(start, end);
  const overscrollShiftBars = historyOffset - panBars;
  const totalSlots = Math.max(visibleCount, 1);

  const series = buildRollingCorrelationSeries(primaryBars, secondaryBars, 30);
  const valueByTime = new Map(series.map(p => [p.t, p.v]));

  // First pass — collect x/v without y so we can compute auto-range
  const rawPts = visibleBars.map((b, i) => {
    const v = valueByTime.get(b.t);
    if (v == null) return null;
    return { i, x: PAD.l + ((i + 0.5 - overscrollShiftBars) / totalSlots) * CW, v, t: b.t };
  }).filter(Boolean);

  if (rawPts.length < 2) {
    ctx.fillStyle = "rgba(124,58,237,0.3)";
    ctx.font = "11px 'Space Mono',monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Need more aligned bars for correlation", W / 2, H / 2);
    return;
  }

  // Auto-scale: fit visible data with padding, clamped to [-1, 1]
  const vals = rawPts.map(p => p.v);
  const rawMin = Math.min(...vals), rawMax = Math.max(...vals);
  const rangePad = Math.max(0.08, (rawMax - rawMin) * 0.25);
  const rangeMin = Math.max(-1.0, rawMin - rangePad);
  const rangeMax = Math.min( 1.0, rawMax + rangePad);
  const toY = v => PAD.t + CH * (1 - (v - rangeMin) / (rangeMax - rangeMin));

  // Second pass — add y
  const drawn = rawPts.map(p => ({ ...p, y: toY(p.v) }));

  // Grid lines at round values visible within the auto range; labels on RIGHT (PAD.r area)
  [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1].filter(v => v >= rangeMin - 0.02 && v <= rangeMax + 0.02).forEach(v => {
    const y = toY(v);
    ctx.strokeStyle = v === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.setLineDash(v === 0 ? [] : [3, 4]);
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(PAD.l + CW, y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = v === 0 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.20)";
    ctx.font = "8px 'Space Mono',monospace";
    ctx.textAlign = "left"; ctx.textBaseline = "middle";
    ctx.fillText(v === 0 ? "0" : v.toFixed(2), W - PAD.r + 4, y);
  });

  const last = drawn[drawn.length - 1];
  const zeroY = toY(Math.max(rangeMin, Math.min(rangeMax, 0)));
  const grd = ctx.createLinearGradient(0, PAD.t, 0, PAD.t + CH);
  grd.addColorStop(0, last.v >= 0 ? "rgba(16,185,129,0.22)" : "rgba(239,68,68,0.22)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  drawn.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
  ctx.lineTo(drawn[drawn.length - 1].x, zeroY);
  ctx.lineTo(drawn[0].x, zeroY);
  ctx.closePath();
  ctx.fillStyle = grd;
  ctx.fill();

  const lg = ctx.createLinearGradient(PAD.l, 0, PAD.l + CW, 0);
  lg.addColorStop(0, "rgba(124,58,237,0.85)");
  lg.addColorStop(1, last.v >= 0 ? "#10b981" : "#ef4444");
  ctx.strokeStyle = lg;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.beginPath();
  drawn.forEach((p, i) => { i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); });
  ctx.stroke();

  ctx.fillStyle = last.v >= 0 ? "#10b981" : "#ef4444";
  ctx.beginPath();
  ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(W - PAD.r + 2, last.y - 8, PAD.r - 4, 16);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 9px 'Space Mono',monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(last.v.toFixed(3), W - PAD.r + 6, last.y);
}

/* ─── CORRELATION VIEW ───────────────────────────────────────────────────── */
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
// fetchCloses: uses Pyth Benchmarks for ALL assets — no CORS, no Binance dependency
// Returns array of close prices (same interface as before)
async function fetchCloses(sym, tf = "1m", limit = 300) {
  const bars = await fetchPyth(sym, tf, limit);
  return bars.map(b => b.c);
}

const WIN_CFG = {
  "1D":  { tf:"1m",  limit:720,  win:60,  label:"1 Day"   },
  "7D":  { tf:"1h",  limit:168,  win:24,  label:"7 Days"  },
  "30D": { tf:"4h",  limit:180,  win:21,  label:"30 Days" },
  "90D": { tf:"1d",  limit:90,   win:14,  label:"90 Days" },
};

function fmtAxisTime(t, windowKey) {
  if (!t) return "";
  const d = new Date(t * 1000);
  if (windowKey === "1D") return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  if (windowKey === "90D") return d.toLocaleDateString([], {month:"short", year:"2-digit"});
  return d.toLocaleDateString([], {day:"2-digit", month:"short"});
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

/* ── LEAD-LAG MATH ──────────────────────────────────────────────────────── */
const MAX_LAG = { "1D":60, "7D":24, "30D":7, "90D":7 };

function crossCorrAtLag(ra, rb, k) {
  if(k===0) return pearson(ra, rb);
  if(k>0)   return pearson(ra.slice(0,ra.length-k), rb.slice(k));
  return          pearson(ra.slice(-k), rb.slice(0,rb.length+k));
}

function crossCorrFull(ra, rb, maxLag) {
  const out=[];
  for(let k=-maxLag;k<=maxLag;k++){
    const v=crossCorrAtLag(ra,rb,k);
    if(v!==null) out.push({lag:k,corr:v});
  }
  return out;
}

function findLeadLag(symA, symB, ra, rb, maxLag) {
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

function fmtLag(lagBars, windowKey) {
  if(!lagBars) return "sync";
  if(windowKey==="1D")  return `${lagBars}m`;
  if(windowKey==="7D")  return `${lagBars}h`;
  if(windowKey==="30D") return `${lagBars*4}h`;
  if(windowKey==="90D") return lagBars===1?"1d":`${lagBars}d`;
  return `${lagBars}`;
}

function drawXCorr(canvas, pts, symA, symB, windowKey, hoverIdx=null) {
  if(!canvas||!pts||!pts.length) return;
  const par=canvas.parentElement; if(!par) return;
  const W=par.clientWidth||canvas.offsetWidth, H=par.clientHeight||canvas.offsetHeight;
  if(W<10||H<10) return;
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext("2d");
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

  // ── Filled area — green where |r| high, red where |r| low ──
  ctx.beginPath();
  ctx.moveTo(toX(0), zero);
  pts.forEach((p,i)=>ctx.lineTo(toX(i),toY(p.corr)));
  ctx.lineTo(toX(n-1), zero);
  ctx.closePath();
  const fillGrad=ctx.createLinearGradient(0,PAD.t,0,PAD.t+CH);
  fillGrad.addColorStop(0,   "rgba(16,185,129,0.25)");  // |r|=+1 → green
  fillGrad.addColorStop(0.5, "rgba(239,68,68,0.12)");   // |r|=0  → red
  fillGrad.addColorStop(1,   "rgba(16,185,129,0.25)");  // |r|=-1 → green
  ctx.fillStyle=fillGrad; ctx.fill();

  // ── Line colored by |corr|: red(weak) → green(strong) ──
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

  // ── Hover crosshair ──
  if(hoverIdx!==null && hoverIdx>=0 && hoverIdx<pts.length){
    const hp=pts[hoverIdx];
    const hx=toX(hoverIdx), hy=toY(hp.corr);
    // Vertical line
    ctx.strokeStyle="rgba(255,255,255,0.28)"; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    ctx.beginPath(); ctx.moveTo(hx,PAD.t); ctx.lineTo(hx,PAD.t+CH); ctx.stroke();
    ctx.setLineDash([]);
    // Horizontal dashed to y-axis
    ctx.strokeStyle="rgba(255,255,255,0.12)"; ctx.lineWidth=1; ctx.setLineDash([2,4]);
    ctx.beginPath(); ctx.moveTo(PAD.l,hy); ctx.lineTo(hx,hy); ctx.stroke();
    ctx.setLineDash([]);
    // Dot on line
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
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext("2d");
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

  // Subtle fill areas using each asset's own color
  const zeroY=toY(Math.max(lo,Math.min(hi,0)));
  [[nA,colA],[nB,colB]].forEach(([arr,col])=>{
    ctx.beginPath();
    arr.forEach((v,i)=>{ i===0?ctx.moveTo(toX(i),toY(v)):ctx.lineTo(toX(i),toY(v)); });
    ctx.lineTo(toX(N-1),zeroY); ctx.lineTo(toX(0),zeroY); ctx.closePath();
    ctx.fillStyle=hr(col,0.05);
    ctx.fill();
  });

  // Lines — each asset keeps its OWN color so they are always distinguishable
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
    if(barsAgo===0){ ctx.fillText("зараз",toX(i),PAD.t+CH+5); continue; }
    const d=new Date(Date.now()-barsAgo*msPerBar2);
    const lbl=windowKey==="1D"
      ? d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
      : windowKey==="7D"
        ? `${d.getDate()} ${d.toLocaleString([],{month:"short"})} ${d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}`
        : `${d.getDate()} ${d.toLocaleString([],{month:"short"})}`;
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
  canvas.width=W; canvas.height=H;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#07050f"; ctx.fillRect(0,0,W,H);

  if(!allPts||allPts.length<2){
    ctx.fillStyle="rgba(124,58,237,0.3)"; ctx.font="11px 'Space Mono',monospace";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("Accumulating…",W/2,H/2); return;
  }

  // Always draw the full chart — cutoff only moves the playhead indicator
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

  // Playhead — vertical indicator line at curIdx
  const px=toX(curIdx), py=toY(curVal);
  ctx.save();
  ctx.strokeStyle=curCol; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
  ctx.beginPath(); ctx.moveTo(px,PAD.t); ctx.lineTo(px,PAD.t+CH); ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Dot at playhead
  ctx.fillStyle=curCol; ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,0.6)"; ctx.lineWidth=1.5; ctx.stroke();

  // Value badge next to playhead (right side if space, else left)
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

/* ══════════════════════════════════════════════════════════════════════════
   LEAD-LAG VIEW
   ══════════════════════════════════════════════════════════════════════════ */
function LeadLagView({histRef, prices, assets, setActiveTab, status}) {
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
    // For 7D/30D/90D, candles are 1h/4h/1d — mixing 1-min live ticks creates a flat end
    if(llWindow!=="1D") return hist.map(b=>b.c).slice(-500);
    const live=histRef.current[sym]||[];
    return [...hist.map(b=>b.c),...live].slice(-500);
  };

  const cA=getCloses(symA), cB=getCloses(symB);
  const ra=pctReturns(cA), rb=pctReturns(cB);
  const maxLag=MAX_LAG[llWindow]||24;
  const result=symA!==symB&&ra.length>maxLag*2&&rb.length>maxLag*2
    ? findLeadLag(symA,symB,ra,rb,maxLag) : null;

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

  // All N*(N-1)/2 pairs from every visible asset (live data, updates every tick)
  const allPairsRanked = useMemo(()=>{
    const syms=assets.map(a=>a.symbol);
    const rows=[];
    for(let i=0;i<syms.length;i++){
      for(let j=i+1;j<syms.length;j++){
        const a=syms[i], b=syms[j];
        const rra=pctReturns(getCloses(a)), rrb=pctReturns(getCloses(b));
        const ml=Math.min(maxLag, Math.floor(Math.min(rra.length,rrb.length)/3));
        if(ml>=1&&rra.length>ml*2&&rrb.length>ml*2){
          const r=findLeadLag(a,b,rra,rrb,ml);
          if(r) rows.push({a,b,r});
        }
      }
    }
    return rows.sort((x,y)=>Math.abs(y.r.corrAtLag)-Math.abs(x.r.corrAtLag));
  },[assets,llBars,llWindow,tick]); // eslint-disable-line

  const corrCol=v=>v==null?"rgba(255,255,255,0.3)":Math.abs(v)>=0.7?"#10b981":Math.abs(v)>=0.4?"#f59e0b":"rgba(255,255,255,0.35)";
  const aAsset=assets.find(x=>x.symbol===symA)||{color:"#a78bfa",symbol:symA};
  const bAsset=assets.find(x=>x.symbol===symB)||{color:"#7c3aed",symbol:symB};
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
        <span style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>LEAD-LAG DETECTOR</span>
        {/* ── ? tooltip button ── */}
        <div style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
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

      {/* ── Controls: window + pair selectors ── */}
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
        {/* Inline result badge */}
        {result&&result.lagBars>0&&(
          <div style={{marginLeft:8,display:"flex",alignItems:"center",gap:7,padding:"4px 12px",background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.22)",borderRadius:20}}>
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
          <span style={{marginLeft:8,fontSize:9,color:"rgba(255,255,255,0.3)"}}>⟺ move in sync — no lead-lag detected</span>
        )}
      </div>

      {/* ── Main content ── */}
      <div style={{flex:1,display:"flex",minHeight:0,overflow:"hidden"}}>

        {/* Left: stats strip + BIG chart */}
        <div style={{flex:3,display:"flex",flexDirection:"column",minWidth:0,padding:"12px 14px",gap:10}}>

          {/* Stats strip */}
          {result&&result.lagBars>0&&(
            <div style={{display:"flex",alignItems:"center",gap:0,background:"rgba(124,58,237,0.05)",border:"1px solid rgba(124,58,237,0.13)",borderRadius:8,padding:"0",flexShrink:0,overflow:"hidden"}}>
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
                <div style={{fontSize:7,color:"rgba(255,255,255,0.15)",marginTop:2}}>with lag</div>
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

          {/* ── BIG Cross-Correlation Chart ── */}
          <div style={{flex:1,background:"rgba(255,255,255,0.015)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,display:"flex",flexDirection:"column",minHeight:0,overflow:"hidden"}}>
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
                  ? "зараз"
                  : llWindow==="1D"
                    ? barDate.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})
                    : barDate.toLocaleDateString([],{day:"numeric",month:"short"})+(llWindow==="7D"?` ${barDate.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}` :"");
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
        <div style={{width:280,display:"flex",flexDirection:"column",overflowY:"auto",flexShrink:0}}>
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
            const barPct=Math.abs(r.corrAtLag)*100;
            return(
              <div key={`${a}-${b}`} onClick={()=>{setSymA(a);setSymB(b);}}
                style={{padding:"9px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",cursor:"pointer",
                  background:isActive?"rgba(124,58,237,0.1)":"transparent",transition:"background .12s",
                  borderLeft:isActive?"2px solid #7c3aed":"2px solid transparent"}}>
                {/* Leader → Follower + lag badge */}
                <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                  <span style={{fontSize:10,fontWeight:700,color:lA.color}}>{r.leader}</span>
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.25)"}}>→</span>
                  <span style={{fontSize:10,fontWeight:700,color:fA.color}}>{r.follower}</span>
                  <span style={{marginLeft:"auto",fontSize:9,fontWeight:700,color:"#c4b5fd",background:"rgba(124,58,237,0.18)",padding:"1px 7px",borderRadius:8}}>
                    {r.lagBars>0?fmtLag(r.lagBars,llWindow):"sync"}
                  </span>
                </div>
                {/* Correlation strength bar */}
                <div style={{height:4,background:"rgba(255,255,255,0.05)",borderRadius:2,overflow:"hidden",marginBottom:4}}>
                  <div style={{height:"100%",width:`${barPct}%`,background:r.corrAtLag>=0?"#10b981":"#ef4444",borderRadius:2}}/>
                </div>
                {/* Numbers */}
                <div style={{display:"flex",gap:10}}>
                  <span style={{fontSize:8,color:corrCol(r.corrAtLag)}} title="Correlation at the optimal lag">peak r: {r.corrAtLag>=0?"+":""}{r.corrAtLag.toFixed(3)}</span>
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

function CorrView({histRef, prices, assets, setActiveTab, status}) {
  const scatterRef = useRef();
  const rollingRef = useRef();
  const [activePair, setActivePair] = useState(0);
  const [corrWindow, setCorrWindow] = useState("7D");
  const [bars, setBars] = useState({});        // { "7D_BTC": [{t,c}], ... }
  const [loading, setLoading] = useState(false);
  const [playPos, setPlayPos] = useState(1.0); // 0..1
  const [playing, setPlaying] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const playRef = useRef(null);
  const [, tick] = useState(0);

  // Build pairs dynamically from selected assets (filter static CORR_PAIRS to only show available ones, then add any missing pairs from selected assets)
  const dynPairs = useMemo(()=>{
    const syms = new Set(assets.map(a=>a.symbol));
    const valid = CORR_PAIRS.filter(([a,b])=>syms.has(a)&&syms.has(b));
    // if fewer than 3 static pairs match, build pairs from selected assets
    if(valid.length >= 1) return valid;
    const out=[];
    const arr=assets.slice(0,8);
    for(let i=0;i<arr.length;i++) for(let j=i+1;j<arr.length;j++) out.push([arr[i].symbol,arr[j].symbol]);
    return out.slice(0,20);
  },[assets]);

  // Reset activePair when dynPairs changes and current index is out of range
  useEffect(()=>{
    if(activePair >= dynPairs.length) setActivePair(0);
  },[dynPairs, activePair]);

  const [symA, symB] = dynPairs[Math.min(activePair, dynPairs.length-1)] || [assets[0]?.symbol||"BTC", assets[1]?.symbol||"ETH"];

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

  // Merge historical bars with live ticks → {closes, times}
  const getBarData = (sym) => {
    const key=`${corrWindow}_${sym}`;
    const hist=bars[key]||[];
    const liveC=histRef.current[sym]||[];
    const now=Math.floor(Date.now()/1000);
    const liveBars=liveC.slice(-60).map((c,i,a)=>({t:now-(a.length-1-i)*3,c}));
    const merged=[...hist,...liveBars];
    return { closes:merged.map(b=>b.c), times:merged.map(b=>b.t) };
  };

  // Reset playback when pair or window changes
  useEffect(()=>{ setPlayPos(1.0); setPlaying(false); },[activePair,corrWindow]);

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
  },[activePair,bars,corrWindow]); // eslint-disable-line react-hooks/exhaustive-deps

  const {closes:cA,times:tA}=getBarData(symA);
  const {closes:cB}=getBarData(symB);
  const ra=pctReturns(cA),rb=pctReturns(cB);
  const n=Math.min(ra.length,rb.length);
  const winSize=WIN_CFG[corrWindow].win;
  const rpts=rollingPearson(ra,rb,winSize);
  // corrVal at current playPos
  const visIdx=Math.max(0,Math.round(playPos*rpts.length)-1);
  const corrVal=rpts.length>0?rpts[visIdx]:n>=4?pearson(ra.slice(-Math.min(n,60)),rb.slice(-Math.min(n,60))):null;
  // Date range for visible bars
  const dateStart=tA.length>0?new Date(tA[0]*1000):null;
  const dateCutIdx=Math.round(playPos*(tA.length-1));
  const dateEnd=tA.length>0?new Date(tA[dateCutIdx]*1000):null;
  const fmtDate=d=>d?d.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"}):"";
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
          <button className="chart-back-btn" onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"6px 15px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,letterSpacing:".05em",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.6)";e.currentTarget.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
            ← MATRIX
          </button>
        </div>
      </div>

      {/* Pair selector */}
      <div style={{display:"flex",alignItems:"center",height:38,padding:"0 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#080614",flexShrink:0,gap:2,overflowX:"auto",scrollbarWidth:"none"}}>
        {dynPairs.map(([a,b],i)=>{
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
          {/* Rolling chart header */}
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
              {/* Date range badge */}
              {dateStart&&<span style={{fontSize:8,color:"rgba(255,255,255,0.2)",whiteSpace:"nowrap"}}>
                {fmtDate(dateStart)} → {fmtDate(dateEnd)}
              </span>}
              {/* Play / Pause */}
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
            {/* Date/time label shown while scrubbing or when not at end */}
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
                {dateEnd.toLocaleDateString([],{day:"2-digit",month:"short",year:"numeric"})}
                {" · "}
                {dateEnd.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
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

function interpolateValue(a, b, t) {
  return a + (b - a) * t;
}

function interpolateMatrix(prev = [], next = [], t = 1) {
  if (!next.length) return [];
  return next.map((row, i) =>
    row.map((val, j) => interpolateValue(prev[i]?.[j] ?? val, val, t))
  );
}

function interpolateEntropyRanking(prev = [], next = [], t = 1) {
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
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(PAD.l + 1, y - barH / 2 + 1, CW - 2, barH - 2);
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
  ctx.fillText("predictable  ←  entropy of returns  →  chaotic", PAD.l + CW / 2, H - PAD.b + 14);
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
    ctx.strokeStyle = "rgba(124,58,237,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 - 38, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W / 2 - 6, H / 2 - 38);
    ctx.lineTo(W / 2 - 1, H / 2 - 33);
    ctx.lineTo(W / 2 + 8, H / 2 - 44);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.16)";
    ctx.font = "700 12px 'Space Mono',monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No hidden connections right now", W / 2, H / 2 - 10);
    ctx.fillStyle = "rgba(255,255,255,0.09)";
    ctx.font = "9px 'Space Mono',monospace";
    ctx.fillText("Current nonlinear links are already visible in Pearson correlation.", W / 2, H / 2 + 12);
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
function EntropyView({ histRef, prices, assets, setActiveTab, status, liveRun, setLiveRun, corrAlertEnabled, setCorrAlertEnabled, corrAlertPair, setCorrAlertPair, corrAlertThreshold, setCorrAlertThreshold, corrAlertHit, corrAlertOptions }) {
  const barRef     = useRef();
  const heatRef    = useRef();
  const hiddenRef  = useRef();
  const animRef    = useRef({ raf: null, ranking: [], nmi: [], pearson: [] });
  const [entropyData, setEntropyData] = useState(null); // bootstrap results
  const [nmiMatrix,   setNmiMatrix]   = useState([]);
  const [pearsonMat,  setPearsonMat]  = useState([]);
  const [closes,      setCloses]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [seedInfo,    setSeedInfo]    = useState(null);
  const [lastRun,     setLastRun]     = useState(null);
  const [autoRun,     setAutoRun]     = useState(true);
  const [showAlertHelp, setShowAlertHelp] = useState(false);
  const [, tick]                      = useState(0);

  const DEFAULT_ENTROPY = ["BTC","ETH","SOL","XAU/USD","EUR/USD","AAPL","SPY"];
  const [selectedSymbols, setSelectedSymbols] = useState(DEFAULT_ENTROPY);
  const activeAssets = assets.filter(a => selectedSymbols.includes(a.symbol));
  const toggleSymbol = sym => {
    setSelectedSymbols(prev =>
      prev.includes(sym) ? (prev.length > 2 ? prev.filter(s => s !== sym) : prev) : [...prev, sym]
    );
    setEntropyData(null); setNmiMatrix([]); setPearsonMat([]);
  };

  const BINS = 8, N_ITER = 40, SAMPLE = 120;

  // Fetch Binance closes for all assets
  useEffect(() => {
    let dead = false;
    const needed = activeAssets.filter(a => !closes[a.symbol] && PYTH_SYM[a.symbol]);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbols]);

  // Merge Binance + live Pyth ticks
  const getReturns = () => {
    const ret = {};
    for (const a of activeAssets) {
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
    const n = activeAssets.length;
    const nmi  = Array.from({ length: n }, () => new Array(n).fill(0));
    const pears = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) { nmi[i][j] = 1; pears[i][j] = 1; continue; }
        const rA = returns[activeAssets[i].symbol], rB = returns[activeAssets[j].symbol];
        if (!rA || !rB) continue;
        const mi = computeMI(rA, rB, BINS);
        nmi[i][j]  = mi?.nmi ?? 0;
        pears[i][j] = Math.abs(pearson(rA, rB) ?? 0);
      }
    }
    setNmiMatrix(nmi);
    setPearsonMat(pears);
    setLastRun(new Date());
  };

  const drawEntropyScene = useCallback((ranking, nmi, pears) => {
    if (!ranking?.length) return;
    const allH = ranking.filter(d=>d.data).map(d=>d.data.mean);
    const minH = allH.length ? Math.min(...allH) : -6;
    const maxH = allH.length ? Math.max(...allH) + 0.5 : 4;
    drawEntropyBars(barRef.current, ranking, activeAssets, minH, maxH);
    drawNMIHeatmap(heatRef.current, activeAssets, nmi);
    drawHiddenConnections(hiddenRef.current, activeAssets, nmi, pears);
  }, [activeAssets]);

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

  // Animated redraw on data change
  useEffect(() => {
    if (!entropyData) return;
    const prevRanking = animRef.current.ranking?.length ? animRef.current.ranking : entropyData;
    const prevNmi = animRef.current.nmi?.length ? animRef.current.nmi : nmiMatrix;
    const prevPearson = animRef.current.pearson?.length ? animRef.current.pearson : pearsonMat;
    if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);

    const duration = liveRun ? 900 : 320;
    const start = performance.now();

    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const ranking = interpolateEntropyRanking(prevRanking, entropyData, ease);
      const nmi = interpolateMatrix(prevNmi, nmiMatrix, ease);
      const pears = interpolateMatrix(prevPearson, pearsonMat, ease);
      animRef.current.ranking = ranking;
      animRef.current.nmi = nmi;
      animRef.current.pearson = pears;
      drawEntropyScene(ranking, nmi, pears);
      if (t < 1) {
        animRef.current.raf = requestAnimationFrame(frame);
      } else {
        animRef.current.raf = null;
      }
    };

    animRef.current.raf = requestAnimationFrame(frame);
    return () => {
      if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
    };
  }, [entropyData, nmiMatrix, pearsonMat, liveRun, drawEntropyScene]);

  // Resize observers
  useEffect(() => {
    if (!entropyData) return;
    const redraw = () => {
      drawEntropyScene(
        animRef.current.ranking?.length ? animRef.current.ranking : entropyData,
        animRef.current.nmi?.length ? animRef.current.nmi : nmiMatrix,
        animRef.current.pearson?.length ? animRef.current.pearson : pearsonMat
      );
    };
    const obs = [barRef, heatRef, hiddenRef].map(r => {
      const ro = new ResizeObserver(redraw);
      if (r.current?.parentElement) ro.observe(r.current.parentElement);
      return ro;
    });
    return () => obs.forEach(ro => ro.disconnect());
  }, [entropyData, nmiMatrix, pearsonMat, drawEntropyScene]);

  // Live tick
  useEffect(() => {
    const iv = setInterval(() => tick(n => n + 1), 3000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (!liveRun) return;
    runAnalysis();
    const iv = setInterval(() => {
      runAnalysis();
      tick(n => n + 1);
    }, 2500);
    return () => clearInterval(iv);
  }, [liveRun, closes, prices]);

  const returns = getReturns();
  const nAssets = Object.keys(returns).length;
  const mostPredictable = entropyData?.[0] || null;
  const mostChaotic = entropyData?.[entropyData.length - 1] || null;
  const hiddenPairsCount = pearsonMat.length
    ? activeAssets.reduce((count, _, i) => count + activeAssets.slice(i + 1).reduce((rowCount, __, j2) => {
        const j = i + 1 + j2;
        const nmi = nmiMatrix[i]?.[j] ?? 0;
        const r = Math.abs(pearsonMat[i]?.[j] ?? 0);
        return rowCount + (nmi > 0.30 && r < 0.35 ? 1 : 0);
      }, 0), 0)
    : 0;

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
          {liveRun && <span style={{fontSize:9,color:"#10b981",letterSpacing:".08em",animation:"pulse 1s infinite"}}>LIVE MEASURING</span>}
          {lastRun && <span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>ran {lastRun.toLocaleTimeString()}</span>}
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 8px",borderRadius:3,background:status==="live"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)",border:`1px solid ${status==="live"?"rgba(16,185,129,0.25)":"rgba(239,68,68,0.25)"}`}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:status==="live"?"#10b981":"#ef4444",display:"inline-block"}}/>
            <span style={{fontSize:10,fontWeight:700,color:status==="live"?"#10b981":"#ef4444"}}>{status==="live"?"LIVE":"DEMO"}</span>
          </div>
          <button onClick={()=>setLiveRun(v=>!v)} style={{background:liveRun?"rgba(239,68,68,0.18)":"rgba(124,58,237,0.2)",border:`1px solid ${liveRun?"rgba(239,68,68,0.42)":"rgba(124,58,237,0.4)"}`,borderRadius:4,padding:"5px 14px",color:liveRun?"#fca5a5":"#c4b5fd",cursor:"pointer",fontSize:10,fontFamily:"inherit",fontWeight:700,letterSpacing:".08em",transition:"all .18s",boxShadow:liveRun?"0 0 18px rgba(239,68,68,0.18)":"none"}}
            onMouseEnter={e=>{e.currentTarget.style.background=liveRun?"rgba(239,68,68,0.28)":"rgba(124,58,237,0.35)";}}
            onMouseLeave={e=>{e.currentTarget.style.background=liveRun?"rgba(239,68,68,0.18)":"rgba(124,58,237,0.2)";}}>
            {liveRun ? "■ STOP" : "▶ RUN"}
          </button>
          <button className="chart-back-btn" onClick={()=>setActiveTab("matrix")} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:4,padding:"6px 15px",color:"rgba(255,255,255,0.5)",cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:700,letterSpacing:".05em",transition:"all .15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(124,58,237,0.6)";e.currentTarget.style.color="#a78bfa";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.5)";}}>
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
          <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.5)"}}>{nAssets} / {activeAssets.length} ready</span>
        </div>
        <div style={{width:1,height:14,background:"rgba(255,255,255,0.06)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",letterSpacing:".08em"}}>SEED SOURCE</span>
          <span style={{fontSize:10,fontWeight:700,color:"#a78bfa"}}>Pyth price ticks</span>
        </div>
        <div style={{marginLeft:"auto",fontSize:8,color:"rgba(255,255,255,0.18)",letterSpacing:".08em"}}>
          live uncertainty map
        </div>
      </div>

      {/* ── Asset selector ──────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"#07050f",flexShrink:0,overflowX:"auto",scrollbarWidth:"none"}}>
        <span style={{fontSize:8,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",flexShrink:0}}>ASSETS:</span>
        {assets.map(a=>{
          const on = selectedSymbols.includes(a.symbol);
          return (
            <button key={a.symbol} onClick={()=>toggleSymbol(a.symbol)} style={{flexShrink:0,padding:"3px 10px",borderRadius:20,border:`1px solid ${on ? a.color+"66" : "rgba(255,255,255,0.08)"}`,background:on ? a.color+"22" : "transparent",color:on ? a.color : "rgba(255,255,255,0.3)",fontSize:10,fontWeight:700,fontFamily:"inherit",cursor:"pointer",transition:"all .15s",letterSpacing:".03em"}}>
              {a.symbol}
            </button>
          );
        })}
      </div>

      {/* ── Main grid ───────────────────────────────────────────────── */}
      <div style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"#080614",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",position:"relative"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,minWidth:220}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Correlation Stability Alert</span>
          <div
            onMouseEnter={()=>setShowAlertHelp(true)}
            onMouseLeave={()=>setShowAlertHelp(false)}
            style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:"50%",background:"linear-gradient(135deg, rgba(124,58,237,0.95), rgba(59,130,246,0.95))",border:"1px solid rgba(255,255,255,0.24)",color:"#fff",fontSize:10,fontWeight:800,cursor:"help"}}
          >
            i
            {showAlertHelp && (
              <div style={{position:"absolute",top:22,left:-6,width:240,padding:"8px 10px",background:"#0b0917",border:"1px solid rgba(124,58,237,0.35)",borderRadius:6,color:"rgba(255,255,255,0.78)",fontSize:10,lineHeight:1.45,boxShadow:"0 8px 24px rgba(0,0,0,0.35)",zIndex:4}}>
                Turn it on, choose a pair and a minimum |r| level. The alert triggers when recent correlation prints stay tight and strong, which usually means the pair has entered a stable regime.
              </div>
            )}
          </div>
        </div>
        <span style={{fontSize:11,color:corrAlertHit?"#10b981":"rgba(255,255,255,0.42)"}}>
          {corrAlertHit ? "stabilized now" : "waiting for stable correlation regime"}
        </span>
        <select value={corrAlertPair} onChange={e=>setCorrAlertPair(e.target.value)} style={{background:"#0b0917",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#fff",padding:"8px 10px",fontFamily:"inherit",fontSize:11}}>
          {corrAlertOptions.map(opt=><option key={opt.key} value={opt.key}>{opt.label}</option>)}
        </select>
        <select value={corrAlertThreshold} onChange={e=>setCorrAlertThreshold(parseFloat(e.target.value))} style={{background:"#0b0917",border:"1px solid rgba(255,255,255,0.1)",borderRadius:6,color:"#fff",padding:"8px 10px",fontFamily:"inherit",fontSize:11}}>
          {[0.6,0.7,0.8,0.9].map(v=><option key={v} value={v}>|r| ≥ {v.toFixed(1)}</option>)}
        </select>
        <button onClick={()=>setCorrAlertEnabled(v=>!v)} style={{background:corrAlertEnabled?"rgba(16,185,129,0.14)":"rgba(124,58,237,0.18)",border:`1px solid ${corrAlertEnabled?"rgba(16,185,129,0.35)":"rgba(124,58,237,0.35)"}`,borderRadius:6,color:corrAlertEnabled?"#34d399":"#c4b5fd",padding:"8px 12px",fontFamily:"inherit",fontSize:11,fontWeight:700,cursor:"pointer"}}>
          {corrAlertEnabled ? "ALERT ON" : "ENABLE ALERT"}
        </button>
        <div style={{marginLeft:"auto",fontSize:10,color:corrAlertHit?"#10b981":"rgba(255,255,255,0.3)",letterSpacing:".06em"}}>
          {corrAlertEnabled ? (corrAlertHit ? "STABLE CORRELATION DETECTED" : "MONITORING LIVE") : "ALERT DISABLED"}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(0, 1fr))",gap:1,background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)",flexShrink:0}}>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Most Predictable</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:mostPredictable ? (activeAssets.find(a=>a.symbol===mostPredictable.sym)?.color || "#10b981") : "rgba(255,255,255,0.25)"}}>{mostPredictable?.sym || "—"}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>{mostPredictable?.data ? `${mostPredictable.data.mean.toFixed(2)} entropy` : "waiting for sample"}</div>
        </div>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Most Chaotic</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:mostChaotic ? (assets.find(a=>a.symbol===mostChaotic.sym)?.color || "#ef4444") : "rgba(255,255,255,0.25)"}}>{mostChaotic?.sym || "—"}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>{mostChaotic?.data ? `${mostChaotic.data.mean.toFixed(2)} entropy` : "waiting for sample"}</div>
        </div>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Hidden Links</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:hiddenPairsCount ? "#f59e0b" : "rgba(255,255,255,0.25)"}}>{hiddenPairsCount}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>nonlinear pairs correlation misses</div>
        </div>
        <div style={{padding:"12px 16px",background:"#080614"}}>
          <div style={{fontSize:9,color:"rgba(255,255,255,0.28)",letterSpacing:".1em",textTransform:"uppercase"}}>Assets Ready</div>
          <div style={{marginTop:6,fontSize:18,fontWeight:800,color:nAssets >= 2 ? "#c4b5fd" : "rgba(255,255,255,0.25)"}}>{nAssets}/{activeAssets.length}</div>
          <div style={{marginTop:2,fontSize:10,color:"rgba(255,255,255,0.42)"}}>enough history to rank entropy</div>
        </div>
      </div>

      <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 200px",gap:1,minHeight:0,background:"rgba(255,255,255,0.04)"}}>

        {/* Entropy Ranking bar chart */}
        <div style={{display:"flex",flexDirection:"column",background:"#07050f",minHeight:0}}>
          <div style={{padding:"8px 16px 4px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>ENTROPY RANKING — predictability ladder</span>
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
            <span style={{fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:".08em"}}>NMI HEATMAP — hidden structure map</span>
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
            <span style={{fontSize:8,color:"rgba(255,255,255,0.15)"}}>pairs that look weak on Pearson but still move with meaningful nonlinear dependence</span>
          </div>
          <div style={{flex:1,position:"relative",minHeight:0}}>
            <canvas ref={hiddenRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
          </div>
        </div>

      </div>
    </div>

  );
}
