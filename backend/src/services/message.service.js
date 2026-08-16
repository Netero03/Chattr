import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getSocketIdFromUserId } from "../lib/socket.js";
import { io } from "../lib/socket.js";
import { throwError } from "../utils/errorHandling.js";
import { MAX_MESSAGE_LENGTH } from "../../../shared/message.constants.js";
import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";

export const getSidebarUsers = async (loggedInUserId) => {
  const loggedInUser =
    await User.findById(loggedInUserId).select("pinnedUsers");

  const pinnedUsers = await User.find({
    _id: { $in: loggedInUser.pinnedUsers },
  }).select("-password"); // Omit passwords for security reasons

  const otherUsers = await User.find({
    _id: {
      $nin: [...loggedInUser.pinnedUsers, loggedInUserId],
    },
  }).select("-password"); // Omit passwords

  return { pinnedUsers, otherUsers };
};

export const addToPinnedUsers = async (loggedInUserId, userToAddId) => {
  if (!mongoose.Types.ObjectId.isValid(userToAddId)) {
    throwError("Invalid user id", 400);
  }

  if (loggedInUserId.equals(userToAddId)) {
    throwError("You cannot pin yourself", 400);
  }

  return await User.findByIdAndUpdate(
    loggedInUserId,
    { $addToSet: { pinnedUsers: userToAddId } },
    { new: true },
  );
};

export const removeFromPinnedUsers = async (loggedInUserId, userToRemoveId) => {
  return await User.findByIdAndUpdate(
    loggedInUserId,
    { $pull: { pinnedUsers: userToRemoveId } },
    { new: true },
  );
};

export const findMessagesSentAndReceived = async (senderId, receiverId) => {
  return await Message.find({
    $or: [
      { senderId: senderId, receiverId: receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  });
};

export const uploadChatImage = async (image) => {
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    return uploadResponse.secure_url;
  }
};

export const updateConversationStateOnMessageSend = async (
  conversationId,
  senderId,
  receiverId,
) => {
  await Conversation.updateOne(
    { _id: conversationId },
    {
      $set: {
        [`read.${senderId}`]: true,
        [`read.${receiverId}`]: false,
      },
    },
  );
};

export const createAndSaveMessage = async (
  senderId,
  receiverId,
  text,
  imageURL,
  gif
) => {
  if (text.length > MAX_MESSAGE_LENGTH) {
    throwError(
      `Message must not exceed ${MAX_MESSAGE_LENGTH} characters.`,
      400,
    );
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageURL,
    gif
  });

  await newMessage.save();
  return newMessage;
};

export const emitNewMessageEvent = (receiverId, newMessage) => {
  const receiverSocketId = getSocketIdFromUserId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", { newMessage });
  }
};

export const findOrCreateChatConversation = async (userId, otherUserId) => {
  if (!otherUserId) {
    throwError("Other user ID is required", 400);
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [userId, otherUserId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId, otherUserId],
      read: {
        [userId]: true,
        [otherUserId]: false,
      },
    });
  }

  return conversation;
};

export const markConversationAsReadForUser = async (conversationId, userId) => {
  return await Conversation.updateOne(
    { _id: conversationId },
    { $set: { [`read.${userId}`]: true } },
  );
};

export const getUnreadUserIdsForUser = async (currentUserId) => {
  const conversations = await Conversation.find({
    participants: { $in: [currentUserId] },
    $or: [
      { [`read.${currentUserId}`]: false },
      { [`read.${currentUserId}`]: { $exists: false } },
    ],
  }).lean();

  const result = [];

  conversations.forEach((conversation) => {
    const otherUserId = conversation.participants.find(
      (id) => id.toString() !== currentUserId.toString(),
    );
    if (otherUserId) {
      result.push(otherUserId.toString());
    }
  });

  return result;
};

export const getGifsForSearch = async (query) => {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    `https://api.klipy.com/api/v1/${process.env.KLIPY}/gifs/search?page=1&per_page=24&q=${query}&customer_id=${process.env.KLIPY_CUSTOMER_ID}&locale=en-US&content_filter=low`,
    requestOptions,
  );

  return await parseResponseForGifs(response);
};

export const getTrendingGifUrls = async () => {
    const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    `https://api.klipy.com/api/v1/${process.env.KLIPY}/gifs/trending?page=1&per_page=24&customer_id=${process.env.KLIPY_CUSTOMER_ID}&locale=en-US&content_filter=low`,
    requestOptions,
  );
  
  return await parseResponseForGifs(response);
}

const parseResponseForGifs = async (response) => {
  const gifUrls = [];

  const parsedResponse = await response.json();

  if (!parsedResponse.result) {
    throwError("No results from the GIF API", 404);
  }

  parsedResponse.data.data.forEach((gif) => {
    gifUrls.push(gif.file.md.mp4.url);
  });

  return gifUrls;
}