import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB, disconnectDB } from "../config/db.js";
import { Sale } from "../models/Sale.js";
import { Product } from "../models/Product.js";
import { DatasetMetadata } from "../models/DatasetMetadata.js";
import { getForecast } from "../controllers/forecastingController.js";
import { getDashboardStats, getAiInsights } from "../controllers/dashboardController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function runValidation() {
  console.log("Starting automated validation of Business Intelligence and Forecasting System...");
  
  // 1. Connect to MongoDB
  await connectDB();
  
  // Ensure we are working on a clean test set
  await Sale.deleteMany({ isTest: true });
  await Product.deleteMany({ isTest: true });
  
  console.log("Seeding test dataset...");
  
  // 2. Seed test inventory products
  const products = [
    { name: "Rice", category: "Grocery", stock: 10, threshold: 5, unitCost: 40, isTest: true, legacyId: 9001 },
    { name: "Sugar", category: "Grocery", stock: 40, threshold: 10, unitCost: 30, isTest: true, legacyId: 9002 },
    { name: "Pasta", category: "Grocery", stock: 5, threshold: 8, unitCost: 25, isTest: true, legacyId: 9003 },
    { name: "Juice", category: "Grocery", stock: 8, threshold: 12, unitCost: 50, isTest: true, legacyId: 9004 },
  ];
  await Product.insertMany(products);
  
  // 3. Seed historical sales data (60 days) to allow ARIMA training
  const sales = [];
  const baseDate = new Date("2026-04-01");
  const productNames = ["Rice", "Sugar", "Pasta", "Juice"];
  
  for (let i = 0; i < 60; i++) {
    const saleDate = new Date(baseDate);
    saleDate.setDate(saleDate.getDate() + i);
    const dateStr = saleDate.toISOString().split("T")[0];
    
    productNames.forEach((prod, pIdx) => {
      let qty = 0;
      if (prod === "Rice") {
        qty = Math.round(5 + i * 0.1 + Math.sin(i) * 2);
      } else if (prod === "Sugar") {
        qty = Math.round(8 + Math.cos(i) * 1.5);
      } else if (prod === "Pasta") {
        qty = Math.round(Math.max(1, 10 - i * 0.12 + Math.sin(i) * 1));
      } else {
        qty = Math.round(Math.max(1, 2 + Math.cos(i) * 0.5));
      }
      
      const unitPrice = prod === "Rice" ? 50 : prod === "Sugar" ? 40 : prod === "Pasta" ? 35 : 60;
      const revenue = qty * unitPrice;
      const profit = Math.round(revenue * 0.25);
      
      sales.push({
        invoiceId: `TINV-${10000 + i * 4 + pIdx}`,
        date: dateStr,
        customer: `Test Customer ${i % 5}`,
        product: prod,
        category: "Grocery",
        qty,
        unitPrice,
        revenue,
        profit,
        region: i % 2 === 0 ? "North" : "South",
        paymentMethod: i % 3 === 0 ? "UPI" : "Cash",
        isTest: true,
        legacyId: 900000 + i * 4 + pIdx
      });
    });
  }
  
  await Sale.insertMany(sales);
  console.log(`Successfully seeded ${sales.length} historical sales records.`);
  
  // Create mock DatasetMetadata mapping
  await DatasetMetadata.findOneAndUpdate(
    { moduleType: 'sales' },
    {
      moduleType: 'sales',
      numericFields: ['qty', 'unitPrice', 'revenue', 'profit'],
      dateFields: ['date'],
      categoryFields: ['category', 'product', 'customer', 'region', 'paymentMethod'],
      mappings: {
        revenue: 'revenue',
        quantity: 'qty',
        date: 'date',
        category: 'category',
        customer: 'customer',
        product: 'product',
        invoice: 'invoiceId',
        unitPrice: 'unitPrice',
        profit: 'profit',
        region: 'region',
        paymentMethod: 'paymentMethod'
      }
    },
    { upsert: true }
  );

  await DatasetMetadata.findOneAndUpdate(
    { moduleType: 'inventory' },
    {
      moduleType: 'inventory',
      numericFields: ['stock', 'threshold', 'unitCost'],
      categoryFields: ['category', 'product', 'warehouse'],
      mappings: {
        product: 'name',
        stock: 'stock',
        threshold: 'threshold',
        unitCost: 'unitCost',
        category: 'category'
      }
    },
    { upsert: true }
  );
  
  // 4. Test forecasting API
  console.log("\n--- Testing ML Forecasting API ---");
  
  const mockReq = { query: { horizon: 30, model: "ARIMA" } };
  const mockRes = {
    json: (data) => {
      console.log("Forecast results generated successfully:");
      console.log(`- Forecasted Sales (30 Days): ${data.forecastedSales} units`);
      console.log(`- Avg Daily Demand: ${data.avgDailyDemand} units`);
      console.log(`- Total Revenue Forecast: ₹${data.totalRevenueForecast}`);
      console.log(`- Peak Demand Day: ${data.peakDemandDay}`);
      console.log(`- Recommended Stock (inc buffer): ${data.recommendedStock} units`);
      console.log(`- MAPE: ${data.mape?.toFixed(2)}%`);
      console.log(`- Accuracy: ${data.accuracy?.toFixed(2)}%`);
      console.log(`- Chart Points returned: ${data.chartData?.length}`);
      
      if (data.forecastedSales <= 0) throw new Error("Forecast output must be positive");
      if (data.accuracy < 0 || data.accuracy > 100) throw new Error("Accuracy must be between 0 and 100");
    }
  };
  
  await getForecast(mockReq, mockRes);
  
  // 5. Test Dashboard Stats
  console.log("\n--- Testing Dashboard Stats Enhancement ---");
  const dashStats = await getDashboardStats();
  console.log("Dashboard Stats:");
  console.log(`- Total Revenue: ₹${dashStats.totalRevenue}`);
  console.log(`- Monthly Revenue (last 30d): ₹${dashStats.monthlyRevenue}`);
  console.log(`- Forecasted Revenue (next 30d): ₹${dashStats.forecastedRevenue}`);
  console.log(`- Top Selling Product: ${dashStats.topSellingProduct}`);
  console.log(`- Fastest Growing Product: ${dashStats.fastestGrowingProduct}`);
  console.log(`- Forecast Confidence Score: ${dashStats.forecastConfidenceScore?.toFixed(1)}%`);
  
  if (dashStats.monthlyRevenue <= 0) throw new Error("Monthly revenue must be positive");
  if (dashStats.forecastedRevenue <= 0) throw new Error("Forecasted revenue must be positive");
  if (dashStats.topSellingProduct === "N/A") throw new Error("Top selling product must be determined");
  if (dashStats.fastestGrowingProduct === "N/A") throw new Error("Fastest growing product must be determined");

  // 6. Test AI Recommendations and Alerts
  console.log("\n--- Testing Investment Recommendations & Inventory Alerts ---");
  const insights = await getAiInsights();
  console.log("Generated AI Insights:");
  insights.forEach((ins, idx) => {
    console.log(`[Insight ${idx + 1}] Type: ${ins.type} | Title: ${ins.title}`);
    console.log(`  Message: ${ins.message}`);
  });
  
  const hasOpportunity = insights.some(ins => ins.title.includes("Opportunity") || ins.title.includes("Outlook"));
  const hasShortage = insights.some(ins => ins.title.includes("Shortage") || ins.title.includes("Risk") || ins.title.includes("Healthy"));
  
  console.log(`- Has Opportunity: ${hasOpportunity}`);
  console.log(`- Has Shortage/Risk: ${hasShortage}`);
  
  // Clean up
  await Sale.deleteMany({ isTest: true });
  await Product.deleteMany({ isTest: true });
  
  console.log("\nAutomated validation complete! All checks passed successfully.");
  await disconnectDB();
}

runValidation().catch(async (err) => {
  console.error("\nAutomated validation failed:", err);
  await disconnectDB();
  process.exit(1);
});
