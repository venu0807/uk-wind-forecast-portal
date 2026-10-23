import pytest
from datetime import date
from app.services.data_processor import (
    get_decision_forecast,
    compute_accuracy_metrics,
    compute_daily_accuracy,
)

# ── fixtures ──────────────────────────────────────────────────────────────────
DELIVERY_DATE = date(2026, 1, 15)
# Gate closure: 2026-01-14T09:50:00Z
# Forecast runs published on 2026-01-14:
FORECASTS = [
    # published BEFORE gate — eligible
    {"startTime": "2026-01-15T00:00:00Z", "publishTime": "2026-01-14T03:30:00Z", "generation": 4000.0},
    {"startTime": "2026-01-15T00:30:00Z", "publishTime": "2026-01-14T03:30:00Z", "generation": 4100.0},
    {"startTime": "2026-01-15T00:00:00Z", "publishTime": "2026-01-14T08:30:00Z", "generation": 4200.0},
    {"startTime": "2026-01-15T00:30:00Z", "publishTime": "2026-01-14T08:30:00Z", "generation": 4300.0},
    # published AFTER gate — must be excluded
    {"startTime": "2026-01-15T00:00:00Z", "publishTime": "2026-01-14T10:30:00Z", "generation": 9999.0},
]
ACTUALS = [
    {"startTime": "2026-01-15T00:00:00Z", "generation": 4100.0},
    {"startTime": "2026-01-15T00:30:00Z", "generation": 4250.0},
]


# ── tests ─────────────────────────────────────────────────────────────────────
def test_decision_forecast_uses_latest_before_gate():
    result = get_decision_forecast(FORECASTS, DELIVERY_DATE)
    # 08:30 run should win; 10:30 excluded
    assert all(r["publishTime"] == "2026-01-14T08:30:00Z" for r in result)
    assert len(result) == 2


def test_decision_forecast_returns_empty_when_no_eligible():
    # No forecasts published before the gate
    future_only = [
        {"startTime": "2026-01-15T00:00:00Z", "publishTime": "2026-01-14T11:00:00Z", "generation": 1.0}
    ]
    result = get_decision_forecast(future_only, DELIVERY_DATE)
    assert result == []


def test_compute_accuracy_metrics_values():
    # forecast: [4200, 4300], actual: [4100, 4250]
    # errors: [100, 50] → MAE=75, RMSE=sqrt((10000+2500)/2)=79.06..., bias=75
    metrics = compute_accuracy_metrics(ACTUALS, get_decision_forecast(FORECASTS, DELIVERY_DATE))
    assert abs(metrics["mae"] - 75.0) < 0.01
    assert abs(metrics["rmse"] - 79.06) < 0.1
    assert abs(metrics["bias"] - 75.0) < 0.01
    assert metrics["n"] == 2


def test_compute_daily_accuracy_returns_one_row_per_day():
    days = [DELIVERY_DATE]
    result = compute_daily_accuracy(ACTUALS, FORECASTS, days)
    assert len(result) == 1
    assert result[0]["date"] == "2026-01-15"
    assert "mae" in result[0]
