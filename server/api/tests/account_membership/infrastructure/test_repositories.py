from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timedelta

import pytest
import pytest_asyncio
from sqlalchemy import delete, text
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from mz_ai_backend.core.config import get_settings
from mz_ai_backend.modules.account_membership.application.dtos import (
    MembershipOrderRegistration,
)
from mz_ai_backend.modules.account_membership.domain import (
    MembershipSku,
    MembershipTier,
    OrderStatus,
)
from mz_ai_backend.modules.account_membership.infrastructure.models import (
    AccountMembershipOrderModel,
)
from mz_ai_backend.modules.account_membership.infrastructure.repositories import (
    SqlAlchemyAccountMembershipRepository,
)
from mz_ai_backend.modules.agent_auth.infrastructure.models import AgentAccountModel
from mz_ai_backend.shared.wechat_pay import WechatPayNotification

pytestmark = pytest.mark.asyncio


ACCOUNT_ID = 910_001_001
ORDER_ID = 910_002_001
ORDER_NO = "WEBMEMTEST910002001"
TRANSACTION_ID = "420000910002001"


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
            await connection.run_sync(AgentAccountModel.__table__.create, checkfirst=True)
            await connection.run_sync(AccountMembershipOrderModel.__table__.create, checkfirst=True)
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
        AgentAccountModel(
            account_id=ACCOUNT_ID,
            username="repo-membership-test",
            email="repo-membership-test@example.com",
            password_hash=None,
            password_salt=None,
            password_scheme_version=None,
            status="active",
            membership_tier=MembershipTier.NONE.value,
            membership_started_at=None,
            membership_expires_at=None,
            is_deleted=False,
        )
    )
    await session.commit()


async def _cleanup(session: AsyncSession) -> None:
    await session.execute(
        delete(AccountMembershipOrderModel).where(
            AccountMembershipOrderModel.account_id == ACCOUNT_ID,
        )
    )
    await session.execute(
        delete(AgentAccountModel).where(
            AgentAccountModel.account_id == ACCOUNT_ID,
        )
    )
    await session.commit()


def _registration(*, order_id: int = ORDER_ID, order_no: str = ORDER_NO) -> MembershipOrderRegistration:
    return MembershipOrderRegistration(
        order_id=order_id,
        order_no=order_no,
        account_id=ACCOUNT_ID,
        sku=MembershipSku.ANNUAL_NORMAL,
        amount_fen=49_900,
    )


def _success_notification(*, order_no: str = ORDER_NO, transaction_id: str = TRANSACTION_ID) -> WechatPayNotification:
    return WechatPayNotification(
        order_no=order_no,
        transaction_id=transaction_id,
        trade_state="SUCCESS",
        amount_fen=49_900,
        payer_openid=None,
        success_time=datetime(2026, 5, 18, 10, 0, 0),
        raw_payload='{"trade_state":"SUCCESS"}',
    )


async def test_repository_creates_updates_and_reads_order(db_session: AsyncSession) -> None:
    repository = SqlAlchemyAccountMembershipRepository(session=db_session)

    created = await repository.create_pending_order(_registration())
    updated = await repository.update_order_code_url(
        order_no=created.order_no,
        code_url="weixin://wxpay/bizpayurl?pr=test",
    )
    loaded = await repository.get_order_by_order_no(order_no=created.order_no)
    queried_at = datetime(2026, 5, 18, 10, 1, 0)
    await repository.mark_order_wechat_query_attempted(
        order_no=created.order_no,
        queried_at=queried_at,
    )
    reloaded = await repository.get_order_by_order_no(order_no=created.order_no)

    assert created.status == OrderStatus.PENDING
    assert updated.code_url == "weixin://wxpay/bizpayurl?pr=test"
    assert loaded is not None
    assert loaded.order_id == ORDER_ID
    assert reloaded is not None
    assert reloaded.last_wechat_query_at == queried_at


async def test_repository_enforces_transaction_id_uniqueness(db_session: AsyncSession) -> None:
    repository = SqlAlchemyAccountMembershipRepository(session=db_session)

    await repository.create_pending_order(_registration())
    await repository.create_pending_order(
        _registration(order_id=ORDER_ID + 1, order_no=f"{ORDER_NO}B")
    )
    await repository.process_wechat_pay_notification(
        notification=_success_notification(),
        now=datetime(2026, 5, 18, 10, 0, 0),
        expected_tier=MembershipTier.NORMAL,
    )

    with pytest.raises(IntegrityError):
        await repository.process_wechat_pay_notification(
            notification=_success_notification(
                order_no=f"{ORDER_NO}B",
                transaction_id=TRANSACTION_ID,
            ),
            now=datetime(2026, 5, 18, 10, 0, 0),
            expected_tier=MembershipTier.NORMAL,
        )

    await db_session.rollback()


async def test_repository_applies_membership_update_atomically(db_session: AsyncSession) -> None:
    repository = SqlAlchemyAccountMembershipRepository(session=db_session)
    now = datetime(2026, 5, 18, 10, 0, 0)

    await repository.create_pending_order(_registration())
    paid_order = await repository.process_wechat_pay_notification(
        notification=_success_notification(),
        now=now,
        expected_tier=MembershipTier.NORMAL,
    )
    snapshot = await repository.get_membership_snapshot(account_id=ACCOUNT_ID, now=now)

    assert paid_order.status == OrderStatus.PAID
    assert paid_order.membership_applied is True
    assert paid_order.membership_started_at == now
    assert paid_order.membership_expires_at == now + timedelta(days=365)
    assert snapshot.tier == MembershipTier.NORMAL
    assert snapshot.is_active is True
    assert snapshot.expires_at == paid_order.membership_expires_at
