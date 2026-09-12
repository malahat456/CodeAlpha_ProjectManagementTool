import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadFile, getAttachments, deleteAttachment } from "../controllers/fileController.js";

const router = express.Router();

router.post("/upload", protect, uploadFile);
router.get("/", protect, getAttachments);
router.delete("/:id", protect, deleteAttachment);

export default router;