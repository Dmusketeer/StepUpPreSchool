import { isUploadError } from "../config/upload.js";

export function notFoundApi(_request, response) {
  response.status(404).json({ error: "API route not found." });
}

export function errorHandler(error, _request, response, _next) {
  console.error(error);

  if (isUploadError(error)) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (error.name === "MongoServerSelectionError" || error.name === "MongooseServerSelectionError") {
    response.status(503).json({ error: "Database connection failed. Make sure MongoDB is running and MONGODB_URI is correct." });
    return;
  }

  response.status(500).json({ error: "Something went wrong on the server." });
}
