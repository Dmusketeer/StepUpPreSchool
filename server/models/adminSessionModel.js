import crypto from "node:crypto";
import { env } from "../config/env.js";

const adminSessions = new Map();

export function createAdminSession(username = env.adminUsername) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + env.adminSessionDurationMs;
  adminSessions.set(token, expiresAt);

  return { token, expiresAt, username };
}

export function deleteAdminSession(token) {
  adminSessions.delete(token);
}

export function validateAdminSession(token) {
  const expiresAt = adminSessions.get(token);

  if (!token || !expiresAt || expiresAt < Date.now()) {
    adminSessions.delete(token);
    return false;
  }

  return true;
}
