import { describe, expect, it } from "vitest";
import { buildGalleryItems, createBrochureDownloadHref, createWhatsAppLink, formatCount } from "./publicUtils.js";

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

describe("buildGalleryItems", () => {
  const defaultGallery = [
    { title: "Story Corner", category: "Classroom", alt: "Story time", image: "/stock-1.jpg" },
    { title: "Creative Art", category: "Art Activities", alt: "Painting", image: "/stock-2.jpg" }
  ];

  it("falls back to the seeded gallery when nothing has been uploaded", () => {
    const items = buildGalleryItems({ media: [], gallery: defaultGallery });

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ id: "default-gallery-0", type: "image", src: "/stock-1.jpg", category: "Classroom" });
  });

  it("replaces the seeded gallery once media has been uploaded", () => {
    const items = buildGalleryItems({
      media: [{ id: "abc", type: "image", url: "/uploads/real.jpg", title: "Annual Day", category: "Celebrations" }],
      gallery: defaultGallery
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "abc", src: "/uploads/real.jpg", category: "Celebrations" });
    expect(items.some((item) => item.src.startsWith("/stock"))).toBe(false);
  });

  it("defaults missing alt text and category on uploaded media", () => {
    const [item] = buildGalleryItems({
      media: [{ id: "abc", type: "video", url: "/uploads/clip.mp4", title: "Sports Day" }],
      gallery: defaultGallery
    });

    expect(item.alt).toBe("Sports Day");
    expect(item.category).toBe("Recent Uploads");
  });

  it("returns an empty list when the site has no gallery data", () => {
    expect(buildGalleryItems({})).toEqual([]);
  });
});
