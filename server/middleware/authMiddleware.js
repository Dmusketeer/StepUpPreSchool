import { deleteAdminSession, validateAdminSession } from "../models/adminSessionModel.js";

export function requireAdmin(request, response, next) {
  const authorization = request.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";

  if (!validateAdminSession(token)) {
    deleteAdminSession(token);
    response.status(401).json({ error: "Admin login required." });
    return;
  }

  request.adminToken = token;
  next();
}
