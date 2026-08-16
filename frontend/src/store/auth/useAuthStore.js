import { create } from "zustand";
import createSocketSlice from "./slices/socket.slice";
import createAuthSlice from "./slices/auth.slice";

export const useAuthStore = create((set, get) => ({
    ...createSocketSlice(set, get),
    ...createAuthSlice(set, get)
}));