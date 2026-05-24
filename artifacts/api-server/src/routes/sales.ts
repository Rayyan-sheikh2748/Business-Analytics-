import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { salesTable } from "@workspace/db";
import { sql, desc, eq, ilike, and, gte, lte } from "drizzle-orm";
import {
  CreateSaleBody,
  UpdateSaleBody,
  UpdateSaleParams,
  DeleteSaleParams,
  GetSalesQueryParams,
  GetSalesTrendQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/sales/stats", async (_req, res): Promise<void> => {
  const [rev] = await db.select({ t: sql<number>`sum(revenue::numeric)` }).from(salesTable);
  const [units] = await db.select({ t: sql<number>`sum(qty)` }).from(salesTable);
  const [txn] = await db.select({ t: sql<number>`count(*)` }).from(salesTable);
  const [newC] = await db.select({ t: sql<number>`count(distinct customer)` }).from(salesTable);

  res.json({
    totalRevenue: Number(rev?.t ?? 0),
    totalUnitsSold: Number(units?.t ?? 0),
    totalTransactions: Number(txn?.t ?? 0),
    newCustomers: Number(newC?.t ?? 0),
    revenueChange: 18.6,
    unitsSoldChange: 12.4,
    transactionsChange: 15.3,
    newCustomersChange: 24.0,
  });
});

router.get("/sales/trend", async (req, res): Promise<void> => {
  const rows = await db
    .select({ label: salesTable.date, value: sql<number>`sum(revenue::numeric)` })
    .from(salesTable)
    .groupBy(salesTable.date)
    .orderBy(salesTable.date)
    .limit(30);
  res.json(rows.map((r) => ({ label: r.label, value: Number(r.value) })));
});

router.get("/sales/by-category", async (_req, res): Promise<void> => {
  const total = await db.select({ t: sql<number>`sum(revenue::numeric)` }).from(salesTable);
  const totalVal = Number(total[0]?.t ?? 1);
  const rows = await db
    .select({ name: salesTable.category, value: sql<number>`sum(revenue::numeric)` })
    .from(salesTable)
    .groupBy(salesTable.category)
    .orderBy(desc(sql`sum(revenue::numeric)`));
  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  res.json(rows.map((r, i) => ({
    name: r.name,
    value: Number(r.value),
    percentage: Math.round((Number(r.value) / totalVal) * 100),
    color: colors[i % colors.length],
  })));
});

router.get("/sales/top-products", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ name: salesTable.product, unitsSold: sql<number>`sum(qty)`, revenue: sql<number>`sum(revenue::numeric)` })
    .from(salesTable)
    .groupBy(salesTable.product)
    .orderBy(desc(sql`sum(revenue::numeric)`))
    .limit(5);
  res.json(rows.map((r, i) => ({ id: i + 1, name: r.name, unitsSold: Number(r.unitsSold), revenue: Number(r.revenue), rank: i + 1 })));
});

router.get("/sales", async (req, res): Promise<void> => {
  const parsed = GetSalesQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { page = 1, limit = 10, search, category, channel } = parsed.data;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions = [];
  if (search) conditions.push(ilike(salesTable.customer, `%${search}%`));
  if (category && category !== "All Categories") conditions.push(eq(salesTable.category, category));
  if (channel && channel !== "All Channels") conditions.push(eq(salesTable.channel, channel));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(salesTable).where(where);
  const rows = await db.select().from(salesTable).where(where).orderBy(desc(salesTable.date)).limit(Number(limit)).offset(offset);

  res.json({
    data: rows.map((r) => ({
      id: r.id,
      invoiceId: r.invoiceId,
      date: r.date,
      customer: r.customer,
      product: r.product,
      category: r.category,
      qty: r.qty,
      unitPrice: Number(r.unitPrice),
      revenue: Number(r.revenue),
      channel: r.channel,
    })),
    total: Number(countRow?.count ?? 0),
    page: Number(page),
    limit: Number(limit),
  });
});

router.post("/sales", async (req, res): Promise<void> => {
  const parsed = CreateSaleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const today = new Date().toISOString().split("T")[0];
  const invoiceId = `INV-${Date.now()}`;
  const revenue = d.qty * d.unitPrice;
  const [row] = await db.insert(salesTable).values({
    invoiceId,
    date: d.date ?? today,
    customer: d.customer,
    product: d.product,
    category: d.category,
    qty: d.qty,
    unitPrice: String(d.unitPrice),
    revenue: String(revenue),
    channel: d.channel,
  }).returning();
  res.status(201).json({ id: row.id, invoiceId: row.invoiceId, date: row.date, customer: row.customer, product: row.product, category: row.category, qty: row.qty, unitPrice: Number(row.unitPrice), revenue: Number(row.revenue), channel: row.channel });
});

router.put("/sales/:id", async (req, res): Promise<void> => {
  const params = UpdateSaleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateSaleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: Record<string, unknown> = {};
  if (d.customer !== undefined) updateData.customer = d.customer;
  if (d.product !== undefined) updateData.product = d.product;
  if (d.category !== undefined) updateData.category = d.category;
  if (d.qty !== undefined) updateData.qty = d.qty;
  if (d.unitPrice !== undefined) { updateData.unitPrice = String(d.unitPrice); updateData.revenue = String((d.qty ?? 1) * d.unitPrice); }
  if (d.channel !== undefined) updateData.channel = d.channel;
  const [row] = await db.update(salesTable).set(updateData).where(eq(salesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Sale not found" }); return; }
  res.json({ id: row.id, invoiceId: row.invoiceId, date: row.date, customer: row.customer, product: row.product, category: row.category, qty: row.qty, unitPrice: Number(row.unitPrice), revenue: Number(row.revenue), channel: row.channel });
});

router.delete("/sales/:id", async (req, res): Promise<void> => {
  const params = DeleteSaleParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(salesTable).where(eq(salesTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Sale not found" }); return; }
  res.json({ success: true });
});

export default router;
