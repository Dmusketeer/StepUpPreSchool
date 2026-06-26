import { beforeEach, describe, expect, it, vi } from "vitest";
import { authHeaders, requestJson } from "./apiClient.js";

describe("apiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends JSON header for non-FormData requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ ok: true })
    });
    vi.stubGlobal("fetch", fetchMock);

    await requestJson("/api/health", { method: "GET" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/health",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ "Content-Type": "application/json" })
      })
    );
  });

  it("does not force JSON header for FormData", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ uploaded: true })
    });
    vi.stubGlobal("fetch", fetchMock);

    const formData = new FormData();
    formData.append("file", new Blob(["abc"], { type: "text/plain" }), "a.txt");

    await requestJson("/api/upload", { method: "POST", body: formData });

    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["Content-Type"]).toBeUndefined();
  });

  it("throws enriched errors for non-ok responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: "Bad request" })
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestJson("/api/fail")).rejects.toMatchObject({
      message: "Bad request",
      status: 400,
      data: { error: "Bad request" }
    });
  });

  it("builds auth headers only when token exists", () => {
    expect(authHeaders("token-123")).toEqual({ Authorization: "Bearer token-123" });
    expect(authHeaders("")).toEqual({});
  });
});
