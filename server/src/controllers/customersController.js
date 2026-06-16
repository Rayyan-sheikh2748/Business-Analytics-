import { Customer } from "../models/Customer.js";
import { getNextSequence } from "../utils/sequence.js";
import { categoryStats, buildRegexSearch } from "../services/analyticsService.js";

export async function getStats(_req, res) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [total, ordersAgg, revAgg, recentCustomers, prevCustomers,
    recentOrdersAgg, prevOrdersAgg, recentRevAgg, prevRevAgg] = await Promise.all([
    Customer.countDocuments(),
    Customer.aggregate([{ $group: { _id: null, total: { $sum: "$totalOrders" } } }]),
    Customer.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
    Customer.countDocuments({ joinDate: { $gte: thirtyDaysAgo } }),
    Customer.countDocuments({ joinDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    // recent 30d orders vs prior 30d
    Customer.aggregate([{ $match: { joinDate: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: "$totalOrders" } } }]),
    Customer.aggregate([{ $match: { joinDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: "$totalOrders" } } }]),
    Customer.aggregate([{ $match: { joinDate: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
    Customer.aggregate([{ $match: { joinDate: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: "$totalSpent" } } }]),
  ]);

  const totalCount = total;
  const totalRev = revAgg[0]?.total ?? 0;

  const calcChange = (curr, prev) => {
    if (!prev || prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  res.json({
    totalCustomers: totalCount,
    newCustomers: recentCustomers,
    totalOrders: ordersAgg[0]?.total ?? 0,
    totalRevenue: totalRev,
    avgCustomerValue: totalCount > 0 ? Math.round(totalRev / totalCount) : 0,
    totalCustomersChange: calcChange(totalCount, totalCount - recentCustomers),
    newCustomersChange: calcChange(recentCustomers, prevCustomers),
    totalOrdersChange: calcChange(recentOrdersAgg[0]?.total || 0, prevOrdersAgg[0]?.total || 0),
    totalRevenueChange: calcChange(recentRevAgg[0]?.total || 0, prevRevAgg[0]?.total || 0),
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
  // Use ALL customers — uploaded CSV datasets are typically historical,
  // not within the last 30 days.
  const allCustomers = await Customer.find().sort({ joinDate: 1 }).lean();

  if (allCustomers.length === 0) {
    return res.json([]);
  }

  // Build trend by splitting the entire date range into 7 buckets
  const dates = allCustomers.map(c => c.joinDate).filter(Boolean).sort();
  if (dates.length === 0) return res.json([]);

  const earliest = new Date(dates[0]);
  const latest   = new Date(dates[dates.length - 1]);
  // Ensure valid dates
  if (isNaN(earliest.getTime()) || isNaN(latest.getTime())) return res.json([]);

  const rangeMs = Math.max(latest - earliest, 1);
  const bucketMs = rangeMs / 7;

  const result = [];
  for (let i = 0; i < 7; i++) {
    const bStart = new Date(earliest.getTime() + i * bucketMs);
    const bEnd   = new Date(earliest.getTime() + (i + 1) * bucketMs);

    const count = allCustomers.filter(c => {
      const cDate = new Date(c.joinDate);
      return cDate >= bStart && cDate < bEnd;
    }).length;

    result.push({
      label: bEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: count  // No Math.random() fallback — 0 is legitimate
    });
  }

  res.json(result);
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
