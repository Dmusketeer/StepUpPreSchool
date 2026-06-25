import { Router } from "express";
import { getEvents, getGallery, getMedia, getPrograms, getSite, getTestimonials } from "../controllers/siteController.js";

const router = Router();

router.get("/site", getSite);
router.get("/programs", getPrograms);
router.get("/events", getEvents);
router.get("/gallery", getGallery);
router.get("/media", getMedia);
router.get("/testimonials", getTestimonials);

export default router;
