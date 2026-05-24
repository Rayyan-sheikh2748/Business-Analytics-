import { Router } from "express";
import * as sales from "../controllers/salesController.js";

const router = Router();

router.get("/sales/stats", sales.getStats);
router.get("/sales/trend", sales.getTrend);
router.get("/sales/by-category", sales.getByCategory);
router.get("/sales/top-products", sales.getTopProducts);
router.get("/sales", sales.listSales);
router.post("/sales", sales.createSale);
router.put("/sales/:id", sales.updateSale);
router.delete("/sales/:id", sales.deleteSale);

export default router;
