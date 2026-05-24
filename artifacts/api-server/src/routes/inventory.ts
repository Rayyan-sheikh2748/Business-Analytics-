import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, stockMovementsTable } from "@workspace/db";
import { sql, desc, eq, ilike, and } from "drizzle-orm";
import {
  GetInventoryQueryParams,
  CreateInventoryItemBody,
  UpdateInventoryItemBody,
  UpdateInventoryItemParams,
  DeleteInventoryItemParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function stockStatus(stock: number, threshold: number): string {
  if (stock === 0) return "Out of Stock";
  if (stock <= threshold) return "Low Stock";
  return "In Stock";
}

router.get("/inventory/stats", async (_req, res): Promise<void> => {
  const [totProd] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
  const [totStock] = await db.select({ t: sql<number>`sum(stock)` }).from(productsTable);
  const lowStock = await db.select().from(productsTable);
  const lowCount = lowStock.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
  const outCount = lowStock.filter((p) => p.stock === 0).length;
  const [invVal] = await db.select({ t: sql<number>`sum(stock * coalesce(unit_cost::numeric, 1000))` }).from(productsTable);

  res.json({
    totalProducts: Number(totProd?.count ?? 0),
    totalStock: Number(totStock?.t ?? 0),
    lowStockItems: lowCount,
    outOfStockItems: outCount,
    inventoryValue: Number(invVal?.t ?? 0),
  });
});

router.get("/inventory/stock-status", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productsTable);
  const total = rows.length || 1;
  const inStock = rows.filter((p) => p.stock > p.threshold).length;
  const low = rows.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
  const out = rows.filter((p) => p.stock === 0).length;
  const noData = rows.filter((p) => p.stock < 0).length;
  res.json([
    { status: "In Stock", count: inStock, percentage: Math.round((inStock / total) * 100) },
    { status: "Low Stock", count: low, percentage: Math.round((low / total) * 100) },
    { status: "Out of Stock", count: out, percentage: Math.round((out / total) * 100) },
    { status: "No Stock Data", count: noData, percentage: Math.round((noData / total) * 100) },
  ]);
});

router.get("/inventory/low-stock-alerts", async (_req, res): Promise<void> => {
  const rows = await db.select().from(productsTable);
  const alerts = rows.filter((p) => p.stock <= p.threshold).slice(0, 5);
  res.json(alerts.map((p) => ({ id: p.id, product: p.name, stock: p.stock, threshold: p.threshold })));
});

router.get("/inventory/recent-movements", async (_req, res): Promise<void> => {
  const rows = await db.select().from(stockMovementsTable).orderBy(desc(stockMovementsTable.createdAt)).limit(5);
  res.json(rows.map((r) => ({ id: r.id, product: r.product, warehouse: r.warehouse, change: r.change, date: r.date })));
});

router.get("/inventory/trend", async (_req, res): Promise<void> => {
  const labels = ["Apr 1", "Apr 6", "Apr 11", "Apr 16", "Apr 21", "Apr 26", "Apr 30"];
  const [base] = await db.select({ t: sql<number>`sum(stock)` }).from(productsTable);
  const baseVal = Number(base?.t ?? 1000);
  res.json(labels.map((l, i) => ({ label: l, value: baseVal + i * 500 - Math.floor(Math.random() * 200) })));
});

router.get("/inventory/by-category", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      name: productsTable.category,
      value: sql<number>`sum(stock * coalesce(unit_cost::numeric, 1000))`,
    })
    .from(productsTable)
    .groupBy(productsTable.category)
    .orderBy(desc(sql`sum(stock * coalesce(unit_cost::numeric, 1000))`));
  const total = rows.reduce((s, r) => s + Number(r.value), 0) || 1;
  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  res.json(rows.map((r, i) => ({
    name: r.name,
    value: Number(r.value),
    percentage: Math.round((Number(r.value) / total) * 100),
    color: colors[i % colors.length],
  })));
});

router.get("/inventory", async (req, res): Promise<void> => {
  const parsed = GetInventoryQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { page = 1, limit = 10, search, category, warehouse, stockStatus: statusFilter } = parsed.data;
  const offset = (Number(page) - 1) * Number(limit);

  const conditions = [];
  if (search) conditions.push(ilike(productsTable.name, `%${search}%`));
  if (category && category !== "All Categories") conditions.push(eq(productsTable.category, category));
  if (warehouse && warehouse !== "All Warehouses") conditions.push(eq(productsTable.warehouse, warehouse));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [countRow] = await db.select({ count: sql<number>`count(*)` }).from(productsTable).where(where);
  const rows = await db.select().from(productsTable).where(where).orderBy(productsTable.id).limit(Number(limit)).offset(offset);

  res.json({
    data: rows.map((r) => ({
      id: r.id,
      sku: r.sku,
      product: r.name,
      category: r.category,
      warehouse: r.warehouse,
      stock: r.stock,
      threshold: r.threshold,
      unitCost: Number(r.unitCost ?? 0),
      status: stockStatus(r.stock, r.threshold),
      stockValue: r.stock * Number(r.unitCost ?? 0),
    })),
    total: Number(countRow?.count ?? 0),
    page: Number(page),
    limit: Number(limit),
  });
});

router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const [row] = await db.insert(productsTable).values({
    sku: d.sku,
    name: d.product,
    category: d.category,
    warehouse: d.warehouse,
    stock: d.stock,
    threshold: d.threshold,
    unitCost: d.unitCost != null ? String(d.unitCost) : null,
  }).returning();
  res.status(201).json({ id: row.id, sku: row.sku, product: row.name, category: row.category, warehouse: row.warehouse, stock: row.stock, threshold: row.threshold, unitCost: Number(row.unitCost ?? 0), status: stockStatus(row.stock, row.threshold), stockValue: row.stock * Number(row.unitCost ?? 0) });
});

router.put("/inventory/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (d.product !== undefined) updateData.name = d.product;
  if (d.category !== undefined) updateData.category = d.category;
  if (d.warehouse !== undefined) updateData.warehouse = d.warehouse;
  if (d.stock !== undefined) updateData.stock = d.stock;
  if (d.threshold !== undefined) updateData.threshold = d.threshold;
  if (d.unitCost !== undefined) updateData.unitCost = d.unitCost != null ? String(d.unitCost) : null;
  const [row] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ id: row.id, sku: row.sku, product: row.name, category: row.category, warehouse: row.warehouse, stock: row.stock, threshold: row.threshold, unitCost: Number(row.unitCost ?? 0), status: stockStatus(row.stock, row.threshold), stockValue: row.stock * Number(row.unitCost ?? 0) });
});

router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const params = DeleteInventoryItemParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const [row] = await db.delete(productsTable).where(eq(productsTable.id, params.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ success: true });
});

export default router;
