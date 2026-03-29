from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.membership.application import (
    HandleWechatPayNotifyCommand,
    HandleWechatPayNotifyUseCase,
)
from mz_ai_backend.modules.membership.application.dtos import WechatPayNotification
from mz_ai_backend.modules.membership.domain import (
    MembershipOrder,
    MembershipOrderStatus,
    MembershipTier,
)


class InMemoryMembershipRepository:
    async def get_user_membership_by_openid(self, *, openid: str, now: datetime):
        raise NotImplementedError

    async def create_pending_order(self, registration):
        raise NotImplementedError

    async def update_order_prepay_id(self, *, order_no: str, prepay_id: str):
        raise NotImplementedError

    async def get_order_by_order_no_and_openid(self, *, order_no: str, openid: str):
        raise NotImplementedError

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        membership_duration_days: int,
        expected_tier: MembershipTier,
    ) -> MembershipOrder:
        assert notification.order_no == "30001"
        assert membership_duration_days == 365
        assert expected_tier == MembershipTier.NORMAL
        return MembershipOrder(
            order_id=30001,
            order_no="30001",
            user_id=10001,
            openid="openid-10001",
            tier=MembershipTier.NORMAL,
            amount_fen=10,
            status=MembershipOrderStatus.PAID,
            prepay_id="prepay-id",
            transaction_id="wx-transaction-01",
            trade_state="SUCCESS",
            paid_at=now,
            membership_applied=True,
            membership_started_at=now,
            membership_expires_at=now,
            notify_payload=notification.raw_payload,
            created_at=now,
            updated_at=now,
        )


class StubCurrentTimeProvider:
    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


class StubWechatPayGateway:
    def __init__(self) -> None:
        self.called = False

    async def create_order(self, request):
        raise NotImplementedError

    def parse_notification(self, *, headers: dict[str, str], body: bytes):
        self.called = True
        assert headers["wechatpay-signature"] == "signature"
        assert body == b'{"id":"notification-id"}'
        return WechatPayNotification(
            order_no="30001",
            transaction_id="wx-transaction-01",
            trade_state="SUCCESS",
            amount_fen=10,
            payer_openid="openid-10001",
            success_time=datetime.now(UTC).replace(tzinfo=None),
            raw_payload='{"resource":{"out_trade_no":"30001"}}',
        )


@pytest.mark.asyncio
async def test_handle_wechat_pay_notify_handles_success_callback() -> None:
    gateway = StubWechatPayGateway()
    use_case = HandleWechatPayNotifyUseCase(
        membership_repository=InMemoryMembershipRepository(),
        current_time_provider=StubCurrentTimeProvider(),
        wechat_pay_gateway=gateway,
    )

    result = await use_case.execute(
        HandleWechatPayNotifyCommand(
            headers={"wechatpay-signature": "signature"},
            body=b'{"id":"notification-id"}',
        )
    )

    assert gateway.called is True
    assert result.order_no == "30001"
    assert result.status == MembershipOrderStatus.PAID
