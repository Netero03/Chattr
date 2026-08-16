import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://relay.azurewebsites.net"
    : "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
  },
  transports: ["websocket", "polling"],
});

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user has connected", socket.id);

  const userId = socket.handshake.auth.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        userId,
      });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", {
        userId,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user has disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

function getSocketIdFromUserId(userId) {
  return userSocketMap[userId];
}

export { io, app, server, getSocketIdFromUserId };
