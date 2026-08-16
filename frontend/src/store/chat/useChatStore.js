import { create } from "zustand";
import createUnreadSlice from "./slices/unreadUsers.slice";
import createSidebarSlice from "./slices/sidebar.slice"
import createMessagesSlice from "./slices/messages.slice";
import createTypingSlice from "./slices/typing.slice";
import createGifsSlice from "./slices/gifs.slice";

export const useChatStore = create((set, get) => ({
  ...createUnreadSlice(set, get),
  ...createSidebarSlice(set, get),
  ...createMessagesSlice(set, get),
  ...createTypingSlice(set, get),
  ...createGifsSlice(set)
}));
