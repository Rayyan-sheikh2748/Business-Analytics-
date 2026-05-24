import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function generateForecastChart(horizon: number) {
  const points = [];
  const histDays = 20;
  const totalDays = histDays + horizon;
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(2024, 3, 1 + i);
    const label = `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
    const base = 40 + Math.sin(i * 0.3) * 15;
    if (i < histDays) {
      points.push({ label, historical: Math.round(base + Math.random() * 10), forecasted: null, upperBound: null, lowerBound: null });
    } else {
      const fc = Math.round(base + Math.random() * 8);
      points.push({ label, historical: null, forecasted: fc, upperBound: fc + 13, lowerBound: Math.max(0, fc - 13) });
    }
  }
  return points;
}

router.get("/forecasting/forecast", async (req, res): Promise<void> => {
  const horizon = Number(req.query.horizon ?? 30);
  const model = (req.query.model as string) ?? "ARIMA";

  const mapeMap: Record<string, number> = { ARIMA: 8.42, Prophet: 11.23, "Linear Regression": 14.67, "Exponential Smoothing": 13.91 };
  const mape = mapeMap[model] ?? 8.42;

  res.json({
    forecastedSales: 1250,
    avgDailyDemand: 41.7,
    peakDemandDay: "May 18, 2024 (Saturday)",
    peakDemandUnits: 78,
    totalRevenueForecast: 187500,
    recommendedStock: 1450,
    mape,
    rmse: 12.35,
    accuracy: 100 - mape,
    chartData: generateForecastChart(horizon),
  });
});

router.get("/forecasting/breakdown", async (_req, res): Promise<void> => {
  const weeks = [
    { period: "May 01 - May 07", forecastedDemand: 280, lowerBound: 240, upperBound: 320, revenueForecast: 42000 },
    { period: "May 08 - May 14", forecastedDemand: 295, lowerBound: 250, upperBound: 340, revenueForecast: 44250 },
    { period: "May 15 - May 21", forecastedDemand: 320, lowerBound: 270, upperBound: 370, revenueForecast: 48000 },
    { period: "May 22 - May 28", forecastedDemand: 200, lowerBound: 170, upperBound: 230, revenueForecast: 30000 },
    { period: "May 29 - May 30", forecastedDemand: 155, lowerBound: 130, upperBound: 180, revenueForecast: 23250 },
  ];
  res.json(weeks);
});

router.get("/forecasting/heatmap", async (_req, res): Promise<void> => {
  const heatmap = [];
  for (let w = 1; w <= 5; w++) {
    heatmap.push({
      week: w,
      mon: Math.floor(25 + Math.random() * 20),
      tue: Math.floor(25 + Math.random() * 20),
      wed: Math.floor(25 + Math.random() * 20),
      thu: Math.floor(30 + Math.random() * 20),
      fri: Math.floor(35 + Math.random() * 20),
      sat: Math.floor(55 + Math.random() * 30),
      sun: Math.floor(40 + Math.random() * 25),
    });
  }
  res.json(heatmap);
});

router.get("/forecasting/model-comparison", async (_req, res): Promise<void> => {
  res.json([
    { model: "ARIMA (Auto)", mape: 8.42, isRecommended: true },
    { model: "Prophet", mape: 11.23, isRecommended: false },
    { model: "Linear Regression", mape: 14.67, isRecommended: false },
    { model: "Exponential Smoothing", mape: 13.91, isRecommended: false },
  ]);
});

export default router;
