import { Settings } from "../models/Settings.js";

const DEFAULTS = {
  businessName: "Business Analytics",
  businessEmail: "info@businessanalytics.com",
  defaultTheme: "Light",
  language: "English",
  timezone: "(GMT+05:30) Asia/Kolkata",
  currency: "INR (₹) - Indian Rupee",
  dateFormat: "Apr 01, 2024",
  timeFormat: "12 Hour (01:30 PM)",
  enableAnalytics: true,
  autoRefresh: true,
  emailNotifications: true,
  darkMode: false,
  compactView: true,
};

export function toSettingsResponse(doc) {
  return {
    businessName: doc.businessName,
    businessEmail: doc.businessEmail,
    defaultTheme: doc.defaultTheme,
    language: doc.language,
    timezone: doc.timezone,
    currency: doc.currency,
    dateFormat: doc.dateFormat,
    timeFormat: doc.timeFormat,
    enableAnalytics: doc.enableAnalytics,
    autoRefresh: doc.autoRefresh,
    emailNotifications: doc.emailNotifications,
    darkMode: doc.darkMode,
    compactView: doc.compactView,
  };
}

export async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(DEFAULTS);
  }
  return settings;
}
