import {
  AI_API_KEY,
  AI_BASE_URL,
  AI_MODEL_CHAT,
  AI_REQUEST_TIMEOUT_MS,
  isAIConfigured,
} from "../../config/ai.config.js";
import { recordAIMetric } from "./observability.js";

const providerError = (message, status = 503) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const request = async (path, body, signal) => {
  if (!isAIConfigured) {
    throw providerError("AI service is not configured.");
  }

  const response = await fetch(`${AI_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw providerError(`AI provider request failed: ${detail}`, response.status);
  }

  return response;
};

const withTimeout = () => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);
  return { controller, timeout };
};

export const chat = async ({ messages, responseFormat }) => {
  const startedAt = Date.now();
  const { controller, timeout } = withTimeout();
  try {
    const response = await request(
      "/chat/completions",
      {
        model: AI_MODEL_CHAT,
        messages,
        temperature: 0.2,
        ...(responseFormat ? { response_format: responseFormat } : {}),
      },
      controller.signal,
    );
    const payload = await response.json();
    recordAIMetric({
      event: "request_success",
      feature: "chat",
      durationMs: Date.now() - startedAt,
      usage: payload.usage,
    });
    return payload.choices?.[0]?.message?.content || "";
  } catch (error) {
    recordAIMetric({ event: "request_error", feature: "chat", durationMs: Date.now() - startedAt, error });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const streamChat = async function* ({ messages }) {
  const startedAt = Date.now();
  const { controller, timeout } = withTimeout();
  try {
    const response = await request(
      "/chat/completions",
      { model: AI_MODEL_CHAT, messages, temperature: 0.2, stream: true },
      controller.signal,
    );
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const normalizedLine = line.trim();
        if (!normalizedLine.startsWith("data: ") || normalizedLine === "data: [DONE]") continue;
        const content = JSON.parse(normalizedLine.slice(6)).choices?.[0]?.delta?.content;
        if (content) yield content;
      }
    }
    recordAIMetric({ event: "request_success", feature: "stream", durationMs: Date.now() - startedAt });
  } catch (error) {
    recordAIMetric({ event: "request_error", feature: "stream", durationMs: Date.now() - startedAt, error });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};