import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  addProjectMember,
  getProjectMembers,
  removeProjectMember,
} from "../controllers/projectMemberController.js";

const router = express.Router();

// Add member
router.post("/", protect, addProjectMember);

// Get project members
router.get("/", protect, getProjectMembers);

// Remove member
router.delete("/:id", protect, removeProjectMember);

export default router;