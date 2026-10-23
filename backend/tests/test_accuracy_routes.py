import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app

MOCK_ACTUALS = [
    {"startTime": "2026-01-15T00:00:00Z", "generation": 4100.0},
    {"startTime": "2026-01-15T00:30:00Z", "generation": 4250.0},
]
MOCK_FORECASTS = [
    {"startTime": "2026-01-15T00:00:00Z", "publishTime": "2026-01-14T08:30:00Z", "generation": 4200.0},
    {"startTime": "2026-01-15T00:30:00Z", "publishTime": "2026-01-14T08:30:00Z", "generation": 4300.0},
]


@pytest.mark.asyncio
async def test_actuals_endpoint_returns_list():
    with patch("app.routers.actuals.fetch_wind_actuals", new_callable=AsyncMock, return_value=MOCK_ACTUALS):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            resp = await ac.get("/api/actuals?date=2026-01-15")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert body[0]["startTime"] == "2026-01-15T00:00:00Z"


@pytest.mark.asyncio
async def test_forecasts_decision_endpoint():
    with patch("app.routers.forecasts.fetch_wind_forecasts", new_callable=AsyncMock, return_value=MOCK_FORECASTS):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            resp = await ac.get("/api/forecasts?date=2026-01-15")
    assert resp.status_code == 200
    body = resp.json()
    assert "decision" in body
    assert len(body["decision"]) == 2
    assert body["decision"][0]["publishTime"] == "2026-01-14T08:30:00Z"


@pytest.mark.asyncio
async def test_accuracy_endpoint():
    with (
        patch("app.routers.accuracy.fetch_wind_actuals", new_callable=AsyncMock, return_value=MOCK_ACTUALS),
        patch("app.routers.accuracy.fetch_wind_forecasts", new_callable=AsyncMock, return_value=MOCK_FORECASTS),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            resp = await ac.get("/api/accuracy")
    assert resp.status_code == 200
    body = resp.json()
    assert isinstance(body, list)
    assert len(body) == 31  # 31 days in January
    jan15 = next(item for item in body if item["date"] == "2026-01-15")
    assert jan15["n"] == 2
    assert jan15["mae"] is not None


@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
