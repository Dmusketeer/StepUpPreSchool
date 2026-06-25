import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

export const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "",
  mongoDbName: process.env.MONGODB_DB_NAME || "stepup_pre_school",
  mongoServerSelectionTimeoutMs: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 2500,
  allowedOrigins: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
    : nodeEnv === "production" ? false : true,
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "stepup123",
  adminSessionDurationMs: 8 * 60 * 60 * 1000,
  whatsappGraphVersion: process.env.WHATSAPP_GRAPH_VERSION || "v20.0",
  whatsappAccessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  whatsappToNumber: process.env.WHATSAPP_TO_NUMBER
};

export const isProduction = env.nodeEnv === "production";
