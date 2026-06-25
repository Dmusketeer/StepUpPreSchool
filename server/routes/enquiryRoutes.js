import { Router } from "express";
import { createEnquiry } from "../controllers/enquiryController.js";
import { writeLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.post("/enquiries", writeLimiter, createEnquiry);

export default router;
