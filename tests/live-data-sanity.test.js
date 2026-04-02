import test from "node:test";
import assert from "node:assert/strict";

import {
  getTickAgeSec,
  isStaleTick,
  hasMonotonicTimestamps,
  getTimestampSkewSec,
  computeRelativeDivergence,
  summarizeLiveDataHealth,
} from "../src/utils/live-data.js";

test("tick age and stale detection work on normal timestamps", () => {
  assert.equal(getTickAgeSec(100, 112), 12);
  assert.equal(isStaleTick(100, 15, 112), false);
  assert.equal(isStaleTick(100, 10, 112), true);
});

test("monotonic timestamp check catches backward ticks", () => {
  assert.equal(hasMonotonicTimestamps([{ t: 100 }, { t: 101 }, { t: 101 }, { t: 105 }]), true);
  assert.equal(hasMonotonicTimestamps([{ t: 100 }, { t: 99 }, { t: 105 }]), false);
});

test("timestamp skew is measured on latest aligned observations", () => {
  const a = [{ t: 100 }, { t: 106 }];
  const b = [{ t: 101 }, { t: 110 }];
  assert.equal(getTimestampSkewSec(a, b), 4);
  assert.equal(getTimestampSkewSec([], b), null);
});

test("relative divergence is symmetric and guarded", () => {
  assert.equal(computeRelativeDivergence(102, 100), 0.02);
  assert.equal(computeRelativeDivergence(98, 100), 0.02);
  assert.equal(computeRelativeDivergence(100, 0), null);
});

test("live data health summary stays green on healthy feed", () => {
  const health = summarizeLiveDataHealth({
    tickSeries: [{ t: 100 }, { t: 103 }, { t: 106 }],
    compareSeries: [{ t: 101 }, { t: 105 }],
    livePrice: 101.2,
    benchmarkClose: 100,
    nowSec: 110,
    staleAfterSec: 10,
    maxSkewSec: 5,
    maxDivergence: 0.02,
  });
  assert.equal(health.ok, true);
  assert.deepEqual(health.issues, []);
});

test("live data health summary flags stale, skewed, divergent, non-monotonic feeds", () => {
  const health = summarizeLiveDataHealth({
    tickSeries: [{ t: 100 }, { t: 98 }, { t: 101 }],
    compareSeries: [{ t: 120 }],
    livePrice: 110,
    benchmarkClose: 100,
    nowSec: 130,
    staleAfterSec: 15,
    maxSkewSec: 6,
    maxDivergence: 0.05,
  });
  assert.equal(health.ok, false);
  assert.deepEqual(
    health.issues.sort(),
    ["live_benchmark_divergence", "non_monotonic_ticks", "stale_tick", "timestamp_skew"].sort()
  );
});
