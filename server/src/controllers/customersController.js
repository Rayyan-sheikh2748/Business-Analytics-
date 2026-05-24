import { Customer } from "../models/Customer.js";
import { getNextSequence } from "../utils/sequence.js";
import { categoryStats, buildRegexSearch } from "../services/analyticsService.js";

export async function getStats(_req, res) {
  const [total, ordersAgg, revAgg] = await Promise.all([
    Customer.countDocuments(),
    Customer.aggregate([{ $group: { _id: null, total: { $sum: "$totalOrders" } } }]),
    Customer.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
  ]);

  const totalCount = total;
  const totalRev = revAgg[0]?.total ?? 0;

  res.json({
    totalCustomers: totalCount,
    newCustomers: 86,
    totalOrders: ordersAgg[0]?.total ?? 0,
    totalRevenue: totalRev,
    avgCustomerValue: totalCount > 0 ? Math.round(totalRev / totalCount) : 0,
    totalCustomersChange: 12.5,
    newCustomersChange: 15.8,
    totalOrdersChange: 18.2,
    totalRevenueChange: 20.4,
  });
}

export async function getBySegment(_req, res) {
  const rows = await Customer.aggregate([
    { $group: { _id: "$segment", value: { $sum: 1 } } },
    { $sort: { value: -1 } },
  ]);
  res.json(categoryStats(rows.map((r) => ({ name: r._id, value: r.value })), "name", "value"));
}

export async function getTopByRevenue(_req, res) {
  const rows = await Customer.find().sort({ totalSpent: -1 }).limit(5).lean();
  res.json(rows.map((r) => ({ id: r.legacyId, name: r.name, revenue: r.totalSpent, segment: r.segment })));
}

export async function getTrend(_req, res) {
  const labels = ["Apr 1", "Apr 6", "Apr 11", "Apr 16", "Apr 21", "Apr 26", "Apr 30"];
  res.json(labels.map((l, i) => ({ label: l, value: 40 + i * 10 + Math.floor(Math.random() * 20) })));
}

export async function getByLocation(_req, res) {
  const rows = await Customer.aggregate([
    { $match: { location: { $ne: null } } },
    { $group: { _id: "$location", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  res.json(rows.map((r) => ({
    location: r._id,
    count: r.count,
    percentage: Math.round((r.count / total) * 100),
  })));
}

export async function listCustomers(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { search, segment, location } = req.query;
  const filter = {};

  if (search) filter.name = buildRegexSearch(search);
  if (segment && segment !== "All Segments") filter.segment = segment;
  if (location && location !== "All Locations") filter.location = location;

  const [total, rows] = await Promise.all([
    Customer.countDocuments(filter),
    Customer.find(filter).sort({ joinDate: 1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.json({
    data: rows.map(mapCustomer),
    total,
    page,
    limit,
  });
}

export async function createCustomer(req, res) {
  const d = req.body;
  const today = new Date().toISOString().split("T")[0];
  const legacyId = await getNextSequence("customer");
  const row = await Customer.create({
    legacyId,
    name: d.name,
    email: d.email,
    phone: d.phone,
    segment: d.segment ?? "Regular",
    location: d.location ?? null,
    totalOrders: 0,
    totalSpent: 0,
    joinDate: today,
  });
  res.status(201).json(mapCustomer(row));
}

export async function updateCustomer(req, res) {
  const id = Number(req.params.id);
  const d = req.body;
  const row = await Customer.findOneAndUpdate({ legacyId: id }, d, { new: true });
  if (!row) return res.status(404).json({ error: "Customer not found" });
  res.json(mapCustomer(row));
}

export async function deleteCustomer(req, res) {
  const id = Number(req.params.id);
  const row = await Customer.findOneAndDelete({ legacyId: id });
  if (!row) return res.status(404).json({ error: "Customer not found" });
  res.json({ success: true });
}

function mapCustomer(r) {
  return {
    id: r.legacyId,
    name: r.name,
    email: r.email,
    phone: r.phone,
    segment: r.segment,
    totalOrders: r.totalOrders,
    totalSpent: r.totalSpent,
    joinDate: r.joinDate,
    location: r.location,
  };
}
