import crypto from "node:crypto";
import {
  changeAdminCredentials,
  checkAdminUsernameFormat,
  getAdminUsername,
  resetAdminCredentials,
  validateAdminCredential
} from "../models/adminCredentialModel.js";
import { clearPasswordResetCode, consumePasswordResetCode, createPasswordResetCode } from "../models/adminPasswordResetModel.js";
import { createAdminSession, deleteAdminSession, deleteAllAdminSessions } from "../models/adminSessionModel.js";
import { listEnquiries, updateEnquiryStatus } from "../models/enquiryModel.js";
import { addMediaItems, deleteMedia, listMedia } from "../models/mediaModel.js";
import { ensureSiteShape, readSiteData, writeSiteData } from "../models/siteModel.js";
import { importGooglePlacePhotos } from "../services/placesService.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";
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

export async function getAdminAccount(_request, response, next) {
  try {
    response.json({ username: await getAdminUsername() });
  } catch (error) {
    next(error);
  }
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

export async function importAdminGoogleMedia(request, response, next) {
  try {
    const result = await importGooglePlacePhotos(request.body?.limit);

    if (!result.ok) {
      response.status(result.status).json({ error: result.error });
      return;
    }

    const category = clean(request.body?.category) || "Campus";
    const mediaItems = result.photos.map((photo, index) => ({
      id: crypto.randomUUID(),
      type: "image",
      title: `${result.displayName || "StepUp Pre School"} ${index + 1}`,
      alt: photo.attribution,
      attribution: photo.attribution,
      category,
      url: `/uploads/${photo.filename}`,
      filename: photo.filename,
      mimeType: photo.mimeType,
      size: photo.size,
      createdAt: new Date().toISOString()
    }));

    await addMediaItems(mediaItems);

    response.status(201).json({
      message: `${mediaItems.length} photo${mediaItems.length === 1 ? "" : "s"} imported from Google.`,
      media: mediaItems
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCredentials(request, response, next) {
  try {
    const currentPassword = clean(request.body.currentPassword);
    const newUsername = clean(request.body.newUsername);
    const newPassword = clean(request.body.newPassword);

    if (!currentPassword) {
      response.status(400).json({ error: "Current password is required." });
      return;
    }

    if (!newUsername && !newPassword) {
      response.status(400).json({ error: "Provide a new admin ID, a new password, or both." });
      return;
    }

    const result = await changeAdminCredentials(currentPassword, { newUsername, newPassword });

    if (!result.ok) {
      response.status(result.status).json({ error: result.error });
      return;
    }

    deleteAllAdminSessions(request.adminToken);

    response.json({
      message: buildCredentialUpdateMessage(result),
      username: result.username,
      usernameChanged: result.usernameChanged,
      passwordChanged: result.passwordChanged,
      updatedAt: result.updatedAt
    });
  } catch (error) {
    next(error);
  }
}

function buildCredentialUpdateMessage({ usernameChanged, passwordChanged }) {
  if (usernameChanged && passwordChanged) {
    return "Admin ID and password updated.";
  }

  return usernameChanged ? "Admin ID updated." : "Admin password updated.";
}

export async function requestAdminPasswordReset(_request, response, next) {
  try {
    const code = createPasswordResetCode();
    const whatsappResult = await sendWhatsAppMessage(buildPasswordResetMessage(code));

    if (!whatsappResult.sent) {
      clearPasswordResetCode();
      response.status(503).json({ error: `Could not send the reset code. ${whatsappResult.reason}` });
      return;
    }

    response.json({ message: "A one-time reset code was sent via WhatsApp to the registered admin number." });
  } catch (error) {
    next(error);
  }
}

export async function confirmAdminPasswordReset(request, response, next) {
  try {
    const code = clean(request.body.code);
    const newUsername = clean(request.body.newUsername);
    const newPassword = clean(request.body.newPassword);

    if (!code) {
      response.status(400).json({ error: "Enter the reset code sent via WhatsApp." });
      return;
    }

    if (!newPassword) {
      response.status(400).json({ error: "Enter a new password." });
      return;
    }

    if (newPassword.length < 8) {
      response.status(400).json({ error: "New password must be at least 8 characters." });
      return;
    }

    if (newUsername) {
      const usernameError = checkAdminUsernameFormat(newUsername);

      if (usernameError) {
        response.status(400).json({ error: usernameError });
        return;
      }
    }

    const codeResult = consumePasswordResetCode(code);

    if (!codeResult.ok) {
      response.status(400).json({ error: codeResult.error });
      return;
    }

    const result = await resetAdminCredentials({ newUsername, newPassword });

    if (!result.ok) {
      response.status(result.status).json({ error: result.error });
      return;
    }

    deleteAllAdminSessions();

    response.json({
      message: `${buildCredentialUpdateMessage(result)} Login with your new details.`,
      username: result.username,
      usernameChanged: result.usernameChanged,
      passwordChanged: result.passwordChanged,
      updatedAt: result.updatedAt
    });
  } catch (error) {
    next(error);
  }
}

function buildPasswordResetMessage(code) {
  return [
    "StepUp Admin password reset",
    "",
    `Your one-time reset code is: ${code}`,
    "This code expires in 10 minutes and can be used once.",
    "If you did not request this, you can ignore this message."
  ].join("\n");
}