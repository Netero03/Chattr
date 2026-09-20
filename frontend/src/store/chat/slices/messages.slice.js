import { useAuthStore } from "../../auth/useAuthStore";
import { chatService } from "../../../services/chatService";
import { handleToastErrorMessage } from "../../../lib/utils";


const createMessagesSlice = (set, get) => ({
  messages: [],
  isMessagesLoading: false,

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      get().emitStopTypingEvent();

      const response = await chatService.sendMessageToUser(
        selectedUser._id,
        messageData
      );
      set({ messages: [...messages, response.data.newMessage] });
    } catch (error) {
      handleToastErrorMessage(error);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const subscribe = () => {
      get().setupSocketForTypingEvents(socket);
      get().subscribeToAI(socket);
    };

    if (socket.connected) subscribe();
    else socket.once("connect", subscribe);

    socket.off("newMessage");
    socket.on("newMessage", ({ newMessage }) => {
      // Limits incoming messages to the currently selected user only
      let isNewMessageFromSelectedUser =
        newMessage.senderId.toString() === get().selectedUser?._id.toString();
      if (isNewMessageFromSelectedUser) {
        set((state) => ({ messages: [...state.messages, newMessage] }));
      } else {
        // Add sender ID to unreadUserIds for new message notifications
        get().addToUnreadUserIds(newMessage.senderId);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("connect");
    get().removeSocketFromTypingEvents(socket);
    get().unsubscribeFromAI(socket);
  },
});

export default createMessagesSlice;
