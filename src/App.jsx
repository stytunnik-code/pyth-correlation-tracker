import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import SmokeBackground from "./SmokeBackground";
import { Analytics } from "@vercel/analytics/react";

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
function getHeatmapTooltipPosition(cellRect, wrapRect, scrollLeft = 0, scrollTop = 0){
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
      <div className="docs-body" style={S.body}>
        {/* Sidebar nav */}
        <div className="docs-sidebar" style={S.sidebar}>
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
        <div className="docs-content" style={S.content}>
          {sections[section]}
        </div>
      </div>
    </div>
  );
}



/* ── LOADING CANVAS ─────────────────────────────────────────────────────── */
function LoadingCanvas(){
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
  const hmWrapRef=useRef(null);
  const [initialCorrPair,setInitialCorrPair]=useState(null);
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
    const params = new URLSearchParams(window.location.search);
    const a = params.get("a");
    const b = params.get("b");
    if(!a || !b || a===b) return;
    const hasA = ASSETS.some(asset=>asset.symbol===a);
    const hasB = ASSETS.some(asset=>asset.symbol===b);
    if(!hasA || !hasB) return;
    setInitialCorrPair({a,b});
    setActiveTab("corr");
    setShowLanding(false);
    setLandingExiting(false);
    setShowLoading(false);
  },[]);
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
    const txt=`${assetA.symbol}/${assetB.symbol} correlation: ${corrVal>=0?'+':''}${corrVal.toFixed(2)}\n\nPowered by @PythNetwork`;
    const shareUrl = new URL("/share", window.location.origin);
    shareUrl.searchParams.set("a", assetA.symbol);
    shareUrl.searchParams.set("b", assetB.symbol);
    shareUrl.searchParams.set("v", corrVal.toFixed(3));
    shareUrl.searchParams.set("ca", assetA.color || "#a78bfa");
    shareUrl.searchParams.set("cb", assetB.color || "#67e8f9");
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}&url=${encodeURIComponent(shareUrl.toString())}`,'_blank');
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
          <div className="hdr-nav" style={{display:"flex",gap:2,background:"rgba(0,0,0,0.4)",borderRadius:6,padding:3,marginRight:6}}>
            {[["matrix","Matrix"],["charts","Charts"],["corr","Correlation"],["leadlag","Lead-Lag"],["entropy","Entropy"],["docs","Docs ↗"]].map(([k,l])=>(
              <button key={k} onClick={()=>k==="docs"?window.open("https://pythcorrelation.gitbook.io/pythcorrelation-docs/","_blank"):setActiveTab(k)} style={{background:activeTab===k?"rgba(139,92,246,0.35)":"transparent",border:"none",borderRadius:4,padding:"4px 12px",fontFamily:"inherit",fontSize:11,fontWeight:600,color:activeTab===k?"#e2d9f3":"rgba(139,92,246,0.5)",cursor:"pointer"}}>{l}</button>
            ))}
          </div>
          {/* Coin picker — always visible in header */}
          <div ref={pickerRef} className="hdr-picker" style={{position:"relative",marginRight:6}}>
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

      {/* ══ MOBILE NAV BAR ══════════════════════════════════════════════ */}
      <nav className="mob-nav">
        {[["matrix","Matrix"],["charts","Charts"],["corr","Corr"],["leadlag","Lead-Lag"],["entropy","Entropy"],["docs","Docs"]].map(([k,l])=>(
          <button key={k} className={`mob-nav-btn${activeTab===k?" a":""}`}
            onClick={()=>k==="docs"?window.open("https://pythcorrelation.gitbook.io/pythcorrelation-docs/","_blank"):setActiveTab(k)}>
            {l}
          </button>
        ))}
      </nav>

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

      {/* ══ MOBILE SECTION TABS ════════════════════════════════════════ */}
      <div className="mtabs" style={{display:activeTab!=="matrix"?"none":undefined}}>
        {[["tickers","Tickers"],["heatmap","Heatmap"],["top","Rankings"]].map(([k,l])=>(
          <button key={k} className={`mt${mobileTab===k?" a":""}`} onClick={()=>setMobileTab(k)}>{l}</button>
        ))}
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
                <div key={asset.symbol} className="tc" style={{"--ac":asset.color,"--d":`${i*30}ms`,cursor:"pointer"}}
                  onClick={()=>{setChartAsset(asset.symbol);setActiveTab("charts");}}
                  title={`View ${asset.symbol} chart`}>
                  <div className="tc-head">
                    <AssetIcon asset={asset} size={36}/>
                    <div className="tc-meta">
                      <div className="tc-sym" style={{color:asset.color}}>{asset.symbol}</div>
                      <div className="tc-name">{asset.name}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,color:"rgba(167,139,250,0.45)",opacity:.7}}>📈</span>
                      <div className={`tc-badge ${asset.category}`}>{asset.category}</div>
                    </div>
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
            <div ref={hmWrapRef} className="hmwrap" onMouseLeave={()=>setHmTooltip(null)}>
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
                              const wrap=hmWrapRef.current;
                              if(!wrap) return;
                              const r=e.currentTarget.getBoundingClientRect();
                              const wrapRect=wrap.getBoundingClientRect();
                              const pos=getHeatmapTooltipPosition(r, wrapRect, wrap.scrollLeft, wrap.scrollTop);
                              setHmTooltip({x:pos.x, y:pos.y, symA:rA.symbol,symB:cB.symbol,val});
                            }}
                            onMouseMove={(e)=>{
                              if(diag) return;
                              const wrap=hmWrapRef.current;
                              if(!wrap) return;
                              const r=e.currentTarget.getBoundingClientRect();
                              const wrapRect=wrap.getBoundingClientRect();
                              const pos=getHeatmapTooltipPosition(r, wrapRect, wrap.scrollLeft, wrap.scrollTop);
                              setHmTooltip({x:pos.x, y:pos.y, symA:rA.symbol,symB:cB.symbol,val});
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
        <CorrView histRef={histRef} prices={prices} assets={ASSETS} setActiveTab={setActiveTab} status={status} initialPair={initialCorrPair}/>
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
          <a href="https://x.com/wladwtf" target="_blank" rel="noreferrer" style={{color:"rgba(255,255,255,0.3)",textDecoration:"none",fontSize:11}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>𝕏 @wladwtf</a>
          <span className="foot-sep">·</span>
          <button onClick={()=>window.open("https://pythcorrelation.gitbook.io/pythcorrelation-docs/","_blank")} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:11,fontFamily:"inherit",padding:0}} onMouseEnter={e=>e.target.style.color="#a78bfa"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.25)"}>Docs & Legal ↗</button>
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
        .tc { background: var(--card); border: 1px solid var(--cb2); border-top: 2px solid var(--ac, var(--pu)); border-radius: var(--r); padding: 12px; display: flex; flex-direction: column; gap: 6px; transition: transform .2s, border-color .2s, box-shadow .2s; animation: fup .4s ease both; animation-delay: var(--d,0ms); cursor: pointer; position: relative; overflow: hidden; }
        .tc::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at top left, var(--ac,transparent) 0%, transparent 60%); opacity: 0.04; pointer-events: none; }
        .tc:hover { transform: translateY(-4px); border-color: var(--ac, var(--cb)); box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--ac, rgba(139,92,246,0.3)); }
        .tc:hover::after { content: '📈 CHART'; position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%); color: rgba(255,255,255,0.55); font-size: 8px; font-weight: 700; letter-spacing: .12em; text-align: center; padding: 8px 4px 5px; pointer-events: none; }
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
        .tc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 6px; border-top: 1px solid var(--cb2); padding-top: 7px; margin-top: 2px; }
        .tc-stat { display: flex; flex-direction: column; gap: 1px; }
        .tc-sk { font-size: 9px; color: var(--tm); text-transform: uppercase; letter-spacing: .06em; font-weight: 700; opacity: .6; }
        .tc-sv { font-size: 12px; color: #e2d9f3; font-variant-numeric: tabular-nums; font-weight: 700; letter-spacing: -.01em; line-height: 1.1; }
        .tc-stat:nth-child(1) .tc-sv { color: #34d399; }
        .tc-stat:nth-child(2) .tc-sv { color: #f87171; }
        .tc-stat:nth-child(3) .tc-sv { color: #a78bfa; }
        .tc-stat:nth-child(4) .tc-sv { color: rgba(255,255,255,0.4); font-size: 11px; }

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
        .hmwrap { position: relative; overflow-x: auto; padding: 10px; width: 100%; }
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
        .hm-tooltip { position: absolute; pointer-events: none; z-index: 999; background: rgba(7,5,15,0.97); border: 1px solid rgba(124,58,237,0.35); border-radius: 10px; padding: 11px 14px; min-width: 170px; box-shadow: 0 8px 36px rgba(0,0,0,0.65); backdrop-filter: blur(16px); animation: fadein .1s ease; }
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

        /* MOBILE NAV — hidden on desktop, shown on mobile */
        .mob-nav { display: none; }

        /* ─── RESPONSIVE ──────────────────────────────────────────────── */

        @media(max-width:1024px) {
          .dp-body { grid-template-columns: 1fr; }
          .dp-left { border-right: none; border-bottom: 1px solid var(--cb2); }
          .hdr-stats { display: none; }
          .ce-grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── iPhone 14 / Android (≤768px) ─────────────────────────────── */
        @media(max-width:768px) {

          /* HEADER — single row: logo | picker | pill */
          .hdr { padding: 8px 12px; gap: 8px; }
          .hdr-l    { flex: 1; min-width: 0; }
          .hdr-stats { display: none !important; }
          .hdr-r    { display: flex; align-items: center; gap: 6px; }
          .hdr-upd  { display: none !important; }
          .tick-badge { display: none !important; }
          .hdr-nav  { display: none !important; }

          /* MOBILE NAV BAR — below header, full width, scrollable */
          .mob-nav {
            display: flex;
            overflow-x: auto;
            scrollbar-width: none;
            gap: 2px;
            padding: 4px 10px;
            background: rgba(6,4,16,0.85);
            border-bottom: 1px solid rgba(139,92,246,0.15);
            position: sticky;
            top: 0;
            z-index: 50;
          }
          .mob-nav::-webkit-scrollbar { display: none; }
          .mob-nav-btn {
            flex-shrink: 0;
            background: transparent;
            border: none;
            border-radius: 4px;
            padding: 6px 14px;
            font-family: inherit;
            font-size: 12px;
            font-weight: 600;
            color: rgba(139,92,246,0.55);
            cursor: pointer;
            white-space: nowrap;
            min-height: 32px;
          }
          .mob-nav-btn.a {
            background: rgba(139,92,246,0.3);
            color: #e2d9f3;
          }

          /* FILTER BAR */
          .fbar { padding: 5px 10px; }
          .fbtn { padding: 3px 7px; font-size: 9px; }
          .fbtn-count { display: none; }
          .sort-wrap    { display: none; }
          .window-badge { display: none; }
          .fbar-right   { display: none; }

          /* MAIN */
          .main { padding: 10px 12px; }

          /* TICKERS — 2 columns */
          .tgrid { grid-template-columns: 1fr 1fr; }

          /* RANKINGS */
          .rgrid { grid-template-columns: 1fr; }

          /* HEATMAP */
          .hm-cell { min-width: 32px; height: 32px; font-size: 6.5px; }
          .hm-cl   { min-width: 48px; }
          .hm-cl-inner { min-height: 22px; }

          /* DETAIL PANEL */
          .dp-corr { font-size: 28px; }
          .dp-sym  { font-size: 13px; }

          /* CORRELATION EXPLANATION */
          .ce-grid { grid-template-columns: 1fr; }

          /* FOOTER */
          .foot   { flex-direction: column; align-items: flex-start; padding: 12px 14px; gap: 10px; }
          .foot-r { width: 100%; justify-content: space-between; }

          /* ─── FULL-SCREEN VIEW TOP BARS ────────── */
          .vt-label { display: none !important; }

          /* ─── CHART VIEW ─────────────────────── */
          .chart-topbar {
            height: 40px !important;
            padding: 0 10px !important;
            gap: 8px !important;
          }
          .chart-topbar .chart-back-btn {
            padding: 5px 10px !important;
            font-size: 10px !important;
          }
          .chart-sym-strip {
            height: 28px !important;
          }
          .chart-sym-strip button {
            padding: 0 9px !important;
            font-size: 10px !important;
          }
          .cv-ctrl {
            overflow-x: auto !important;
            scrollbar-width: none !important;
            height: auto !important;
            padding: 3px 6px !important;
          }
          .cv-ctrl::-webkit-scrollbar { display: none; }
          .cv-ctrl button { flex-shrink: 0 !important; min-height: 26px !important; font-size: 9px !important; padding: 2px 7px !important; }
          .cv-ctrl-stats { display: none !important; }
          .chart-resize-hdl { height: 18px !important; }

          /* ─── LEAD-LAG VIEW ──────────────────── */
          .ll-main {
            flex-direction: column !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          .ll-main > div:first-child { flex: none !important; min-height: 260px; }
          .ll-stats-strip {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            scrollbar-width: none !important;
            flex-wrap: nowrap !important;
          }
          .ll-stats-strip::-webkit-scrollbar { display: none; }
          .ll-side {
            width: 100% !important;
            max-height: 220px !important;
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.05) !important;
          }

          /* ─── ENTROPY VIEW ───────────────────── */
          .en-cfg {
            flex-wrap: wrap !important;
            gap: 6px 12px !important;
            padding: 6px 12px !important;
          }
          .en-cfg > div[style*="width:1"] { display: none !important; }
          .en-stats {
            grid-template-columns: 1fr 1fr !important;
          }
          .en-grid {
            grid-template-columns: 1fr !important;
            grid-template-rows: 200px 200px 150px !important;
          }
          .en-grid > div[style*="gridColumn"] { grid-column: 1 !important; }

          /* CORRELATION STATS BAR */
          .corr-stats-bar {
            height: auto !important;
            flex-wrap: wrap !important;
            padding: 8px 12px !important;
            gap: 6px !important;
            row-gap: 4px !important;
          }
          .corr-stats-bar > div { flex-shrink: 0; }

          /* CORRELATION CHARTS — stack vertically on mobile */
          .corr-charts-wrap {
            flex-direction: column !important;
            overflow-y: auto;
          }
          .corr-charts-wrap > div {
            flex: 0 0 auto !important;
            min-height: 200px;
            width: 100% !important;
          }

          /* DOCS VIEW */
          .docs-body    { flex-direction: column !important; }
          .docs-sidebar { width: 100% !important; max-height: 160px !important; border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; flex-shrink: 0 !important; }
          .docs-content { max-width: 100% !important; padding: 20px 16px !important; }

          /* LANDING */
          .landing-inner { padding: 20px 14px; }
          .hero-btns { flex-direction: column; align-items: stretch; gap: 8px; }
          .hero-btn-p, .hero-btn-s { width: 100%; text-align: center; }
        }

        /* ── Very small phones (≤480px) ──────────────────────────────── */
        @media(max-width:480px) {
          .hdr-sub   { display: none; }
          .hdr-brand { font-size: 14px !important; }
        }

        /* ── Tiny screens (≤360px) ────────────────────────────────────── */
        @media(max-width:360px) {
          .tgrid { grid-template-columns: 1fr; }
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
      <Analytics />
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
const PYTH_LOOKBACK_MULTIPLIERS = [1, 4, 12, 30];

// Fetch OHLCV from Pyth Benchmarks API
// Returns [{t,o,h,l,c,v,tfs}] same shape as Binance klines
async function fetchPyth(symbol, tf = "1m", countback = 300) {
  const pythSym = PYTH_SYM[symbol];
  if (!pythSym) return [];
  const res  = PYTH_RES[tf] || "1";
  // Pyth Benchmarks caps daily resolution at 365 bars
  const cap  = res === "D" ? Math.min(countback, 365) : countback;
  const now  = Math.floor(Date.now() / 1000);
  const tryFetch = async (url) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  };
  try {
    const tfs = TF_SECS[tf] || 60;
    const targetBars = Math.min(cap, CHART_VISIBLE_BARS);
    let best = [];

    for (const mult of PYTH_LOOKBACK_MULTIPLIERS) {
      const from = now - tfs * cap * mult;
      const qs = `?symbol=${encodeURIComponent(pythSym)}&resolution=${res}&from=${from}&to=${now}&countback=${cap}`;
      let d;
      try {
        d = await tryFetch(`/api/benchmarks${qs}`);
      } catch {
        d = await tryFetch(`https://benchmarks.pyth.network/v1/shims/tradingview/history${qs}`);
      }
      if (d.s !== "ok" || !d.t?.length) continue;
      const bars = d.t.map((t, i) => ({
        t, tfs,
        o: d.o[i], h: d.h[i], l: d.l[i], c: d.c[i],
        v: d.v?.[i] ?? 0,
      }));
      if (bars.length > best.length) best = bars;
      if (bars.length >= targetBars) return bars.slice(-cap);
    }
    return best.slice(-cap);
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
const CHART_SIDE_PAD = { l: 8, r: 80 };

function getChartViewport(totalBars, view = {}) {
  const visibleCount = Math.max(20, Math.min(view.visibleCount || CHART_VISIBLE_BARS, totalBars));
  const maxOffset = Math.max(0, totalBars - visibleCount);
  const overscrollBars = Math.max(0, view.overscrollBars ?? CHART_OVERSCROLL_BARS);
  const panBars = Math.max(-overscrollBars, Math.min(view.offset || 0, maxOffset));
  const historyOffset = Math.max(0, Math.min(maxOffset, panBars));
  const end = Math.max(visibleCount, totalBars - historyOffset);
  const start = Math.max(0, end - visibleCount);
  const overscrollShiftBars = historyOffset - panBars;
  const totalSlots = Math.max(visibleCount, 1);
  return { visibleCount, maxOffset, start, end, historyOffset, overscrollShiftBars, totalSlots };
}

function getChartHoverBar(x, width, bars, view = {}) {
  if (!bars?.length) return null;
  const plotWidth = width - CHART_SIDE_PAD.l - CHART_SIDE_PAD.r;
  if (plotWidth <= 0) return null;
  const { start, end, overscrollShiftBars, totalSlots } = getChartViewport(bars.length, view);
  const visible = bars.slice(start, end);
  if (!visible.length) return null;
  const rawIndex = ((x - CHART_SIDE_PAD.l) / plotWidth) * totalSlots + overscrollShiftBars - 0.5;
  const idx = Math.max(0, Math.min(visible.length - 1, Math.round(rawIndex)));
  const bar = visible[idx];
  return bar ? { bar, idx, absoluteIndex: start + idx } : null;
}

function drawCandles(canvas, bars, chartType, view = {}) {
  if (!canvas) return;
  const par = canvas.parentElement;
  if (!par) return;
  const W = par.clientWidth, H = par.clientHeight;
  if (W < 10 || H < 10) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

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
    const wH = Math.min(H * 0.065, 40);
    const fontSize = wH * 0.88;
    ctx.save();
    ctx.globalAlpha = 0.032;
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

  const PAD = { t:12, b:32, l:8, r: W < 500 ? 54 : 80 };
  const PH = (H - PAD.t - PAD.b) * 0.78;
  const VH = (H - PAD.t - PAD.b) * 0.14;
  const CW = W - PAD.l - PAD.r;
  const { start, end, historyOffset, overscrollShiftBars, totalSlots } = getChartViewport(bars.length, view);
  const vis = bars.slice(start, end);
  const N = vis.length;
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
  const [zoomBars, setZoomBars] = useState(()=>window.innerWidth<=768?90:CHART_VISIBLE_BARS);
  const [crosshairActive, setCrosshairActive] = useState(false);
  const [crosshairX, setCrosshairX] = useState(null);
  const [crosshairY, setCrosshairY] = useState(null);
  const [hoverBar, setHoverBar] = useState(null);
  const [showCorrHelp, setShowCorrHelp] = useState(false);
  const [corrHeight, setCorrHeight] = useState(()=>window.innerWidth<=768?80:176);
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
    const minOffset = -CHART_OVERSCROLL_BARS;
    const maxPanOffset = maxOffset;
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
    const rect = e.currentTarget.getBoundingClientRect();
    const nextX = e.clientX - rect.left;
    const nextY = e.clientY - rect.top;
    setCrosshairActive(true);
    setCrosshairX(nextX);
    setCrosshairY(nextY);
    setHoverBar(getChartHoverBar(nextX, rect.width, barsRef.current, {
      offset:viewOffset,
      visibleCount:visibleBars,
      overscrollBars:CHART_OVERSCROLL_BARS,
    }));
  }, [viewOffset, visibleBars]);

  const clearCrosshair = useCallback(() => {
    setCrosshairActive(false);
    setCrosshairX(null);
    setCrosshairY(null);
    setHoverBar(null);
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
    const minOffset = -CHART_OVERSCROLL_BARS;
    const maxPanOffset = maxOffset;
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
    setViewOffset(prev => Math.max(-CHART_OVERSCROLL_BARS, Math.min(prev, nextMaxOffset)));
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
  const hoverTime = hoverBar?.bar?.t ? new Date(hoverBar.bar.t * 1000).toLocaleString("en", {
    month:"short",
    day:"numeric",
    hour:"2-digit",
    minute:"2-digit",
    hour12:false,
  }) : null;

  return (
    <div style={{display:"flex",flexDirection:"column",width:"100%",height:"100%",background:"#07050f",fontFamily:"'Space Mono',monospace",position:"relative"}}>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div className="chart-topbar" style={{display:"flex",alignItems:"center",height:48,padding:"0 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",background:"#0b0917",flexShrink:0,gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <PythLogo size={22}/>
          <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
          <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>CHARTS</span>
        </div>
        <div className="vt-label" style={{width:1,height:20,background:"rgba(255,255,255,0.08)"}}/>
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
      <div className="chart-sym-strip" style={{display:"flex",alignItems:"center",height:36,padding:"0 0",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#080614",flexShrink:0,overflowX:"auto",scrollbarWidth:"none"}}>
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
      <div className="cv-ctrl" style={{display:"flex",alignItems:"center",height:34,padding:"0 12px",borderBottom:"1px solid rgba(255,255,255,0.05)",background:"#07050f",flexShrink:0,gap:2}}>
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
        {viewOffset !== 0 && (
          <button onClick={()=>setViewOffset(0)} style={{marginLeft:8,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.25)",borderRadius:3,cursor:"pointer",color:"#10b981",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:700,letterSpacing:".04em"}}>
            Latest
          </button>
        )}
        <button onClick={()=>setZoomBars(CHART_VISIBLE_BARS)} style={{marginLeft:8,background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:3,cursor:"pointer",color:"rgba(255,255,255,0.5)",fontSize:10,padding:"3px 10px",fontFamily:"inherit",fontWeight:700,letterSpacing:".04em"}}>
          Reset Zoom
        </button>
        {/* Stats */}
        <div className="cv-ctrl-stats" style={{marginLeft:"auto",display:"flex",gap:16,fontSize:9,letterSpacing:".04em"}}>
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
        {/* ── Zoom buttons (mobile-friendly) ─────────────────────────── */}
        <div style={{position:"absolute",top:10,right:10,display:"flex",flexDirection:"column",gap:5,zIndex:5}}>
          <button
            onPointerDown={e=>e.stopPropagation()}
            onClick={()=>{
              const b=barsRef.current; if(!b.length) return;
              const step=Math.max(8,Math.round(visibleBars*0.15));
              const next=Math.max(CHART_MIN_VISIBLE_BARS,visibleBars-step);
              setZoomBars(next);
              setViewOffset(prev=>Math.max(-CHART_OVERSCROLL_BARS,Math.min(prev,Math.max(0,b.length-next))));
            }}
            style={{width:34,height:34,borderRadius:6,border:"1px solid rgba(124,58,237,0.3)",background:"rgba(6,4,16,0.82)",color:"#a78bfa",fontSize:20,lineHeight:1,cursor:"pointer",fontFamily:"inherit",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"}}>+</button>
          <button
            onPointerDown={e=>e.stopPropagation()}
            onClick={()=>{
              const b=barsRef.current; if(!b.length) return;
              const step=Math.max(8,Math.round(visibleBars*0.15));
              const next=Math.min(CHART_MAX_VISIBLE_BARS,b.length,visibleBars+step);
              setZoomBars(next);
              setViewOffset(prev=>Math.max(-CHART_OVERSCROLL_BARS,Math.min(prev,Math.max(0,b.length-next))));
            }}
            style={{width:34,height:34,borderRadius:6,border:"1px solid rgba(124,58,237,0.3)",background:"rgba(6,4,16,0.82)",color:"#a78bfa",fontSize:20,lineHeight:1,cursor:"pointer",fontFamily:"inherit",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)"}}>−</button>
        </div>
      </div>

      {/* ── RESIZE HANDLE ────────────────────────────────────────────────── */}
      {hoverBar?.bar && crosshairX != null && crosshairY != null && (()=>{
        const TIP_W = 148, TIP_H = 72, GAP = 14;
        const chartEl = canvasRef.current?.parentElement;
        const areaW = chartEl?.clientWidth || 600;
        const areaH = chartEl?.clientHeight || 400;
        const onRight = crosshairX + GAP + TIP_W > areaW - 10;
        const tipLeft = onRight ? crosshairX - GAP - TIP_W : crosshairX + GAP;
        const tipTop = Math.max(6, Math.min(crosshairY - TIP_H / 2, areaH - TIP_H - 6));
        const isUp = hoverBar.bar.c >= hoverBar.bar.o;
        return (
          <div style={{position:"absolute",left:tipLeft,top:tipTop,width:TIP_W,padding:"7px 10px",background:"rgba(7,5,15,0.94)",border:`1px solid ${isUp?"rgba(16,185,129,0.35)":"rgba(239,68,68,0.35)"}`,borderRadius:6,color:"rgba(255,255,255,0.82)",fontSize:9,lineHeight:1.6,letterSpacing:".03em",pointerEvents:"none",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",zIndex:10}}>
            <div style={{color:"rgba(196,181,253,0.7)",fontSize:8,fontWeight:700,letterSpacing:".07em",marginBottom:3}}>{hoverTime}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px 8px"}}>
              <span style={{color:"rgba(255,255,255,0.38)"}}>O</span><span style={{color:"rgba(255,255,255,0.75)"}}>{fmtP(hoverBar.bar.o)}</span>
              <span style={{color:"rgba(255,255,255,0.38)"}}>H</span><span style={{color:"#10b981"}}>{fmtP(hoverBar.bar.h)}</span>
              <span style={{color:"rgba(255,255,255,0.38)"}}>L</span><span style={{color:"#ef4444"}}>{fmtP(hoverBar.bar.l)}</span>
              <span style={{color:"rgba(255,255,255,0.38)"}}>C</span><span style={{color:"#fff",fontWeight:700}}>{fmtP(hoverBar.bar.c)}</span>
            </div>
          </div>
        );
      })()}
      <div
        className="chart-resize-hdl"
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
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
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
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
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
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
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

  const PAD = { t: 14, b: 28, ...CHART_SIDE_PAD };
  const CW = W - PAD.l - PAD.r;
  const CH = H - PAD.t - PAD.b;
  const { start, end, overscrollShiftBars, totalSlots } = getChartViewport(primaryBars.length, view);
  const visibleBars = primaryBars.slice(start, end);

  const series = buildRollingCorrelationSeries(primaryBars, secondaryBars, 30);
  const valueByTime = new Map(series.map(p => [p.t, p.v]));

  // First pass — collect x/v without y so we can compute auto-range
  const rawPts = visibleBars.map((b, i) => {
    const v = valueByTime.get(b.t);
    if (v == null) return null;
    return { i, x: PAD.l + ((i + 0.5 - overscrollShiftBars) / totalSlots) * CW, v, t: b.t };
  }).filter(Boolean);

  // Simulate a soft continuation to the viewport edges so the correlation chart
  // stays anchored without creating a visibly flat artificial line.
  if (rawPts.length >= 1) {
    const first = rawPts[0];
    const last = rawPts[rawPts.length - 1];
    if (first.i > 0) {
      const leftSeed = rawPts[Math.min(1, rawPts.length - 1)] || first;
      const missing = first.i;
      const simPts = [];
      const delta = leftSeed.v - first.v;
      for (let i = 0; i < missing; i++) {
        const progress = missing <= 1 ? 1 : i / (missing - 1);
        const ease = Math.pow(progress, 1.35);
        const swing = Math.sin((i + 1) * 0.72 + first.t * 0.00013);
        const swing2 = Math.cos((i + 1) * 0.31 + first.t * 0.00007);
        const base = first.v - delta * (1 - ease) * 0.42;
        const wiggle = (swing * 0.11 + swing2 * 0.05) * (Math.abs(delta) + 0.08) * (0.35 + (1 - ease) * 0.65);
        simPts.push({
          ...first,
          i,
          x: PAD.l + ((i + 0.5 - overscrollShiftBars) / totalSlots) * CW,
          v: Math.max(-1, Math.min(1, base + wiggle)),
        });
      }
      rawPts.unshift(...simPts);
    }
    if (last.i < visibleBars.length - 1) {
      const rightSeed = rawPts[Math.max(0, rawPts.length - 2)] || last;
      const edgeIndex = visibleBars.length - 1;
      const missing = edgeIndex - last.i;
      const delta = last.v - rightSeed.v;
      for (let step = 1; step <= missing; step++) {
        const i = last.i + step;
        const progress = missing <= 1 ? 1 : step / missing;
        const ease = Math.pow(progress, 1.25);
        const swing = Math.sin((i + 1) * 0.68 + last.t * 0.00012);
        const swing2 = Math.cos((i + 1) * 0.28 + last.t * 0.00008);
        const base = last.v + delta * ease * 0.28;
        const wiggle = (swing * 0.09 + swing2 * 0.04) * (Math.abs(delta) + 0.06) * (0.3 + (1 - ease) * 0.5);
        rawPts.push({
          ...last,
          i,
          x: PAD.l + ((i + 0.5 - overscrollShiftBars) / totalSlots) * CW,
          v: Math.max(-1, Math.min(1, base + wiggle)),
        });
      }
    }
  }

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
  const firstDrawn = drawn[0];
  const lastDrawn = drawn[drawn.length - 1];

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
  ctx.lineTo(lastDrawn.x, zeroY);
  ctx.lineTo(firstDrawn.x, zeroY);
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

  if (firstDrawn.x > PAD.l + 1) {
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(PAD.l, zeroY);
    ctx.lineTo(firstDrawn.x, zeroY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
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
  if (windowKey === "1D") return d.toLocaleTimeString("en", {hour:"2-digit", minute:"2-digit"});
  if (windowKey === "90D") return d.toLocaleDateString("en", {month:"short", year:"2-digit"});
  return d.toLocaleDateString("en", {day:"2-digit", month:"short"});
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
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>LEAD-LAG DETECTOR</span>
        {/* ── ? tooltip button ── */}
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

function CorrView({histRef, prices, assets, setActiveTab, status, initialPair}) {
  const scatterRef = useRef();
  const rollingRef = useRef();
  const [symA, setSymA] = useState(()=>assets[0]?.symbol||"BTC");
  const [symB, setSymB] = useState(()=>assets[1]?.symbol||"ETH");
  const [corrWindow, setCorrWindow] = useState("7D");
  const [bars, setBars] = useState({});        // { "7D_BTC": [{t,c}], ... }
  const [loading, setLoading] = useState(false);
  const [playPos, setPlayPos] = useState(1.0); // 0..1
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

  // Build pairs dynamically from selected assets (filter static CORR_PAIRS to only show available ones, then add any missing pairs from selected assets)
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
  // corrVal at current playPos
  const visIdx=Math.max(0,Math.round(playPos*rpts.length)-1);
  const corrVal=rpts.length>0?rpts[visIdx]:n>=4?pearson(ra.slice(-Math.min(n,60)),rb.slice(-Math.min(n,60))):null;
  // Date range for visible bars
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
        {/* Dropdowns row */}
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
        {/* Quick select row */}
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
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
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
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
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
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
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
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"#7c3aed",letterSpacing:".06em"}}>PYTH</span>
        <span className="vt-label" style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.25)"}}>ENTROPY</span>
        <div className="vt-label" style={{height:16,width:1,background:"rgba(255,255,255,0.08)"}}/>
        {seedInfo && (
          <div className="vt-label" style={{display:"flex",alignItems:"center",gap:6,padding:"2px 8px",borderRadius:3,background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)"}}>
            <span style={{fontSize:8,color:"rgba(167,139,250,0.6)",letterSpacing:".08em"}}>SEED</span>
            <span style={{fontSize:10,fontWeight:700,color:"#c4b5fd",letterSpacing:".04em"}}>0x{seedInfo.hex}</span>
            <span style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>Pyth live</span>
          </div>
        )}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8}}>
          {loading && <span className="vt-label" style={{fontSize:9,color:"rgba(124,58,237,0.6)",letterSpacing:".06em",animation:"pulse 1s infinite"}}>LOADING DATA…</span>}
          {liveRun && <span className="vt-label" style={{fontSize:9,color:"#10b981",letterSpacing:".08em",animation:"pulse 1s infinite"}}>LIVE MEASURING</span>}
          {lastRun && <span className="vt-label" style={{fontSize:8,color:"rgba(255,255,255,0.2)"}}>ran {lastRun.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>}
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
      <div className="en-cfg" style={{display:"flex",alignItems:"center",gap:20,padding:"6px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"#080614",flexShrink:0}}>
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

      <div className="en-stats" style={{display:"grid",gridTemplateColumns:"repeat(4, minmax(0, 1fr))",gap:1,background:"rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)",flexShrink:0}}>
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

      <div className="en-grid" style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gridTemplateRows:"1fr 200px",gap:1,minHeight:0,background:"rgba(255,255,255,0.04)"}}>

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
