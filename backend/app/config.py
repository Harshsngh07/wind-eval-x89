from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "UK Wind Day-Ahead Decision Support Portal"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Elexon BMRS API Endpoints
    ELEXON_FUELHH_URL: str = "https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream"
    ELEXON_WINDFOR_URL: str = "https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream"
    
    # Default cut-off time on D-1 for Day-Ahead gate closure (e.g., 11:00 UTC)
    DEFAULT_DAY_AHEAD_GATE_CLOSURE_HOUR: int = 11
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "*"
    ]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()
