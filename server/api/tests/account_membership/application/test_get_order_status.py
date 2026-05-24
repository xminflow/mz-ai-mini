from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.account_membership.application import GetOrderStatusQuery, GetOrderStatusUseCase
from mz_ai_backend.modules.account_membership.domain import (
    SKU_TIER_MAP,
    AccountMembershipOrder,
    MembershipSku,
    OrderStatus,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification


def _order(*, last_query_at: datetime | None = None) -> AccountMembershipOrder:
    now = datetime(2026, 5, 18, 10, 0, 0)
    return AccountMembershipOrder(
        order_id=1,
        order_no="WEB1",
        account_id=2001,
        sku=MembershipSku.ANNUAL_NORMAL,
        amount_fen=50000,
        status=OrderStatus.PENDING,
        code_url="weixin://wxpay/native",
        transaction_id=None,
        trade_state=None,
        paid_at=None,
        membership_applied=False,
        membership_started_at=None,
        membership_expires_at=None,
        last_wechat_query_at=last_query_at,
        notify_payload=None,
        created_at=now,
        updated_at=now,
    )


class Repository:
    def __init__(self, order: AccountMembershipOrder) -> None:
        self.order = order
        self.query_attempts = 0
        self.processed = 0

    async def get_order_by_order_no(self, *, order_no: str) -> AccountMembershipOrder | None:
        assert order_no == "WEB1"
        return self.order

    async def mark_order_wechat_query_attempted(self, *, order_no: str, queried_at: datetime) -> None:
        self.query_attempts += 1

    async def process_wechat_pay_notification(self, *, notification, now: datetime, sku_tier_map):
        self.processed += 1
        self.order = self.order.model_copy(
            update={
                "status": OrderStatus.PAID,
                "paid_at": now,
                "membership_applied": True,
                "membership_started_at": now,
                "membership_expires_at": now,
            }
        )
        return self.order


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 5, 18, 10, 0, 0)


class Gateway:
    def __init__(self, notification: WechatPayNotification | None) -> None:
        self.notification = notification
        self.calls = 0

    async def query_order(self, *, order_no: str):
        self.calls += 1
        return self.notification

    async def create_native_order(self, request):
        raise NotImplementedError

    def parse_notification(self, *, headers, body):
        raise NotImplementedError


@pytest.mark.asyncio
async def test_get_order_status_triggers_query_when_not_recently_queried() -> None:
    repository = Repository(_order())
    gateway = Gateway(
        WechatPayNotification(
            order_no="WEB1",
            transaction_id="wx-tx-1",
            trade_state="SUCCESS",
            amount_fen=50000,
            payer_openid=None,
            success_time=datetime(2026, 5, 18, 10, 0, 0),
            raw_payload="{}",
        )
    )
    use_case = GetOrderStatusUseCase(
        repository=repository,
        current_time_provider=Clock(),
        wechat_pay_gateway=gateway,
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(GetOrderStatusQuery(account_id=2001, order_no="WEB1"))

    assert result.status == OrderStatus.PAID
    assert gateway.calls == 1
    assert repository.query_attempts == 1
    assert repository.processed == 1


@pytest.mark.asyncio
async def test_get_order_status_throttles_recent_query() -> None:
    repository = Repository(_order(last_query_at=datetime(2026, 5, 18, 9, 59, 45)))
    gateway = Gateway(None)
    use_case = GetOrderStatusUseCase(
        repository=repository,
        current_time_provider=Clock(),
        wechat_pay_gateway=gateway,
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(GetOrderStatusQuery(account_id=2001, order_no="WEB1"))

    assert result.status == OrderStatus.PENDING
    assert gateway.calls == 0
    assert repository.query_attempts == 0
