import { Sale } from "../models/Sale.js";
import { categoryStats, buildRegexSearch } from "../services/analyticsService.js";

export async function getStats(_req, res) {
  const [revAgg, ordersCount, unitsAgg] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$revenue" } } }]),
    Sale.countDocuments(),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$qty" } } }]),
  ]);

  const totalRev = revAgg[0]?.total ?? 0;
  const totalOrders = ordersCount;

  res.json({
    totalRevenue: totalRev,
    totalOrders,
    totalUnitsSold: unitsAgg[0]?.total ?? 0,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
    revenueChange: 18.6,
    ordersChange: 12.6,
    unitsSoldChange: 15.3,
  });
}

export async function getRevenueTrend(_req, res) {
  const rows = await Sale.aggregate([
    { $group: { _id: "$date", value: { $sum: "$revenue" } } },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);
  res.json(rows.map((r) => ({ label: r._id, value: r.value })));
}

export async function getByCategory(_req, res) {
  const rows = await Sale.aggregate([
    { $group: { _id: "$category", value: { $sum: "$revenue" } } },
    { $sort: { value: -1 } },
  ]);
  res.json(categoryStats(rows.map((r) => ({ name: r._id, value: r.value })), "name", "value"));
}

export async function getTopProducts(_req, res) {
  const rows = await Sale.aggregate([
    { $group: { _id: "$product", unitsSold: { $sum: "$qty" }, revenue: { $sum: "$revenue" } } },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);
  res.json(rows.map((r, i) => ({ id: i + 1, name: r._id, unitsSold: r.unitsSold, revenue: r.revenue, rank: i + 1 })));
}

export async function getReport(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { category, product } = req.query;
  const filter = {};

  if (category && category !== "All Categories") filter.category = category;
  if (product && product !== "All Products") filter.product = buildRegexSearch(product);

  const [total, rows] = await Promise.all([
    Sale.countDocuments(filter),
    Sale.find(filter).sort({ date: 1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.json({
    data: rows.map((r) => ({
      date: r.date,
      product: r.product,
      category: r.category,
      orders: 1,
      unitsSold: r.qty,
      revenue: r.revenue,
      profit: Math.round(r.revenue * 0.197),
    })),
    total,
    page,
    limit,
  });
}
