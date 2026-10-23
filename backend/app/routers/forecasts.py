from fastapi import APIRouter, Query, HTTPException
from datetime import date as dt_date, datetime, timezone, timedelta
from app.services.elexon_client import fetch_wind_forecasts
from app.services.data_processor import get_decision_forecast
from app.services.cache import ttl_cache
from app.schemas import ForecastResponse, ForecastPoint

router = APIRouter(prefix="/api/forecasts", tags=["forecasts"])


@ttl_cache(ttl_seconds=300)
async def _cached_forecasts(date_str: str) -> list[dict]:
    """Fetch all WINDFOR records published from the day before up to end of delivery day."""
    d = dt_date.fromisoformat(date_str)
    from_dt = datetime(d.year, d.month, d.day, tzinfo=timezone.utc) - timedelta(days=1)
    to_dt = datetime(d.year, d.month, d.day, tzinfo=timezone.utc) + timedelta(days=1)
    return await fetch_wind_forecasts(from_dt, to_dt)


@router.get("", response_model=ForecastResponse)
async def get_forecasts(date: str = Query(..., examples=["2026-01-15"])):
    try:
        d = dt_date.fromisoformat(date)
    except ValueError:
        raise HTTPException(400, "date must be YYYY-MM-DD")
    all_forecasts = await _cached_forecasts(date)
    decision = get_decision_forecast(all_forecasts, d)
    # Collect distinct publish times for UI awareness
    publish_times = sorted(set(f["publishTime"] for f in all_forecasts))
    return ForecastResponse(
        decision=[ForecastPoint(**f) for f in decision],
        all_publish_times=publish_times,
    )
