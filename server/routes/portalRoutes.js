import { Router } from "express";
import { getPortalCredentials, loginPortal } from "../controllers/portalController.js";

const router = Router();

router.get("/portal/demo-credentials", getPortalCredentials);
router.post("/portal/login", loginPortal);

export default router;
