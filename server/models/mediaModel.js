import fs from "node:fs/promises";
import path from "node:path";
import { uploadsDir } from "../config/paths.js";
import { readSiteData, writeSiteData } from "./siteModel.js";

export async function listMedia() {
  const siteData = await readSiteData();
  return siteData.media;
}

export async function addMediaItems(mediaItems) {
  const siteData = await readSiteData();
  siteData.media = [...mediaItems, ...siteData.media].slice(0, 100);
  await writeSiteData(siteData);
  return mediaItems;
}

export async function deleteMedia(id) {
  const siteData = await readSiteData();
  const media = siteData.media.find((item) => item.id === id);

  if (!media) {
    return null;
  }

  siteData.media = siteData.media.filter((item) => item.id !== id);
  await writeSiteData(siteData);

  if (media.filename) {
    await fs.unlink(path.join(uploadsDir, media.filename)).catch(() => undefined);
  }

  return media;
}
