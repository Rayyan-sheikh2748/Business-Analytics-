import { getOrCreateSettings, toSettingsResponse } from "../services/settingsService.js";
import { Product } from "../models/Product.js";
import { Sale } from "../models/Sale.js";
import { Customer } from "../models/Customer.js";
import { StockMovement } from "../models/StockMovement.js";
import { DatasetMetadata } from "../models/DatasetMetadata.js";
import { clearForecastCache } from "./forecastingController.js";

export async function getSettings(_req, res) {
  const settings = await getOrCreateSettings();
  res.json(toSettingsResponse(settings));
}

export async function updateSettings(req, res) {
  const settings = await getOrCreateSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(toSettingsResponse(settings));
}

export async function clearData(_req, res) {
  try {
    await Promise.all([
      Product.deleteMany({}),
      Sale.deleteMany({}),
      Customer.deleteMany({}),
      StockMovement.deleteMany({}),
      DatasetMetadata.deleteMany({}),
    ]);
    
    clearForecastCache();
    
    res.json({ success: true, message: "All uploaded datasets and analytics data cleared successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
