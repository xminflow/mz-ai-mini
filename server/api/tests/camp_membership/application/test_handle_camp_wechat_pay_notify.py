from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.camp_membership.application import (
    HandleCampWechatPayNotifyCommand,
    HandleCampWechatPayNotifyUseCase,
)
from mz_ai_backend.modules.camp_membership.domain import (
    SKU_TIER_MAP,
    CampMembershipOrder,
    CampMembershipSku,
    CampOrderStatus,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification


class Repository:
    async def process_wechat_pay_notification(self, *, notification: WechatPayNotification, now, sku_tier_map) -> CampMembershipOrder:
        assert notification.trade_state == "SUCCESS"
        return CampMembershipOrder(
            order_id=1,
            order_no=notification.order_no,
            account_id=3001,
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PAID,
            code_url=None,
            transaction_id=notification.transaction_id,
            trade_state=notification.trade_state,
            paid_at=now,
            membership_applied=True,
            membership_started_at=now,
            membership_expires_at=now,
            notify_payload=notification.raw_payload,
            created_at=now,
            updated_at=now,
        )


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 6, 12, 10, 0, 0)


class Gateway:
    def parse_notification(self, *, headers: dict[str, str], body: bytes) -> WechatPayNotification:
        assert headers["wechatpay-signature"] == "signature"
        assert body == b"{}"
        return WechatPayNotification(
            order_no="CAMP1",
            transaction_id="wx-tx-1",
            trade_state="SUCCESS",
            amount_fen=199900,
            payer_openid=None,
            success_time=datetime(2026, 6, 12, 10, 0, 0),
            raw_payload='{"resource":{}}',
        )

    async def create_native_order(self, request):
        raise NotImplementedError


@pytest.mark.asyncio
async def test_handle_camp_wechat_pay_notify_processes_success() -> None:
    use_case = HandleCampWechatPayNotifyUseCase(
        repository=Repository(),
        current_time_provider=Clock(),
        wechat_pay_gateway=Gateway(),
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(
        HandleCampWechatPayNotifyCommand(headers={"wechatpay-signature": "signature"}, body=b"{}")
    )

    assert result.order_no == "CAMP1"
    assert result.status == CampOrderStatus.PAID
    assert result.membership_applied is True
