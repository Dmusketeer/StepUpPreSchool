import { describe, expect, it } from "vitest";
import { createBrochureDownloadHref, createWhatsAppLink, formatCount } from "./publicUtils.js";

describe("publicUtils", () => {
  it("creates a WhatsApp link with normalized phone and encoded text", () => {
    const link = createWhatsAppLink("+91 98765-43210", "Hello StepUp & team");
    expect(link).toBe("https://wa.me/919876543210?text=Hello%20StepUp%20%26%20team");
  });

  it("formats counts in Indian locale", () => {
    expect(formatCount(123456)).toBe("1,23,456");
    expect(formatCount("invalid")).toBe("0");
  });

  it("creates a PDF brochure data URI", () => {
    const href = createBrochureDownloadHref({
      brochure: {
        title: "StepUp Brochure",
        description: "School details"
      },
      contact: {
        hours: "9 AM to 1 PM",
        phone: "9999999999",
        email: "hello@stepup.test",
        address: "Pune"
      },
      fees: {
        items: [{ title: "Admission", amount: "5000", description: "One-time" }],
        note: "Fees may change"
      }
    });

    expect(href.startsWith("data:application/pdf;base64,")).toBe(true);
    const base64Data = href.split(",")[1];
    const pdf = atob(base64Data);
    expect(pdf.startsWith("%PDF-1.4")).toBe(true);
  });
});
