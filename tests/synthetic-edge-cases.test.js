import test from "node:test";
import assert from "node:assert/strict";

import { pearson } from "../src/utils/math.js";
import {
  gaussianEntropy,
  computeMI,
  permutationAdjustedMI,
  pctReturns,
  mergeHistoricalBarsWithLiveTicks,
} from "../src/utils/entropy.js";

test("empty and single-point inputs fail soft", () => {
  assert.equal(pearson([], []), null);
  assert.equal(pearson([1], [1]), null);
  assert.equal(gaussianEntropy([]), null);
  assert.equal(gaussianEntropy([1]), null);
  assert.equal(computeMI([], []), null);
  assert.deepEqual(pctReturns([]), []);
  assert.deepEqual(pctReturns([42]), []);
});

test("different length inputs align by trailing overlap", () => {
  const r = pearson([1, 2, 3, 4, 5], [20, 30, 40, 50]);
  assert.equal(r, 1);
});

test("non-finite values are filtered out of pearson and MI", () => {
  const p = pearson([1, 2, NaN, 4, 5, Infinity, 7], [2, 4, 6, 8, 10, 12, 14]);
  assert.equal(p, 1);
  const mi = computeMI(
    Array.from({ length: 30 }, (_, i) => (i === 10 ? NaN : i)),
    Array.from({ length: 30 }, (_, i) => (i === 12 ? Infinity : i * i))
  );
  assert.ok(mi);
  assert.ok(mi.nmi >= 0);
});

test("identical values give zero gaussian entropy and null pearson", () => {
  assert.equal(gaussianEntropy([7, 7, 7, 7, 7]), 0);
  assert.equal(pearson([7, 7, 7, 7], [3, 3, 3, 3]), null);
});

test("permutationAdjustedMI stays bounded on noisy small samples", () => {
  const a = Array.from({ length: 40 }, (_, i) => Math.sin(i / 3) + (i % 3) * 0.01);
  const b = Array.from({ length: 40 }, (_, i) => Math.cos(i / 5) + (i % 5) * 0.02);
  const adj = permutationAdjustedMI(a, b, 6, 1234, 12);
  assert.ok(adj);
  assert.ok(adj.adjNmi >= 0 && adj.adjNmi <= 1);
});

test("mergeHistoricalBarsWithLiveTicks replaces same-bucket last bar and appends new buckets", () => {
  const hist = [
    { t: 1020, c: 10, o: 10, h: 10, l: 10 },
    { t: 1080, c: 11, o: 11, h: 11, l: 11 },
  ];
  const live = [
    { t: 1085, p: 12 },
    { t: 1135, p: 13 },
    { t: 1201, p: 14 },
  ];
  const merged = mergeHistoricalBarsWithLiveTicks(hist, live, 60, 10);
  assert.equal(merged.length, 3);
  assert.equal(merged[1].t, 1080);
  assert.equal(merged[1].c, 13);
  assert.equal(merged[2].t, 1200);
  assert.equal(merged[2].c, 14);
});
