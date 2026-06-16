import { Sale } from "../models/Sale.js";
import { Customer } from "../models/Customer.js";
import { Product } from "../models/Product.js";
import { StockMovement } from "../models/StockMovement.js";
import { getNextSequence } from "../utils/sequence.js";
import { categoryStats, buildRegexSearch } from "../services/analyticsService.js";
import { csvToJson } from "../utils/csv.js";
import { DatasetMetadata } from "../models/DatasetMetadata.js";
import { detectSchema } from "../utils/schemaDetector.js";
import { cleanDate, cleanProductName, cleanNumeric } from "../utils/preprocessing.js";

function formatToISODate(dateStr) {
  if (!dateStr) return new Date().toISOString().split("T")[0];
  const cleaned = String(dateStr).trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  // Try custom regex patterns for DD/MM/YYYY or MM/DD/YYYY
  const parts = cleaned.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);
    if (p1 > 12) {
      return `${p2}-${String(p0).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
    } else {
      const year = p2 < 100 ? (p2 < 50 ? 2000 + p2 : 1900 + p2) : p2;
      return `${year}-${String(p1).padStart(2, "0")}-${String(p0).padStart(2, "0")}`;
    }
  }
  return cleaned;
}

export async function getStats(_req, res) {
  const [revenueAgg, unitsAgg, txnCount, customersAgg] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$revenue" } } }]),
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$qty" } } }]),
    Sale.countDocuments(),
    Sale.distinct("customer"),
  ]);

  // Compute period-based change percentages from real data
  const allDates = await Sale.distinct("date");
  const sortedDates = allDates.filter(Boolean).sort();
  
  let revenueChange = 0, unitsSoldChange = 0, transactionsChange = 0, newCustomersChange = 0;

  if (sortedDates.length >= 2) {
    const midIdx = Math.floor(sortedDates.length / 2);
    const midDate = sortedDates[midIdx];
    const firstDate = sortedDates[0];

    const [recentStats, prevStats, recentCust, prevCust] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: midDate } } },
        { $group: { _id: null, rev: { $sum: "$revenue" }, qty: { $sum: "$qty" }, txn: { $sum: 1 } } }
      ]),
      Sale.aggregate([
        { $match: { date: { $gte: firstDate, $lt: midDate } } },
        { $group: { _id: null, rev: { $sum: "$revenue" }, qty: { $sum: "$qty" }, txn: { $sum: 1 } } }
      ]),
      Sale.distinct("customer", { date: { $gte: midDate } }),
      Sale.distinct("customer", { date: { $gte: firstDate, $lt: midDate } }),
    ]);

    const calcChange = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return Number((((curr - prev) / prev) * 100).toFixed(1));
    };

    revenueChange = calcChange(recentStats[0]?.rev || 0, prevStats[0]?.rev || 0);
    unitsSoldChange = calcChange(recentStats[0]?.qty || 0, prevStats[0]?.qty || 0);
    transactionsChange = calcChange(recentStats[0]?.txn || 0, prevStats[0]?.txn || 0);
    newCustomersChange = calcChange(recentCust.length, prevCust.length);
  }

  res.json({
    totalRevenue: revenueAgg[0]?.total ?? 0,
    totalUnitsSold: unitsAgg[0]?.total ?? 0,
    totalTransactions: txnCount,
    newCustomers: customersAgg.length,
    revenueChange,
    unitsSoldChange,
    transactionsChange,
    newCustomersChange,
  });
}

export async function getTrend(_req, res) {
  const rows = await Sale.aggregate([
    { $match: { date: { $exists: true, $ne: null } } },
    { $group: { _id: "$date", value: { $sum: "$revenue" } } },
    { $sort: { _id: 1 } },
    { $limit: 60 },
  ]);
  res.json(rows.map((r) => ({ label: r._id, value: r.value })));
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
    { $match: { product: { $exists: true, $ne: null } } },
    { $group: { _id: "$product", unitsSold: { $sum: "$qty" }, revenue: { $sum: "$revenue" } } },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);
  res.json(rows.map((r, i) => ({ id: i + 1, name: r._id, unitsSold: r.unitsSold, revenue: r.revenue, rank: i + 1 })));
}

export async function listSales(req, res) {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { search, category, channel, dateFrom, dateTo } = req.query;
  const filter = {};

  if (search) filter.customer = buildRegexSearch(search);
  if (category && category !== "All Categories") filter.category = category;
  if (channel && channel !== "All Channels") filter.channel = channel;
  
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) filter.date.$gte = dateFrom;
    if (dateTo) filter.date.$lte = dateTo;
  }

  const [total, rows] = await Promise.all([
    Sale.countDocuments(filter),
    Sale.find(filter).sort({ date: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.json({
    data: rows.map(r => mapSaleDynamic(r)),
    total,
    page,
    limit,
  });
}

export async function createSale(req, res) {
  const d = req.body;
  const today = new Date().toISOString().split("T")[0];
  const invoiceId = `INV-${Date.now()}`;
  const qty = Number(d.qty) || 1;
  const unitPrice = Number(d.unitPrice) || 0;
  const revenue = qty * unitPrice;
  const legacyId = await getNextSequence("sale");
  const product = cleanProductName(d.product);
  const date = cleanDate(d.date) ?? today;

  const { getOrCreateSettings } = await import("../services/settingsService.js");
  const settings = await getOrCreateSettings();
  const fallbackMargin = (settings.profitMargin ?? 20) / 100;
  const profit = Number((revenue * fallbackMargin).toFixed(2));

  const row = await Sale.create({
    legacyId,
    invoiceId,
    date,
    customer: String(d.customer || "Unknown").trim(),
    product,
    category: String(d.category || "Uncategorized").trim(),
    qty,
    unitPrice,
    revenue,
    profit,
    channel: d.channel ?? "Online",
  });

  // Deduct from inventory product stock if matches
  const matchedProduct = await Product.findOneAndUpdate(
    { name: product },
    { $inc: { stock: -qty } },
    { new: true }
  );
  if (matchedProduct) {
    await StockMovement.create({
      legacyId: Date.now(),
      productId: matchedProduct.legacyId,
      product: matchedProduct.name,
      warehouse: matchedProduct.warehouse || "Main Warehouse",
      change: -qty,
      date
    });
  }

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
    const revenue = qty * unitPrice;
    update.revenue = revenue;
    
    const { getOrCreateSettings } = await import("../services/settingsService.js");
    const settings = await getOrCreateSettings();
    const fallbackMargin = (settings.profitMargin ?? 20) / 100;
    update.profit = Number((revenue * fallbackMargin).toFixed(2));
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

export async function uploadSalesCsv(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const csvData = req.file.buffer.toString("utf8");
    const jsonRows = csvToJson(csvData);

    if (!jsonRows || jsonRows.length === 0) {
      return res.status(400).json({ error: "Empty or invalid CSV file" });
    }

    // 1. Detect dynamic schema from CSV columns
    const { numericFields, dateFields, categoryFields, mappings } = detectSchema(jsonRows, 'sales');

    // 2. Persist schema mapping to DB
    await DatasetMetadata.findOneAndUpdate(
      { moduleType: 'sales' },
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
    const newSalesRows = [];
    const seenInvoiceIds = new Set();

    // Fetch existing invoice IDs from DB for the incoming batch to identify inserts vs updates
    const incomingInvoiceIds = jsonRows
      .map(row => row[mappings.invoice] || row.invoiceId)
      .filter(Boolean)
      .map(id => String(id).trim());

    const existingSales = await Sale.find({ invoiceId: { $in: incomingInvoiceIds } }, { invoiceId: 1 }).lean();
    const existingInvoiceSet = new Set(existingSales.map(s => s.invoiceId));

    // Fetch profit margin setting once for the entire upload batch
    const { getOrCreateSettings } = await import("../services/settingsService.js");
    const uploadSettings = await getOrCreateSettings();
    const fallbackMargin = (uploadSettings.profitMargin ?? 20) / 100;

    jsonRows.forEach((row, index) => {
      try {
        // Preprocess Date
        const rawDate = row[mappings.date] || row.date;
        const date = cleanDate(rawDate);
        if (!date) {
          throw new Error("Invalid or missing date");
        }

        // Preprocess Product Name
        const prodVal = row[mappings.product] || row.product;
        if (!prodVal) {
          throw new Error("Missing product name");
        }
        const product = cleanProductName(prodVal);

        // Preprocess Invoice ID
        const invoiceVal = row[mappings.invoice] || row.invoiceId;
        const invoiceId = invoiceVal ? String(invoiceVal).trim() : `INV-${baseTs}-${index}`;

        // Deduplicate within the uploaded CSV itself
        if (seenInvoiceIds.has(invoiceId)) {
          skippedRows++;
          return;
        }
        seenInvoiceIds.add(invoiceId);

        // Preprocess Numeric fields
        const qty = Math.max(1, Math.round(cleanNumeric(row[mappings.quantity] ?? row.qty, 1)));
        const unitPrice = Math.max(0, cleanNumeric(row[mappings.unitPrice] ?? row.unitPrice, 0));
        const revenue = cleanNumeric(row[mappings.revenue] ?? row.revenue, qty * unitPrice);
        // Use profit from CSV if available, otherwise calculate from settings-based margin
        const profit = cleanNumeric(row[mappings.profit] ?? row.profit, Number((revenue * fallbackMargin).toFixed(2)));

        const customer = String(row[mappings.customer] || row.customer || "Unknown").trim();
        const category = String(row[mappings.category] || row.category || "Uncategorized").trim();
        const region = String(row[mappings.region] || row.region || "Unknown").trim();
        const paymentMethod = String(row[mappings.paymentMethod] || row.paymentMethod || "Cash").trim();
        const channel = String(row[mappings.channel] || row.channel || "Online").trim();

        const doc = {
          ...row,
          legacyId: baseTs * 100000 + index,
          invoiceId,
          date,
          customer,
          product,
          category,
          qty,
          unitPrice,
          revenue,
          profit,
          region,
          paymentMethod,
          channel,
        };

        if (existingInvoiceSet.has(invoiceId)) {
          finalOps.push({
            updateOne: {
              filter: { invoiceId },
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

        newSalesRows.push(doc);
      } catch (err) {
        console.warn(`[Sales CSV Preprocess Row Warning] Row ${index + 1} validation failed:`, err.message);
        failedRows++;
      }
    });

    if (finalOps.length > 0) {
      const chunkSize = 2000;
      for (let i = 0; i < finalOps.length; i += chunkSize) {
        const chunk = finalOps.slice(i, i + chunkSize);
        try {
          await Sale.bulkWrite(chunk, { ordered: false });
        } catch (bulkErr) {
          console.error(`[Sales CSV BulkWrite Error] Chunk starting at ${i} failed:`, bulkErr.message);
          if (bulkErr.writeErrors) {
            const errCount = bulkErr.writeErrors.length;
            failedRows += errCount;
            // Best effort statistics correction: assume failed operations are subtracted from expected counts
            insertedRows = Math.max(0, insertedRows - errCount);
          }
        }
      }
    }

    // Update Customer collection incrementally based on newly processed sales rows
    if (newSalesRows.length > 0) {
      const customerNames = [...new Set(newSalesRows.map(r => r.customer).filter(Boolean))];
      
      const existingCustomers = await Customer.find({ name: { $in: customerNames } }).lean();
      const customerStatsMap = new Map(existingCustomers.map(c => [c.name, c]));

      newSalesRows.forEach(row => {
        const name = row.customer;
        const rev = row.revenue || 0;
        const date = row.date || "";
        const location = row.region && row.region !== "Unknown" ? row.region : undefined;

        if (!customerStatsMap.has(name)) {
          customerStatsMap.set(name, {
            name,
            totalOrders: 0,
            totalSpent: 0,
            joinDate: date,
            lastOrderDate: date,
            legacyId: null,
            location: location || null,
          });
        }
        const stats = customerStatsMap.get(name);
        stats.totalOrders += 1;
        stats.totalSpent += rev;
        // Set location from first sale that has one
        if (location && !stats.location) stats.location = location;
        if (date && (!stats.lastOrderDate || date > stats.lastOrderDate)) stats.lastOrderDate = date;
        if (date && (!stats.joinDate || date < stats.joinDate)) stats.joinDate = date;
      });

      const customerOps = [];
      let custIdx = 0;
      
      for (const stat of customerStatsMap.values()) {
        const isActive = true;
        const safeName = stat.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'customer';
        const totalSpent = stat.totalSpent;
        
        let segment = "Regular";
        if (totalSpent > 10000) segment = "VIP";
        else if (totalSpent > 5000) segment = "Premium";
        else if (totalSpent < 1000 && stat.totalOrders === 1) segment = "New";

        const updateDoc = {
          name: stat.name,
          email: stat.email || `${safeName}${custIdx}@dataset.local`,
          phone: stat.phone || "000-000-0000",
          totalOrders: stat.totalOrders,
          totalSpent: stat.totalSpent,
          status: isActive ? "Active" : "Inactive",
          joinDate: stat.joinDate || new Date().toISOString().split("T")[0],
          lastOrderDate: stat.lastOrderDate || '',
          segment,
          ...(stat.location ? { location: stat.location } : {}),
        };

        if (!stat._id) {
          updateDoc.legacyId = baseTs * 100000 + 90000000 + custIdx;
        }

        customerOps.push({
          updateOne: {
            filter: { name: stat.name },
            update: { $set: updateDoc },
            upsert: true
          }
        });
        custIdx++;
      }

      if (customerOps.length > 0) {
        await Customer.bulkWrite(customerOps, { ordered: false });
      }
    }

    // Update Product Stock levels based on sold quantities (Inventory Sync)
    if (newSalesRows.length > 0) {
      const productQuantities = new Map();
      newSalesRows.forEach(row => {
        if (row.product) {
          productQuantities.set(row.product, (productQuantities.get(row.product) || 0) + row.qty);
        }
      });
      
      if (productQuantities.size > 0) {
        const productNames = Array.from(productQuantities.keys());
        const existingProducts = await Product.find({ name: { $in: productNames } }).lean();
        const existingProductNames = new Set(existingProducts.map(p => p.name));
        
        const productOps = [];
        const stockMovements = [];
        
        for (const [prodName, soldQty] of productQuantities.entries()) {
          if (existingProductNames.has(prodName)) {
            // Decrement stock
            productOps.push({
              updateOne: {
                filter: { name: prodName },
                update: { $inc: { stock: -soldQty } }
              }
            });
            
            // Add StockMovement record
            const matchingProd = existingProducts.find(p => p.name === prodName);
            stockMovements.push({
              legacyId: baseTs + Math.floor(Math.random() * 100000),
              productId: matchingProd?.legacyId || 0,
              product: prodName,
              warehouse: matchingProd?.warehouse || "Main Warehouse",
              change: -soldQty,
              date: new Date().toISOString().split("T")[0]
            });
          }
        }
        
        if (productOps.length > 0) {
          await Product.bulkWrite(productOps, { ordered: false });
        }
        if (stockMovements.length > 0) {
          await StockMovement.insertMany(stockMovements, { ordered: false });
        }
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
    console.error('[Sales CSV Upload Error]', err);
    res.status(500).json({ error: err.message });
  }
}

function mapSaleDynamic(r) {
  return {
    id: r.legacyId,
    invoiceId: r.invoiceId || "N/A",
    date: r.date || "Unknown",
    customer: r.customer || "Unknown",
    product: r.product || "Unknown",
    category: r.category || "Uncategorized",
    qty: Number(r.qty) || 1,
    unitPrice: Number(r.unitPrice) || 0,
    revenue: Number(r.revenue) || 0,
    channel: r.channel || "Online",
  };
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
