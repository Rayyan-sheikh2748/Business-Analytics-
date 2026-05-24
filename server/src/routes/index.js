import { Router } from "express";
import healthRoutes from "./healthRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import salesRoutes from "./salesRoutes.js";
import inventoryRoutes from "./inventoryRoutes.js";
import customersRoutes from "./customersRoutes.js";
import reportsRoutes from "./reportsRoutes.js";
import forecastingRoutes from "./forecastingRoutes.js";
import settingsRoutes from "./settingsRoutes.js";

const router = Router();

router.use(healthRoutes);
router.use(dashboardRoutes);
router.use(salesRoutes);
router.use(inventoryRoutes);
router.use(customersRoutes);
router.use(reportsRoutes);
router.use(forecastingRoutes);
router.use(settingsRoutes);

export default router;
