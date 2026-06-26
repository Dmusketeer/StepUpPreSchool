import fsSync from "node:fs";
import multer from "multer";
import { uploadsDir } from "./paths.js";
import { createUploadFileName } from "../utils/uploadUtils.js";

const uploadErrorMessage = "Only image and video files are allowed.";
const allowedUploadMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

export const upload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => {
      fsSync.mkdirSync(uploadsDir, { recursive: true });
      callback(null, uploadsDir);
    },
    filename: (_request, file, callback) => {
      callback(null, createUploadFileName(file.originalname));
    }
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 20
  },
  fileFilter: (_request, file, callback) => {
    if (allowedUploadMimeTypes.has(file.mimetype)) {
      callback(null, true);
      return;
    }

    callback(new Error(uploadErrorMessage));
  }
});

export function isUploadError(error) {
  return error instanceof multer.MulterError || error.message === uploadErrorMessage;
}
