import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { salesTable } from "@workspace/db";
import { sql, desc, ilike, eq, and } from "drizzle-orm";
import { GetReportQueryParams, GetReportStatsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports/stats", async (req, res): Promise<void> => {
  const [rev] = await db.select({ t: sql<number>`sum(revenue::numeric)` }).from(salesTable);
  const [orders] = await db.select({ t: sql<number>`count(*)` }).from(salesTable);
  const [units] = await db.select({ t: sql<number>`sum(qty)` }).from(salesTable);
  const totalRev = Number(rev?.t ?? 0);
  const totalOrders = Number(orders?.t ?? 0);
  res.json({
    totalRevenue: totalRev,
    totalOrders,
    totalUnitsSold: Number(units?.t ?? 0),
    avgOrderValue: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
    revenueChange: 18.6,
    ordersChange: 12.6,
    unitsSoldChange: 15.3,
  });
});

router.get("/reports/revenue-trend", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ label: salesTable.date, value: sql<number>`sum(revenue::numeric)` })
    .from(salesTable)
    .groupBy(salesTable.date)
    .orderBy(salesTable.date)
    .limit(30);
  res.json(rows.map((r) => ({ label: r.label, value: Number(r.value) })));
});

router.get("/reports/by-category", async (_req, res): Promise<void> => {
  const total = await db.select({ t: sql<number>`sum(revenue::numeric)` }).from(salesTable);
  const totalVal = Number(total[0]?.t ?? 1);
  const rows = await db
    .select({ name: salesTable.category, value: sql<number>`sum(revenue::numeric)` })
    .from(salesTable)
    .groupBy(salesTable.category)
    .orderBy(desc(sql`sum(revenue::numeric)`));
  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  res.json(rows.map((r, i) => ({
    name: r.name, value: Number(r.value), percentage: Math.round((Number(r.value) / totalVal) * 100), color: colors[i % colors.length],
  })));
});

router.get("/reports/top-products", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ name: salesTable.product, unitsSold: sql<number>`sum(qty)`, revenue: sql<number>`sum(revenue::numeric)` })
    .from(salesTable)
    .groupBy(salesTable.product)
    .orderBy(desc(sql`sum(revenue::numeric)`))
    .limit(5);
  res.json(rows.map((r, i) => ({ id: i + 1, name: r.name, unitsSold: Number(r.unitsSold), revenue: Number(r.revenue), rank: i + 1 })));
});

router.get("/reports", async (req, res): Promise<void> => {
  const parsed = GetReportQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { page = 1, limit = 10, category, product } = parsed.data;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions = [];
  if (category && category !== "All Categories") conditions.push(eq(salesTable.category, category));
  if (product && product !== "All Products") conditions.push(ilike(salesTable.product, `%${product}%`));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(salesTable).where(where);
  const rows = await db.select().from(salesTable).where(where).orderBy(salesTable.date).limit(Number(limit)).offset(offset);

  res.json({
    data: rows.map((r) => ({
      date: r.date,
      product: r.product,
      category: r.category,
      orders: 1,
      unitsSold: r.qty,
      revenue: Number(r.revenue),
      profit: Math.round(Number(r.revenue) * 0.197),
    })),
    total: Number(countRow?.count ?? 0),
    page: Number(page),
    limit: Number(limit),
  });
});

export default router;
