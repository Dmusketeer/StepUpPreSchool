import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { envMock } = vi.hoisted(() => ({
  envMock: {
    googleMapsApiKey: "",
    googlePlaceId: "",
    googlePlaceQuery: ""
  }
}));

vi.mock("../config/env.js", () => ({
  env: envMock,
  isProduction: false
}));

import { uploadsDir } from "../config/paths.js";
import { importGooglePlacePhotos } from "../services/placesService.js";

const createdFiles = [];

function jsonResponse(body, ok = true) {
  return { ok, json: async () => body, headers: new Map() };
}

function imageResponse(mimeType = "image/jpeg") {
  return {
    ok: true,
    headers: { get: () => mimeType },
    arrayBuffer: async () => new TextEncoder().encode("fake-image-bytes").buffer
  };
}

beforeEach(() => {
  envMock.googleMapsApiKey = "test-key";
  envMock.googlePlaceId = "PLACE123";
  envMock.googlePlaceQuery = "";
});

afterEach(async () => {
  vi.restoreAllMocks();

  while (createdFiles.length) {
    await fs.unlink(path.join(uploadsDir, createdFiles.pop())).catch(() => undefined);
  }
});

describe("importGooglePlacePhotos", () => {
  it("refuses to run without an API key", async () => {
    envMock.googleMapsApiKey = "";

    const result = await importGooglePlacePhotos(5);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toMatch(/GOOGLE_MAPS_API_KEY/);
  });

  it("requires a place id or search query", async () => {
    envMock.googlePlaceId = "";

    const result = await importGooglePlacePhotos(5);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toMatch(/GOOGLE_PLACE_ID/);
  });

  it("downloads photos and keeps the Google attribution", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        if (String(url).includes("/media?")) {
          return jsonResponse({ photoUri: "https://example.test/photo.jpg" });
        }

        if (String(url).startsWith("https://example.test/")) {
          return imageResponse();
        }

        return jsonResponse({
          photos: [{ name: "places/PLACE123/photos/a", authorAttributions: [{ displayName: "StepUp Pre School" }] }]
        });
      })
    );

    const result = await importGooglePlacePhotos(1);

    expect(result.ok).toBe(true);
    expect(result.photos).toHaveLength(1);
    expect(result.photos[0].attribution).toBe("Photo by StepUp Pre School via Google");
    expect(result.photos[0].filename).toMatch(/google-photo-1\.jpg$/);

    createdFiles.push(result.photos[0].filename);
    await expect(fs.access(path.join(uploadsDir, result.photos[0].filename))).resolves.toBeUndefined();
  });

  it("reports when the listing exposes no photos", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ photos: [] })));

    const result = await importGooglePlacePhotos(5);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });

  it("surfaces Google API errors instead of throwing", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse({ error: { message: "API key not valid" } }, false)));

    const result = await importGooglePlacePhotos(5);

    expect(result.ok).toBe(false);
    expect(result.status).toBe(502);
    expect(result.error).toBe("API key not valid");
  });

  it("caps the number of imported photos", async () => {
    const photos = Array.from({ length: 30 }, (_, index) => ({
      name: `places/PLACE123/photos/${index}`,
      authorAttributions: [{ displayName: "Owner" }]
    }));

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) => {
        if (String(url).includes("/media?")) {
          return jsonResponse({ photoUri: "https://example.test/photo.jpg" });
        }

        if (String(url).startsWith("https://example.test/")) {
          return imageResponse();
        }

        return jsonResponse({ photos });
      })
    );

    const result = await importGooglePlacePhotos(99);

    expect(result.ok).toBe(true);
    expect(result.photos).toHaveLength(20);
    result.photos.forEach((photo) => createdFiles.push(photo.filename));
  });
});
