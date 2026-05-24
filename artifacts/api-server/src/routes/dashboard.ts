import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, salesTable, customersTable } from "@workspace/db";
import { sql, desc, gte, lte, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const [revenueRow] = await db.select({ total: sql<number>`sum(revenue::numeric)` }).from(salesTable);
  const [ordersRow] = await db.select({ count: sql<number>`count(*)` }).from(salesTable);
  const [profitRow] = await db.select({ total: sql<number>`sum(revenue::numeric * 0.197)` }).from(salesTable);
  const [productsRow] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
  const [customersRow] = await db.select({ count: sql<number>`count(*)` }).from(customersTable);

  res.json({
    totalRevenue: Number(revenueRow?.total ?? 0),
    totalOrders: Number(ordersRow?.count ?? 0),
    totalProfit: Number(profitRow?.total ?? 0),
    totalProducts: Number(productsRow?.count ?? 0),
    newCustomers: Number(customersRow?.count ?? 0),
    revenueChange: 18.6,
    ordersChange: 12.6,
    profitChange: 16.3,
    productsChange: 2.4,
    customersChange: 15.8,
  });
});

router.get("/dashboard/revenue-overview", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      label: salesTable.date,
      value: sql<number>`sum(revenue::numeric)`,
    })
    .from(salesTable)
    .groupBy(salesTable.date)
    .orderBy(salesTable.date)
    .limit(30);

  res.json(rows.map((r) => ({ label: r.label, value: Number(r.value) })));
});

router.get("/dashboard/sales-by-category", async (req, res): Promise<void> => {
  const total = await db.select({ t: sql<number>`sum(revenue::numeric)` }).from(salesTable);
  const totalVal = Number(total[0]?.t ?? 1);
  const rows = await db
    .select({
      name: salesTable.category,
      value: sql<number>`sum(revenue::numeric)`,
    })
    .from(salesTable)
    .groupBy(salesTable.category)
    .orderBy(desc(sql`sum(revenue::numeric)`));

  const colors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  res.json(
    rows.map((r, i) => ({
      name: r.name,
      value: Number(r.value),
      percentage: Math.round((Number(r.value) / totalVal) * 100),
      color: colors[i % colors.length],
    }))
  );
});

router.get("/dashboard/recent-orders", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(salesTable)
    .orderBy(desc(salesTable.createdAt))
    .limit(5);

  const statuses = ["Completed", "Processing"];
  res.json(
    rows.map((r) => ({
      id: r.id,
      orderId: r.invoiceId,
      product: r.product,
      amount: Number(r.revenue),
      status: statuses[r.id % 2],
      date: r.date,
    }))
  );
});

router.get("/dashboard/inventory-status", async (req, res): Promise<void> => {
  const rows = await db.select().from(productsTable).limit(5);
  res.json(
    rows.map((r) => ({
      id: r.id,
      product: r.name,
      stock: r.stock,
      status:
        r.stock === 0
          ? "Out of Stock"
          : r.stock <= r.threshold
          ? "Low Stock"
          : "In Stock",
    }))
  );
});

router.get("/dashboard/revenue-vs-profit", async (req, res): Promise<void> => {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const data = months.map((m, i) => ({
    label: m,
    revenue: 80000 + i * 12000 + Math.floor(Math.random() * 15000),
    profit: 25000 + i * 4000 + Math.floor(Math.random() * 5000),
  }));
  res.json(data);
});

router.get("/dashboard/top-selling-products", async (req, res): Promise<void> => {
  const rows = await db
    .select({
      id: salesTable.id,
      name: salesTable.product,
      unitsSold: sql<number>`sum(qty)`,
      revenue: sql<number>`sum(revenue::numeric)`,
    })
    .from(salesTable)
    .groupBy(salesTable.product, salesTable.id)
    .orderBy(desc(sql`sum(revenue::numeric)`))
    .limit(5);

  res.json(
    rows.map((r, i) => ({
      id: r.id,
      name: r.name,
      unitsSold: Number(r.unitsSold),
      revenue: Number(r.revenue),
      rank: i + 1,
    }))
  );
});

router.get("/dashboard/ai-insights", async (_req, res): Promise<void> => {
  res.json([
    { type: "positive", title: "Revenue is up by 18.6%", message: "Great job! Your revenue has increased compared to last month." },
    { type: "warning", title: "Low Stock Alert", message: "2 products are running low on stock. Consider restocking soon." },
    { type: "info", title: "Peak Sales Time", message: "Your sales peak on weekends. Plan promotions accordingly." },
    { type: "star", title: "Top Performer", message: "Wireless Headphones is your top selling product this month." },
  ]);
});

export default router;
