import { Router } from "express";
import * as forecasting from "../controllers/forecastingController.js";

const router = Router();

router.get("/forecasting/forecast", forecasting.getForecast);
router.get("/forecasting/breakdown", forecasting.getBreakdown);
router.get("/forecasting/heatmap", forecasting.getHeatmap);
router.get("/forecasting/model-comparison", forecasting.getModelComparison);
router.get("/forecasting/historical-analytics", forecasting.getHistoricalAnalytics);
router.get("/forecasting/product-forecast", forecasting.getProductForecast);
router.get("/forecasting/inventory-forecast", forecasting.getInventoryForecast);
router.get("/forecasting/investment-recommendations", forecasting.getInvestmentRecommendations);

export default router;
