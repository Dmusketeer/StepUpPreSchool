import crypto from "node:crypto";

const codeTtlMs = 10 * 60 * 1000;
const maxAttempts = 5;
const codeLength = 6;

let activeReset = null;

export function createPasswordResetCode() {
  const code = crypto.randomInt(0, 10 ** codeLength).toString().padStart(codeLength, "0");

  activeReset = {
    codeHash: hashCode(code),
    expiresAt: Date.now() + codeTtlMs,
    attemptsRemaining: maxAttempts
  };

  return code;
}

export function clearPasswordResetCode() {
  activeReset = null;
}

export function consumePasswordResetCode(code) {
  if (!activeReset) {
    return { ok: false, error: "No reset code is active. Request a new one." };
  }

  if (Date.now() > activeReset.expiresAt) {
    activeReset = null;
    return { ok: false, error: "Reset code has expired. Request a new one." };
  }

  if (activeReset.attemptsRemaining <= 0) {
    activeReset = null;
    return { ok: false, error: "Too many incorrect attempts. Request a new code." };
  }

  if (!isMatchingCode(code)) {
    activeReset.attemptsRemaining -= 1;
    return { ok: false, error: "Incorrect reset code." };
  }

  activeReset = null;
  return { ok: true };
}

function isMatchingCode(code) {
  const expected = Buffer.from(activeReset.codeHash, "hex");
  const actual = Buffer.from(hashCode(String(code ?? "")), "hex");

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}
