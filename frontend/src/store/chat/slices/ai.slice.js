import { useAuthStore } from "../../auth/useAuthStore";
import { handleToastErrorMessage } from "../../../lib/utils";

const createAISlice = (set, get) => ({
  aiStreamText: "",
  isAIStreaming: false,
  smartReplies: [],
  autocomplete: "",
  aiSummary: null,
  aiTasks: [],
  clearAIArtifacts: () => set({ aiSummary: null, aiTasks: [] }),

  subscribeToAI: (socket) => {
    socket.on("ai:stream:start", () => set({ aiStreamText: "", isAIStreaming: true }));
    socket.on("ai:stream:delta", ({ delta }) =>
      set((state) => ({ aiStreamText: state.aiStreamText + delta })),
    );
    socket.on("ai:stream:end", ({ requestId }) => {
      const finalText = get().aiStreamText.trim();

      if (finalText) {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              _id: requestId || `ai-${Date.now()}`,
              senderId: "ai",
              text: finalText,
              createdAt: new Date().toISOString(),
              isAI: true,
            },
          ],
          aiStreamText: "",
          isAIStreaming: false,
        }));
        return;
      }

      set({ aiStreamText: "", isAIStreaming: false });
    });
    socket.on("ai:smart_replies:result", ({ replies }) => set({ smartReplies: replies }));
    socket.on("ai:autocomplete:result", ({ completion }) => set({ autocomplete: completion }));
    socket.on("ai:thread:summary", ({ summary, keyPoints, decisions, openQuestions }) =>
      set({ aiSummary: { summary, keyPoints, decisions, openQuestions } }),
    );
    socket.on("ai:thread:tasks", ({ tasks }) => set({ aiTasks: tasks }));
    socket.on("ai:error", ({ message }) => {
      set({ aiStreamText: "", isAIStreaming: false });
      handleToastErrorMessage({ response: { data: { message } } });
    });
  },

  unsubscribeFromAI: (socket) => {
    [
      "ai:stream:start",
      "ai:stream:delta",
      "ai:stream:end",
      "ai:smart_replies:result",
      "ai:autocomplete:result",
      "ai:thread:summary",
      "ai:thread:tasks",
      "ai:error",
    ].forEach((event) => socket.off(event));
  },

  askAI: (query) => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (!query?.trim()) return;
    socket?.emit("ai:thread:ask", { threadId: selectedUser?._id, query: query.trim() });
  },

  requestSmartReplies: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    socket?.emit("ai:smart_replies:get", { threadId: selectedUser?._id });
  },

  requestAutocomplete: (draft) => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (draft.trim().length >= 8) {
      socket?.emit("ai:autocomplete:get", { threadId: selectedUser?._id, draft });
    } else {
      set({ autocomplete: "" });
    }
  },

  summarizeThread: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    socket?.emit("ai:thread:summarize", { threadId: selectedUser?._id });
  },

  extractTasks: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    socket?.emit("ai:thread:extract_tasks", { threadId: selectedUser?._id });
  },
});

export default createAISlice;