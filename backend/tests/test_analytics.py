import pytest
import pandas as pd
from app.services.analytics_service import analytics_service


def test_metrics_calculation_standard():
    df = pd.DataFrame({
        "start_time": pd.date_range("2026-01-01 00:00", periods=4, freq="30min"),
        "actual_generation": [100.0, 200.0, 300.0, 400.0],
        "forecast_generation": [110.0, 190.0, 330.0, 380.0]
    })
    metrics = analytics_service.calculate_metrics(df)
    
    # errors = [+10, -10, +30, -20]
    # abs_errors = [10, 10, 30, 20] -> mean = 70 / 4 = 17.5
    # sq_errors = [100, 100, 900, 400] -> mean = 1500 / 4 = 375 -> sqrt(375) ~= 19.36
    # bias = (+10 - 10 + 30 - 20) / 4 = 10 / 4 = 2.5
    assert metrics.mae == 17.5
    assert metrics.bias == 2.5
    assert metrics.total_records == 4
    assert metrics.max_overforecast == 30.0
    assert metrics.max_underforecast == -20.0


def test_metrics_calculation_empty():
    df = pd.DataFrame(columns=["start_time", "actual_generation", "forecast_generation"])
    metrics = analytics_service.calculate_metrics(df)
    assert metrics.mae == 0.0
    assert metrics.rmse == 0.0
    assert metrics.total_records == 0


def test_api_health_and_dates():
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "ok"

    dates_resp = client.get("/api/dates")
    assert dates_resp.status_code == 200
    dates_data = dates_resp.json()
    assert len(dates_data["dates"]) == 31
    assert "2026-01-01" in dates_data["dates"]
    assert "2026-01-31" in dates_data["dates"]
