import { Product } from "../models/Product.js";
import { StockMovement } from "../models/StockMovement.js";
import { getNextSequence } from "../utils/sequence.js";
import { categoryStats, stockStatus, buildRegexSearch } from "../services/analyticsService.js";

export async function getStats(_req, res) {
  const products = await Product.find().lean();
  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStockItems = products.filter((p) => p.stock > 0 && p.stock <= p.threshold).length;
  const outOfStockItems = products.filter((p) => p.stock === 0).length;
  const inventoryValue = products.reduce((s, p) => s + p.stock * (p.unitCost || 0), 0);

  res.json({ totalProducts, totalStock, lowStockItems, outOfStockItems, inventoryValue });
}

export async function getStockStatus(_req, res) {
  const rows = await Product.find().lean();
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
}

export async function getLowStockAlerts(_req, res) {
  const rows = await Product.find({ $expr: { $lte: ["$stock", "$threshold"] } }).limit(5).lean();
  res.json(rows.map((p) => ({ id: p.legacyId, product: p.name, stock: p.stock, threshold: p.threshold })));
}

export async function getRecentMovements(_req, res) {
  const rows = await StockMovement.find().sort({ createdAt: -1 }).limit(5).lean();
  res.json(rows.map((r) => ({ id: r.legacyId, product: r.product, warehouse: r.warehouse, change: r.change, date: r.date })));
}

export async function getTrend(_req, res) {
  const labels = ["Apr 1", "Apr 6", "Apr 11", "Apr 16", "Apr 21", "Apr 26", "Apr 30"];
  const products = await Product.find().lean();
  const baseVal = products.reduce((s, p) => s + p.stock, 0) || 1000;
  res.json(labels.map((l, i) => ({ label: l, value: baseVal + i * 500 - Math.floor(Math.random() * 200) })));
}

export async function getByCategory(_req, res) {
  const rows = await Product.aggregate([
    { $group: { _id: "$category", value: { $sum: { $multiply: ["$stock", { $ifNull: ["$unitCost", 1000] }] } } } },
    { $sort: { value: -1 } },
  ]);
  res.json(categoryStats(rows.map((r) => ({ name: r._id, value: r.value })), "name", "value"));
}

export async function listInventory(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { search, category, warehouse } = req.query;
  const filter = {};

  if (search) filter.name = buildRegexSearch(search);
  if (category && category !== "All Categories") filter.category = category;
  if (warehouse && warehouse !== "All Warehouses") filter.warehouse = warehouse;

  const [total, rows] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort({ legacyId: 1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.json({
    data: rows.map(mapProduct),
    total,
    page,
    limit,
  });
}

export async function createProduct(req, res) {
  const d = req.body;
  const legacyId = await getNextSequence("product");
  const row = await Product.create({
    legacyId,
    sku: d.sku,
    name: d.product,
    category: d.category,
    warehouse: d.warehouse ?? "Main Warehouse",
    stock: d.stock ?? 0,
    threshold: d.threshold ?? 10,
    unitCost: d.unitCost ?? 0,
  });
  res.status(201).json(mapProduct(row));
}

export async function updateProduct(req, res) {
  const id = Number(req.params.id);
  const d = req.body;
  const update = {};
  if (d.product !== undefined) update.name = d.product;
  if (d.category !== undefined) update.category = d.category;
  if (d.warehouse !== undefined) update.warehouse = d.warehouse;
  if (d.stock !== undefined) update.stock = d.stock;
  if (d.threshold !== undefined) update.threshold = d.threshold;
  if (d.unitCost !== undefined) update.unitCost = d.unitCost;

  const row = await Product.findOneAndUpdate({ legacyId: id }, update, { new: true });
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json(mapProduct(row));
}

export async function deleteProduct(req, res) {
  const id = Number(req.params.id);
  const row = await Product.findOneAndDelete({ legacyId: id });
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json({ success: true });
}

function mapProduct(r) {
  return {
    id: r.legacyId,
    sku: r.sku,
    product: r.name,
    category: r.category,
    warehouse: r.warehouse,
    stock: r.stock,
    threshold: r.threshold,
    unitCost: r.unitCost ?? 0,
    status: stockStatus(r.stock, r.threshold),
    stockValue: r.stock * (r.unitCost ?? 0),
  };
}
