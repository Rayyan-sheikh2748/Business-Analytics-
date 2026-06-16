import { Sale } from "../models/Sale.js";
import { categoryStats, buildRegexSearch } from "../services/analyticsService.js";

async function getProfitMargin() {
  try {
    const { getOrCreateSettings } = await import("../services/settingsService.js");
    const settings = await getOrCreateSettings();
    return (settings.profitMargin ?? 20) / 100;
  } catch {
    return 0.20;
  }
}

export async function getStats(_req, res) {
  const [revAgg, profitAgg, ordersCount, unitsAgg] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$revenue" } } }]),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$profit" } } }]),
    Sale.countDocuments(),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$qty" } } }]),
  ]);

  const totalRev = revAgg[0]?.total ?? 0;
  const storedProfit = profitAgg[0]?.total ?? 0;
  const totalOrders = ordersCount;
  const margin = await getProfitMargin();

  // Compute real change percentages by splitting dataset dates in half
  let revenueChange = 0, ordersChange = 0, unitsSoldChange = 0;

  const allDates = await Sale.distinct("date");
  const sorted = allDates.filter(Boolean).sort();
  if (sorted.length >= 2) {
    const mid = sorted[Math.floor(sorted.length / 2)];
    const first = sorted[0];

    const [recent, prev] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: mid } } },
        { $group: { _id: null, rev: { $sum: "$revenue" }, qty: { $sum: "$qty" }, txn: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: first, $lt: mid } } },
        { $group: { _id: null, rev: { $sum: "$revenue" }, qty: { $sum: "$qty" }, txn: { $sum: 1 } } }
      ]),
    ]);

    const calc = (c, p) => {
      if (!p || p === 0) return c > 0 ? 100 : 0;
      return Number((((c - p) / p) * 100).toFixed(1));
    };

    revenueChange = calc(recent[0]?.rev || 0, prev[0]?.rev || 0);
    ordersChange = calc(recent[0]?.txn || 0, prev[0]?.txn || 0);
    unitsSoldChange = calc(recent[0]?.qty || 0, prev[0]?.qty || 0);
  }

  const totalProfit = storedProfit > 0 ? Math.round(storedProfit) : Math.round(totalRev * margin);

  res.json({
    totalRevenue: totalRev,
    totalProfit,
    totalOrders,
    totalUnitsSold: unitsAgg[0]?.total ?? 0,
    avgOrderValue: totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0,
    revenueChange,
    ordersChange,
    unitsSoldChange,
  });
}

export async function getRevenueTrend(_req, res) {
  const allSales = await Sale.find({ date: { $exists: true, $ne: null }, revenue: { $gt: 0 } })
    .select("date revenue")
    .lean();

  if (allSales.length === 0) return res.json([]);

  const grouped = {};
  allSales.forEach(s => {
    if (!s.date || s.date === "Unknown") return;
    grouped[s.date] = (grouped[s.date] || 0) + (Number(s.revenue) || 0);
  });

  const rows = Object.keys(grouped)
    .sort()
    .slice(-60)
    .map(k => {
      let label = k;
      try {
        const d = new Date(k);
        if (!isNaN(d.getTime())) label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } catch {}
      return { label, value: Math.round(grouped[k]) };
    });

  res.json(rows);
}

export async function getByCategory(_req, res) {
  const rows = await Sale.aggregate([
    { $match: { category: { $exists: true, $ne: null } } },
    { $group: { _id: "$category", value: { $sum: "$revenue" } } },
    { $sort: { value: -1 } },
  ]);
  res.json(categoryStats(rows.map((r) => ({ name: r._id || "Uncategorized", value: r.value })), "name", "value"));
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
  const { category, product, dateFrom, dateTo } = req.query;
  const filter = {};

  if (category && category !== "All Categories") filter.category = category;
  if (product && product !== "All Products") filter.product = buildRegexSearch(product);

  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = dateFrom;
    if (dateTo) filter.date.$lte = dateTo;
  }

  const margin = await getProfitMargin();

  const [total, rows] = await Promise.all([
    Sale.countDocuments(filter),
    Sale.find(filter).sort({ date: 1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.json({
    data: rows.map((r) => {
      const rev = Number(r.revenue) || 0;
      const qty = Number(r.qty) || 1;
      const storedProfit = Number(r.profit) || 0;
      return {
        date: r.date || "Unknown",
        product: r.product || "Unknown",
        category: r.category || "Uncategorized",
        orders: 1,
        unitsSold: qty,
        revenue: rev,
        profit: storedProfit > 0 ? Math.round(storedProfit) : Math.round(rev * margin),
      };
    }),
    total,
    page,
    limit,
  });
}
