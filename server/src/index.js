import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";

async function start() {
  try {
    await connectDB();
    
    // Auto-seed default users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("No users found. Seeding default Admin and User...");
      
      const adminPassword = await bcrypt.hash("admin123", 10);
      const userPassword = await bcrypt.hash("user123", 10);
      
      await User.insertMany([
        { name: "Admin", email: "admin@businessanalytics.com", password: adminPassword, role: "admin" },
        { name: "User", email: "user@businessanalytics.com", password: userPassword, role: "user" }
      ]);
      console.log("Default users seeded successfully.");
    }

    const server = app.listen(env.port, () => {
      console.log(`API server running on http://localhost:${env.port}`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${env.port} is already in use. Stop the process using that port or set PORT to a free port.`);
        process.exit(1);
      }
      throw error;
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
