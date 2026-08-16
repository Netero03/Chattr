import { axiosInstance } from "../lib/axios";

export const chatService = {
  fetchSidebarUsers() {
    return axiosInstance.get("/messages/users/sidebar");
  },

  fetchMessagesWithUser(receiverId) {
    return axiosInstance.get(`/messages/chat/get-messages/${receiverId}`);
  },


  sendMessageToUser(receiverId, messageData) {
    return axiosInstance.post(`/messages/chat/send/${receiverId}`, messageData);
  },

  pinUser(userToAddId) {
    return axiosInstance.put(`/messages/users/pin-user/${userToAddId}`);
  },

  unpinUser(userToRemoveId) {
    return axiosInstance.delete(`/messages/users/unpin-user/${userToRemoveId}`);
  },

  getConversation(otherUserId) {
    return axiosInstance.post(`/messages/conversation/get/${otherUserId}`);
  },

  markConversationAsRead(conversationId) {
    return axiosInstance.put(`/messages/conversation/mark-as-read/${conversationId}`);
  },

  getUnreadUserIds() {
    return axiosInstance.get("/messages/conversation/get-unread");
  },
  searchForGifs(query) {
    return axiosInstance.get(`/messages/chat/search-gifs/${query}`)
  },
  getTrendingGifs() {
    return axiosInstance.get("/messages/chat/trending-gifs");
  }
};
