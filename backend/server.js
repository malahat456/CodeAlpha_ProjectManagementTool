import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import projectMemberRoutes from "./routes/projectMemberRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Create Express app
const app = express();

// Create HTTP server for Express + Socket.IO
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ===============================
// SOCKET.IO SETUP
// ===============================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error.message);
    next(new Error("Invalid token"));
  }
});

// Socket connection
io.on("connection", (socket) => {
  const userId = socket.user.id;

  console.log(`Socket connected: User ${userId}`);

  // Each user gets their own private room
  socket.join(`user_${userId}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: User ${userId}`);
  });
});

// Make io available to other files
app.set("io", io);

// ===============================
// API ROUTES
// ===============================

app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/files", fileRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);
app.use("/api/project-members", projectMemberRoutes);
app.use("/api/notifications", notificationRoutes);

// ===============================
// HEALTH CHECK
// ===============================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Project Management System API",
    status: "running",
    version: "1.0.0",
    frontendUrl: process.env.FRONTEND_URL || "not set",
    endpoints: {
      auth: "/api/auth",
      projects: "/api/projects",
      tasks: "/api/tasks",
      comments: "/api/comments",
      dashboard: "/api/dashboard",
      files: "/api/files",
      uploads: "/uploads",
      notifications: "/api/notifications",
      health: "/health"
    }
  });
});

// ===============================
// ERROR HANDLING
// ===============================

app.use((err, req, res, next) => {
  console.error("Error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "CORS error: Request from this origin is not allowed",
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }

  res.status(500).json({
    message: err.message || "Internal server error"
  });
});

// ===============================
// START SERVER
// ===============================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Socket.IO running on port ${PORT}`);
});