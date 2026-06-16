import { Router } from "express";
import {
  getDashboardStats,
  getRevenueOverview,
  getSalesByCategory,
  getRecentOrders,
  getInventoryStatus,
  getRevenueVsProfit,
  getTopSellingProducts,
  getAiInsights,
} from "../controllers/dashboardController.js";

const router = Router();

router.get("/dashboard/stats", async (req, res, next) => {
  try { await getDashboardStats(req, res); } catch (e) { next(e); }
});
router.get("/dashboard/revenue-overview", async (req, res, next) => {
  try { await getRevenueOverview(req, res); } catch (e) { next(e); }
});
router.get("/dashboard/sales-by-category", async (req, res, next) => {
  try { await getSalesByCategory(req, res); } catch (e) { next(e); }
});
router.get("/dashboard/recent-orders", async (req, res, next) => {
  try { await getRecentOrders(req, res); } catch (e) { next(e); }
});
router.get("/dashboard/inventory-status", async (req, res, next) => {
  try { await getInventoryStatus(req, res); } catch (e) { next(e); }
});
router.get("/dashboard/revenue-vs-profit", async (req, res, next) => {
  try { await getRevenueVsProfit(req, res); } catch (e) { next(e); }
});
router.get("/dashboard/top-selling-products", async (req, res, next) => {
  try { await getTopSellingProducts(req, res); } catch (e) { next(e); }
});
router.get("/dashboard/ai-insights", async (req, res, next) => {
  try { await getAiInsights(req, res); } catch (e) { next(e); }
});

export default router;

