export function getTickAgeSec(lastTs, nowSec = Math.floor(Date.now() / 1000)) {
  if (!Number.isFinite(lastTs) || !Number.isFinite(nowSec)) return null;
  return Math.max(0, nowSec - lastTs);
}

export function isStaleTick(lastTs, maxAgeSec = 15, nowSec = Math.floor(Date.now() / 1000)) {
  const age = getTickAgeSec(lastTs, nowSec);
  return age == null ? true : age > maxAgeSec;
}

export function hasMonotonicTimestamps(ticks = []) {
  let prev = -Infinity;
  for (const tick of ticks) {
    const ts = Number(tick?.t);
    if (!Number.isFinite(ts)) continue;
    if (ts < prev) return false;
    prev = ts;
  }
  return true;
}

export function getTimestampSkewSec(seriesA = [], seriesB = []) {
  const ta = Number(seriesA[seriesA.length - 1]?.t);
  const tb = Number(seriesB[seriesB.length - 1]?.t);
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return null;
  return Math.abs(ta - tb);
}

export function computeRelativeDivergence(livePrice, benchmarkClose) {
  const live = Number(livePrice);
  const bench = Number(benchmarkClose);
  if (!Number.isFinite(live) || !Number.isFinite(bench) || bench === 0) return null;
  return Math.abs(live - bench) / Math.abs(bench);
}

export function summarizeLiveDataHealth({
  tickSeries = [],
  compareSeries = [],
  livePrice = null,
  benchmarkClose = null,
  nowSec = Math.floor(Date.now() / 1000),
  staleAfterSec = 15,
  maxSkewSec = 6,
  maxDivergence = 0.02,
} = {}) {
  const lastTs = Number(tickSeries[tickSeries.length - 1]?.t);
  const ageSec = getTickAgeSec(lastTs, nowSec);
  const stale = isStaleTick(lastTs, staleAfterSec, nowSec);
  const monotonic = hasMonotonicTimestamps(tickSeries);
  const skewSec = getTimestampSkewSec(tickSeries, compareSeries);
  const divergence = computeRelativeDivergence(livePrice, benchmarkClose);

  const issues = [];
  if (!monotonic) issues.push("non_monotonic_ticks");
  if (stale) issues.push("stale_tick");
  if (skewSec != null && skewSec > maxSkewSec) issues.push("timestamp_skew");
  if (divergence != null && divergence > maxDivergence) issues.push("live_benchmark_divergence");

  return {
    ok: issues.length === 0,
    issues,
    ageSec,
    skewSec,
    divergence,
    monotonic,
    stale,
  };
}
