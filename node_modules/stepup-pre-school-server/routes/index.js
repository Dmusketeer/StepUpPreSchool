import { Router } from "express";
import { getHealth } from "../controllers/healthController.js";
import adminRoutes from "./adminRoutes.js";
import enquiryRoutes from "./enquiryRoutes.js";
import erpRoutes from "./erpRoutes.js";
import portalRoutes from "./portalRoutes.js";
import siteRoutes from "./siteRoutes.js";
import visitorRoutes from "./visitorRoutes.js";

const router = Router();

router.get("/health", getHealth);
router.use(siteRoutes);
router.use(enquiryRoutes);
router.use(portalRoutes);
router.use(erpRoutes);
router.use(visitorRoutes);
router.use("/admin", adminRoutes);

export default router;
