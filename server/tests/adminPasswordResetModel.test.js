import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPasswordResetCode,
  consumePasswordResetCode,
  createPasswordResetCode
} from "../models/adminPasswordResetModel.js";

describe("adminPasswordResetModel", () => {
  beforeEach(() => {
    clearPasswordResetCode();
  });

  it("generates a 6-digit numeric code", () => {
    const code = createPasswordResetCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("accepts the correct code exactly once", () => {
    const code = createPasswordResetCode();

    expect(consumePasswordResetCode(code)).toEqual({ ok: true });
    expect(consumePasswordResetCode(code)).toMatchObject({ ok: false, error: expect.stringContaining("No reset code") });
  });

  it("rejects an incorrect code without consuming the real one", () => {
    const code = createPasswordResetCode();

    expect(consumePasswordResetCode("000000")).toMatchObject({ ok: false, error: "Incorrect reset code." });
    expect(consumePasswordResetCode(code)).toEqual({ ok: true });
  });

  it("locks out after too many incorrect attempts", () => {
    const code = createPasswordResetCode();
    const wrongCode = code === "111111" ? "222222" : "111111";

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(consumePasswordResetCode(wrongCode)).toMatchObject({ ok: false });
    }

    expect(consumePasswordResetCode(code)).toMatchObject({ ok: false, error: expect.stringContaining("Too many incorrect attempts") });
  });

  it("reports no active code when none was requested", () => {
    expect(consumePasswordResetCode("123456")).toMatchObject({ ok: false, error: expect.stringContaining("No reset code") });
  });

  it("expires the code after the TTL window", () => {
    vi.useFakeTimers();

    try {
      const code = createPasswordResetCode();
      vi.advanceTimersByTime(10 * 60 * 1000 + 1);
      expect(consumePasswordResetCode(code)).toMatchObject({ ok: false, error: expect.stringContaining("expired") });
    } finally {
      vi.useRealTimers();
    }
  });
});
