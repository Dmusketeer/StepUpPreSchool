import crypto from "node:crypto";
import { getErpDashboardForRole } from "../models/erpModel.js";
import { getPortalDemoCredentials, loginPortalUser } from "../models/portalModel.js";
import { clean } from "../utils/textUtils.js";

export function getPortalCredentials(_request, response) {
  response.json(getPortalDemoCredentials());
}

export function loginPortal(request, response) {
  const role = clean(request.body.role).toLowerCase();
  const username = clean(request.body.username);
  const password = clean(request.body.password);

  if (!role || !username || !password) {
    response.status(400).json({ error: "Role, username, and password are required." });
    return;
  }

  const user = loginPortalUser(role, username, password);

  if (!user) {
    response.status(401).json({ error: "Invalid portal login details." });
    return;
  }

  response.json({
    token: crypto.randomBytes(24).toString("hex"),
    user: {
      ...user,
      erp: getErpDashboardForRole(user.role)
    }
  });
}
