import { describe, expect, it } from "vitest";
import { getAllErpModules, getErpDashboardForRole, getErpModulesForRole, getErpRoles } from "../models/erpModel.js";

describe("erpModel", () => {
  it("returns all ERP roles", () => {
    expect(getErpRoles()).toEqual(expect.arrayContaining(["admin", "teacher", "parent"]));
  });

  it("filters modules by role", () => {
    const teacherModules = getErpModulesForRole("teacher");
    expect(teacherModules.length).toBeGreaterThan(0);
    expect(teacherModules.every((module) => module.roles.includes("teacher"))).toBe(true);
    expect(teacherModules.every((module) => typeof module.roleDescription === "string")).toBe(true);
  });

  it("returns dashboard with modules for known role", () => {
    const dashboard = getErpDashboardForRole("parent");
    expect(dashboard).toBeTruthy();
    expect(dashboard.role).toBe("parent");
    expect(Array.isArray(dashboard.modules)).toBe(true);
  });

  it("returns null dashboard for unknown role", () => {
    expect(getErpDashboardForRole("unknown")).toBeNull();
  });

  it("returns normalized module shape", () => {
    const modules = getAllErpModules();
    expect(modules[0]).toHaveProperty("key");
    expect(modules[0]).toHaveProperty("label");
    expect(modules[0]).toHaveProperty("metrics");
  });
});
