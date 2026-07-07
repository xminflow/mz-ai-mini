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
    wechat_pay_web_appid: str | None = Field(default=None)
    wechat_pay_web_notify_url: str | None = Field(default=None)
    account_membership_annual_fen: int = Field(default=49900, ge=1)  # 已废弃，保留以兼容旧 .env
    account_membership_normal_fen: int = Field(default=19900, ge=1)
    account_membership_premium_fen: int = Field(default=49900, ge=1)
    camp_membership_basic_fen: int = Field(default=199900, ge=1)
    camp_membership_premium_fen: int = Field(default=399900, ge=1)
    account_membership_sweep_enabled: bool = Field(default=True)
    account_membership_sweep_interval_seconds: int = Field(default=60, ge=10, le=3600)
    account_membership_sweep_retry_after_seconds: int = Field(default=60, ge=10, le=3600)
    account_membership_sweep_lookback_hours: int = Field(default=24, ge=1, le=72)
    account_membership_sweep_batch_size: int = Field(default=50, ge=1, le=500)
    membership_normal_price_fen: int = Field(default=49900, ge=1)
    wechat_pay_cert_dir: str | None = Field(default=None)
    wechat_pay_public_key: str | None = Field(default=None)
    wechat_pay_public_key_path: str | None = Field(default=None)
    wechat_pay_public_key_id: str | None = Field(default=None)
    agent_auth_token_pepper: str | None = Field(default=None)
    agent_auth_access_token_ttl_seconds: int = Field(default=1800, ge=60)
    agent_auth_refresh_token_ttl_days: int = Field(default=7, ge=1, le=365)
    agent_auth_wechat_login_session_ttl_seconds: int = Field(default=300, ge=60, le=1800)
    camp_auth_token_pepper: str | None = Field(default=None)
    camp_auth_access_token_ttl_seconds: int = Field(default=1800, ge=60)
    camp_auth_refresh_token_ttl_days: int = Field(default=7, ge=1, le=365)
    camp_auth_wechat_login_session_ttl_seconds: int = Field(default=300, ge=60, le=1800)
    agent_auth_email_smtp_host: str | None = Field(default=None)
    agent_auth_email_smtp_port: int = Field(default=465, ge=1, le=65535)
    agent_auth_email_smtp_username: str | None = Field(default=None)
    agent_auth_email_smtp_password: str | None = Field(default=None)
    agent_auth_email_smtp_use_ssl: bool = Field(default=True)
    agent_auth_email_from_address: str | None = Field(default=None)
    agent_auth_email_from_name: str | None = Field(default=None)
    agent_auth_email_code_ttl_seconds: int = Field(default=600, ge=60, le=1800)
    agent_auth_email_send_cooldown_seconds: int = Field(default=60, ge=1, le=600)
    wechat_official_appid: str | None = Field(default=None)
    wechat_official_app_secret: str | None = Field(default=None)
    wechat_official_token: str | None = Field(default=None)
    wechat_official_encoding_aes_key: str | None = Field(default=None)
    wechat_official_qr_expire_seconds: int = Field(default=300, ge=60, le=1800)
    # 公众号关注自动回复：开发模式下后台自动回复失效，改为 subscribe 事件返回单图文被动回复
    # （标题=邀请文案、封面=二维码图）。客服接口不可用于关注回复——关注不打开其 48h 窗口。
    wechat_official_auto_reply_enabled: bool = Field(default=False)
    wechat_official_auto_reply_subscribe_news_title: str | None = Field(default=None)
    wechat_official_auto_reply_subscribe_news_description: str | None = Field(default=None)
    wechat_official_auto_reply_subscribe_news_pic_url: str | None = Field(default=None)
    wechat_official_auto_reply_subscribe_news_url: str | None = Field(default=None)
    blogger_insight_import_token: str | None = Field(default=None)
    track_analysis_import_token: str | None = Field(default=None)
    # 管理端：配置写死的单管理员账号 + 无状态 HMAC 令牌；缺省为空表示未启用管理端。
    admin_username: str | None = Field(default=None)
    admin_password: str | None = Field(default=None)
    admin_token_secret: str | None = Field(default=None)
    admin_token_ttl_minutes: int = Field(default=720, ge=5, le=10080)
    # 逗号分隔的允许跨域来源；为空表示不放开任何跨域。
    admin_cors_origins: str = Field(default="")

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
