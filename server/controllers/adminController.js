import { changeAdminPassword, validateAdminCredential } from "../models/adminCredentialModel.js";
import { createAdminSession, deleteAdminSession } from "../models/adminSessionModel.js";
import { listEnquiries, updateEnquiryStatus } from "../models/enquiryModel.js";
import { addMediaItems, deleteMedia, listMedia } from "../models/mediaModel.js";
import { ensureSiteShape, readSiteData, writeSiteData } from "../models/siteModel.js";
import { clean, isPlainObject, parseLimit } from "../utils/textUtils.js";
import { createMediaItem, getUploadedFiles } from "../utils/uploadUtils.js";

export async function login(request, response, next) {
  const username = clean(request.body.username);
  const password = clean(request.body.password);

  try {
    if (!(await validateAdminCredential(username, password))) {
      response.status(401).json({ error: "Invalid admin username or password." });
      return;
    }

    response.json(createAdminSession(username));
  } catch (error) {
    next(error);
  }
}

export function logout(request, response) {
  deleteAdminSession(request.adminToken);
  response.json({ message: "Logged out." });
}

export async function getAdminSite(_request, response, next) {
  try {
    response.json(await readSiteData());
  } catch (error) {
    next(error);
  }
}

export async function updateAdminSite(request, response, next) {
  try {
    if (!isPlainObject(request.body)) {
      response.status(400).json({ error: "Website data must be a JSON object." });
      return;
    }

    const siteData = ensureSiteShape(request.body);
    await writeSiteData(siteData);
    response.json({ message: "Website data saved.", siteData });
  } catch (error) {
    next(error);
  }
}

export async function getAdminEnquiries(request, response, next) {
  try {
    response.json(await listEnquiries(parseLimit(request.query.limit)));
  } catch (error) {
    next(error);
  }
}

export async function updateAdminEnquiryStatus(request, response, next) {
  try {
    const status = clean(request.body.status);
    const allowedStatuses = new Set(["new", "contacted", "admitted", "closed"]);

    if (!allowedStatuses.has(status)) {
      response.status(400).json({ error: "Choose a valid enquiry status." });
      return;
    }

    const enquiry = await updateEnquiryStatus(request.params.id, status);

    if (!enquiry) {
      response.status(404).json({ error: "Enquiry not found." });
      return;
    }

    response.json({ message: "Enquiry status updated.", enquiry });
  } catch (error) {
    next(error);
  }
}

export async function getAdminMedia(_request, response, next) {
  try {
    response.json(await listMedia());
  } catch (error) {
    next(error);
  }
}

export async function uploadAdminMedia(request, response, next) {
  try {
    const uploadedFiles = getUploadedFiles(request.files);

    if (!uploadedFiles.length) {
      response.status(400).json({ error: "Please choose one or more photo or video files." });
      return;
    }

    const baseTitle = clean(request.body.title);
    const baseAlt = clean(request.body.alt);
    const category = clean(request.body.category) || "Recent Uploads";
    const mediaItems = uploadedFiles.map((file, index) => createMediaItem(file, baseTitle, baseAlt, category, uploadedFiles.length, index));

    await addMediaItems(mediaItems);

    response.status(201).json({
      message: `${mediaItems.length} media file${mediaItems.length === 1 ? "" : "s"} uploaded.`,
      media: mediaItems
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminMedia(request, response, next) {
  try {
    const deletedMedia = await deleteMedia(request.params.id);

    if (!deletedMedia) {
      response.status(404).json({ error: "Media item not found." });
      return;
    }

    response.json({ message: "Media deleted." });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminPassword(request, response, next) {
  try {
    const currentPassword = clean(request.body.currentPassword);
    const newPassword = clean(request.body.newPassword);

    if (!currentPassword || !newPassword) {
      response.status(400).json({ error: "Current password and new password are required." });
      return;
    }

    const result = await changeAdminPassword(currentPassword, newPassword);

    if (!result.ok) {
      response.status(result.status).json({ error: result.error });
      return;
    }

    response.json({
      message: "Admin password updated.",
      username: result.username,
      updatedAt: result.updatedAt
    });
  } catch (error) {
    next(error);
  }
}