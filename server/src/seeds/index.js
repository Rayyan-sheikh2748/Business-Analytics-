import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, disconnectDB } from "../config/db.js";
import { Product } from "../models/Product.js";
import { Sale } from "../models/Sale.js";
import { Customer } from "../models/Customer.js";
import { Settings } from "../models/Settings.js";
import { StockMovement } from "../models/StockMovement.js";
import { datasets } from "./datasets.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function resetCollections() {
  await Promise.all([
    Product.deleteMany({}),
    Sale.deleteMany({}),
    Customer.deleteMany({}),
    Settings.deleteMany({}),
    StockMovement.deleteMany({}),
    mongoose.connection.collection("counters").deleteMany({}),
  ]);
}

async function clearDatabase() {
  const dbName = mongoose.connection.name;
  console.log(`Clearing entire database: ${dbName}`);
  await mongoose.connection.dropDatabase();
}

async function seedDataset(type = "grocery") {
  const data = datasets[type] ?? datasets.grocery;
  console.log(`Seeding ${type} dataset: ${data.businessName}`);

  await Settings.create({
    businessName: data.businessName,
    businessEmail: data.businessEmail,
    defaultTheme: "light",
    language: "en",
    timezone: "Asia/Kolkata",
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    enableAnalytics: true,
    autoRefresh: true,
    emailNotifications: true,
    darkMode: false,
    compactView: false,
  });

  const productDocs = [];
  for (let i = 0; i < data.products.length; i++) {
    const p = data.products[i];
    productDocs.push(await Product.create({ legacyId: i + 1, ...p }));
  }

  for (let i = 0; i < data.customers.length; i++) {
    const c = data.customers[i];
    await Customer.create({ legacyId: i + 1, ...c });
  }

  const channels = ["Retail", "Online", "Retail", "Retail", "Online"];
  for (let i = 0; i < 60; i++) {
    const d = new Date("2024-04-01");
    d.setDate(d.getDate() + Math.floor(i * 0.6));
    const date = d.toISOString().split("T")[0];
    const prod = data.salesProducts[i % data.salesProducts.length];
    const qty = 1 + (i % 6);
    const revenue = qty * prod.price;
    await Sale.create({
      legacyId: i + 1,
      invoiceId: `INV-${String(10001 + i).padStart(5, "0")}`,
      date,
      customer: data.customerNames[i % data.customerNames.length],
      product: prod.name,
      category: prod.cat,
      qty,
      unitPrice: prod.price,
      revenue,
      channel: channels[i % channels.length],
    });
  }

  for (let i = 0; i < Math.min(5, productDocs.length); i++) {
    const p = productDocs[i];
    await StockMovement.create({
      legacyId: i + 1,
      productId: p.legacyId,
      product: p.name,
      warehouse: p.warehouse,
      change: i % 2 === 0 ? 50 : -20,
      date: "2024-04-0" + (i + 1),
    });
  }

  await mongoose.connection.collection("counters").insertMany([
    { _id: "product", seq: data.products.length },
    { _id: "sale", seq: 60 },
    { _id: "customer", seq: data.customers.length },
    { _id: "stockMovement", seq: 5 },
  ]);

  console.log(`Seed complete for ${type}!`);
}

const datasetType = process.argv[2] || "grocery";

try {
  await connectDB();
  if (datasetType === "clear") {
    await clearDatabase();
  } else {
    await resetCollections();
    await seedDataset(datasetType);
  }
  await disconnectDB();
  process.exit(0);
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
}
