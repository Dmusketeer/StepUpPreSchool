import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "stepup-admin-routes-"));
const tempCredentialsPath = path.join(tempDir, "adminCredentials.json");

vi.mock("../config/paths.js", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, adminCredentialsPath: tempCredentialsPath };
});

const { createApp } = await import("../app.js");
const { env } = await import("../config/env.js");

const app = createApp();

async function loginAs(username, password) {
  return request(app).post("/api/admin/login").send({ username, password });
}

describe("admin credential routes", () => {
  beforeEach(async () => {
    await fs.rm(tempCredentialsPath, { force: true });
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("GET /api/admin/account returns the current admin id", async () => {
    const session = await loginAs(env.adminUsername, env.adminPassword);
    expect(session.status).toBe(200);

    const response = await request(app).get("/api/admin/account").set("Authorization", `Bearer ${session.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.username).toBe(env.adminUsername);
  });

  it("PUT /api/admin/credentials requires authentication", async () => {
    const response = await request(app).put("/api/admin/credentials").send({ currentPassword: env.adminPassword, newUsername: "nope" });

    expect(response.status).toBe(401);
  });

  it("PUT /api/admin/credentials rejects an empty change", async () => {
    const session = await loginAs(env.adminUsername, env.adminPassword);
    const response = await request(app)
      .put("/api/admin/credentials")
      .set("Authorization", `Bearer ${session.body.token}`)
      .send({ currentPassword: env.adminPassword });

    expect(response.status).toBe(400);
  });

  it("resets the admin id and password, then logs in with the new details", async () => {
    const session = await loginAs(env.adminUsername, env.adminPassword);

    const response = await request(app)
      .put("/api/admin/credentials")
      .set("Authorization", `Bearer ${session.body.token}`)
      .send({ currentPassword: env.adminPassword, newUsername: "stepup.head", newPassword: "fresh-pass-2026" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: "stepup.head", usernameChanged: true, passwordChanged: true });

    const oldLogin = await loginAs(env.adminUsername, env.adminPassword);
    expect(oldLogin.status).toBe(401);

    const newLogin = await loginAs("stepup.head", "fresh-pass-2026");
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.username).toBe("stepup.head");
  });

  it("keeps the legacy PUT /api/admin/password route working", async () => {
    const session = await loginAs(env.adminUsername, env.adminPassword);

    const response = await request(app)
      .put("/api/admin/password")
      .set("Authorization", `Bearer ${session.body.token}`)
      .send({ currentPassword: env.adminPassword, newPassword: "legacy-pass-2026" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: env.adminUsername, passwordChanged: true });

    const newLogin = await loginAs(env.adminUsername, "legacy-pass-2026");
    expect(newLogin.status).toBe(200);
  });
});
