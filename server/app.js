import path from "node:path";
import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env, isProduction } from "./config/env.js";
import { clientDistPath, uploadsDir } from "./config/paths.js";
import { errorHandler, notFoundApi } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimitMiddleware.js";
import apiRoutes from "./routes/index.js";

export function createApp() {
  const app = express();

  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
  }));
  app.use(compression());
  app.use(cors({ origin: env.allowedOrigins }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(isProduction ? "combined" : "dev"));
  app.use("/uploads", express.static(uploadsDir, { maxAge: isProduction ? "7d" : 0 }));
  app.use("/api", apiLimiter);
  app.use("/api", apiRoutes);
  app.use("/api", notFoundApi);
  app.use(express.static(clientDistPath, { maxAge: isProduction ? "1d" : 0 }));
  app.get("*", (_request, response, next) => {
    response.sendFile(path.join(clientDistPath, "index.html"), (error) => {
      if (error) {
        next(error);
      }
    });
  });
  app.use(errorHandler);

  return app;
}