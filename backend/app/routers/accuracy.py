from fastapi import APIRouter
from datetime import date, datetime, timezone, timedelta
from app.services.elexon_client import fetch_wind_actuals, fetch_wind_forecasts
from app.services.data_processor import compute_daily_accuracy
from app.services.cache import ttl_cache
from app.schemas import DayAccuracy

router = APIRouter(prefix="/api/accuracy", tags=["accuracy"])

JANUARY_DAYS = [date(2026, 1, d) for d in range(1, 32)]


@ttl_cache(ttl_seconds=600)
async def _cached_accuracy() -> list[dict]:
    from_dt = datetime(2025, 12, 31, tzinfo=timezone.utc)
    to_dt = datetime(2026, 1, 31, 23, 59, 59, tzinfo=timezone.utc)
    actuals = await fetch_wind_actuals(
        datetime(2026, 1, 1, tzinfo=timezone.utc), to_dt
    )
    forecasts = await fetch_wind_forecasts(from_dt, to_dt)
    return compute_daily_accuracy(actuals, forecasts, JANUARY_DAYS)


@router.get("", response_model=list[DayAccuracy])
async def get_accuracy():
    return await _cached_accuracy()
