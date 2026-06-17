import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost for development
    if (origin.startsWith("http://localhost:")) return callback(null, true);
    // Allow the configured production client URL
    if (env.clientUrl && origin === env.clientUrl) return callback(null, true);
    // Allow any .onrender.com subdomain
    if (origin.endsWith(".onrender.com")) return callback(null, true);
    callback(null, false);
  }, 
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
