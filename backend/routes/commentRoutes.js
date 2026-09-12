import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { addComment, getComments, updateComment, deleteComment } from "../controllers/commentController.js";

const router = express.Router();

// POST /api/comments - add comment
router.post("/", protect, addComment);

// GET /api/comments?task_id=1 یا ?project_id=1 - get comments
router.get("/", protect, getComments);

// commentRoutes.js میں
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);
export default router;