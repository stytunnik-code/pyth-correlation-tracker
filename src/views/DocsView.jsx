import { useState } from "react";

export default function DocsView({ setActiveTab }) {
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
