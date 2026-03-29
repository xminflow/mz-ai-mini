from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.membership.application import (
    GetMembershipOrderQuery,
    GetMembershipOrderUseCase,
    MiniProgramIdentity,
)
from mz_ai_backend.modules.membership.domain import (
    MembershipOrder,
    MembershipOrderNotFoundException,
    MembershipOrderStatus,
    MembershipTier,
)


class InMemoryMembershipRepository:
    def __init__(self, *, order: MembershipOrder | None) -> None:
        self._order = order

    async def get_order_by_order_no_and_openid(self, *, order_no: str, openid: str):
        if (
            self._order is not None
            and self._order.order_no == order_no
            and self._order.openid == openid
        ):
            return self._order
        return None

    async def get_user_membership_by_openid(self, *, openid: str, now: datetime):
        raise NotImplementedError

    async def create_pending_order(self, registration):
        raise NotImplementedError

    async def update_order_prepay_id(self, *, order_no: str, prepay_id: str):
        raise NotImplementedError

    async def process_wechat_pay_notification(
        self,
        *,
        notification,
        now: datetime,
        membership_duration_days: int,
        expected_tier: MembershipTier,
    ):
        raise NotImplementedError


@pytest.mark.asyncio
async def test_get_membership_order_returns_existing_order() -> None:
    now = datetime.now(UTC)
    repository = InMemoryMembershipRepository(
        order=MembershipOrder(
            order_id=20001,
            order_no="20001",
            user_id=10001,
            openid="openid-10001",
            tier=MembershipTier.NORMAL,
            amount_fen=10,
            status=MembershipOrderStatus.PENDING,
            prepay_id="prepay-id",
            transaction_id=None,
            trade_state=None,
            paid_at=None,
            membership_applied=False,
            membership_started_at=None,
            membership_expires_at=None,
            notify_payload=None,
            created_at=now,
            updated_at=now,
        )
    )
    use_case = GetMembershipOrderUseCase(membership_repository=repository)

    result = await use_case.execute(
        GetMembershipOrderQuery(
            order_no="20001",
            identity=MiniProgramIdentity(
                openid="openid-10001",
                app_id="wx-app-id",
                union_id=None,
            ),
        )
    )

    assert result.order_no == "20001"
    assert result.status == MembershipOrderStatus.PENDING
    assert result.membership_applied is False


@pytest.mark.asyncio
async def test_get_membership_order_rejects_missing_order() -> None:
    repository = InMemoryMembershipRepository(order=None)
    use_case = GetMembershipOrderUseCase(membership_repository=repository)

    with pytest.raises(MembershipOrderNotFoundException):
        await use_case.execute(
            GetMembershipOrderQuery(
                order_no="not-found",
                identity=MiniProgramIdentity(
                    openid="openid-10001",
                    app_id="wx-app-id",
                    union_id=None,
                ),
            )
        )
