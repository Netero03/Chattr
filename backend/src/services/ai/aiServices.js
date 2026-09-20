import { chat, streamChat } from "./llmProvider.js";
import {
  autocompleteMessages,
  smartReplyMessages,
  summaryMessages,
  taskMessages,
  threadMessages,
} from "./promptTemplates.js";
import { parseJSON, validateAIInput } from "./safetyFilter.js";
import { buildRetrievalContext } from "./ragService.js";

export const answerThread = ({ messages, query }) => {
  const retrieval = buildRetrievalContext(messages, validateAIInput(query, "query"), 3);
  const promptMessages = threadMessages({
    messages: retrieval.map((entry) => ({ senderId: "retrieved", text: entry })),
    query: validateAIInput(query, "query"),
  });
  return streamChat({ messages: promptMessages });
};

export const summarizeThread = async (messages) => {
  const result = parseJSON(await chat({
    messages: summaryMessages(messages),
    responseFormat: { type: "json_object" },
  }), {});
  return {
    summary: result.summary || "No summary was generated.",
    keyPoints: Array.isArray(result.keyPoints) ? result.keyPoints : [],
    decisions: Array.isArray(result.decisions) ? result.decisions : [],
    openQuestions: Array.isArray(result.openQuestions) ? result.openQuestions : [],
  };
};

export const extractTasks = async (messages) => {
  const result = parseJSON(await chat({
    messages: taskMessages(messages),
    responseFormat: { type: "json_object" },
  }), { tasks: [] });
  return { tasks: Array.isArray(result.tasks) ? result.tasks.slice(0, 20) : [] };
};

export const getSmartReplies = async (messages) => {
  const result = parseJSON(await chat({
    messages: smartReplyMessages(messages),
    responseFormat: { type: "json_object" },
  }), { replies: [] });
  return { replies: [...new Set(Array.isArray(result.replies) ? result.replies : [])].slice(0, 3) };
};

export const getAutocomplete = async ({ messages, draft }) => ({
  completion: (await chat({ messages: autocompleteMessages({ messages, draft: validateAIInput(draft, "draft") }) })).trim(),
});