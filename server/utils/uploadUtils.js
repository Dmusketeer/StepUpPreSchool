import crypto from "node:crypto";
import path from "node:path";
import { appendNumberWhenNeeded } from "./textUtils.js";

export function createUploadFileName(originalName) {
  const extension = path.extname(originalName).toLowerCase();
  const baseName = path
    .basename(originalName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

  return `${Date.now()}-${crypto.randomUUID()}-${baseName || "media"}${extension}`;
}

export function getUploadedFiles(files) {
  if (Array.isArray(files)) {
    return files;
  }

  return Object.values(files ?? {}).flat();
}

export function createMediaItem(file, baseTitle, baseAlt, category, totalFiles, index) {
  const fileTitle = path.basename(file.originalname, path.extname(file.originalname));
  const title = baseTitle ? appendNumberWhenNeeded(baseTitle, totalFiles, index) : fileTitle;
  const alt = baseAlt ? appendNumberWhenNeeded(baseAlt, totalFiles, index) : title;

  return {
    id: crypto.randomUUID(),
    type: file.mimetype.startsWith("video/") ? "video" : "image",
    title,
    alt,
    category,
    url: `/uploads/${file.filename}`,
    filename: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    createdAt: new Date().toISOString()
  };
}
