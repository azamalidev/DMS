import { Router } from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

// GET categories - any authenticated user
router.get("/", authMiddleware, getCategories);

// POST category - admin only
router.post("/", authMiddleware, adminMiddleware, createCategory);

export default router;
