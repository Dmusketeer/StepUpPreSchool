import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { requireAdmin } from "../middleware/authMiddleware.js";
import { createAdminSession } from "../models/adminSessionModel.js";

function buildApp() {
  const app = express();
  app.get("/protected", requireAdmin, (req, res) => {
    res.json({ ok: true, token: req.adminToken });
  });
  return app;
}

describe("requireAdmin middleware", () => {
  let app;

  beforeEach(() => {
    app = buildApp();
  });

  it("rejects missing token", async () => {
    const response = await request(app).get("/protected");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Admin login required.");
  });

  it("rejects invalid token", async () => {
    const response = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Admin login required.");
  });

  it("accepts valid token", async () => {
    const session = createAdminSession("admin");

    const response = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${session.token}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ ok: true, token: session.token });
  });
});
