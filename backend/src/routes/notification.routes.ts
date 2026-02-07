import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notification.controller";
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// GET /notifications - get notifications for authenticated user
router.get("/", authMiddleware, getNotifications);

// PUT /notifications/:id/read - mark a notification as read
router.put("/:id/read", authMiddleware, markAsRead);

export default router;