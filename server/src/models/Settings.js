import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "Business Analytics" },
    businessEmail: { type: String, default: "info@businessanalytics.com" },
    defaultTheme: { type: String, default: "Light" },
    language: { type: String, default: "English" },
    timezone: { type: String, default: "(GMT+05:30) Asia/Kolkata" },
    currency: { type: String, default: "INR (₹) - Indian Rupee" },
    dateFormat: { type: String, default: "Apr 01, 2024" },
    timeFormat: { type: String, default: "12 Hour (01:30 PM)" },
    enableAnalytics: { type: Boolean, default: true },
    autoRefresh: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    compactView: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Settings = mongoose.model("Settings", settingsSchema);
