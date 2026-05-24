import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(settingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [row] = await db.insert(settingsTable).values({}).returning();
  return row;
}

function toResponse(s: typeof settingsTable.$inferSelect) {
  return {
    businessName: s.businessName,
    businessEmail: s.businessEmail,
    defaultTheme: s.defaultTheme,
    language: s.language,
    timezone: s.timezone,
    currency: s.currency,
    dateFormat: s.dateFormat,
    timeFormat: s.timeFormat,
    enableAnalytics: s.enableAnalytics,
    autoRefresh: s.autoRefresh,
    emailNotifications: s.emailNotifications,
    darkMode: s.darkMode,
    compactView: s.compactView,
  };
}

router.get("/settings", async (_req, res): Promise<void> => {
  const s = await getOrCreateSettings();
  res.json(toResponse(s));
});

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const s = await getOrCreateSettings();
  const [updated] = await db
    .update(settingsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(settingsTable.id, s.id))
    .returning();
  res.json(toResponse(updated));
});

export default router;
