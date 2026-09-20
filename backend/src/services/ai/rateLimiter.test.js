import assert from "node:assert/strict";
import test from "node:test";
import { createRateLimiter } from "./rateLimiter.js";

test("allows the configured number of requests and blocks the next one", async () => {
  const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });

  assert.equal(await limiter.isRateLimited("user-1"), false);
  assert.equal(await limiter.isRateLimited("user-1"), false);
  assert.equal(await limiter.isRateLimited("user-1"), true);
});

test("clearing a key starts a fresh window", async () => {
  const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });

  assert.equal(await limiter.isRateLimited("user-1"), false);
  assert.equal(await limiter.isRateLimited("user-1"), true);
  await limiter.clear("user-1");
  assert.equal(await limiter.isRateLimited("user-1"), false);
});

test("uses a shared store when provided", async () => {
  const counts = new Map();
  const store = {
    increment: async (key) => {
      const count = (counts.get(key) || 0) + 1;
      counts.set(key, count);
      return count;
    },
    delete: async (key) => counts.delete(key),
  };
  const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000, store });

  assert.equal(await limiter.isRateLimited("user-1"), false);
  assert.equal(await limiter.isRateLimited("user-1"), true);
  await limiter.clear("user-1");
  assert.equal(await limiter.isRateLimited("user-1"), false);
});

test("falls back to local limiting when the shared store fails", async () => {
  const store = {
    increment: async () => {
      throw new Error("shared store unavailable");
    },
    delete: async () => {},
  };
  const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000, store });

  assert.equal(await limiter.isRateLimited("user-1"), false);
  assert.equal(await limiter.isRateLimited("user-1"), true);
});