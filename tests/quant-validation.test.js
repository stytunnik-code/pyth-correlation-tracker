import test from "node:test";
import assert from "node:assert/strict";

import { pearson } from "../src/utils/math.js";
import {
  gaussianEntropy,
  computeMI,
  permutationAdjustedMI,
  pctReturns,
  findLeadLag,
  findLeadLagValidated,
} from "../src/utils/entropy.js";

function approxEqual(actual, expected, tolerance = 1e-9) {
  assert.ok(Number.isFinite(actual), `expected finite value, got ${actual}`);
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
}

function makeLCG(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function gaussianNoise(rng, scale = 1) {
  const u1 = Math.max(rng(), 1e-12);
  const u2 = rng();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * scale;
}

test("pearson returns null for degenerate constant series", () => {
  assert.equal(pearson([5, 5, 5, 5], [1, 2, 3, 4]), null);
  assert.equal(pearson([1, 2, 3, 4], [7, 7, 7, 7]), null);
});

test("pearson matches perfect linear correlation", () => {
  approxEqual(pearson([1, 2, 3, 4], [2, 4, 6, 8]), 1);
  approxEqual(pearson([1, 2, 3, 4], [8, 6, 4, 2]), -1);
});

test("pctReturns skips zero and non-finite denominators", () => {
  const out = pctReturns([100, 110, 0, 10, Infinity, 20, 25]);
  assert.deepEqual(out, [10, -100, 25]);
});

test("gaussianEntropy is stable and finite for tiny and large scales", () => {
  const tiny = [-1e-9, 0, 1e-9, 2e-9, -2e-9];
  const huge = tiny.map(v => v * 1e18);
  const hTiny = gaussianEntropy(tiny);
  const hHuge = gaussianEntropy(huge);
  assert.ok(Number.isFinite(hTiny));
  assert.ok(Number.isFinite(hHuge));
  assert.ok(hHuge > hTiny);
});

test("computeMI detects dependence on a nonlinear synthetic relationship", () => {
  const rng = makeLCG(42);
  const x = [];
  const y = [];
  for (let i = 0; i < 400; i++) {
    const v = rng() * 2 - 1;
    x.push(v);
    y.push(v * v + gaussianNoise(rng, 0.03));
  }
  const mi = computeMI(x, y, 8);
  assert.ok(mi);
  assert.ok(mi.nmi > 0.2, `expected nonlinear dependence, got ${mi?.nmi}`);
});

test("permutationAdjustedMI suppresses independent noise", () => {
  const rng = makeLCG(77);
  const a = [];
  const b = [];
  for (let i = 0; i < 500; i++) {
    a.push(gaussianNoise(rng));
    b.push(gaussianNoise(rng));
  }
  const raw = computeMI(a, b, 8);
  const adj = permutationAdjustedMI(a, b, 8, 0xBEEF, 32);
  assert.ok(raw);
  assert.ok(adj);
  assert.ok(raw.nmi >= adj.adjNmi);
  assert.ok(adj.adjNmi < 0.08, `expected near-zero adjusted NMI, got ${adj.adjNmi}`);
});

test("findLeadLag finds the planted lag direction", () => {
  const rng = makeLCG(99);
  const leader = [];
  for (let i = 0; i < 240; i++) leader.push(gaussianNoise(rng));
  const follower = [];
  for (let i = 0; i < 240; i++) {
    const delayed = i >= 3 ? leader[i - 3] : 0;
    follower.push(delayed * 0.9 + gaussianNoise(rng, 0.1));
  }
  const result = findLeadLag("A", "B", leader, follower, 8);
  assert.ok(result);
  assert.equal(result.leader, "A");
  assert.equal(result.follower, "B");
  assert.equal(result.lagBars, 3);
  assert.ok((result.corrAtLag ?? 0) > 0.8);
});

test("findLeadLagValidated confirms stable out-of-sample lag", () => {
  const rng = makeLCG(314159);
  const leader = [];
  for (let i = 0; i < 360; i++) leader.push(gaussianNoise(rng));
  const follower = [];
  for (let i = 0; i < 360; i++) {
    const delayed = i >= 4 ? leader[i - 4] : 0;
    follower.push(delayed * 0.85 + gaussianNoise(rng, 0.12));
  }
  const result = findLeadLagValidated("A", "B", leader, follower, 8);
  assert.ok(result);
  assert.equal(result.leader, "A");
  assert.equal(result.lagBars, 4);
  assert.equal(result.validationStatus, "confirmed");
  assert.ok((result.testCorrAtLag ?? 0) > 0.5);
  assert.ok((result.validatedCorr ?? 0) > 0.5);
});

test("findLeadLagValidated rejects broken out-of-sample relationships", () => {
  const rng = makeLCG(271828);
  const leader = [];
  const follower = [];
  for (let i = 0; i < 280; i++) {
    leader.push(gaussianNoise(rng));
  }
  for (let i = 0; i < 280; i++) {
    if (i < 180) {
      const delayed = i >= 2 ? leader[i - 2] : 0;
      follower.push(delayed * 0.9 + gaussianNoise(rng, 0.08));
    } else {
      follower.push(gaussianNoise(rng));
    }
  }
  const result = findLeadLagValidated("A", "B", leader, follower, 6);
  assert.ok(result);
  assert.ok(result.validationStatus === "rejected" || (result.testCorrAtLag ?? 0) < 0.2);
  assert.ok((result.validatedCorr ?? 0) <= Math.max(result.testCorrAtLag ?? 0, 0.2));
});
