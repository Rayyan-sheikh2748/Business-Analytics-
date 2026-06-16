import { Product } from "../models/Product.js";
import { StockMovement } from "../models/StockMovement.js";
import { getNextSequence } from "../utils/sequence.js";
import { categoryStats, stockStatus, buildRegexSearch } from "../services/analyticsService.js";
import { csvToJson } from "../utils/csv.js";
import { DatasetMetadata } from "../models/DatasetMetadata.js";
import { detectSchema } from "../utils/schemaDetector.js";
import { cleanProductName, cleanNumeric } from "../utils/preprocessing.js";

export async function getStats(_req, res) {
  const products = await Product.find().lean();
  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);
  const lowStockItems = products.filter((p) => {
    const s = Number(p.stock) || 0;
    const t = Number(p.threshold) || 10;
    return s > 0 && s <= t;
  }).length;
  const outOfStockItems = products.filter((p) => (Number(p.stock) || 0) === 0).length;
  const inventoryValue = products.reduce((s, p) => {
    const stock = Number(p.stock) || 0;
    const cost = Number(p.unitCost) || 0;
    return s + (stock * cost);
  }, 0);

  res.json({ totalProducts, totalStock, lowStockItems, outOfStockItems, inventoryValue: Math.round(inventoryValue) });
}

export async function getStockStatus(_req, res) {
  const rows = await Product.find().lean();
  const total = rows.length || 1;

  let inStock = 0, low = 0, out = 0, noData = 0;
  for (const p of rows) {
    const s = Number(p.stock) || 0;
    const t = Number(p.threshold) || 10;
    if (s < 0) noData++;
    else if (s === 0) out++;
    else if (s <= t) low++;
    else inStock++;
  }

  res.json([
    { status: "In Stock",      count: inStock, percentage: Math.round((inStock / total) * 100) },
    { status: "Low Stock",     count: low,     percentage: Math.round((low / total) * 100) },
    { status: "Out of Stock",  count: out,     percentage: Math.round((out / total) * 100) },
    { status: "No Stock Data", count: noData,  percentage: Math.round((noData / total) * 100) },
  ]);
}

export async function getLowStockAlerts(_req, res) {
  const products = await Product.find().lean();
  const alerts = products.filter(p => {
    const s = Number(p.stock) || 0;
    const t = Number(p.threshold) || 10;
    return s >= 0 && s <= t;
  }).slice(0, 5);

  res.json(alerts.map((p) => ({
    id: p.legacyId || p._id,
    product: p.name || p.product || "Unknown",
    stock: Number(p.stock) || 0,
    threshold: Number(p.threshold) || 10,
  })));
}

export async function getRecentMovements(_req, res) {
  const rows = await StockMovement.find().sort({ createdAt: -1 }).limit(5).lean();
  res.json(rows.map((r) => ({ id: r.legacyId, product: r.product, warehouse: r.warehouse, change: r.change, date: r.date })));
}

export async function getTrend(_req, res) {
  const products = await Product.find().lean();
  const currentStock = products.reduce((s, p) => s + (Number(p.stock) || 0), 0);

  if (currentStock === 0) {
    return res.json([]);
  }

  // Build a trend from StockMovement records if available, otherwise simulate from current stock
  const movements = await StockMovement.find().sort({ date: 1 }).lean();

  if (movements.length > 0) {
    // Group by date and compute cumulative stock level
    const dateMap = {};
    movements.forEach(m => {
      const d = m.date || new Date(m.createdAt).toISOString().split("T")[0];
      dateMap[d] = (dateMap[d] || 0) + (Number(m.change) || 0);
    });
    const dates = Object.keys(dateMap).sort();
    let running = currentStock;
    // Reverse-compute starting stock
    dates.forEach(d => { running -= dateMap[d]; });
    
    const result = [];
    dates.slice(-7).forEach(d => {
      running += dateMap[d];
      const dt = new Date(d);
      const label = !isNaN(dt.getTime()) ? dt.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : d;
      result.push({ label, value: Math.max(0, running) });
    });
    // Ensure last point is current stock
    if (result.length > 0) result[result.length - 1].value = currentStock;
    return res.json(result);
  }

  // Fallback: simple simulated trend from current stock
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - (i * 5));
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const variation = Math.floor(currentStock * 0.04 * i);
    const value = i === 0 ? currentStock : Math.max(0, currentStock - variation);
    result.push({ label, value });
  }
  res.json(result);
}

export async function getByCategory(_req, res) {
  const rows = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        value: { $sum: { $multiply: [{ $ifNull: ["$stock", 0] }, { $ifNull: ["$unitCost", 0] }] } },
        count: { $sum: 1 }
      }
    },
    { $sort: { value: -1 } },
  ]);

  const total = rows.reduce((s, r) => s + r.value, 0);
  const useCount = total === 0;

  res.json(categoryStats(
    rows.map((r) => ({ name: r._id || "Uncategorized", value: useCount ? r.count : r.value })),
    "name",
    "value"
  ));
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
    data: rows.map(r => mapProductDynamic(r)),
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
  if (d.product !== undefined)   update.name = d.product;
  if (d.category !== undefined)  update.category = d.category;
  if (d.warehouse !== undefined) update.warehouse = d.warehouse;
  if (d.stock !== undefined)     update.stock = d.stock;
  if (d.threshold !== undefined) update.threshold = d.threshold;
  if (d.unitCost !== undefined)  update.unitCost = d.unitCost;

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

export async function uploadInventoryCsv(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const csvData = req.file.buffer.toString("utf8");
    const jsonRows = csvToJson(csvData);

    if (!jsonRows || jsonRows.length === 0) {
      return res.status(400).json({ error: "Empty or invalid CSV file" });
    }

    // 1. Detect dynamic schema
    const { numericFields, dateFields, categoryFields, mappings } = detectSchema(jsonRows, 'inventory');

    // 2. Persist schema mapping
    await DatasetMetadata.findOneAndUpdate(
      { moduleType: 'inventory' },
      { numericFields, dateFields, categoryFields, mappings, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const baseTs = Date.now();
    const totalRows = jsonRows.length;
    let insertedRows = 0;
    let updatedRows = 0;
    let skippedRows = 0;
    let failedRows = 0;

    const finalOps = [];
    const seenProductNames = new Set();

    // Fetch existing products to identify insert vs update
    const incomingNames = jsonRows
      .map(row => row[mappings.product] || row.product || row.name)
      .filter(Boolean)
      .map(p => cleanProductName(p));

    const existingProducts = await Product.find({ name: { $in: incomingNames } }).lean();
    const existingProductsMap = new Map(existingProducts.map(p => [p.name, p]));

    jsonRows.forEach((row, index) => {
      try {
        const prodVal = row[mappings.product] || row.product || row.name;
        if (!prodVal) {
          throw new Error("Missing product name");
        }
        const name = cleanProductName(prodVal);

        if (seenProductNames.has(name)) {
          skippedRows++;
          return;
        }
        seenProductNames.add(name);

        const stock = Math.max(0, Math.round(cleanNumeric(row[mappings.stock] ?? row.stock, 0)));
        const threshold = Math.max(0, Math.round(cleanNumeric(row[mappings.threshold] ?? row.threshold, 10)));
        const unitCost = Math.max(0, cleanNumeric(row[mappings.unitPrice] ?? row.unitCost ?? row.unitPrice, 0));
        const category = String(row[mappings.category] || row.category || "Uncategorized").trim();
        const warehouse = String(row[mappings.warehouse] || row.warehouse || "Main Warehouse").trim();

        let sku = row[mappings.sku] || row.sku;
        if (!sku) {
          sku = `SKU-${baseTs * 1000 + index}`;
        } else {
          sku = String(sku).trim();
        }

        const doc = {
          legacyId: baseTs * 100000 + index,
          sku,
          name,
          category,
          warehouse,
          stock,
          threshold,
          unitCost,
        };

        if (existingProductsMap.has(name)) {
          finalOps.push({
            updateOne: {
              filter: { name },
              update: { $set: doc }
            }
          });
          updatedRows++;
        } else {
          finalOps.push({
            insertOne: {
              document: doc
            }
          });
          insertedRows++;
        }
      } catch (err) {
        console.warn(`[Inventory CSV Preprocess Row Warning] Row ${index + 1} validation failed:`, err.message);
        failedRows++;
      }
    });

    if (finalOps.length > 0) {
      const chunkSize = 2000;
      for (let i = 0; i < finalOps.length; i += chunkSize) {
        const chunk = finalOps.slice(i, i + chunkSize);
        try {
          await Product.bulkWrite(chunk, { ordered: false });
        } catch (bulkErr) {
          console.error(`[Inventory CSV BulkWrite Error] Chunk starting at ${i} failed:`, bulkErr.message);
          if (bulkErr.writeErrors) {
            const errCount = bulkErr.writeErrors.length;
            failedRows += errCount;
            insertedRows = Math.max(0, insertedRows - errCount);
          }
        }
      }

      if (insertedRows + updatedRows > 0) {
        await StockMovement.create({
          legacyId: Date.now(),
          productId: 0,
          product: "Bulk Dynamic Import",
          warehouse: "Multiple",
          change: insertedRows + updatedRows,
          date: new Date().toISOString().split("T")[0],
        });
      }
    }

    res.json({
      success: true,
      message: `Processed ${totalRows} rows: ${insertedRows} inserted, ${updatedRows} updated, ${skippedRows} skipped, ${failedRows} failed.`,
      insertedCount: insertedRows,
      stats: {
        totalRows,
        insertedRows,
        updatedRows,
        skippedRows,
        failedRows
      },
      mappings,
    });

  } catch (err) {
    console.error('[Inventory CSV Upload Error]', err);
    res.status(500).json({ error: err.message });
  }
}

function mapProductDynamic(r) {
  const stock = Number(r.stock) || 0;
  const threshold = Number(r.threshold) || 10;
  const cost = Number(r.unitCost) || 0;
  return {
    id: r.legacyId,
    sku: r.sku || "N/A",
    product: r.name || r.product || "Unknown",
    category: r.category || "Uncategorized",
    warehouse: r.warehouse || "Main Warehouse",
    stock,
    threshold,
    unitCost: cost,
    status: stockStatus(stock, threshold),
    stockValue: stock * cost,
  };
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
    unitCost: r.unitCost,
    status: stockStatus(r.stock, r.threshold),
    stockValue: r.stock * r.unitCost,
  };
}
