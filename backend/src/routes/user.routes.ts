import { Router } from "express";
import { getUsers } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";

const router = Router();

// GET /users - admin only
router.get("/", authMiddleware, adminMiddleware, getUsers);

export default router;
