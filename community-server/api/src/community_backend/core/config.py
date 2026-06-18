from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# .env 位于工程根（community-server/）。本文件路径为
# community-server/api/src/community_backend/core/config.py，向上 4 层即工程根。
SERVER_ENV_FILE = Path(__file__).resolve().parents[4] / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="COMMUNITY_BACKEND_",
        env_file=SERVER_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = Field(default="community-backend")
    app_version: str = Field(default="0.1.0")
    env: Literal["development", "test", "production"] = Field(default="development")
    debug: bool = Field(default=False)
    api_prefix: str = Field(default="/api/v1")
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO"
    )
    database_url: str | None = Field(default=None)
    development_database_url: str | None = Field(default=None)
    production_database_url: str | None = Field(default=None)

    @model_validator(mode="after")
    def apply_development_defaults(self) -> "Settings":
        """Resolve the active database URL after environment loading."""

        if self.database_url is None:
            if self.env == "development":
                self.database_url = self.development_database_url
            elif self.env == "production":
                self.database_url = self.production_database_url
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached application settings."""

    return Settings()
