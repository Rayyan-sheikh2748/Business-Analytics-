import { Sale } from "../models/Sale.js";
import { Product } from "../models/Product.js";
import { Customer } from "../models/Customer.js";
import { categoryStats } from "../services/analyticsService.js";
import { stockStatus } from "../services/analyticsService.js";

export async function getDashboardStats() {
  const [revenueAgg, ordersCount, productsCount, customersCount] = await Promise.all([
    Sale.aggregate([{ $group: { _id: null, total: { $sum: "$revenue" } } }]),
    Sale.countDocuments(),
    Product.countDocuments(),
    Customer.countDocuments(),
  ]);

  const totalRevenue = revenueAgg[0]?.total ?? 0;

  return {
    totalRevenue,
    totalOrders: ordersCount,
    totalProfit: Math.round(totalRevenue * 0.197),
    totalProducts: productsCount,
    newCustomers: customersCount,
    revenueChange: 18.6,
    ordersChange: 12.6,
    profitChange: 16.3,
    productsChange: 2.4,
    customersChange: 15.8,
  };
}

export async function getRevenueOverview() {
  const rows = await Sale.aggregate([
    { $group: { _id: "$date", value: { $sum: "$revenue" } } },
    { $sort: { _id: 1 } },
    { $limit: 30 },
  ]);
  return rows.map((r) => ({ label: r._id, value: r.value }));
}

export async function getSalesByCategory() {
  const rows = await Sale.aggregate([
    { $group: { _id: "$category", value: { $sum: "$revenue" } } },
    { $sort: { value: -1 } },
  ]);
  return categoryStats(
    rows.map((r) => ({ name: r._id, value: r.value })),
    "name",
    "value",
  );
}

export async function getRecentOrders() {
  const rows = await Sale.find().sort({ createdAt: -1 }).limit(5).lean();
  const statuses = ["Completed", "Processing"];
  return rows.map((r, i) => ({
    id: r.legacyId,
    orderId: r.invoiceId,
    product: r.product,
    amount: r.revenue,
    status: statuses[i % 2],
    date: r.date,
  }));
}

export async function getInventoryStatus() {
  const rows = await Product.find().limit(5).lean();
  return rows.map((r) => ({
    id: r.legacyId,
    product: r.name,
    stock: r.stock,
    status: stockStatus(r.stock, r.threshold),
  }));
}

export async function getRevenueVsProfit() {
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  return months.map((m, i) => ({
    label: m,
    revenue: 80000 + i * 12000 + Math.floor(Math.random() * 15000),
    profit: 25000 + i * 4000 + Math.floor(Math.random() * 5000),
  }));
}

export async function getTopSellingProducts() {
  const rows = await Sale.aggregate([
    {
      $group: {
        _id: "$product",
        unitsSold: { $sum: "$qty" },
        revenue: { $sum: "$revenue" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);
  return rows.map((r, i) => ({
    id: i + 1,
    name: r._id,
    unitsSold: r.unitsSold,
    revenue: r.revenue,
    rank: i + 1,
  }));
}

export function getAiInsights() {
  return [
    { type: "positive", title: "Revenue is up by 18.6%", message: "Great job! Your revenue has increased compared to last month." },
    { type: "warning", title: "Low Stock Alert", message: "2 products are running low on stock. Consider restocking soon." },
    { type: "info", title: "Peak Sales Time", message: "Your sales peak on weekends. Plan promotions accordingly." },
    { type: "star", title: "Top Performer", message: "Your top selling product is driving strong monthly growth." },
  ];
}
