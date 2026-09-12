import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getMemberProjects,
} from "../controllers/projectController.js";

const router = express.Router();

// Get member's assigned projects
router.get("/member-projects", protect, getMemberProjects);

// Get projects
router.get("/", protect, getProjects);

// Create project
router.post("/", protect, createProject);

// Update project
router.put("/:id", protect, updateProject);

// Delete project
router.delete("/:id", protect, deleteProject);

export default router;