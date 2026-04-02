# Lead-Lag Analysis

The **Lead-Lag** module identifies which asset in a pair tends to move first and which one tends to follow.

---

## Core Idea

Standard correlation asks:

`Do A and B move together?`

Lead-lag asks:

`Does A at time T help explain B at time T+k?`

The system scans correlations across time shifts, then performs a basic **out-of-sample check** on the discovered lag.

---

## What the View Shows

- leader and follower;
- lag duration;
- peak in-sample correlation;
- zero-lag correlation;
- OOS check on the trained lag;
- ranking of pairs by validated lag strength.

---

## How to Read It

- **Peak at k = 0** means no meaningful lead-lag
- **Strong train peak + confirming OOS check** means a more credible lag
- **Strong train peak + weak OOS check** means the lag is probably unstable or overfit

---

## Why This Changed

In the older version, the best lag was selected and judged on the same sample window.

The current version is stricter:

- train segment finds the lag;
- out-of-sample segment checks whether that lag still holds;
- ranking uses the validated score rather than only the train peak.

---

## Limitations

- lead-lag is regime-dependent;
- very short lags may still reflect oracle timing rather than true market structure;
- the OOS validation is useful, but still lightweight rather than institutional-grade.
