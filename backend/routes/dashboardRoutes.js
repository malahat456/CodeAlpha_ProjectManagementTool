import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminStats } from "../controllers/dashboardController.js";

const router = express.Router();
router.get("/admin", protect, adminStats);

export default router;
