// Loads environment variables first so modules can use them safely.
import "./lib/env.js";

import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import { FRONTEND_URL } from "./config/url.config.js";
import { FRONTEND_DIST_PATH } from "./config/paths.config.js";
import { MAX_PAYLOAD_SIZE, PORT, isProduction } from "./config/server.config.js";
import path from "path";


// Increase payload size for image uploads
app.use(express.json({ limit: MAX_PAYLOAD_SIZE }));
app.use(express.urlencoded({ extended: true, limit: MAX_PAYLOAD_SIZE }));

app.use(cors(
    {
       origin: FRONTEND_URL,
       credentials: true,
    }
));

app.use(cookieParser());

// Expose the endpoints last to prevent CORS and null payload errors
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve React build static files to the browser through http endpoints
if (isProduction) {
  app.use(express.static(FRONTEND_DIST_PATH));

  // SPA fallback (Express v5 compatible)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST_PATH, "index.html"));
  });
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    connectDB();
});
