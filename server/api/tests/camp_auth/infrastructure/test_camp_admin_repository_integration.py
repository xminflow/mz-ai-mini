from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timedelta, timezone

import pytest
import pytest_asyncio
from sqlalchemy import delete, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from mz_ai_backend.core.config import get_settings
from mz_ai_backend.modules.camp_auth.application.admin_dtos import CampAccountAdminFilter
from mz_ai_backend.modules.camp_auth.application.dtos import CampAccountRegistration
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus
from mz_ai_backend.modules.camp_auth.infrastructure.models import CampAccountModel
from mz_ai_backend.modules.camp_auth.infrastructure.repositories import (
    SqlAlchemyCampAccountRepository,
)

pytestmark = pytest.mark.asyncio

# ---------------------------------------------------------------------------
# 测试专用 ID（931_001_00X 范围，避免与其他测试冲突）
# ---------------------------------------------------------------------------
ACCOUNT_ID_ACTIVE_1 = 931_001_001
ACCOUNT_ID_ACTIVE_2 = 931_001_002
ACCOUNT_ID_DISABLED = 931_001_003

ACCOUNT_IDS = [ACCOUNT_ID_ACTIVE_1, ACCOUNT_ID_ACTIVE_2, ACCOUNT_ID_DISABLED]


def _naive_utc_now() -> datetime:
    """返回当前 UTC naive datetime（与 repo 内部存储保持一致）。"""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _future(days: int = 30) -> datetime:
    return _naive_utc_now() + timedelta(days=days)


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
            await connection.run_sync(CampAccountModel.__table__.create, checkfirst=True)
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
    """清理本测试文件插入的账号行（按 931_001_00X id 范围删除）。"""
    await session.execute(
        delete(CampAccountModel).where(CampAccountModel.account_id.in_(ACCOUNT_IDS))
    )
    await session.commit()


async def _seed_accounts(repo: SqlAlchemyCampAccountRepository) -> None:
    """插入 3 个账号：两个 active（其一将被软删除），一个 disabled。"""
    await repo.create_account(
        CampAccountRegistration(
            account_id=ACCOUNT_ID_ACTIVE_1,
            username=f"admin-test-{ACCOUNT_ID_ACTIVE_1}",
            email=f"admin-test-{ACCOUNT_ID_ACTIVE_1}@example.com",
            status=CampAccountStatus.ACTIVE,
        )
    )
    await repo.create_account(
        CampAccountRegistration(
            account_id=ACCOUNT_ID_ACTIVE_2,
            username=f"admin-test-{ACCOUNT_ID_ACTIVE_2}",
            email=f"admin-test-{ACCOUNT_ID_ACTIVE_2}@example.com",
            status=CampAccountStatus.ACTIVE,
        )
    )
    await repo.create_account(
        CampAccountRegistration(
            account_id=ACCOUNT_ID_DISABLED,
            username=f"admin-test-{ACCOUNT_ID_DISABLED}",
            email=f"admin-test-{ACCOUNT_ID_DISABLED}@example.com",
            status=CampAccountStatus.DISABLED,
        )
    )


# ---------------------------------------------------------------------------
# Test 1 — list_admin_accounts 默认排除已删除；status 过滤生效
# ---------------------------------------------------------------------------


async def test_list_admin_accounts_excludes_deleted_and_filters_status(
    db_session: AsyncSession,
) -> None:
    repo = SqlAlchemyCampAccountRepository(session=db_session)
    await _seed_accounts(repo)

    # 软删除其中一个 active 账号
    deleted = await repo.soft_delete_account(account_id=ACCOUNT_ID_ACTIVE_2)
    assert deleted is True

    # 默认不含已删除
    default_filter = CampAccountAdminFilter()
    items = await repo.list_admin_accounts(filter_=default_filter, offset=0, limit=100)
    ids = {item.account_id for item in items if item.account_id in ACCOUNT_IDS}
    assert ACCOUNT_ID_ACTIVE_1 in ids
    assert ACCOUNT_ID_DISABLED in ids
    assert ACCOUNT_ID_ACTIVE_2 not in ids

    # status 过滤生效：仅 disabled
    disabled_filter = CampAccountAdminFilter(status=CampAccountStatus.DISABLED)
    disabled_items = await repo.list_admin_accounts(filter_=disabled_filter, offset=0, limit=100)
    disabled_ids = {item.account_id for item in disabled_items if item.account_id in ACCOUNT_IDS}
    assert disabled_ids == {ACCOUNT_ID_DISABLED}

    # include_deleted=True 时可看到已删除账号
    include_deleted_filter = CampAccountAdminFilter(include_deleted=True)
    all_items = await repo.list_admin_accounts(
        filter_=include_deleted_filter, offset=0, limit=100
    )
    all_ids = {item.account_id for item in all_items if item.account_id in ACCOUNT_IDS}
    assert all_ids == set(ACCOUNT_IDS)


# ---------------------------------------------------------------------------
# Test 2 — keyword 匹配用户名/邮箱；count_admin_accounts 与 list 过滤一致
# ---------------------------------------------------------------------------


async def test_keyword_matches_username_and_email_and_count_consistent(
    db_session: AsyncSession,
) -> None:
    repo = SqlAlchemyCampAccountRepository(session=db_session)
    await _seed_accounts(repo)

    # keyword 命中用户名
    username_filter = CampAccountAdminFilter(keyword=f"admin-test-{ACCOUNT_ID_ACTIVE_1}")
    by_username = await repo.list_admin_accounts(filter_=username_filter, offset=0, limit=100)
    assert {item.account_id for item in by_username} == {ACCOUNT_ID_ACTIVE_1}

    # keyword 命中邮箱
    email_filter = CampAccountAdminFilter(keyword=f"admin-test-{ACCOUNT_ID_DISABLED}@example.com")
    by_email = await repo.list_admin_accounts(filter_=email_filter, offset=0, limit=100)
    assert {item.account_id for item in by_email} == {ACCOUNT_ID_DISABLED}

    # count_admin_accounts 与 list 过滤一致（用共同前缀命中全部 3 个种子账号）
    # 注意：ilike 中下划线 "_" 是通配符，故用不含下划线的前缀 "admin-test-931"
    common_filter = CampAccountAdminFilter(keyword="admin-test-931")
    listed = await repo.list_admin_accounts(filter_=common_filter, offset=0, limit=100)
    counted = await repo.count_admin_accounts(filter_=common_filter)
    assert counted == len(listed) == len(ACCOUNT_IDS)


# ---------------------------------------------------------------------------
# Test 3 — get_admin_account_by_id / update_account_status / update_account_membership
# ---------------------------------------------------------------------------


async def test_get_update_status_and_membership(db_session: AsyncSession) -> None:
    repo = SqlAlchemyCampAccountRepository(session=db_session)
    await _seed_accounts(repo)

    fetched = await repo.get_admin_account_by_id(ACCOUNT_ID_ACTIVE_1)
    assert fetched is not None
    assert fetched.account_id == ACCOUNT_ID_ACTIVE_1
    assert fetched.status == CampAccountStatus.ACTIVE
    assert fetched.membership_tier == "none"
    assert fetched.is_deleted is False

    # update_account_status 改 disabled 后再读为 disabled
    updated_status = await repo.update_account_status(
        account_id=ACCOUNT_ID_ACTIVE_1, status=CampAccountStatus.DISABLED
    )
    assert updated_status is not None
    assert updated_status.status == CampAccountStatus.DISABLED

    reread_status = await repo.get_admin_account_by_id(ACCOUNT_ID_ACTIVE_1)
    assert reread_status is not None
    assert reread_status.status == CampAccountStatus.DISABLED

    # update_account_membership(tier="premium", started_at, expires_at) 后 view 反映新值
    started_at = _naive_utc_now()
    expires_at = _future(365)
    updated_membership = await repo.update_account_membership(
        account_id=ACCOUNT_ID_ACTIVE_1,
        tier="premium",
        started_at=started_at,
        expires_at=expires_at,
    )
    assert updated_membership is not None
    assert updated_membership.membership_tier == "premium"
    assert updated_membership.membership_started_at is not None
    assert updated_membership.membership_expires_at is not None

    reread_membership = await repo.get_admin_account_by_id(ACCOUNT_ID_ACTIVE_1)
    assert reread_membership is not None
    assert reread_membership.membership_tier == "premium"


# ---------------------------------------------------------------------------
# Test 4 — soft_delete_account 后 list 默认不返回，get 仍可读到 is_deleted=True
# ---------------------------------------------------------------------------


async def test_soft_delete_excluded_from_list_but_gettable(db_session: AsyncSession) -> None:
    repo = SqlAlchemyCampAccountRepository(session=db_session)
    await _seed_accounts(repo)

    deleted = await repo.soft_delete_account(account_id=ACCOUNT_ID_ACTIVE_1)
    assert deleted is True

    # 再次软删除应返回 False（已不是 active 状态记录）
    deleted_again = await repo.soft_delete_account(account_id=ACCOUNT_ID_ACTIVE_1)
    assert deleted_again is False

    default_items = await repo.list_admin_accounts(
        filter_=CampAccountAdminFilter(), offset=0, limit=100
    )
    default_ids = {item.account_id for item in default_items if item.account_id in ACCOUNT_IDS}
    assert ACCOUNT_ID_ACTIVE_1 not in default_ids

    fetched = await repo.get_admin_account_by_id(ACCOUNT_ID_ACTIVE_1)
    assert fetched is not None
    assert fetched.is_deleted is True
