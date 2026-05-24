// import "dotenv/config";
// import { defineConfig } from "drizzle-kit";
// import path from "path";

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not set, ensure the database is provisioned");
// }

// export default defineConfig({
//   schema: path.join(__dirname, "./src/schema/index.ts"),
//   dialect: "postgresql",
//   dbCredentials: {
//     url: process.env.DATABASE_URL,
//   },
// });
import * as dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set, ensure the database is provisioned");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});