import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { adminCredentialsPath } from "../config/paths.js";
import { getAdminCredentialModel } from "./mongooseModels.js";

const keyLength = 64;
const adminCredentialsDocumentId = "main";
const minUsernameLength = 3;
const maxUsernameLength = 32;
const minPasswordLength = 8;
const usernamePattern = /^[A-Za-z0-9._-]+$/;

export async function validateAdminCredential(username, password) {
  const credentials = await readAdminCredentials();

  if (username !== credentials.username) {
    return false;
  }

  return verifyPassword(password, credentials.password);
}

export async function getAdminUsername() {
  const credentials = await readAdminCredentials();
  return credentials.username;
}

export async function changeAdminCredentials(currentPassword, { newUsername = "", newPassword = "" } = {}) {
  if (!newUsername && !newPassword) {
    return { ok: false, status: 400, error: "Provide a new admin ID, a new password, or both." };
  }

  const credentials = await readAdminCredentials();

  if (!verifyPassword(currentPassword, credentials.password)) {
    return { ok: false, status: 401, error: "Current password is incorrect." };
  }

  if (newUsername) {
    const usernameError = validateUsername(newUsername);

    if (usernameError) {
      return { ok: false, status: 400, error: usernameError };
    }
  }

  if (newPassword && newPassword.length < minPasswordLength) {
    return { ok: false, status: 400, error: `New password must be at least ${minPasswordLength} characters.` };
  }

  const updatedCredentials = {
    ...credentials,
    username: newUsername || credentials.username,
    password: newPassword ? createPasswordRecord(newPassword) : credentials.password,
    updatedAt: new Date().toISOString()
  };

  await writeAdminCredentials(updatedCredentials);

  return {
    ok: true,
    username: updatedCredentials.username,
    usernameChanged: updatedCredentials.username !== credentials.username,
    passwordChanged: Boolean(newPassword),
    updatedAt: updatedCredentials.updatedAt
  };
}

function validateUsername(username) {
  if (username.length < minUsernameLength || username.length > maxUsernameLength) {
    return `Admin ID must be between ${minUsernameLength} and ${maxUsernameLength} characters.`;
  }

  if (!usernamePattern.test(username)) {
    return "Admin ID can only contain letters, numbers, dots, underscores, and hyphens.";
  }

  return "";
}

async function readAdminCredentials() {
  if (!env.mongoUri) {
    const legacyCredentials = await readLegacyAdminCredentials();

    if (isValidCredentialShape(legacyCredentials)) {
      return legacyCredentials;
    }

    const seededCredentials = {
      username: env.adminUsername,
      password: createPasswordRecord(env.adminPassword),
      updatedAt: new Date().toISOString()
    };
    await writeLegacyAdminCredentials(seededCredentials);
    return seededCredentials;
  }

  const AdminCredential = await getAdminCredentialModel();
  const credentialsDocument = await AdminCredential.findById(adminCredentialsDocumentId).lean();

  if (isValidCredentialShape(credentialsDocument)) {
    return withoutMongoId(credentialsDocument);
  }

  const legacyCredentials = await readLegacyAdminCredentials();

  if (isValidCredentialShape(legacyCredentials)) {
    await writeAdminCredentials(legacyCredentials);
    return legacyCredentials;
  }

  const seededCredentials = {
    username: env.adminUsername,
    password: createPasswordRecord(env.adminPassword),
    updatedAt: new Date().toISOString()
  };
  await writeAdminCredentials(seededCredentials);
  return seededCredentials;
}

async function readLegacyAdminCredentials() {
  try {
    const file = await fs.readFile(adminCredentialsPath, "utf8");
    return JSON.parse(file);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  return null;
}

async function writeAdminCredentials(credentials) {
  if (!env.mongoUri) {
    await writeLegacyAdminCredentials(credentials);
    return;
  }

  const AdminCredential = await getAdminCredentialModel();

  await AdminCredential.updateOne(
    { _id: adminCredentialsDocumentId },
    { $set: { ...credentials, updatedAt: credentials.updatedAt ?? new Date().toISOString() } },
    { upsert: true }
  );
}

async function writeLegacyAdminCredentials(credentials) {
  await fs.mkdir(path.dirname(adminCredentialsPath), { recursive: true });
  await fs.writeFile(adminCredentialsPath, JSON.stringify(credentials, null, 2));
}

function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString("hex");

  return {
    algorithm: "scrypt",
    salt,
    hash: crypto.scryptSync(password, salt, keyLength).toString("hex")
  };
}

function verifyPassword(password, passwordRecord) {
  if (!passwordRecord?.salt || !passwordRecord?.hash) {
    return false;
  }

  const expected = Buffer.from(passwordRecord.hash, "hex");
  const actual = crypto.scryptSync(password, passwordRecord.salt, expected.length);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function isValidCredentialShape(credentials) {
  return Boolean(credentials?.username && credentials?.password?.salt && credentials?.password?.hash);
}

function withoutMongoId(document) {
  const { _id, ...value } = document;
  return value;
}