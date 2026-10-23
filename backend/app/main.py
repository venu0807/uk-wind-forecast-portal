from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import actuals, forecasts, accuracy

app = FastAPI(
    title="Wind Forecast Portal API",
    description="UK wind generation forecast and accuracy analytics — Elexon BMRS data",
    version="1.0.0",
)

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(actuals.router)
app.include_router(forecasts.router)
app.include_router(accuracy.router)


@app.get("/health")
def health():
    return {"status": "ok"}
