from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.account_membership.application import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderUseCase,
)
from mz_ai_backend.modules.account_membership.application.dtos import MembershipOrderRegistration
from mz_ai_backend.modules.account_membership.domain import AccountMembershipOrder, MembershipSku, OrderStatus
from mz_ai_backend.shared.wechat_pay import WechatPayNativeCreateOrderRequest, WechatPayNativeCreateOrderResult


class Repository:
    def __init__(self) -> None:
        self.order: AccountMembershipOrder | None = None

    async def create_pending_order(self, registration: MembershipOrderRegistration) -> AccountMembershipOrder:
        now = datetime(2026, 5, 18, 10, 0, 0)
        self.order = AccountMembershipOrder(
            order_id=registration.order_id,
            order_no=registration.order_no,
            account_id=registration.account_id,
            sku=registration.sku,
            amount_fen=registration.amount_fen,
            status=OrderStatus.PENDING,
            code_url=None,
            transaction_id=None,
            trade_state=None,
            paid_at=None,
            membership_applied=False,
            membership_started_at=None,
            membership_expires_at=None,
            last_wechat_query_at=None,
            notify_payload=None,
            created_at=now,
            updated_at=now,
        )
        return self.order

    async def update_order_code_url(self, *, order_no: str, code_url: str) -> AccountMembershipOrder:
        assert self.order is not None
        self.order = self.order.model_copy(update={"code_url": code_url})
        return self.order


class Snowflake:
    def generate(self) -> int:
        return 1900000000000000001


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 5, 18, 10, 0, 0)


class Gateway:
    def __init__(self) -> None:
        self.requests: list[WechatPayNativeCreateOrderRequest] = []

    async def create_native_order(
        self,
        request: WechatPayNativeCreateOrderRequest,
    ) -> WechatPayNativeCreateOrderResult:
        self.requests.append(request)
        return WechatPayNativeCreateOrderResult(code_url="weixin://wxpay/native")

    def parse_notification(self, *, headers: dict[str, str], body: bytes):
        raise NotImplementedError

    async def query_order(self, *, order_no: str):
        return None


@pytest.mark.asyncio
async def test_create_membership_order_creates_native_qr_order() -> None:
    gateway = Gateway()
    use_case = CreateMembershipOrderUseCase(
        repository=Repository(),
        snowflake_id_generator=Snowflake(),
        current_time_provider=Clock(),
        wechat_pay_gateway=gateway,
        annual_amount_fen=50000,
    )

    result = await use_case.execute(
        CreateMembershipOrderCommand(account_id=2001, sku=MembershipSku.ANNUAL_NORMAL)
    )

    assert result.order_no == "WEB1900000000000000001"
    assert result.amount_fen == 50000
    assert result.code_url == "weixin://wxpay/native"
    assert result.status == OrderStatus.PENDING
    assert gateway.requests[0].amount_fen == 50000
