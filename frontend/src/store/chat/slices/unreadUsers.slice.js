import { chatService } from "../../../services/chatService";
import { handleToastErrorMessage } from "../../../lib/utils";

const createUnreadSlice = (set) => ({
  unreadUserIds: new Set(),

  getUnreadUserIds: async () => {
    try {
      const response = await chatService.getUnreadUserIds();
      set({ unreadUserIds: new Set(response.data || []) });
    } catch (error) {
      handleToastErrorMessage(error);
    }
  },

  addToUnreadUserIds: (senderId) => {
    set((state) => {
          const newUnreadUserIds = new Set(state.unreadUserIds);
          newUnreadUserIds.add(senderId);
          return { unreadUserIds: newUnreadUserIds };
        });
  },
  removeFromUnreadUserIds: (selectedUserId) => {
    set((state) => {
        const updatedUnreadUserIds = new Set(state.unreadUserIds);
        updatedUnreadUserIds.delete(selectedUserId);
        return { unreadUserIds: updatedUnreadUserIds };
      });
  },
});

export default createUnreadSlice;
