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

router.get("/dashboard/stats", async (_req, res, next) => {
  try { res.json(await getDashboardStats()); } catch (e) { next(e); }
});
router.get("/dashboard/revenue-overview", async (_req, res, next) => {
  try { res.json(await getRevenueOverview()); } catch (e) { next(e); }
});
router.get("/dashboard/sales-by-category", async (_req, res, next) => {
  try { res.json(await getSalesByCategory()); } catch (e) { next(e); }
});
router.get("/dashboard/recent-orders", async (_req, res, next) => {
  try { res.json(await getRecentOrders()); } catch (e) { next(e); }
});
router.get("/dashboard/inventory-status", async (_req, res, next) => {
  try { res.json(await getInventoryStatus()); } catch (e) { next(e); }
});
router.get("/dashboard/revenue-vs-profit", async (_req, res, next) => {
  try { res.json(await getRevenueVsProfit()); } catch (e) { next(e); }
});
router.get("/dashboard/top-selling-products", async (_req, res, next) => {
  try { res.json(await getTopSellingProducts()); } catch (e) { next(e); }
});
router.get("/dashboard/ai-insights", (_req, res) => {
  res.json(getAiInsights());
});

export default router;
