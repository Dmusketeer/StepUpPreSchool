import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { siteDataPath } from "../config/paths.js";
import defaultSchoolData from "../data/schoolData.js";
import { getSiteContentModel } from "./mongooseModels.js";
import { clone, isPlainObject } from "../utils/textUtils.js";

const siteDocumentId = "main";

export async function readSiteData() {
  if (!env.mongoUri) {
    return ensureSiteShape(await readLegacySiteData());
  }

  const SiteContent = await getSiteContentModel();
  const siteDocument = await SiteContent.findById(siteDocumentId).lean();

  if (siteDocument?.data) {
    return ensureSiteShape(siteDocument.data);
  }

  const seededData = ensureSiteShape(await readLegacySiteData());
  await writeSiteData(seededData);
  return seededData;
}

export async function writeSiteData(siteData) {
  const normalizedSiteData = ensureSiteShape(siteData);

  if (!env.mongoUri) {
    await writeLegacySiteData(normalizedSiteData);
    return;
  }

  const SiteContent = await getSiteContentModel();

  await SiteContent.updateOne(
    { _id: siteDocumentId },
    { $set: { data: normalizedSiteData, updatedAt: new Date().toISOString() } },
    { upsert: true }
  );
}

async function readLegacySiteData() {
  try {
    const file = await fs.readFile(siteDataPath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    if (error.code === "ENOENT") {
      return defaultSchoolData;
    }

    throw error;
  }
}

async function writeLegacySiteData(siteData) {
  await fs.mkdir(path.dirname(siteDataPath), { recursive: true });
  await fs.writeFile(siteDataPath, JSON.stringify(siteData, null, 2));
}

export function ensureSiteShape(value) {
  const fallback = clone(defaultSchoolData);
  const siteData = isPlainObject(value) ? value : {};

  return {
    ...fallback,
    ...siteData,
    hero: { ...fallback.hero, ...(isPlainObject(siteData.hero) ? siteData.hero : {}) },
    about: { ...fallback.about, ...(isPlainObject(siteData.about) ? siteData.about : {}) },
    contact: { ...fallback.contact, ...(isPlainObject(siteData.contact) ? siteData.contact : {}) },
    socialLinks: { ...fallback.socialLinks, ...(isPlainObject(siteData.socialLinks) ? siteData.socialLinks : {}) },
    stats: Array.isArray(siteData.stats) ? siteData.stats : fallback.stats,
    programs: Array.isArray(siteData.programs) ? siteData.programs : fallback.programs,
    whyStepUp: Array.isArray(siteData.whyStepUp) ? siteData.whyStepUp : fallback.whyStepUp,
    dailyRhythm: Array.isArray(siteData.dailyRhythm) ? siteData.dailyRhythm : fallback.dailyRhythm,
    admissions: Array.isArray(siteData.admissions) ? siteData.admissions : fallback.admissions,
    fees: { ...fallback.fees, ...(isPlainObject(siteData.fees) ? siteData.fees : {}) },
    brochure: { ...fallback.brochure, ...(isPlainObject(siteData.brochure) ? siteData.brochure : {}) },
    gallery: Array.isArray(siteData.gallery) ? siteData.gallery : fallback.gallery,
    galleryCategories: Array.isArray(siteData.galleryCategories) ? siteData.galleryCategories : fallback.galleryCategories,
    media: Array.isArray(siteData.media) ? siteData.media : [],
    events: Array.isArray(siteData.events) ? siteData.events : fallback.events,
    notices: Array.isArray(siteData.notices) ? siteData.notices : fallback.notices,
    teachers: Array.isArray(siteData.teachers) ? siteData.teachers : fallback.teachers,
    testimonials: Array.isArray(siteData.testimonials) ? siteData.testimonials : fallback.testimonials,
    faqs: Array.isArray(siteData.faqs) ? siteData.faqs : fallback.faqs,
    map: { ...fallback.map, ...(isPlainObject(siteData.map) ? siteData.map : {}) }
  };
}
