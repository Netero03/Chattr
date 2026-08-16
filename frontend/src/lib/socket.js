import { BACKEND_BASE_URL } from "../config/url";
import { io } from "socket.io-client";


export const createSocket = (authUser) => {
  const socket = io(BACKEND_BASE_URL, {
    auth: {
      userId: authUser._id,
    },
  });

  return socket;
};
