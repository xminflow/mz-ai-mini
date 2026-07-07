from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.core.config import get_settings


def test_admin_cors_allows_configured_origin_without_credentials(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("MZ_AI_BACKEND_ADMIN_CORS_ORIGINS", "http://localhost:5175")
    get_settings.cache_clear()
    try:
        app = create_app()
        with TestClient(app, raise_server_exceptions=False) as client:
            response = client.get(
                "/api/v1/admin/auth/me",
                headers={"Origin": "http://localhost:5175"},
            )
        assert response.headers.get("access-control-allow-origin") == "http://localhost:5175"
        # 管理端用 Bearer 头鉴权（非 cookie），CORS 中间件禁用 allow_credentials
        assert "access-control-allow-credentials" not in response.headers
    finally:
        get_settings.cache_clear()


def test_admin_cors_no_header_when_origins_unset(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("MZ_AI_BACKEND_ADMIN_CORS_ORIGINS", "")
    get_settings.cache_clear()
    try:
        app = create_app()
        with TestClient(app, raise_server_exceptions=False) as client:
            response = client.get(
                "/api/v1/admin/auth/me",
                headers={"Origin": "http://localhost:5175"},
            )
        assert "access-control-allow-origin" not in response.headers
    finally:
        get_settings.cache_clear()
