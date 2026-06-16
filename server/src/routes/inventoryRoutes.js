import { Router } from "express";
import * as inventory from "../controllers/inventoryController.js";

const router = Router();

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

router.get("/inventory/stats", inventory.getStats);
router.get("/inventory/stock-status", inventory.getStockStatus);
router.get("/inventory/low-stock-alerts", inventory.getLowStockAlerts);
router.get("/inventory/recent-movements", inventory.getRecentMovements);
router.get("/inventory/trend", inventory.getTrend);
router.get("/inventory/by-category", inventory.getByCategory);
router.get("/inventory", inventory.listInventory);
router.post("/inventory/upload", upload.single("file"), inventory.uploadInventoryCsv);
router.post("/inventory", inventory.createProduct);
router.put("/inventory/:id", inventory.updateProduct);
router.delete("/inventory/:id", inventory.deleteProduct);

export default router;
