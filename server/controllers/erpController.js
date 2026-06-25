import { getAllErpModules, getErpDashboardForRole, getErpModulesForRole, getErpRoles } from "../models/erpModel.js";
import { clean } from "../utils/textUtils.js";

export function getErpModules(request, response) {
  const role = clean(request.query.role).toLowerCase();

  response.json({
    status: "ready-for-implementation",
    roles: getErpRoles(),
    modules: role ? getErpModulesForRole(role) : getAllErpModules()
  });
}

export function getErpDashboard(request, response) {
  const role = clean(request.params.role).toLowerCase();
  const dashboard = getErpDashboardForRole(role);

  if (!dashboard) {
    response.status(404).json({ error: "ERP role not found." });
    return;
  }

  response.json(dashboard);
}
