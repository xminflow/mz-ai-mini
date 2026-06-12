from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from sqlalchemy import delete, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from mz_ai_backend.core.config import get_settings
from mz_ai_backend.modules.camp_auth.application.dtos import (
    CampAccountRegistration,
    CampSessionIssue,
    CampWechatIdentityUpsert,
    CampWechatLoginGrantIssue,
    CampWechatLoginSessionCreate,
)
from mz_ai_backend.modules.camp_auth.domain import (
    CampAccountStatus,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)
from mz_ai_backend.modules.camp_auth.infrastructure.models import (
    CampAccountModel,
    CampAuthAccessTokenModel,
    CampAuthSessionModel,
    CampWechatIdentityModel,
    CampWechatLoginSessionModel,
)
from mz_ai_backend.modules.camp_auth.infrastructure.repositories import (
    SqlAlchemyCampAccountRepository,
)

pytestmark = pytest.mark.asyncio

# ---------------------------------------------------------------------------
# 测试专用 ID（930_* 范围，避免与其他测试冲突）
# ---------------------------------------------------------------------------
ACCOUNT_ID = 930_001_001
IDENTITY_ID = 930_002_001
LOGIN_SESSION_ID = 930_003_001
SESSION_ID = 930_004_001
ACCESS_TOKEN_ID = 930_005_001
ACCESS_TOKEN_ID_2 = 930_005_002

SCENE_KEY = f"camp-login-{LOGIN_SESSION_ID}"
OFFICIAL_OPENID = f"test-openid-{ACCOUNT_ID}"

REFRESH_HASH = f"refresh-hash-930-{SESSION_ID}"
REFRESH_HASH_2 = f"refresh-hash-930-{SESSION_ID}-rotated"
ACCESS_HASH = f"access-hash-930-{ACCESS_TOKEN_ID}"
ACCESS_HASH_2 = f"access-hash-930-{ACCESS_TOKEN_ID_2}"


def _naive_utc_now() -> datetime:
    """返回当前 UTC naive datetime（与 repo 内部存储保持一致）。"""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _future(seconds: int = 3600) -> datetime:
    return _naive_utc_now() + timedelta(seconds=seconds)


# ---------------------------------------------------------------------------
# Fixture
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    settings = get_settings()
    engine = create_async_engine(settings.database_url)
    try:
        async with engine.begin() as connection:
            try:
                await connection.execute(text("SELECT 1"))
            except (ConnectionRefusedError, OSError, OperationalError) as exc:
                pytest.skip(f"PostgreSQL test database is not available: {exc!s}")
            # 按外键依赖顺序建表（若已存在则跳过）
            await connection.run_sync(CampAccountModel.__table__.create, checkfirst=True)
            await connection.run_sync(CampWechatIdentityModel.__table__.create, checkfirst=True)
            await connection.run_sync(CampWechatLoginSessionModel.__table__.create, checkfirst=True)
            await connection.run_sync(CampAuthSessionModel.__table__.create, checkfirst=True)
            await connection.run_sync(CampAuthAccessTokenModel.__table__.create, checkfirst=True)
    except (ConnectionRefusedError, OSError, OperationalError) as exc:
        await engine.dispose()
        pytest.skip(f"PostgreSQL test database is not available: {exc!s}")

    session_maker = async_sessionmaker(engine, expire_on_commit=False)
    async with session_maker() as session:
        await _cleanup(session)
        yield session
        await _cleanup(session)

    await engine.dispose()


async def _cleanup(session: AsyncSession) -> None:
    """清理所有属于本次测试的行（按依赖顺序删除子表再删父表）。"""
    # access tokens 先于 sessions
    await session.execute(
        delete(CampAuthAccessTokenModel).where(
            CampAuthAccessTokenModel.session_id == SESSION_ID
        )
    )
    await session.execute(
        delete(CampAuthSessionModel).where(
            CampAuthSessionModel.session_id == SESSION_ID
        )
    )
    await session.execute(
        delete(CampWechatLoginSessionModel).where(
            CampWechatLoginSessionModel.login_session_id == LOGIN_SESSION_ID
        )
    )
    await session.execute(
        delete(CampWechatIdentityModel).where(
            CampWechatIdentityModel.identity_id == IDENTITY_ID
        )
    )
    await session.execute(
        delete(CampAccountModel).where(
            CampAccountModel.account_id == ACCOUNT_ID
        )
    )
    await session.commit()


# ---------------------------------------------------------------------------
# Test 1 — Account + WeChat identity + login-session 全流程
# ---------------------------------------------------------------------------


async def test_account_identity_login_session_flow(db_session: AsyncSession) -> None:
    repo = SqlAlchemyCampAccountRepository(session=db_session)

    # --- 1. 创建账号 ---
    account = await repo.create_account(
        CampAccountRegistration(
            account_id=ACCOUNT_ID,
            username=f"camp-test-{ACCOUNT_ID}",
            email=None,
            status=CampAccountStatus.ACTIVE,
        )
    )
    assert account.account_id == ACCOUNT_ID
    assert account.status == CampAccountStatus.ACTIVE
    assert account.email is None

    fetched_account = await repo.get_account_by_id(ACCOUNT_ID)
    assert fetched_account is not None
    # enrollment_status 由 ORM 默认值提供，持久化后应为 "none"
    assert fetched_account.enrollment_status == "none"
    assert fetched_account.status == CampAccountStatus.ACTIVE

    # --- 2. 创建扫码登录会话 ---
    login_session = await repo.create_wechat_login_session(
        CampWechatLoginSessionCreate(
            login_session_id=LOGIN_SESSION_ID,
            scene_key=SCENE_KEY,
            status=CampWechatLoginSessionStatus.PENDING,
            expires_at=_future(600),
        )
    )
    assert login_session.login_session_id == LOGIN_SESSION_ID
    assert login_session.status == CampWechatLoginSessionStatus.PENDING

    by_scene = await repo.get_wechat_login_session_by_scene_key(SCENE_KEY)
    assert by_scene is not None
    assert by_scene.status == CampWechatLoginSessionStatus.PENDING

    by_id = await repo.get_wechat_login_session_by_id(LOGIN_SESSION_ID)
    assert by_id is not None
    assert by_id.status == CampWechatLoginSessionStatus.PENDING

    # --- 3. 创建微信身份（关注状态） ---
    subscribed_at = _naive_utc_now()
    identity = await repo.create_wechat_identity(
        CampWechatIdentityUpsert(
            identity_id=IDENTITY_ID,
            account_id=ACCOUNT_ID,
            official_openid=OFFICIAL_OPENID,
            subscribe_status=CampWechatSubscribeStatus.SUBSCRIBED,
            subscribed_at=subscribed_at,
            unsubscribed_at=None,
            last_event_at=subscribed_at,
        )
    )
    assert identity.identity_id == IDENTITY_ID
    assert identity.subscribe_status == CampWechatSubscribeStatus.SUBSCRIBED

    fetched_identity = await repo.get_wechat_identity_by_openid(OFFICIAL_OPENID)
    assert fetched_identity is not None
    assert fetched_identity.account_id == ACCOUNT_ID
    assert fetched_identity.subscribe_status == CampWechatSubscribeStatus.SUBSCRIBED

    # --- 4. 标记登录会话已认证 ---
    authenticated_at = _naive_utc_now()
    authed = await repo.mark_wechat_login_session_authenticated(
        login_session_id=LOGIN_SESSION_ID,
        official_openid=OFFICIAL_OPENID,
        account_id=ACCOUNT_ID,
        issue=CampWechatLoginGrantIssue(authenticated_at=authenticated_at),
    )
    assert authed is not None
    assert authed.status == CampWechatLoginSessionStatus.AUTHENTICATED
    assert authed.official_openid == OFFICIAL_OPENID
    assert authed.account_id == ACCOUNT_ID

    # 重新查询验证持久化
    refetched = await repo.get_wechat_login_session_by_id(LOGIN_SESSION_ID)
    assert refetched is not None
    assert refetched.status == CampWechatLoginSessionStatus.AUTHENTICATED
    assert refetched.official_openid == OFFICIAL_OPENID
    assert refetched.account_id == ACCOUNT_ID

    # --- 5. 标记已消费 ---
    consumed = await repo.mark_wechat_login_session_consumed(
        login_session_id=LOGIN_SESSION_ID
    )
    assert consumed is not None
    assert consumed.status == CampWechatLoginSessionStatus.CONSUMED

    final = await repo.get_wechat_login_session_by_id(LOGIN_SESSION_ID)
    assert final is not None
    assert final.status == CampWechatLoginSessionStatus.CONSUMED
    assert final.consumed_at is not None


# ---------------------------------------------------------------------------
# Test 2 — Session token lifecycle（issue / rotate / revoke）
# ---------------------------------------------------------------------------


async def test_session_token_lifecycle(db_session: AsyncSession) -> None:
    repo = SqlAlchemyCampAccountRepository(session=db_session)

    # 先建账号（session 持有 account_id 外键约束若存在）
    await repo.create_account(
        CampAccountRegistration(
            account_id=ACCOUNT_ID,
            username=f"camp-test-{ACCOUNT_ID}",
            email=None,
            status=CampAccountStatus.ACTIVE,
        )
    )

    # --- 1. 颁发 session ---
    await repo.create_session(
        CampSessionIssue(
            session_id=SESSION_ID,
            account_id=ACCOUNT_ID,
            refresh_token_hash=REFRESH_HASH,
            refresh_token_expires_at=_future(86400),
            access_token_id=ACCESS_TOKEN_ID,
            access_token_hash=ACCESS_HASH,
            access_token_expires_at=_future(900),
        )
    )

    # 验证可通过 refresh_hash 和 session_id 查到
    by_hash = await repo.get_session_by_refresh_token_hash(REFRESH_HASH)
    assert by_hash is not None
    assert by_hash.session_id == SESSION_ID
    assert by_hash.account_id == ACCOUNT_ID
    assert by_hash.revoked_at is None

    by_id = await repo.get_session_by_id(SESSION_ID)
    assert by_id is not None
    assert by_id.refresh_token_hash == REFRESH_HASH

    # 验证 access token 可查
    at = await repo.get_access_token_record(ACCESS_HASH)
    assert at is not None
    assert at.token_id == ACCESS_TOKEN_ID
    assert at.session_id == SESSION_ID

    # --- 2. 轮换 tokens ---
    await repo.replace_session_tokens(
        session_id=SESSION_ID,
        refresh_token_hash=REFRESH_HASH_2,
        refresh_token_expires_at=_future(86400),
        access_token_id=ACCESS_TOKEN_ID_2,
        access_token_hash=ACCESS_HASH_2,
        access_token_expires_at=_future(900),
    )

    # 旧 refresh hash 不再能查到
    old = await repo.get_session_by_refresh_token_hash(REFRESH_HASH)
    assert old is None

    # 新 refresh hash 可以查到
    new_session = await repo.get_session_by_refresh_token_hash(REFRESH_HASH_2)
    assert new_session is not None
    assert new_session.session_id == SESSION_ID

    # 旧 access token 已被删除（rotate 时删整个 session 的 access tokens）
    old_at = await repo.get_access_token_record(ACCESS_HASH)
    assert old_at is None

    # 新 access token 存在
    new_at = await repo.get_access_token_record(ACCESS_HASH_2)
    assert new_at is not None
    assert new_at.token_id == ACCESS_TOKEN_ID_2

    # --- 3. 撤销 session ---
    revoked = await repo.revoke_session_by_refresh_token_hash(REFRESH_HASH_2)
    assert revoked is True

    # 重新查询确认 revoked_at 已设置
    revoked_session = await repo.get_session_by_id(SESSION_ID)
    assert revoked_session is not None
    assert revoked_session.revoked_at is not None

    # 对同一 session 再次撤销应返回 False
    revoked_again = await repo.revoke_session_by_refresh_token_hash(REFRESH_HASH_2)
    assert revoked_again is False


# ---------------------------------------------------------------------------
# Test 3 — WeChat identity 取消关注更新
# ---------------------------------------------------------------------------


async def test_wechat_identity_unsubscribe_update(db_session: AsyncSession) -> None:
    repo = SqlAlchemyCampAccountRepository(session=db_session)

    # 先建账号
    await repo.create_account(
        CampAccountRegistration(
            account_id=ACCOUNT_ID,
            username=f"camp-test-{ACCOUNT_ID}",
            email=None,
            status=CampAccountStatus.ACTIVE,
        )
    )

    # 建初始关注身份
    subscribed_at = _naive_utc_now()
    await repo.create_wechat_identity(
        CampWechatIdentityUpsert(
            identity_id=IDENTITY_ID,
            account_id=ACCOUNT_ID,
            official_openid=OFFICIAL_OPENID,
            subscribe_status=CampWechatSubscribeStatus.SUBSCRIBED,
            subscribed_at=subscribed_at,
            unsubscribed_at=None,
            last_event_at=subscribed_at,
        )
    )

    # 更新为取消关注
    unsubscribed_at = _naive_utc_now() + timedelta(minutes=5)
    updated = await repo.update_wechat_identity(
        CampWechatIdentityUpsert(
            identity_id=IDENTITY_ID,
            account_id=ACCOUNT_ID,
            official_openid=OFFICIAL_OPENID,
            subscribe_status=CampWechatSubscribeStatus.UNSUBSCRIBED,
            subscribed_at=subscribed_at,
            unsubscribed_at=unsubscribed_at,
            last_event_at=unsubscribed_at,
        )
    )
    assert updated.subscribe_status == CampWechatSubscribeStatus.UNSUBSCRIBED
    assert updated.unsubscribed_at is not None

    # 重新查询确认持久化
    fetched = await repo.get_wechat_identity_by_openid(OFFICIAL_OPENID)
    assert fetched is not None
    assert fetched.subscribe_status == CampWechatSubscribeStatus.UNSUBSCRIBED
    assert fetched.unsubscribed_at is not None


# ---------------------------------------------------------------------------
# Test 4 — set_membership 强制写会员三列（dev-only）
# ---------------------------------------------------------------------------

SET_MEMBERSHIP_ACCOUNT_ID = 930_006_001


async def _cleanup_set_membership(session: AsyncSession) -> None:
    """清理 set_membership 测试专用账号行。"""
    from sqlalchemy import delete as sa_delete
    await session.execute(
        sa_delete(CampAccountModel).where(
            CampAccountModel.account_id == SET_MEMBERSHIP_ACCOUNT_ID
        )
    )
    await session.commit()


async def test_set_membership_writes_account_columns(db_session: AsyncSession) -> None:
    # 先清理可能遗留的测试数据
    await _cleanup_set_membership(db_session)

    repo = SqlAlchemyCampAccountRepository(session=db_session)

    account = await repo.create_account(
        CampAccountRegistration(
            account_id=SET_MEMBERSHIP_ACCOUNT_ID,
            username=f"dev_set_member_{SET_MEMBERSHIP_ACCOUNT_ID}",
            email=None,
            status=CampAccountStatus.ACTIVE,
        )
    )
    now = _naive_utc_now()
    await repo.set_membership(
        account_id=account.account_id,
        tier="basic",
        started_at=now,
        expires_at=now + timedelta(days=365),
    )

    summary = await repo.get_membership_summary(account_id=account.account_id, now=now)
    assert summary.tier == "basic"
    assert summary.is_active is True

    # 清理
    await _cleanup_set_membership(db_session)
