import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull().default("Business Analytics"),
  businessEmail: text("business_email").notNull().default("info@businessanalytics.com"),
  defaultTheme: text("default_theme").notNull().default("Light"),
  language: text("language").notNull().default("English"),
  timezone: text("timezone").notNull().default("(GMT+05:30) Asia/Kolkata"),
  currency: text("currency").notNull().default("INR (₹) - Indian Rupee"),
  dateFormat: text("date_format").notNull().default("Apr 01, 2024"),
  timeFormat: text("time_format").notNull().default("12 Hour (01:30 PM)"),
  enableAnalytics: boolean("enable_analytics").notNull().default(true),
  autoRefresh: boolean("auto_refresh").notNull().default(true),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  darkMode: boolean("dark_mode").notNull().default(false),
  compactView: boolean("compact_view").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true, updatedAt: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
