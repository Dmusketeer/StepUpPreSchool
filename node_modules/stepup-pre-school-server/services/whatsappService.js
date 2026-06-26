import { env } from "../config/env.js";

export async function sendWhatsAppNotification(enquiry) {
  const recipientNumber = normalizeWhatsAppNumber(env.whatsappToNumber);

  if (!env.whatsappAccessToken || !env.whatsappPhoneNumberId || !recipientNumber) {
    return {
      sent: false,
      reason: "WhatsApp API is not configured. Add WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_TO_NUMBER."
    };
  }

  const apiUrl = `https://graph.facebook.com/${env.whatsappGraphVersion}/${env.whatsappPhoneNumberId}/messages`;
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.whatsappAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientNumber,
        type: "text",
        text: {
          preview_url: false,
          body: buildWhatsAppMessage(enquiry)
        }
      })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("WhatsApp notification failed", result);
      return {
        sent: false,
        reason: result.error?.message || "WhatsApp notification failed."
      };
    }

    return {
      sent: true,
      messageId: result.messages?.[0]?.id || null
    };
  } catch (error) {
    console.error("WhatsApp notification failed", error);
    return {
      sent: false,
      reason: "WhatsApp notification failed. Check network and API credentials."
    };
  }
}

function buildWhatsAppMessage(enquiry) {
  return [
    "New StepUp Pre School enquiry",
    "",
    `Parent: ${enquiry.guardianName}`,
    `Phone: ${enquiry.phone}`,
    `Email: ${enquiry.email || "Not provided"}`,
    `Child: ${enquiry.childName}`,
    `Child Age: ${enquiry.childAge}`,
    `Program: ${enquiry.interest}`,
    `Message: ${enquiry.message || "Not provided"}`,
    `Submitted: ${new Date(enquiry.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
  ].join("\n");
}

function normalizeWhatsAppNumber(value) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}