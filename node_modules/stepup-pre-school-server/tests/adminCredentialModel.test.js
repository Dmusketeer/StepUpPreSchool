import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "stepup-admin-credentials-"));
const tempCredentialsPath = path.join(tempDir, "adminCredentials.json");

vi.mock("../config/paths.js", async (importOriginal) => {
  const original = await importOriginal();
  return { ...original, adminCredentialsPath: tempCredentialsPath };
});

const { changeAdminCredentials, getAdminUsername, validateAdminCredential } = await import("../models/adminCredentialModel.js");
const { env } = await import("../config/env.js");

describe("adminCredentialModel", () => {
  beforeEach(async () => {
    await fs.rm(tempCredentialsPath, { force: true });
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("seeds credentials from env and validates them", async () => {
    expect(await getAdminUsername()).toBe(env.adminUsername);
    expect(await validateAdminCredential(env.adminUsername, env.adminPassword)).toBe(true);
    expect(await validateAdminCredential(env.adminUsername, "wrong-password")).toBe(false);
  });

  it("rejects a credential change when the current password is wrong", async () => {
    const result = await changeAdminCredentials("not-the-password", { newPassword: "brand-new-pass" });
    expect(result).toMatchObject({ ok: false, status: 401 });
  });

  it("requires at least one new value", async () => {
    const result = await changeAdminCredentials(env.adminPassword, {});
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects an invalid admin id", async () => {
    expect(await changeAdminCredentials(env.adminPassword, { newUsername: "ab" })).toMatchObject({ ok: false, status: 400 });
    expect(await changeAdminCredentials(env.adminPassword, { newUsername: "bad id!" })).toMatchObject({ ok: false, status: 400 });
    expect(await validateAdminCredential(env.adminUsername, env.adminPassword)).toBe(true);
  });

  it("rejects a short password", async () => {
    const result = await changeAdminCredentials(env.adminPassword, { newPassword: "short" });
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it("updates the admin id only and keeps the password", async () => {
    const result = await changeAdminCredentials(env.adminPassword, { newUsername: "head.teacher" });

    expect(result).toMatchObject({ ok: true, username: "head.teacher", usernameChanged: true, passwordChanged: false });
    expect(await validateAdminCredential("head.teacher", env.adminPassword)).toBe(true);
    expect(await validateAdminCredential(env.adminUsername, env.adminPassword)).toBe(false);
  });

  it("updates the admin id and password together", async () => {
    const result = await changeAdminCredentials(env.adminPassword, {
      newUsername: "principal",
      newPassword: "super-secret-01"
    });

    expect(result).toMatchObject({ ok: true, username: "principal", usernameChanged: true, passwordChanged: true });
    expect(await validateAdminCredential("principal", "super-secret-01")).toBe(true);
    expect(await validateAdminCredential("principal", env.adminPassword)).toBe(false);
  });

  it("persists the updated credentials to disk", async () => {
    await changeAdminCredentials(env.adminPassword, { newUsername: "owner", newPassword: "another-secret" });

    const stored = JSON.parse(await fs.readFile(tempCredentialsPath, "utf8"));
    expect(stored.username).toBe("owner");
    expect(stored.password.algorithm).toBe("scrypt");
    expect(stored.password).not.toHaveProperty("plain");
    expect(JSON.stringify(stored)).not.toContain("another-secret");
  });
});
