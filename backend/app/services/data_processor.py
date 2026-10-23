import math
from datetime import date, datetime, timezone, timedelta

GATE_CLOSURE_HOUR = 9
GATE_CLOSURE_MINUTE = 50


def _parse_dt(s: str) -> datetime:
    """Parse ISO-8601 string to UTC-aware datetime."""
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def get_decision_forecast(forecasts: list[dict], delivery_date: date) -> list[dict]:
    """
    Return the forecast series for delivery_date whose publishTime is
    the latest strictly before {delivery_date - 1 day}T09:50:00Z.
    This aligns with the N2EX day-ahead auction gate closure at 09:50 GMT.
    """
    gate_dt = datetime(
        delivery_date.year,
        delivery_date.month,
        delivery_date.day,
        GATE_CLOSURE_HOUR,
        GATE_CLOSURE_MINUTE,
        0,
        tzinfo=timezone.utc,
    ) - timedelta(days=1)

    delivery_str = delivery_date.isoformat()  # e.g., "2026-01-15"

    # Filter forecasts: must target delivery_date AND be published before gate
    eligible = [
        f for f in forecasts
        if f["startTime"].startswith(delivery_str)
        and _parse_dt(f["publishTime"]) < gate_dt
    ]
    if not eligible:
        return []

    # Find the latest publishTime among eligible
    latest_publish = max(_parse_dt(f["publishTime"]) for f in eligible)
    return [
        f for f in eligible
        if _parse_dt(f["publishTime"]) == latest_publish
    ]


def compute_accuracy_metrics(
    actuals: list[dict], forecast: list[dict]
) -> dict:
    """
    Compute MAE, RMSE, and Bias (forecast - actual) for aligned pairs.
    Bias > 0  → over-forecast (procured too much)
    Bias < 0  → under-forecast (short position)
    Returns {"mae": float, "rmse": float, "bias": float, "n": int}.
    """
    actual_map = {r["startTime"]: r["generation"] for r in actuals}
    errors = []
    for f in forecast:
        key = f["startTime"]
        if key in actual_map:
            err = f["generation"] - actual_map[key]
            errors.append(err)

    if not errors:
        return {"mae": None, "rmse": None, "bias": None, "n": 0}

    n = len(errors)
    mae = sum(abs(e) for e in errors) / n
    rmse = math.sqrt(sum(e ** 2 for e in errors) / n)
    bias = sum(errors) / n
    return {"mae": round(mae, 2), "rmse": round(rmse, 2), "bias": round(bias, 2), "n": n}


def compute_daily_accuracy(
    actuals: list[dict],
    forecasts: list[dict],
    days: list[date],
) -> list[dict]:
    """
    For each day in days, compute accuracy metrics using the decision forecast.
    Returns a list of dicts: [{date, mae, rmse, bias, n}, ...].
    """
    results = []
    for d in days:
        day_str = d.isoformat()
        day_actuals = [a for a in actuals if a["startTime"].startswith(day_str)]
        decision_fc = get_decision_forecast(forecasts, d)
        metrics = compute_accuracy_metrics(day_actuals, decision_fc)
        results.append({"date": day_str, **metrics})
    return results
