import test from "node:test";
import assert from "node:assert/strict";

import pythHandler from "../api/pyth.js";
import benchmarksHandler from "../api/benchmarks.js";
import klinesHandler from "../api/klines.js";

function createMockRes() {
  return {
    headers: {},
    statusCode: 200,
    body: undefined,
    ended: false,
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      this.ended = true;
      return this;
    },
  };
}

test("api/pyth returns 400 when ids are missing", async () => {
  const req = { method: "GET", query: {} };
  const res = createMockRes();
  await pythHandler(req, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Missing ids" });
});

test("api/pyth tolerates partial batch failure and returns fulfilled items", async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url) => {
    if (String(url).includes("id-good")) {
      return {
        ok: true,
        async json() {
          return { parsed: [{ id: "id-good", price: { price: "100", expo: -2 }, ema_price: null, metadata: { slot: 1 } }] };
        },
      };
    }
    throw new Error("network fail");
  };
  try {
    const req = { method: "GET", query: { ids: ["id-good", "id-bad"] } };
    const res = createMockRes();
    await pythHandler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.parsed[0].id, "id-good");
  } finally {
    global.fetch = originalFetch;
  }
});

test("api/pyth returns 500 when every batch fails or parses empty", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    async json() {
      return { parsed: [] };
    },
  });
  try {
    const req = { method: "GET", query: { ids: "id-1,id-2" } };
    const res = createMockRes();
    await pythHandler(req, res);
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.error, "No valid price updates");
  } finally {
    global.fetch = originalFetch;
  }
});

test("api/benchmarks returns 400 on missing symbol or resolution", async () => {
  const req = { method: "GET", query: { symbol: "Crypto.BTC/USD" } };
  const res = createMockRes();
  await benchmarksHandler(req, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Missing params" });
});

test("api/klines returns 400 on missing symbol", async () => {
  const req = { method: "GET", query: {} };
  const res = createMockRes();
  await klinesHandler(req, res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { error: "Missing symbol" });
});

test("api/klines returns source none for unsupported symbols", async () => {
  const req = { method: "GET", query: { symbol: "AAPL", interval: "1m", limit: "10" } };
  const res = createMockRes();
  await klinesHandler(req, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { candles: [], source: "none", symbol: "AAPL" });
});

test("api/klines normalizes upstream candle payload", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    async json() {
      return [
        [1700000000000, "10", "12", "9", "11", "123", 1700000060000, "0", "7"],
      ];
    },
  });
  try {
    const req = { method: "GET", query: { symbol: "BTC", interval: "1m", limit: "1" } };
    const res = createMockRes();
    await klinesHandler(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, "binance");
    assert.deepEqual(res.body.candles[0], {
      t: 1700000000,
      o: 10,
      h: 12,
      l: 9,
      c: 11,
      v: 123,
      n: 7,
    });
  } finally {
    global.fetch = originalFetch;
  }
});
