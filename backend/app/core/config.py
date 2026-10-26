from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str = "change-me"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    cors_origins: List[str] | str = ["http://localhost:3000", "http://127.0.0.1:3000"]
    github_token: str | None = None
    github_repository: str = "jamesozs7890/networkz-kalander"
    github_workflow: str = "event-sync.yml"
    github_ref: str = "main"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
