import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const configDir = path.dirname(__filename);

export const serverRoot = path.resolve(configDir, "..");
export const dataDir = path.join(serverRoot, "data");
export const adminCredentialsPath = path.join(dataDir, "adminCredentials.json");
export const enquiriesPath = path.join(dataDir, "enquiries.json");
export const siteDataPath = path.join(dataDir, "siteContent.json");
export const visitorStatsPath = path.join(dataDir, "visitorStats.json");
export const uploadsDir = path.join(serverRoot, "uploads");
export const clientDistPath = path.resolve(serverRoot, "..", "client", "dist");
