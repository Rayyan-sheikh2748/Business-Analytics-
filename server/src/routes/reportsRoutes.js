import { Router } from "express";
import * as reports from "../controllers/reportsController.js";

const router = Router();

router.get("/reports/stats", reports.getStats);
router.get("/reports/revenue-trend", reports.getRevenueTrend);
router.get("/reports/by-category", reports.getByCategory);
router.get("/reports/top-products", reports.getTopProducts);
router.get("/reports", reports.getReport);

export default router;
