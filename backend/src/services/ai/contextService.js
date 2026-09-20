import Message from "../../models/message.model.js";
import { AI_MAX_CONTEXT_MESSAGES } from "../../config/ai.config.js";

export const getConversationContext = async (userId, otherUserId, limit) => {
  const messages = await Message.find({
    $or: [
      { senderId: userId, receiverId: otherUserId },
      { senderId: otherUserId, receiverId: userId },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || AI_MAX_CONTEXT_MESSAGES, AI_MAX_CONTEXT_MESSAGES))
    .lean();

  return messages
    .reverse()
    .filter((message) => message.text?.trim())
    .map((message) => ({
      senderId: message.senderId.toString() === userId.toString() ? "user" : "other",
      text: message.text.trim(),
        createdAt: message.createdAt,
    }));
};