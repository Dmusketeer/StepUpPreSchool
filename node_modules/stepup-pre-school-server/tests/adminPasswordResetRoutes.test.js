import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "stepup-admin-reset-"));
const tempCredentialsPath = path.join(tempDir, "adminCredentials.json");

vi.mock("../config/paths.js", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, adminCredentialsPath: tempCredentialsPath };
});

const passThroughMiddleware = (_request, _response, next) => next();
vi.mock("../middleware/rateLimitMiddleware.js", () => ({
  apiLimiter: passThroughMiddleware,
  authLimiter: passThroughMiddleware,
  writeLimiter: passThroughMiddleware,
  passwordResetRequestLimiter: passThroughMiddleware,
  passwordResetConfirmLimiter: passThroughMiddleware
}));

const sendWhatsAppMessageMock = vi.fn();
vi.mock("../services/whatsappService.js", () => ({
  sendWhatsAppMessage: (...args) => sendWhatsAppMessageMock(...args)
}));

const { createApp } = await import("../app.js");
const { env } = await import("../config/env.js");
const { clearPasswordResetCode } = await import("../models/adminPasswordResetModel.js");

const app = createApp();

function extractCode(message) {
  return message.match(/\b(\d{6})\b/)[1];
}

async function requestResetCode() {
  const response = await request(app).post("/api/admin/password-reset/request");
  const code = response.status === 200 ? extractCode(sendWhatsAppMessageMock.mock.calls.at(-1)[0]) : null;
  return { response, code };
}

describe("admin password reset routes", () => {
  beforeEach(async () => {
    await fs.rm(tempCredentialsPath, { force: true });
    clearPasswordResetCode();
    sendWhatsAppMessageMock.mockReset();
    sendWhatsAppMessageMock.mockResolvedValue({ sent: true, messageId: "mock-id" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("sends a 6-digit reset code via WhatsApp", async () => {
    const { response, code } = await requestResetCode();

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/WhatsApp/);
    expect(code).toMatch(/^\d{6}$/);
  });

  it("returns 503 when WhatsApp is not configured", async () => {
    sendWhatsAppMessageMock.mockResolvedValue({ sent: false, reason: "WhatsApp API is not configured." });

    const response = await request(app).post("/api/admin/password-reset/request");

    expect(response.status).toBe(503);
    expect(response.body.error).toMatch(/WhatsApp API is not configured/);
  });

  it("rejects confirmation with a wrong code", async () => {
    await requestResetCode();

    const response = await request(app)
      .post("/api/admin/password-reset/confirm")
      .send({ code: "000000", newPassword: "brand-new-pass-1" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Incorrect reset code.");
  });

  it("rejects confirmation without requesting a code first", async () => {
    const response = await request(app)
      .post("/api/admin/password-reset/confirm")
      .send({ code: "123456", newPassword: "brand-new-pass-1" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/No reset code is active/);
  });

  it("requires a new password of at least 8 characters", async () => {
    const { code } = await requestResetCode();

    const response = await request(app).post("/api/admin/password-reset/confirm").send({ code, newPassword: "short" });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/at least 8 characters/);
  });

  it("resets the password only, keeping the admin id, and logs in with it", async () => {
    const { code } = await requestResetCode();

    const response = await request(app)
      .post("/api/admin/password-reset/confirm")
      .send({ code, newPassword: "recovered-pass-1" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: env.adminUsername, usernameChanged: false, passwordChanged: true });

    const login = await request(app).post("/api/admin/login").send({ username: env.adminUsername, password: "recovered-pass-1" });
    expect(login.status).toBe(200);
  });

  it("resets both the admin id and password together", async () => {
    const { code } = await requestResetCode();

    const response = await request(app)
      .post("/api/admin/password-reset/confirm")
      .send({ code, newUsername: "recovered.owner", newPassword: "recovered-pass-2" });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ username: "recovered.owner", usernameChanged: true, passwordChanged: true });

    const oldLogin = await request(app).post("/api/admin/login").send({ username: env.adminUsername, password: env.adminPassword });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app).post("/api/admin/login").send({ username: "recovered.owner", password: "recovered-pass-2" });
    expect(newLogin.status).toBe(200);
  });

  it("invalidates existing admin sessions after a password reset", async () => {
    const loginBefore = await request(app).post("/api/admin/login").send({ username: env.adminUsername, password: env.adminPassword });
    expect(loginBefore.status).toBe(200);

    const { code } = await requestResetCode();
    await request(app).post("/api/admin/password-reset/confirm").send({ code, newPassword: "post-reset-pass-1" });

    const accountCheck = await request(app).get("/api/admin/account").set("Authorization", `Bearer ${loginBefore.body.token}`);
    expect(accountCheck.status).toBe(401);
  });

  it("is single-use: the same code cannot be replayed", async () => {
    const { code } = await requestResetCode();

    const first = await request(app).post("/api/admin/password-reset/confirm").send({ code, newPassword: "first-use-pass-1" });
    expect(first.status).toBe(200);

    const replay = await request(app).post("/api/admin/password-reset/confirm").send({ code, newPassword: "replay-pass-123" });
    expect(replay.status).toBe(400);
  });
});
