import { Router } from "express";
import { getErpDashboard, getErpModules } from "../controllers/erpController.js";

const router = Router();

router.get("/erp/modules", getErpModules);
router.get("/erp/dashboard/:role", getErpDashboard);

export default router;
