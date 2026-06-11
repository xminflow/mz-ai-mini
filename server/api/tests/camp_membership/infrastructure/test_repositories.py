from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timedelta

import pytest
import pytest_asyncio
from sqlalchemy import delete, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from mz_ai_backend.core.config import get_settings
from mz_ai_backend.modules.camp_auth.infrastructure.models import CampAccountModel
from mz_ai_backend.modules.camp_membership.application.dtos import CampMembershipOrderRegistration
from mz_ai_backend.modules.camp_membership.domain import (
    SKU_TIER_MAP,
    CampMembershipSku,
    CampMembershipTier,
    CampOrderStatus,
)
from mz_ai_backend.modules.camp_membership.infrastructure.models import CampMembershipOrderModel
from mz_ai_backend.modules.camp_membership.infrastructure.repositories import (
    SqlAlchemyCampMembershipRepository,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification

pytestmark = pytest.mark.asyncio

ACCOUNT_ID = 920_001_001
ORDER_ID = 920_002_001
ORDER_NO = "CAMPMEMTEST920002001"
TRANSACTION_ID = "420000920002001"


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
            await connection.run_sync(CampMembershipOrderModel.__table__.create, checkfirst=True)
    except (ConnectionRefusedError, OSError, OperationalError) as exc:
        await engine.dispose()
        pytest.skip(f"PostgreSQL test database is not available: {exc!s}")

    session_maker = async_sessionmaker(engine, expire_on_commit=False)
    async with session_maker() as session:
        await _cleanup(session)
        await _insert_account(session)
        yield session
        await _cleanup(session)
    await engine.dispose()


async def _insert_account(session: AsyncSession) -> None:
    session.add(
        CampAccountModel(
            account_id=ACCOUNT_ID,
            username="repo-camp-membership-test",
            email="repo-camp-membership-test@example.com",
            status="active",
            enrollment_status="none",
            membership_tier=CampMembershipTier.NONE.value,
            membership_started_at=None,
            membership_expires_at=None,
            is_deleted=False,
        )
    )
    await session.commit()


async def _cleanup(session: AsyncSession) -> None:
    await session.execute(delete(CampMembershipOrderModel).where(CampMembershipOrderModel.account_id == ACCOUNT_ID))
    await session.execute(delete(CampAccountModel).where(CampAccountModel.account_id == ACCOUNT_ID))
    await session.commit()


def _registration() -> CampMembershipOrderRegistration:
    return CampMembershipOrderRegistration(
        order_id=ORDER_ID,
        order_no=ORDER_NO,
        account_id=ACCOUNT_ID,
        sku=CampMembershipSku.ANNUAL_BASIC,
        amount_fen=199_900,
    )


def _success_notification() -> WechatPayNotification:
    return WechatPayNotification(
        order_no=ORDER_NO,
        transaction_id=TRANSACTION_ID,
        trade_state="SUCCESS",
        amount_fen=199_900,
        payer_openid=None,
        success_time=datetime(2026, 6, 12, 10, 0, 0),
        raw_payload='{"trade_state":"SUCCESS"}',
    )


async def test_repository_applies_membership_and_is_idempotent(db_session: AsyncSession) -> None:
    repository = SqlAlchemyCampMembershipRepository(session=db_session)
    now = datetime(2026, 6, 12, 10, 0, 0)

    await repository.create_pending_order(_registration())
    paid_order = await repository.process_wechat_pay_notification(
        notification=_success_notification(), now=now, sku_tier_map=SKU_TIER_MAP
    )
    again = await repository.process_wechat_pay_notification(
        notification=_success_notification(), now=now, sku_tier_map=SKU_TIER_MAP
    )
    snapshot = await repository.get_membership_snapshot(account_id=ACCOUNT_ID, now=now)

    assert paid_order.status == CampOrderStatus.PAID
    assert paid_order.membership_applied is True
    assert paid_order.membership_expires_at == now + timedelta(days=365)
    assert again.membership_expires_at == paid_order.membership_expires_at
    assert snapshot.tier == CampMembershipTier.BASIC
    assert snapshot.is_active is True
