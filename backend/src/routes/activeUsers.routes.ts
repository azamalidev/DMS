import { Router } from "express";
import { getActiveUsersApi } from "../controllers/activeUsers.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

router.get("/", authMiddleware, adminMiddleware, getActiveUsersApi);

export default router;
