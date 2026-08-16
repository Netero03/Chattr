import { useAuthStore } from "../../auth/useAuthStore";

const createTypingSlice = (set, get) => ({
  typingUsers: new Set(),

  emitStopTypingEvent: () => {
    const socket = useAuthStore.getState().socket;
    socket.emit("stopTyping", { to: get().selectedUser._id });
  },

  emitTypingEvent: () => {
    const socket = useAuthStore.getState().socket;
    socket.emit("typing", { to: get().selectedUser._id });
  },

  setupSocketForTypingEvents: (socket) => {
    socket.on("typing", ({ userId }) => {
      set((state) => {
        const newSet = new Set(state.typingUsers);
        newSet.add(userId);
        return { typingUsers: newSet };
      });
    });

    socket.on("stopTyping", ({ userId }) => {
      set((state) => {
        const newSet = new Set(state.typingUsers);
        newSet.delete(userId);
        return { typingUsers: newSet };
      });
    });
  },

  removeSocketFromTypingEvents: (socket) => {
    socket.off("typing");
    socket.off("stopTyping");
  },
});

export default createTypingSlice;
