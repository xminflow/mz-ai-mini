from __future__ import annotations

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.error_codes import ErrorCode


def test_admin_settings_have_expected_defaults() -> None:
    settings = Settings(
        _env_file=None,
        admin_username=None,
        admin_password=None,
        admin_token_secret=None,
    )
    assert settings.admin_username is None
    assert settings.admin_password is None
    assert settings.admin_token_secret is None
    assert settings.admin_token_ttl_minutes == 720
    assert settings.admin_cors_origins == ""


def test_admin_error_codes_exist() -> None:
    assert ErrorCode.ADMIN_INVALID_CREDENTIALS.value == "ADMIN.INVALID_CREDENTIALS"
    assert ErrorCode.ADMIN_UNAUTHORIZED.value == "ADMIN.UNAUTHORIZED"
