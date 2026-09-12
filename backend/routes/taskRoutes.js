import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

import {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMemberTasks,
} from "../controllers/taskController.js";

const router = express.Router();

// Get member tasks
router.get("/member-tasks", protect, getMemberTasks);

// Get tasks
router.get("/", protect, getTasks);

// Create task - Admin only
router.post("/", protect, isAdmin, createTask);

// Update task - Admin only
router.put("/:id", protect, isAdmin, updateTask);

// Update task status - Admin or assigned member
router.put("/status/:id", protect, updateTaskStatus);

// Delete task - Admin only
router.delete("/:id", protect, isAdmin, deleteTask);

export default router;