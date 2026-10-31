import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { uploadsDir } from "../config/paths.js";

const placesApiBase = "https://places.googleapis.com/v1";
const maxImportablePhotos = 20;

const photoExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

export async function importGooglePlacePhotos(limit = 10) {
  if (!env.googleMapsApiKey) {
    return { ok: false, status: 400, error: "Google import is not configured. Add GOOGLE_MAPS_API_KEY to the server environment." };
  }

  const placeLookup = await resolvePlaceName();

  if (!placeLookup.ok) {
    return placeLookup;
  }

  const photoList = await fetchPlacePhotoList(placeLookup.placeName);

  if (!photoList.ok) {
    return photoList;
  }

  const requestedCount = Math.min(Math.max(Number(limit) || 10, 1), maxImportablePhotos);
  const selectedPhotos = photoList.photos.slice(0, requestedCount);

  if (!selectedPhotos.length) {
    return { ok: false, status: 404, error: "This Google listing has no photos available through the Places API." };
  }

  const downloads = await Promise.all(selectedPhotos.map((photo, index) => downloadPlacePhoto(photo, index)));
  const savedPhotos = downloads.filter((download) => download !== null);

  if (!savedPhotos.length) {
    return { ok: false, status: 502, error: "Google returned photo references but none could be downloaded." };
  }

  return { ok: true, photos: savedPhotos, displayName: placeLookup.displayName };
}

async function resolvePlaceName() {
  if (env.googlePlaceId) {
    return { ok: true, placeName: `places/${env.googlePlaceId}`, displayName: "" };
  }

  if (!env.googlePlaceQuery) {
    return {
      ok: false,
      status: 400,
      error: "Add GOOGLE_PLACE_ID (or GOOGLE_PLACE_QUERY) to the server environment so the school listing can be found."
    };
  }

  try {
    const response = await fetch(`${placesApiBase}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.googleMapsApiKey,
        "X-Goog-FieldMask": "places.id,places.displayName"
      },
      body: JSON.stringify({ textQuery: env.googlePlaceQuery, maxResultCount: 1 })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, status: 502, error: describeGoogleError(result, "Could not search for the Google listing.") };
    }

    const place = result.places?.[0];

    if (!place?.id) {
      return { ok: false, status: 404, error: `No Google listing matched "${env.googlePlaceQuery}".` };
    }

    return { ok: true, placeName: `places/${place.id}`, displayName: place.displayName?.text ?? "" };
  } catch (error) {
    console.error("Google place lookup failed", error);
    return { ok: false, status: 502, error: "Could not reach the Google Places API." };
  }
}

async function fetchPlacePhotoList(placeName) {
  try {
    const response = await fetch(`${placesApiBase}/${placeName}?fields=displayName,photos`, {
      headers: { "X-Goog-Api-Key": env.googleMapsApiKey }
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return { ok: false, status: 502, error: describeGoogleError(result, "Could not read photos from the Google listing.") };
    }

    return { ok: true, photos: Array.isArray(result.photos) ? result.photos : [] };
  } catch (error) {
    console.error("Google place photo list failed", error);
    return { ok: false, status: 502, error: "Could not reach the Google Places API." };
  }
}

async function downloadPlacePhoto(photo, index) {
  try {
    const mediaUrl = `${placesApiBase}/${photo.name}/media?maxWidthPx=1600&skipHttpRedirect=true`;
    const response = await fetch(mediaUrl, { headers: { "X-Goog-Api-Key": env.googleMapsApiKey } });
    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result.photoUri) {
      console.error("Google photo reference failed", result);
      return null;
    }

    const imageResponse = await fetch(result.photoUri);

    if (!imageResponse.ok) {
      return null;
    }

    const mimeType = imageResponse.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    const extension = photoExtensions[mimeType];

    if (!extension) {
      return null;
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const filename = `${Date.now()}-${crypto.randomUUID()}-google-photo-${index + 1}${extension}`;

    await fs.mkdir(uploadsDir, { recursive: true });
    await fs.writeFile(path.join(uploadsDir, filename), buffer);

    return {
      filename,
      mimeType,
      size: buffer.length,
      attribution: extractAttribution(photo)
    };
  } catch (error) {
    console.error("Google photo download failed", error);
    return null;
  }
}

function extractAttribution(photo) {
  const author = photo.authorAttributions?.[0];
  return author?.displayName ? `Photo by ${author.displayName} via Google` : "Photo via Google";
}

function describeGoogleError(result, fallback) {
  return result?.error?.message || fallback;
}
