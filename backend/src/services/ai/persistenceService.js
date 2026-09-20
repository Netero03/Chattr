import crypto from "crypto";
import {
  AI_MODEL_CHAT,
  AI_REQUEST_TIMEOUT_MS,
} from "../../config/ai.config.js";
import AISuggestionCache from "../../models/aiSuggestionCache.model.js";
import ThreadSummary from "../../models/threadSummary.model.js";
import ThreadTasks from "../../models/threadTasks.model.js";

export const contextHash = (messages) =>
  crypto.createHash("sha256").update(JSON.stringify(messages)).digest("hex");

export const saveSummary = async (threadId, result, messages) =>
  ThreadSummary.create({
    threadId,
    ...result,
      windowStart: messages[0]?.createdAt,
      windowEnd: messages.at(-1)?.createdAt,
    model: AI_MODEL_CHAT,
  });

export const saveTasks = async (threadId, result, messages) =>
  ThreadTasks.create({
    threadId,
    ...result,
    sourceRange: {
        windowStart: messages[0]?.createdAt,
        windowEnd: messages.at(-1)?.createdAt,
    },
    model: AI_MODEL_CHAT,
  });

export const getCachedSuggestions = async (threadId, messages) =>
  AISuggestionCache.findOne({
    threadId,
    messageContextHash: contextHash(messages),
    expiresAt: { $gt: new Date() },
  }).lean();

export const cacheSuggestions = async (threadId, messages, replies) =>
  AISuggestionCache.findOneAndUpdate(
    { threadId, messageContextHash: contextHash(messages) },
    {
      threadId,
      messageContextHash: contextHash(messages),
      replies,
      expiresAt: new Date(Date.now() + AI_REQUEST_TIMEOUT_MS * 4),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );