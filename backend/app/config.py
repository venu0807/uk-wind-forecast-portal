from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env.example", extra="ignore")

    elexon_base_url: str = "https://data.elexon.co.uk/bmrs/api/v1"
    cache_ttl_seconds: int = 300
    cors_origins: str = "http://localhost:5173"

    # January 2026 scope
    data_from: str = "2025-12-31T00:00:00Z"  # day before Jan 1 for day-ahead forecasts
    data_to: str = "2026-01-31T23:59:59Z"


settings = Settings()
