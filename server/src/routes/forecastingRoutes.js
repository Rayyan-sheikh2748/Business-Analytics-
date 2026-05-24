import { Router } from "express";
import * as forecasting from "../controllers/forecastingController.js";

const router = Router();

router.get("/forecasting/forecast", forecasting.getForecast);
router.get("/forecasting/breakdown", forecasting.getBreakdown);
router.get("/forecasting/heatmap", forecasting.getHeatmap);
router.get("/forecasting/model-comparison", forecasting.getModelComparison);

export default router;
