from pydantic import BaseModel
from typing import Optional


class ActualPoint(BaseModel):
    startTime: str
    generation: float


class ForecastPoint(BaseModel):
    startTime: str
    publishTime: str
    generation: float


class ForecastResponse(BaseModel):
    decision: list[ForecastPoint]
    all_publish_times: list[str]


class DayAccuracy(BaseModel):
    date: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    bias: Optional[float] = None
    n: int
