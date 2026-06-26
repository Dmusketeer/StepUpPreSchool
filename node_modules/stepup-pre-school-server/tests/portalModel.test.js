import { describe, expect, it } from "vitest";
import { getPortalDemoCredentials, loginPortalUser } from "../models/portalModel.js";

describe("portalModel", () => {
  it("returns demo credentials for parent and teacher", () => {
    const credentials = getPortalDemoCredentials();
    expect(credentials).toHaveProperty("parent.username", "parent");
    expect(credentials).toHaveProperty("teacher.username", "teacher");
  });

  it("authenticates valid user and excludes password", () => {
    const user = loginPortalUser("parent", "parent", "parent123");
    expect(user).toBeTruthy();
    expect(user).toHaveProperty("role", "parent");
    expect(user).not.toHaveProperty("password");
  });

  it("returns null for invalid credentials", () => {
    expect(loginPortalUser("parent", "parent", "wrong")).toBeNull();
    expect(loginPortalUser("unknown", "x", "y")).toBeNull();
  });
});
