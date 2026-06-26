import { createApp } from "./app.js";
import { closeDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`StepUp Pre School API is running on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await closeDatabase().catch((error) => console.error(error));
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));