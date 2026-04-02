# What is Pyth Correlation Tracker

## Overview

Pyth Correlation Tracker is an open-access, real-time financial analytics platform built on top of the [Pyth Network](https://pyth.network) oracle stack.

The platform is designed to show not just price, but **relationships**:

- who moves with whom;
- who leads and who follows;
- which return streams are more chaotic;
- where nonlinear structure exists beyond Pearson correlation.

---

## Architecture Overview

```
Pyth Hermes REST polling
        |
        v
Timestamped live tick store
        |
        v
Aligned return pipeline
   |          |            |
   v          v            v
Matrix    Correlation   Entropy
                           |
                           v
                      Lead-Lag
                           |
                           v
                      React UI
```

Historical OHLCV bars come from **Pyth Benchmarks** and are merged with timestamped live ticks where needed.

---

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Canvas API |
| Oracle (live) | Pyth Hermes REST polling |
| Oracle (historical) | Pyth Benchmarks REST |
| Math | Custom Pearson, Gaussian Entropy, adjusted NMI |
| Hosting | Vercel |

---

## Quality Layers

The current version includes:

- quant validation tests;
- synthetic edge-case tests;
- API contract tests;
- live data sanity tests;
- runtime feed diagnostics in the UI.
