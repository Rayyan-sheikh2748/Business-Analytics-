import { Router } from "express";
import * as settings from "../controllers/settingsController.js";

const router = Router();

router.get("/settings", settings.getSettings);
router.put("/settings", settings.updateSettings);

export default router;
