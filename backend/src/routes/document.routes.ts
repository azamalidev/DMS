import { Router } from "express";
import { upload } from "../middleware/upload.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
  getDocumentById,
  updateDocument,
} from "../controllers/document.controller";

const router = Router();

router.post("/upload", authMiddleware, upload.single("file"), uploadDocument);
router.get("/", authMiddleware, getDocuments);
router.get("/:id", authMiddleware, getDocumentById);
router.put("/:id", authMiddleware, updateDocument);
router.delete("/:id", authMiddleware, deleteDocument);

export default router;
