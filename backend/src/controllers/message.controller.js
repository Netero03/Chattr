import { sendErrorResponse } from "../utils/errorHandling.js";
import {
  getSidebarUsers,
  findMessagesSentAndReceived,
  uploadChatImage,
  createAndSaveMessage,
  emitNewMessageEvent,
  removeFromPinnedUsers,
  addToPinnedUsers,
  findOrCreateChatConversation,
  markConversationAsReadForUser,
  updateConversationStateOnMessageSend,
  getUnreadUserIdsForUser,
  getGifsForSearch,
  getTrendingGifUrls
} from "../services/message.service.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const sidebarUsers = await getSidebarUsers(loggedInUserId);
    res.status(200).json(sidebarUsers);
  } catch (error) {
    sendErrorResponse(res, error, "message controller get users for sidebar");
  }
};

export const pinUserToSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { userToAddId } = req.params;

    const updatedUser = await addToPinnedUsers(loggedInUserId, userToAddId);
    res.status(200).json(updatedUser);
  } catch (error) {
    sendErrorResponse(res, error, "message controller pin user to sidebar");
  }
};

export const unpinUserFromSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const { userToRemoveId } = req.params;

    const updatedUser = await removeFromPinnedUsers(
      loggedInUserId,
      userToRemoveId
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    sendErrorResponse(res, error, "message controller unpin user to sidebar");
  }
};

export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    const messages = await findMessagesSentAndReceived(senderId, receiverId);

    res.status(200).json(messages);
  } catch (error) {
    sendErrorResponse(res, error, "message controller get messages");
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, gif } = req.body;
    const { receiverId } = req.params;
    const senderId = req.user._id;

    // Image uploads are optional
    const imageURL = (await uploadChatImage(image)) || "";

    const newMessage = await createAndSaveMessage(
      senderId,
      receiverId,
      text,
      imageURL,
      gif
    );

    // Update conversation meta data for new message notifications for the recipient
    const conversation = await findOrCreateChatConversation(senderId, receiverId);
    await updateConversationStateOnMessageSend(conversation._id, senderId, receiverId);
    
    emitNewMessageEvent(receiverId, newMessage);
    res.status(201).json({ newMessage });
  } catch (error) {
    sendErrorResponse(res, error, "message controller send message");
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const conversation = await findOrCreateChatConversation(userId, otherUserId);
    res.status(200).json(conversation);
  } catch (error) {
    sendErrorResponse(res, error, "message controller get conversation");
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;
    let conversation = await markConversationAsReadForUser(conversationId, userId);
    res.status(200).json(conversation);
  } catch (error) {
    sendErrorResponse(res, error, "message controller mark conversation as read");
  }
};

export const getUnreadUserIds = async (req, res) => {
  try {
    const userId = req.user._id;
    let unreadUserIds = await getUnreadUserIdsForUser(userId);
    res.status(200).json(unreadUserIds);
  } catch (error) {
    sendErrorResponse(res, error, "message controller get unread user IDs");
  }
};

export const searchGifs = async (req, res) => {
  try {
    const {query} = req.params;
    let gifUrls = await getGifsForSearch(query);
    res.status(200).json(gifUrls);
  } catch (error) {
    sendErrorResponse(res, error, "message controller search GIFs");
  }
}

export const getTrendingGifs = async (req, res) => {
  try {
    let gifUrls = await getTrendingGifUrls();
    res.status(200).json(gifUrls);
  } catch (error) {
    sendErrorResponse(res, error, "message controller search GIFs");
  }
}
