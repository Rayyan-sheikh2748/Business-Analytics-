import { Router } from "express";
import * as customers from "../controllers/customersController.js";

const router = Router();

router.get("/customers/stats", customers.getStats);
router.get("/customers/by-segment", customers.getBySegment);
router.get("/customers/top-by-revenue", customers.getTopByRevenue);
router.get("/customers/trend", customers.getTrend);
router.get("/customers/by-location", customers.getByLocation);
router.get("/customers", customers.listCustomers);
router.post("/customers", customers.createCustomer);
router.put("/customers/:id", customers.updateCustomer);
router.delete("/customers/:id", customers.deleteCustomer);

export default router;
