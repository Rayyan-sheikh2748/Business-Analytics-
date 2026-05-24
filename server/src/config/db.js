import mongoose from "mongoose";
import { env } from "./env.js";

let memoryServer = null;

export async function connectDB() {
  mongoose.set("strictQuery", true);
  let uri = env.mongoUri;

  if (process.env.USE_MEMORY_DB === "true") {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    console.log("Using in-memory MongoDB for development");
  }

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("MongoDB connected:", mongoose.connection.name);
  } catch (err) {
    if (process.env.USE_MEMORY_DB !== "true") {
      console.warn("Local MongoDB unavailable, falling back to in-memory database...");
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      memoryServer = await MongoMemoryServer.create();
      await mongoose.connect(memoryServer.getUri());
      console.log("MongoDB connected (in-memory):", mongoose.connection.name);
      return;
    }
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
