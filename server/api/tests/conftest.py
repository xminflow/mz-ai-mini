from __future__ import annotations

import sys
import os
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import make_url


PROJECT_ROOT = Path(__file__).resolve().parents[2]
API_SRC = PROJECT_ROOT / "api" / "src"

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

if str(API_SRC) not in sys.path:
    sys.path.insert(0, str(API_SRC))

from mz_ai_backend import create_app
from mz_ai_backend.core.config import get_settings
from mz_ai_backend.core.database import clear_database_caches


@pytest.fixture(autouse=True)
def configure_test_environment(monkeypatch: pytest.MonkeyPatch) -> None:
    # 允许发布验收连接隔离 PostgreSQL 实例，拒绝误指向业务数据库。
    test_database_url = os.environ.get(
        "MZ_AI_BACKEND_TEST_DATABASE_URL",
        "postgresql+asyncpg://test:test@127.0.0.1:5432/mz_ai_backend_test",
    )
    if not (make_url(test_database_url).database or "").endswith("_test"):
        raise pytest.UsageError("集成测试数据库名称必须以 _test 结尾")
    monkeypatch.setenv("MZ_AI_BACKEND_ENV", "test")
    monkeypatch.setenv(
        "MZ_AI_BACKEND_DATABASE_URL",
        test_database_url,
    )
    get_settings.cache_clear()
    clear_database_caches()
    yield
    get_settings.cache_clear()
    clear_database_caches()


@pytest.fixture
def app() -> Any:
    return create_app()


@pytest.fixture
def client(app: Any) -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
