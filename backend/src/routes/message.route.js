import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  pinUserToSidebar,
  unpinUserFromSidebar,
  getConversation,
  markConversationAsRead,
  getUnreadUserIds,
  searchGifs,
  getTrendingGifs
} from "../controllers/message.controller.js";


const router = express.Router();

router.get("/users/sidebar", protectRoute, getUsersForSidebar);
router.put("/users/pin-user/:userToAddId", protectRoute, pinUserToSidebar);
router.delete("/users/unpin-user/:userToRemoveId", protectRoute, unpinUserFromSidebar);

router.get("/chat/search-gifs/:query", protectRoute, searchGifs);
router.get("/chat/trending-gifs", protectRoute, getTrendingGifs);
router.get("/chat/get-messages/:receiverId", protectRoute, getMessages);
router.post("/chat/send/:receiverId", protectRoute, sendMessage);

router.post("/conversation/get/:otherUserId", protectRoute, getConversation);
router.put("/conversation/mark-as-read/:conversationId", protectRoute, markConversationAsRead);
router.get("/conversation/get-unread", protectRoute, getUnreadUserIds);

export default router;
