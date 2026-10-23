import pytest
import httpx
import respx
from datetime import datetime, timezone
from app.services.elexon_client import fetch_wind_actuals, fetch_wind_forecasts

MOCK_ACTUALS = [
    {"startTime": "2026-01-01T00:00:00Z", "fuelType": "WIND", "generation": 4500.0},
    {"startTime": "2026-01-01T00:30:00Z", "fuelType": "WIND", "generation": 4600.0},
    {"startTime": "2026-01-01T00:00:00Z", "fuelType": "CCGT", "generation": 3000.0},  # noise
]

MOCK_FORECASTS = [
    {"startTime": "2026-01-01T00:00:00Z", "publishTime": "2025-12-31T08:30:00Z", "generation": 4400.0},
    {"startTime": "2026-01-01T00:30:00Z", "publishTime": "2025-12-31T08:30:00Z", "generation": 4550.0},
]


@pytest.mark.asyncio
@respx.mock
async def test_fetch_wind_actuals_filters_wind_only():
    respx.get("https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream").mock(
        return_value=httpx.Response(200, json=MOCK_ACTUALS)
    )
    from_dt = datetime(2026, 1, 1, tzinfo=timezone.utc)
    to_dt = datetime(2026, 1, 1, 1, 0, tzinfo=timezone.utc)
    result = await fetch_wind_actuals(from_dt, to_dt)
    assert len(result) == 2  # CCGT filtered out
    assert all(r["generation"] >= 0 for r in result)
    assert "startTime" in result[0]
    assert "generation" in result[0]


@pytest.mark.asyncio
@respx.mock
async def test_fetch_wind_forecasts_returns_all_publish_times():
    respx.get("https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream").mock(
        return_value=httpx.Response(200, json=MOCK_FORECASTS)
    )
    from_dt = datetime(2025, 12, 31, tzinfo=timezone.utc)
    to_dt = datetime(2026, 1, 1, tzinfo=timezone.utc)
    result = await fetch_wind_forecasts(from_dt, to_dt)
    assert len(result) == 2
    assert "publishTime" in result[0]
