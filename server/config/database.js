import mongoose from "mongoose";
import { env } from "./env.js";

mongoose.set("bufferCommands", false);

let connectionPromise;

export async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.mongoUri, {
        dbName: env.mongoDbName,
        serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs
      })
      .then(() => mongoose.connection)
      .catch((error) => {
        connectionPromise = undefined;
        throw error;
      });
  }

  return connectionPromise;
}

export async function closeDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  connectionPromise = undefined;
}

export function createModel(name, schema, collection) {
  return mongoose.models[name] ?? mongoose.model(name, schema, collection);
}

export { mongoose };
