const toBoolean = (value) => value === "true";

export const AI_AGENT_ENABLED = toBoolean(process.env.AI_AGENT_ENABLED);
export const AI_SMART_REPLIES_ENABLED = toBoolean(
  process.env.AI_SMART_REPLIES_ENABLED,
);
export const AI_AUTOCOMPLETE_ENABLED = toBoolean(
  process.env.AI_AUTOCOMPLETE_ENABLED,
);
export const AI_PROVIDER = process.env.AI_PROVIDER || "gemini-openai-compatible";
export const AI_API_KEY = process.env.AI_API_KEY;
export const AI_BASE_URL =
  process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
export const AI_MODEL_CHAT = process.env.AI_MODEL_CHAT || "gemini-2.5-flash";
export const AI_MODEL_EMBEDDING =
  process.env.AI_MODEL_EMBEDDING || "gemini-embedding-001";
export const AI_MAX_CONTEXT_MESSAGES = Number(
  process.env.AI_MAX_CONTEXT_MESSAGES || 100,
);
export const AI_REQUEST_TIMEOUT_MS = Number(
  process.env.AI_REQUEST_TIMEOUT_MS || 15000,
);
export const AI_RATE_LIMIT_WINDOW_MS = Number(
  process.env.AI_RATE_LIMIT_WINDOW_MS || 60000,
);
export const AI_RATE_LIMIT_MAX_REQUESTS = Number(
  process.env.AI_RATE_LIMIT_MAX_REQUESTS || 30,
);
export const AI_REDIS_URL = process.env.AI_REDIS_URL;

export const isAIConfigured = Boolean(AI_API_KEY);