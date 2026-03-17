import requests, time, sys

API = "https://pyth-correlation-tracker-3131.vercel.app/api/benchmarks"
KEY = "LuDx8mVlOjBkhmVEjbXoo0tvdEZJWPSeVFK"

PYTH_SYM = {
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
}

PYTH_RES = {"1m":"1","5m":"5","15m":"15","1h":"60","4h":"240","1d":"D"}
TF_ORDER = ["1m","5m","15m","1h","4h","1d"]

now = int(time.time())
FROM_SECS = {"1m":200*60,"5m":200*5*60,"15m":200*15*60,"1h":200*3600,"4h":200*4*3600,"1d":200*86400}

issues = []

for sym, psym in PYTH_SYM.items():
    results = []
    for tf in TF_ORDER:
        res_code = PYTH_RES[tf]
        frm = now - FROM_SECS[tf]
        try:
            r = requests.get(API, params={
                "symbol": psym,
                "resolution": res_code,
                "from": frm,
                "to": now,
            }, headers={"x-api-key": KEY}, timeout=15)
            if r.status_code != 200:
                results.append(f"{tf}=ERR{r.status_code}")
                issues.append(f"  {sym} {tf}: HTTP {r.status_code}")
                continue
            d = r.json()
            s = d.get("s","?")
            n = len(d.get("c") or [])
            if s != "ok" or n == 0:
                results.append(f"{tf}=ERR")
                issues.append(f"  {sym} {tf}: s={s} candles={n}")
            else:
                results.append(f"{tf}=OK{n}")
        except Exception as e:
            results.append(f"{tf}=EXC")
            issues.append(f"  {sym} {tf}: exception {e}")
        time.sleep(0.5)

    print(f"{sym:<10} " + " ".join(results))
    sys.stdout.flush()

print("\n=== ISSUES ===")
for i in issues:
    print(i)
