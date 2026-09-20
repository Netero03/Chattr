import assert from "node:assert/strict";
import test from "node:test";

process.env.AI_API_KEY = "test-key";
const { chat } = await import("./llmProvider.js");

test("chat returns the provider message content", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response(JSON.stringify({
    choices: [{ message: { content: "Useful answer" } }],
  }), { status: 200 });

  try {
    assert.equal(await chat({ messages: [{ role: "user", content: "Hi" }] }), "Useful answer");
  } finally {
    global.fetch = originalFetch;
  }
});

test("chat surfaces provider failures", async () => {
  const originalFetch = global.fetch;
  global.fetch = async () => new Response("provider unavailable", { status: 503 });

  try {
    await assert.rejects(
      () => chat({ messages: [{ role: "user", content: "Hi" }] }),
      /AI provider request failed: provider unavailable/,
    );
  } finally {
    global.fetch = originalFetch;
  }
});