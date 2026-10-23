from __future__ import annotations

import asyncio
import base64
import os
import uuid
from collections.abc import AsyncIterator, Iterator
from datetime import UTC, datetime, timedelta
from pathlib import Path

import psycopg
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from mz_ai_backend import create_app
from mz_ai_backend.core.dependencies import get_async_session_dependency
from mz_ai_backend.modules.agent_auth.application.dtos import AgentAccountRegistration, AgentSessionIssue
from mz_ai_backend.modules.agent_auth.domain import AgentAccountStatus
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import get_token_service, Sha256TokenService
from mz_ai_backend.modules.agent_auth.infrastructure.repositories import SqlAlchemyAgentAccountRepository
from mz_ai_backend.modules.agent_auth.presentation.profile import get_avatar_storage


@pytest.fixture
def profile_database_url() -> Iterator[str]:
    base_url = os.environ.get("MZ_AI_PROFILE_INTEGRATION_DATABASE_URL")
    if not base_url:
        pytest.skip("需显式指定隔离资料测试数据库")
    assert (make_url(base_url).database or "").endswith("_test")
    name = f"weelume_profile_{uuid.uuid4().hex}_test"
    with psycopg.connect(make_url(base_url).set(drivername="postgresql").render_as_string(hide_password=False), autocommit=True) as conn:
        conn.execute(psycopg.sql.SQL("CREATE DATABASE {}").format(psycopg.sql.Identifier(name)))
        try:
            yield make_url(base_url).set(database=name).render_as_string(hide_password=False)
        finally:
            conn.execute(psycopg.sql.SQL("DROP DATABASE {} WITH (FORCE)").format(psycopg.sql.Identifier(name)))


def test_profile_migration_registration_and_real_authenticated_api(profile_database_url: str) -> None:
    url = profile_database_url
    assert (make_url(url).database or "").endswith("_test")
    root = Path(__file__).resolve().parents[4]
    bootstrap = (root / "docker/postgres/init/0002_init_schema.sql").read_text(encoding="utf-8")
    migration = (root / "api/migrations/0031_add_agent_account_profile.sql").read_text(encoding="utf-8")
    sync_url = make_url(url).set(drivername="postgresql").render_as_string(hide_password=False)
    with psycopg.connect(sync_url, autocommit=True) as conn:
        # 只在全新专用空库建立旧表结构，再验证新增迁移不改变旧数据。
        assert conn.execute("SELECT to_regclass('public.agent_accounts')").fetchone() == (None,)
        start = bootstrap.index("CREATE TABLE IF NOT EXISTS agent_accounts (")
        end = bootstrap.index(";", start) + 1
        conn.execute(bootstrap[start:end])
        conn.execute("INSERT INTO agent_accounts(account_id,username,status) VALUES (99,'legacy_name','active')")
        for _ in range(2):
            with conn.transaction():
                conn.execute(migration)
        assert conn.execute("SELECT username,display_name,avatar_url FROM agent_accounts").fetchone() == ("legacy_name", None, None)
        for _ in range(2):
            conn.execute(bootstrap)
        assert conn.execute("SELECT count(*) FROM schema_migrations").fetchone() == (31,)

    engine = create_async_engine(url, poolclass=NullPool)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    tokens = Sha256TokenService(pepper="profile-integration-test-only")

    async def prepare() -> None:
        async with sessions() as session:
            repo = SqlAlchemyAgentAccountRepository(session=session)
            for account_id in (1, 2):
                account = await repo.create_account(AgentAccountRegistration(
                    account_id=account_id, username=f"wxoa_{account_id}", status=AgentAccountStatus.ACTIVE))
                assert account.display_name == "weelume"
            now = datetime.now(UTC).replace(tzinfo=None)
            await repo.create_session(AgentSessionIssue(session_id=10, account_id=1,
                refresh_token_hash=tokens.hash_token("refresh-test"), refresh_token_expires_at=now + timedelta(days=1),
                access_token_id=11, access_token_hash=tokens.hash_token("access-test"), access_token_expires_at=now + timedelta(hours=1)))

    asyncio.run(prepare())

    async def session_dependency() -> AsyncIterator[AsyncSession]:
        async with sessions() as session:
            yield session

    class IsolatedStorage:
        """COS 网络由独立存储适配验证覆盖；此处只隔离外部存储，数据库和鉴权均为真实实现。"""
        async def upload(self, *, account_id: int, content: bytes, content_type: str) -> str:
            assert account_id == 1 and content_type == "image/png"
            return "https://example.com/profile-test.png"

    app = create_app()
    app.dependency_overrides[get_async_session_dependency] = session_dependency
    app.dependency_overrides[get_token_service] = lambda: tokens
    app.dependency_overrides[get_avatar_storage] = lambda: IsolatedStorage()
    headers = {"Authorization": "Bearer access-test"}
    with TestClient(app) as client:
        response = client.patch("/api/v1/agent-auth/me/profile", json={"display_name": "小微"})
        assert response.status_code == 401
        response = client.patch("/api/v1/agent-auth/me/profile", json={"display_name": "weelume"}, headers=headers)
        assert response.status_code == 200
        response = client.patch("/api/v1/agent-auth/me/profile", json={"display_name": "小微"}, headers=headers)
        assert response.status_code == 200
        assert response.json()["data"]["account"]["username"] == "wxoa_1"
        response = client.post("/api/v1/agent-auth/me/avatar", json={"content_type": "image/png",
            "content_base64": base64.b64encode(b"\x89PNG\r\n\x1a\nfixture").decode()}, headers=headers)
        assert response.status_code == 200
        current = client.get("/api/v1/agent-auth/me", headers=headers).json()["data"]
        assert current["display_name"] == "小微" and current["avatar_url"] == "https://example.com/profile-test.png"
        assert client.patch("/api/v1/agent-auth/me/profile", json={"display_name": " "}, headers=headers).status_code == 422
        assert client.post("/api/v1/agent-auth/me/avatar", json={"content_type": "image/png", "content_base64": "aHRtbA=="}, headers=headers).status_code == 422

    with psycopg.connect(sync_url) as conn:
        assert conn.execute("SELECT display_name,avatar_url FROM agent_accounts WHERE account_id=1").fetchone() == ("小微", "https://example.com/profile-test.png")
        assert conn.execute("SELECT display_name,avatar_url FROM agent_accounts WHERE account_id=2").fetchone() == ("weelume", None)
        assert conn.execute("SELECT count(*) FROM agent_accounts").fetchone() == (3,)
    asyncio.run(engine.dispose())
