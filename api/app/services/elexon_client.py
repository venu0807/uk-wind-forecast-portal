import httpx
from datetime import datetime
from app.config import settings

BASE_URL = settings.elexon_base_url
_client = httpx.AsyncClient(timeout=60.0)


async def fetch_wind_actuals(from_dt: datetime, to_dt: datetime) -> list[dict]:
    """Fetch FUELHH wind actuals from Elexon, returning only WIND fuelType rows."""
    params = {
        "settlementDateFrom": from_dt.strftime("%Y-%m-%d"),
        "settlementDateTo": to_dt.strftime("%Y-%m-%d"),
    }
    resp = await _client.get(f"{BASE_URL}/datasets/FUELHH/stream", params=params)
    resp.raise_for_status()
    data = resp.json()
    # data may be a list or wrapped in {"data": [...]}
    rows = data if isinstance(data, list) else data.get("data", [])
    return [
        {"startTime": r["startTime"], "generation": float(r["generation"])}
        for r in rows
        if r.get("fuelType", "").upper() == "WIND"
    ]


async def fetch_wind_forecasts(from_dt: datetime, to_dt: datetime) -> list[dict]:
    """Fetch WINDFOR forecasts from Elexon for the given publishing window."""
    params = {
        "publishDateTimeFrom": from_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "publishDateTimeTo": to_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }
    resp = await _client.get(f"{BASE_URL}/datasets/WINDFOR/stream", params=params)
    resp.raise_for_status()
    data = resp.json()
    rows = data if isinstance(data, list) else data.get("data", [])
    return [
        {
            "startTime": r["startTime"],
            "publishTime": r["publishTime"],
            "generation": float(r["generation"]),
        }
        for r in rows
    ]
