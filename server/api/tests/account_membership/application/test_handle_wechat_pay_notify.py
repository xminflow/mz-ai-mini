from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.account_membership.application import (
    HandleWechatPayNotifyCommand,
    HandleWechatPayNotifyUseCase,
)
from mz_ai_backend.modules.account_membership.domain import (
    SKU_TIER_MAP,
    AccountMembershipOrder,
    MembershipSku,
    OrderStatus,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification


class Repository:
    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        sku_tier_map,
    ) -> AccountMembershipOrder:
        assert notification.trade_state == "SUCCESS"
        return AccountMembershipOrder(
            order_id=1,
            order_no=notification.order_no,
            account_id=2001,
            sku=MembershipSku.ANNUAL_NORMAL,
            amount_fen=50000,
            status=OrderStatus.PAID,
            code_url=None,
            transaction_id=notification.transaction_id,
            trade_state=notification.trade_state,
            paid_at=now,
            membership_applied=True,
            membership_started_at=now,
            membership_expires_at=now,
            last_wechat_query_at=None,
            notify_payload=notification.raw_payload,
            created_at=now,
            updated_at=now,
        )


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 5, 18, 10, 0, 0)


class Gateway:
    def parse_notification(self, *, headers: dict[str, str], body: bytes) -> WechatPayNotification:
        assert headers["wechatpay-signature"] == "signature"
        assert body == b"{}"
        return WechatPayNotification(
            order_no="WEB1",
            transaction_id="wx-tx-1",
            trade_state="SUCCESS",
            amount_fen=50000,
            payer_openid=None,
            success_time=datetime(2026, 5, 18, 10, 0, 0),
            raw_payload='{"resource":{}}',
        )

    async def create_native_order(self, request):
        raise NotImplementedError

    async def query_order(self, *, order_no: str):
        return None


@pytest.mark.asyncio
async def test_handle_wechat_pay_notify_processes_success() -> None:
    use_case = HandleWechatPayNotifyUseCase(
        repository=Repository(),
        current_time_provider=Clock(),
        wechat_pay_gateway=Gateway(),
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(
        HandleWechatPayNotifyCommand(headers={"wechatpay-signature": "signature"}, body=b"{}")
    )

    assert result.order_no == "WEB1"
    assert result.status == OrderStatus.PAID
