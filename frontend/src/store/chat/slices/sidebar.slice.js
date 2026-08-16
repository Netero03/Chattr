import { chatService } from "../../../services/chatService";
import { handleToastErrorMessage } from "../../../lib/utils";
import toast from "react-hot-toast";

const createSidebarSlice = (set, get) => ({
  pinnedChatUsers: [],
  otherChatUsers: [],
  selectedUser: null,
  isUsersLoading: false,

  getSidebarUsers: async () => {
    set({ isUsersLoading: true });

    try {
      // Load new message notifications along with sidebar users
      await get().getUnreadUserIds();

      const response = await chatService.fetchSidebarUsers();
      set({ pinnedChatUsers: response.data.pinnedUsers });
      set({ otherChatUsers: response.data.otherUsers });
    } catch (error) {
      handleToastErrorMessage(error);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  pinUser: async (userToAddId) => {
    // optimistic update
    const { pinnedChatUsers, otherChatUsers } = get();

    const userToPin = otherChatUsers.find((u) => u._id === userToAddId);
    if (!userToPin) return;

    set({
      pinnedChatUsers: [userToPin, ...pinnedChatUsers],
      otherChatUsers: otherChatUsers.filter((u) => u._id !== userToAddId),
    });

    try {
      await chatService.pinUser(userToAddId);
      toast.success("User pinned successfully");
    } catch (error) {
      handleToastErrorMessage(error);
      // rollback on failure
      set({
        pinnedChatUsers,
        otherChatUsers,
      });
    }
  },

  unpinUser: async (userToRemoveId) => {
    const { pinnedChatUsers, otherChatUsers } = get();

    const userToUnpin = pinnedChatUsers.find((u) => u._id === userToRemoveId);
    if (!userToUnpin) return;

    // update the frontend state before the backend updates
    set({
      pinnedChatUsers: pinnedChatUsers.filter((u) => u._id !== userToRemoveId),
      otherChatUsers: [userToUnpin, ...otherChatUsers],
    });

    try {
      await chatService.unpinUser(userToRemoveId);
      toast.success("User unpinned successfully");
    } catch (error) {
      // rollback
      handleToastErrorMessage(error);
      set({
        pinnedChatUsers,
        otherChatUsers,
      });
    }
  },
  setSelectedUser: async (newSelectedUser) => {
    set({ selectedUser: newSelectedUser, isMessagesLoading: true });

    try {
      // Update current conversation Id
      const convoRes = await chatService.getConversation(newSelectedUser._id);
      const conversationId = convoRes.data._id;

      // Retrieve messages
      const messagesRes = await chatService.fetchMessagesWithUser(
        newSelectedUser._id
      );
      set({ messages: messagesRes.data });

      // Remove the unread conversation locally
      get().removeFromUnreadUserIds(newSelectedUser._id);
      
      // Mark the conversation as read in the backend
      await chatService.markConversationAsRead(conversationId);
    } catch (error) {
      handleToastErrorMessage(error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
});

export default createSidebarSlice;
