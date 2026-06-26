import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";

const app = createApp();

describe("API routes", () => {
  it("GET /api/health returns status payload", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", service: "StepUp Pre School API" });
  });

  it("GET /api/portal/demo-credentials returns demo users", async () => {
    const response = await request(app).get("/api/portal/demo-credentials");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("parent.username", "parent");
    expect(response.body).toHaveProperty("teacher.username", "teacher");
  });

  it("POST /api/portal/login validates required fields", async () => {
    const response = await request(app).post("/api/portal/login").send({ role: "parent", username: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Role, username, and password are required.");
  });

  it("POST /api/portal/login rejects wrong credentials", async () => {
    const response = await request(app).post("/api/portal/login").send({ role: "parent", username: "parent", password: "wrong" });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid portal login details.");
  });

  it("POST /api/portal/login returns user with ERP payload", async () => {
    const response = await request(app).post("/api/portal/login").send({ role: "parent", username: "parent", password: "parent123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("user.role", "parent");
    expect(response.body).toHaveProperty("user.erp.role", "parent");
  });

  it("GET /api/erp/modules filters by role", async () => {
    const response = await request(app).get("/api/erp/modules").query({ role: "teacher" });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ready-for-implementation");
    expect(response.body.modules.length).toBeGreaterThan(0);
    expect(response.body.modules.every((module) => module.roles.includes("teacher"))).toBe(true);
  });

  it("GET /api/erp/dashboard/:role returns 404 for unknown role", async () => {
    const response = await request(app).get("/api/erp/dashboard/unknown");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("ERP role not found.");
  });

  it("POST /api/enquiries rejects incomplete payload", async () => {
    const response = await request(app).post("/api/enquiries").send({ guardianName: "Parent" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Please complete all required fields.");
  });

  it("returns API not found payload for unknown API route", async () => {
    const response = await request(app).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("API route not found.");
  });
});
