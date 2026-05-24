import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import salesRouter from "./sales";
import inventoryRouter from "./inventory";
import forecastingRouter from "./forecasting";
import reportsRouter from "./reports";
import customersRouter from "./customers";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(salesRouter);
router.use(inventoryRouter);
router.use(forecastingRouter);
router.use(reportsRouter);
router.use(customersRouter);
router.use(settingsRouter);

export default router;
