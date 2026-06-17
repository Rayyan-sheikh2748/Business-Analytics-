import sys
from unittest.mock import MagicMock

# Mock fastapi to run without installing fastapi web server locally
sys.modules['fastapi'] = MagicMock()
sys.modules['fastapi.middleware.cors'] = MagicMock()
sys.modules['pydantic'] = MagicMock()

import numpy as np
import pandas as pd
from main import run_arima, run_random_forest, run_linear_regression, calculate_metrics

def main():
    print("=========================================================")
    print("Running ML validation on mock data (FastAPI mocked)...")
    np.random.seed(42)
    dates = pd.date_range(start="2026-04-01", periods=60, freq="D")
    
    trend = np.linspace(10, 35, 60)
    seasonal = 8 * np.sin(2 * np.pi * dates.dayofweek / 7)
    noise = np.random.normal(0, 3, 60)
    sales_qty = np.clip(np.round(trend + seasonal + noise), 1, None).astype(int)
    
    series = pd.Series(sales_qty, index=dates)
    horizon = 30
    
    print(f"Data length: {len(series)} days")
    print(f"Daily sales summary: Min={series.min()}, Max={series.max()}, Mean={series.mean():.2f}")
    print("=========================================================\n")

    # 1. Test ARIMA Model Pipeline
    print("--- 1. Testing ARIMA Model Pipeline ---")
    forecast_arima, mape_arima, rmse_arima, acc_arima = run_arima(series, horizon)
    print(f"ARIMA Forecast (Next 5 Days): {forecast_arima[:5]}")
    print(f"ARIMA Fit Metrics:")
    print(f"  RMSE: {rmse_arima:.4f}")
    print(f"  MAPE: {mape_arima:.2f}%")
    print(f"  Forecast Accuracy: {acc_arima:.2f}%")
    print("ARIMA Validation SUCCESS\n")

    # 2. Test Random Forest Model Pipeline
    print("--- 2. Testing Random Forest Model Pipeline ---")
    forecast_rf, mape_rf, rmse_rf, acc_rf = run_random_forest(series, horizon)
    print(f"Random Forest Forecast (Next 5 Days): {forecast_rf[:5]}")
    print(f"Random Forest Fit Metrics:")
    print(f"  RMSE: {rmse_rf:.4f}")
    print(f"  MAPE: {mape_rf:.2f}%")
    print(f"  Forecast Accuracy: {acc_rf:.2f}%")
    print("Random Forest Validation SUCCESS\n")

    # 3. Test Linear Regression Model Pipeline
    print("--- 3. Testing Linear Regression Model Pipeline ---")
    forecast_lr, mape_lr, rmse_lr, acc_lr = run_linear_regression(series, horizon)
    print(f"Linear Regression Forecast (Next 5 Days): {forecast_lr[:5]}")
    print(f"Linear Regression Fit Metrics:")
    print(f"  RMSE: {rmse_lr:.4f}")
    print(f"  MAPE: {mape_lr:.2f}%")
    print(f"  Forecast Accuracy: {acc_lr:.2f}%")
    print("Linear Regression Validation SUCCESS\n")
    
    print("=========================================================")
    print("ALL ML PIPELINES SUCCESSFULLY VALIDATED!")
    print("=========================================================")

if __name__ == "__main__":
    main()
