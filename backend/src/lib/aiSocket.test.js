import assert from "node:assert/strict";
import test from "node:test";
import { registerAISocketHandlers } from "./aiSocket.js";

test("AI socket handlers reject disabled agent requests", () => {
  const handlers = new Map();
  const emitted = [];
  const socket = {
    id: "socket-1",
    handshake: { auth: { userId: "user-1" } },
    on: (event, handler) => handlers.set(event, handler),
    emit: (event, payload) => emitted.push({ event, payload }),
  };

  registerAISocketHandlers(socket);
  handlers.get("ai:thread:ask")({ threadId: "507f1f77bcf86cd799439011", query: "Hello" });

  assert.deepEqual(emitted[0], {
    event: "ai:error",
    payload: { message: "AI agent is disabled." },
  });
});