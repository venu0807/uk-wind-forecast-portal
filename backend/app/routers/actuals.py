from fastapi import APIRouter, Query, HTTPException
from datetime import date as dt_date, datetime, timezone, timedelta
from app.services.elexon_client import fetch_wind_actuals
from app.services.cache import ttl_cache
from app.schemas import ActualPoint

router = APIRouter(prefix="/api/actuals", tags=["actuals"])


@ttl_cache(ttl_seconds=300)
async def _cached_actuals(date_str: str) -> list[dict]:
    d = dt_date.fromisoformat(date_str)
    from_dt = datetime(d.year, d.month, d.day, tzinfo=timezone.utc)
    to_dt = from_dt + timedelta(days=1)
    return await fetch_wind_actuals(from_dt, to_dt)


@router.get("", response_model=list[ActualPoint])
async def get_actuals(date: str = Query(..., examples=["2026-01-15"])):
    try:
        dt_date.fromisoformat(date)  # validate format
    except ValueError:
        raise HTTPException(400, "date must be YYYY-MM-DD")
    return await _cached_actuals(date)
