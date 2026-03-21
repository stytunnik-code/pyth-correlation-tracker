export const TF_LIST = ["1m","5m","15m","1h","4h","1d"];
export const TF_SECS = {"1m":60,"5m":300,"15m":900,"1h":3600,"4h":14400,"1d":86400};

export const PYTH_SYM = {
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

export const PYTH_RES = {"1m":"1","5m":"5","15m":"15","1h":"60","4h":"240","1d":"D"};
export const PYTH_LOOKBACK_MULTIPLIERS = [1, 4, 12, 30];

export const CHART_VISIBLE_BARS = 250;
export const CHART_FETCH_BARS = 300;
export const CHART_RIGHT_PAD_RATIO = 0;
export const CHART_MIN_VISIBLE_BARS = 30;
export const CHART_MAX_VISIBLE_BARS = 500;
export const CHART_OVERSCROLL_BARS = 80;
export const CHART_SIDE_PAD = { l: 8, r: 80 };

export async function fetchPyth(symbol, tf = "1m", countback = 300) {
  const pythSym = PYTH_SYM[symbol];
  if (!pythSym) return [];
  const res  = PYTH_RES[tf] || "1";
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

export async function fetchCloses(sym, tf = "1m", limit = 300) {
  const bars = await fetchPyth(sym, tf, limit);
  return bars.map(b => b.c);
}
