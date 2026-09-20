import mongoose from "mongoose";
import {
  AI_AGENT_ENABLED,
  AI_AUTOCOMPLETE_ENABLED,
  AI_RATE_LIMIT_MAX_REQUESTS,
  AI_RATE_LIMIT_WINDOW_MS,
  AI_REDIS_URL,
  AI_SMART_REPLIES_ENABLED,
  isAIConfigured,
} from "../config/ai.config.js";
import { getConversationContext } from "../services/ai/contextService.js";
import {
  answerThread,
  extractTasks,
  getAutocomplete,
  getSmartReplies,
  summarizeThread,
} from "../services/ai/aiServices.js";
import {
  cacheSuggestions,
  getCachedSuggestions,
  saveSummary,
  saveTasks,
} from "../services/ai/persistenceService.js";
import { createRateLimiter } from "../services/ai/rateLimiter.js";
import { createRedisRateLimitStore } from "../services/ai/redisRateLimiter.js";

const featureError = (socket, message) => socket.emit("ai:error", { message });
const rateLimiter = createRateLimiter({
  maxRequests: AI_RATE_LIMIT_MAX_REQUESTS,
  windowMs: AI_RATE_LIMIT_WINDOW_MS,
  store: AI_REDIS_URL ? createRedisRateLimitStore(AI_REDIS_URL) : undefined,
});

const canUseConversation = (threadId, userId) =>
  threadId && userId && mongoose.Types.ObjectId.isValid(threadId);

export const registerAISocketHandlers = (socket) => {
  const run = async (data, callback) => {
    if (!isAIConfigured) return featureError(socket, "AI service is not configured.");
    if (!canUseConversation(data?.threadId, socket.handshake.auth.userId)) {
      return featureError(socket, "A valid conversation is required.");
    }
    try {
      const messages = await getConversationContext(
        socket.handshake.auth.userId,
        data.threadId,
        data.messageLimit,
      );
      await callback(messages);
    } catch (error) {
      featureError(socket, error.message);
    }
  };

  const isRateLimited = async () => {
    const key = socket.handshake.auth.userId || socket.id;
    return rateLimiter.isRateLimited(key);
  };

  const runRateLimited = async (data, callback) => {
    if (await isRateLimited()) return featureError(socket, "AI request rate limit exceeded.");
    return run(data, callback);
  };

  socket.on("disconnect", () => {
    const key = socket.handshake.auth.userId || socket.id;
    void rateLimiter.clear(key);
  });

  socket.on("ai:thread:ask", (data = {}) => {
    if (!AI_AGENT_ENABLED) return featureError(socket, "AI agent is disabled.");
    void runRateLimited(data, async (messages) => {
      const requestId = data.requestId || `${Date.now()}-${socket.id}`;
      socket.emit("ai:stream:start", { threadId: data.threadId, requestId });
      try {
        for await (const delta of answerThread({ messages, query: data.query })) {
          socket.emit("ai:stream:delta", { threadId: data.threadId, requestId, delta });
        }
        socket.emit("ai:stream:end", { threadId: data.threadId, requestId });
      } catch (error) {
        featureError(socket, error.message);
      }
    });
  });

  socket.on("ai:thread:summarize", (data = {}) => {
    if (!AI_AGENT_ENABLED) return featureError(socket, "AI agent is disabled.");
    void runRateLimited(data, async (messages) => {
      const result = await summarizeThread(messages);
      await saveSummary(data.threadId, result, messages);
      socket.emit("ai:thread:summary", { threadId: data.threadId, ...result });
    });
  });

  socket.on("ai:thread:extract_tasks", (data = {}) => {
    if (!AI_AGENT_ENABLED) return featureError(socket, "AI agent is disabled.");
    void runRateLimited(data, async (messages) => {
      const result = await extractTasks(messages);
      await saveTasks(data.threadId, result, messages);
      socket.emit("ai:thread:tasks", { threadId: data.threadId, ...result });
    });
  });

  socket.on("ai:smart_replies:get", (data = {}) => {
    if (!AI_SMART_REPLIES_ENABLED) return featureError(socket, "AI smart replies are disabled.");
    void runRateLimited({ ...data, messageLimit: 20 }, async (messages) => {
      const cached = await getCachedSuggestions(data.threadId, messages);
      const result = cached
        ? { replies: cached.replies }
        : await getSmartReplies(messages);
      if (!cached) await cacheSuggestions(data.threadId, messages, result.replies);
      socket.emit("ai:smart_replies:result", { threadId: data.threadId, ...result });
    });
  });

  socket.on("ai:autocomplete:get", (data = {}) => {
    if (!AI_AUTOCOMPLETE_ENABLED) return featureError(socket, "AI autocomplete is disabled.");
    void runRateLimited({ ...data, messageLimit: 20 }, async (messages) => {
      socket.emit("ai:autocomplete:result", { threadId: data.threadId, ...(await getAutocomplete({ messages, draft: data.draft })) });
    });
  });
};