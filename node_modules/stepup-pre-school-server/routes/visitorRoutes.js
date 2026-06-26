import { Router } from "express";
import { createVisit, getVisits } from "../controllers/visitorController.js";

const router = Router();

router.get("/visits", getVisits);
router.post("/visits", createVisit);

export default router;