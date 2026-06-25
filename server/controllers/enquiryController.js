import crypto from "node:crypto";
import { listEnquiries, saveEnquiry } from "../models/enquiryModel.js";
import { sendWhatsAppNotification } from "../services/whatsappService.js";
import { clean, parseLimit } from "../utils/textUtils.js";

export async function getEnquiries(request, response, next) {
  try {
    response.json(await listEnquiries(parseLimit(request.query.limit)));
  } catch (error) {
    next(error);
  }
}

export async function createEnquiry(request, response, next) {
  try {
    const guardianName = clean(request.body.guardianName);
    const phone = clean(request.body.phone);
    const email = clean(request.body.email);
    const childName = clean(request.body.childName);
    const childAge = clean(request.body.childAge);
    const interest = clean(request.body.interest);
    const message = clean(request.body.message);

    if (!guardianName || !phone || !childName || !childAge || !interest) {
      response.status(400).json({ error: "Please complete all required fields." });
      return;
    }

    const enquiry = await saveEnquiry({
      id: crypto.randomUUID(),
      guardianName,
      phone,
      email,
      childName,
      childAge,
      interest,
      message,
      createdAt: new Date().toISOString()
    });

    const whatsappNotification = await sendWhatsAppNotification(enquiry);

    response.status(201).json({
      message: "Thank you. StepUp Pre School will contact you soon.",
      enquiry,
      whatsappNotification
    });
  } catch (error) {
    next(error);
  }
}
