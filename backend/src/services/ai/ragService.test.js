import test from "node:test";
import assert from "node:assert/strict";

import { rankChunks, buildRetrievalContext } from "./ragService.js";

test("rankChunks prioritizes the relevant message for the user query", () => {
  const chunks = [
    { id: "1", text: "Customer asked for a refund for the delayed order." },
    { id: "2", text: "The team is planning the sprint demo for Friday." },
    { id: "3", text: "The refund policy needs review with the finance team." },
  ];

  const ranked = rankChunks(chunks, "refund policy delay");
  assert.equal(ranked[0].id, "1");
  assert.ok(ranked[0].score > ranked[2].score);
});

test("buildRetrievalContext includes the strongest support and keeps the user intent", () => {
  const context = buildRetrievalContext(
    [
      { senderId: "user", text: "The refund is still pending." },
      { senderId: "other", text: "We are reviewing the payment issue and the finance team is involved." },
      { senderId: "user", text: "Let’s schedule the sprint demo for Friday." },
    ],
    "refund payment issue",
    2,
  );

  assert.ok(context.some((entry) => entry.includes("refund")));
  assert.ok(context.some((entry) => entry.includes("finance")));
  assert.ok(context.length <= 2);
});
