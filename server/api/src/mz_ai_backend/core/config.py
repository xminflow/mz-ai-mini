from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

SERVER_ENV_FILE = Path(__file__).resolve().parents[4] / ".env"


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="MZ_AI_BACKEND_",
        env_file=SERVER_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = Field(default="mz-ai-backend")
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
    snowflake_worker_id: int = Field(default=0, ge=0, le=31)
    snowflake_datacenter_id: int = Field(default=0, ge=0, le=31)
    wechat_pay_mchid: str | None = Field(default=None)
    wechat_pay_private_key: str | None = Field(default=None)
    wechat_pay_private_key_path: str | None = Field(default=None)
    wechat_pay_cert_serial_no: str | None = Field(default=None)
    wechat_pay_apiv3_key: str | None = Field(default=None)
    wechat_pay_appid: str | None = Field(default=None)
    wechat_pay_notify_url: str | None = Field(default=None)
    wechat_pay_cert_dir: str | None = Field(default=None)
    wechat_pay_public_key: str | None = Field(default=None)
    wechat_pay_public_key_path: str | None = Field(default=None)
    wechat_pay_public_key_id: str | None = Field(default=None)

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
