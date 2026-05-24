import { getOrCreateSettings, toSettingsResponse } from "../services/settingsService.js";

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
