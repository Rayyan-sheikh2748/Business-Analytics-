import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { sql, desc, eq, ilike, and } from "drizzle-orm";
import {
  GetCustomersQueryParams,
  CreateCustomerBody,
  UpdateCustomerBody,
  UpdateCustomerParams,
  DeleteCustomerParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/customers/stats", async (_req, res): Promise<void> => {
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(customersTable);
  const [orders] = await db.select({ t: sql<number>`sum(total_orders)` }).from(customersTable);
  const [rev] = await db.select({ t: sql<number>`sum(total_spent::numeric)` }).from(customersTable);
  const totalCount = Number(total?.count ?? 0);
  const totalRev = Number(rev?.t ?? 0);
  res.json({
    totalCustomers: totalCount,
    newCustomers: 86,
    totalOrders: Number(orders?.t ?? 0),
    totalRevenue: totalRev,
    avgCustomerValue: totalCount > 0 ? Math.round(totalRev / totalCount) : 0,
    totalCustomersChange: 12.5,
    newCustomersChange: 15.8,
    totalOrdersChange: 18.2,
    totalRevenueChange: 20.4,
  });
});

router.get("/customers/by-segment", async (_req, res): Promise<void> => {
  const total = await db.select({ t: sql<number>`count(*)` }).from(customersTable);
  const totalVal = Number(total[0]?.t ?? 1);
  const rows = await db
    .select({ name: customersTable.segment, value: sql<number>`count(*)` })
    .from(customersTable)
    .groupBy(customersTable.segment)
    .orderBy(desc(sql`count(*)`));
  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#8B5CF6"];
  res.json(rows.map((r, i) => ({
    name: r.name, value: Number(r.value), percentage: Math.round((Number(r.value) / totalVal) * 100), color: colors[i % colors.length],
  })));
});

router.get("/customers/top-by-revenue", async (_req, res): Promise<void> => {
  const rows = await db.select().from(customersTable).orderBy(desc(customersTable.totalSpent)).limit(5);
  res.json(rows.map((r) => ({ id: r.id, name: r.name, revenue: Number(r.totalSpent), segment: r.segment })));
});

router.get("/customers/trend", async (_req, res): Promise<void> => {
  const labels = ["Apr 1", "Apr 6", "Apr 11", "Apr 16", "Apr 21", "Apr 26", "Apr 30"];
  res.json(labels.map((l, i) => ({ label: l, value: 40 + i * 10 + Math.floor(Math.random() * 20) })));
});

router.get("/customers/by-location", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ location: customersTable.location, count: sql<number>`count(*)` })
    .from(customersTable)
    .groupBy(customersTable.location)
    .orderBy(desc(sql`count(*)`));
  const total = rows.reduce((s, r) => s + Number(r.count), 0) || 1;
  res.json(rows.filter((r) => r.location).map((r) => ({
    location: r.location!,
    count: Number(r.count),
    percentage: Math.round((Number(r.count) / total) * 100),
  })));
});

router.get("/customers", async (req, res): Promise<void> => {
  const parsed = GetCustomersQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { page = 1, limit = 10, search, segment, location } = parsed.data;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions = [];
  if (search) conditions.push(ilike(customersTable.name, `%${search}%`));
  if (segment && segment !== "All Segments") conditions.push(eq(customersTable.segment, segment));
  if (location && location !== "All Locations") conditions.push(eq(customersTable.location, location));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(customersTable).where(where);
  const rows = await db.select().from(customersTable).where(where).orderBy(customersTable.joinDate).limit(Number(limit)).offset(offset);

  res.json({
    data: rows.map((r) => ({
      id: r.id, name: r.name, email: r.email, phone: r.phone, segment: r.segment,
      totalOrders: r.totalOrders, totalSpent: Number(r.totalSpent), joinDate: r.joinDate, location: r.location,
    })),
    total: Number(countRow?.count ?? 0),
    page: Number(page),
    limit: Number(limit),
  });
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const today = new Date().toISOString().split("T")[0];
  const [row] = await db.insert(customersTable).values({
    name: d.name, email: d.email, phone: d.phone, segment: d.segment,
    location: d.location ?? null, totalOrders: 0, totalSpent: "0", joinDate: today,
  }).returning();
  res.status(201).json({ id: row.id, name: row.name, email: row.email, phone: row.phone, segment: row.segment, totalOrders: row.totalOrders, totalSpent: Number(row.totalSpent), joinDate: row.joinDate, location: row.location });
});

router.put("/customers/:id", async (req, res): Promise<void> => {
  const params = UpdateCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (d.name !== undefined) updateData.name = d.name;
  if (d.email !== undefined) updateData.email = d.email;
  if (d.phone !== undefined) updateData.phone = d.phone;
  if (d.segment !== undefined) updateData.segment = d.segment;
  if (d.location !== undefined) updateData.location = d.location;
  const [row] = await db.update(customersTable).set(updateData).where(eq(customersTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json({ id: row.id, name: row.name, email: row.email, phone: row.phone, segment: row.segment, totalOrders: row.totalOrders, totalSpent: Number(row.totalSpent), joinDate: row.joinDate, location: row.location });
});

router.delete("/customers/:id", async (req, res): Promise<void> => {
  const params = DeleteCustomerParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(customersTable).where(eq(customersTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Customer not found" }); return; }
  res.json({ success: true });
});

export default router;
