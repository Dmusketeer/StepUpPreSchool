import { Router } from "express";
import {
  deleteAdminMedia,
  getAdminEnquiries,
  getAdminMedia,
  getAdminSite,
  login,
  logout,
  updateAdminPassword,
  updateAdminEnquiryStatus,
  updateAdminSite,
  uploadAdminMedia
} from "../controllers/adminController.js";
import { upload } from "../config/upload.js";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { authLimiter, writeLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.post("/login", authLimiter, login);
router.post("/logout", requireAdmin, logout);
router.put("/password", requireAdmin, writeLimiter, updateAdminPassword);
router.get("/site", requireAdmin, getAdminSite);
router.put("/site", requireAdmin, writeLimiter, updateAdminSite);
router.get("/enquiries", requireAdmin, getAdminEnquiries);
router.put("/enquiries/:id/status", requireAdmin, writeLimiter, updateAdminEnquiryStatus);
router.get("/media", requireAdmin, getAdminMedia);
router.post(
  "/media",
  requireAdmin,
  writeLimiter,
  upload.fields([
    { name: "files", maxCount: 20 },
    { name: "file", maxCount: 1 }
  ]),
  uploadAdminMedia
);
router.delete("/media/:id", requireAdmin, writeLimiter, deleteAdminMedia);

export default router;
