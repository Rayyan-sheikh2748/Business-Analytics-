import { Sale } from "../models/Sale.js";
import { getNextSequence } from "../utils/sequence.js";
import { categoryStats, buildRegexSearch } from "../services/analyticsService.js";

export async function getStats(_req, res) {
  const [revenueAgg, unitsAgg, txnCount, customersAgg] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$revenue" } } }]),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$qty" } } }]),
    Sale.countDocuments(),
    Sale.distinct("customer"),
  ]);

  res.json({
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalUnitsSold: unitsAgg[0]?.total ?? 0,
    totalTransactions: txnCount,
    newCustomers: customersAgg.length,
    revenueChange: 18.6,
    unitsSoldChange: 12.4,
    transactionsChange: 15.3,
    newCustomersChange: 24.0,
  });
}

export async function getTrend(_req, res) {
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

export async function listSales(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { search, category, channel } = req.query;
  const filter = {};

  if (search) filter.customer = buildRegexSearch(search);
  if (category && category !== "All Categories") filter.category = category;
  if (channel && channel !== "All Channels") filter.channel = channel;

  const [total, rows] = await Promise.all([
    Sale.countDocuments(filter),
    Sale.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.json({
    data: rows.map(mapSale),
    total,
    page,
    limit,
  });
}

export async function createSale(req, res) {
  const d = req.body;
  const today = new Date().toISOString().split("T")[0];
  const invoiceId = `INV-${Date.now()}`;
  const revenue = d.qty * d.unitPrice;
  const legacyId = await getNextSequence("sale");

  const row = await Sale.create({
    legacyId,
    invoiceId,
    date: d.date ?? today,
    customer: d.customer,
    product: d.product,
    category: d.category,
    qty: d.qty,
    unitPrice: d.unitPrice,
    revenue,
    channel: d.channel ?? "Online",
  });

  res.status(201).json(mapSale(row));
}

export async function updateSale(req, res) {
  const id = Number(req.params.id);
  const d = req.body;
  const update = { ...d };
  if (d.qty !== undefined || d.unitPrice !== undefined) {
    const existing = await Sale.findOne({ legacyId: id });
    if (!existing) return res.status(404).json({ error: "Sale not found" });
    const qty = d.qty ?? existing.qty;
    const unitPrice = d.unitPrice ?? existing.unitPrice;
    update.revenue = qty * unitPrice;
  }

  const row = await Sale.findOneAndUpdate({ legacyId: id }, update, { new: true });
  if (!row) return res.status(404).json({ error: "Sale not found" });
  res.json(mapSale(row));
}

export async function deleteSale(req, res) {
  const id = Number(req.params.id);
  const row = await Sale.findOneAndDelete({ legacyId: id });
  if (!row) return res.status(404).json({ error: "Sale not found" });
  res.json({ success: true });
}

function mapSale(r) {
  return {
    id: r.legacyId,
    invoiceId: r.invoiceId,
    date: r.date,
    customer: r.customer,
    product: r.product,
    category: r.category,
    qty: r.qty,
    unitPrice: r.unitPrice,
    revenue: r.revenue,
    channel: r.channel,
  };
}
