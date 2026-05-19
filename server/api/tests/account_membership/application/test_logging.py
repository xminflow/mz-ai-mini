from __future__ import annotations

from datetime import datetime

import pytest
import logging

from mz_ai_backend.modules.account_membership.application import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderUseCase,
)
from mz_ai_backend.modules.account_membership.application.dtos import MembershipOrderRegistration
from mz_ai_backend.modules.account_membership.domain import (
    AccountMembershipOrder,
    MembershipSku,
    OrderStatus,
)
from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
)


class Repository:
    async def create_pending_order(
        self,
        registration: MembershipOrderRegistration,
    ) -> AccountMembershipOrder:
        now = datetime(2026, 5, 18, 10, 0, 0)
        return AccountMembershipOrder(
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

    async def update_order_code_url(self, *, order_no: str, code_url: str) -> AccountMembershipOrder:
        now = datetime(2026, 5, 18, 10, 0, 0)
        return AccountMembershipOrder(
            order_id=1,
            order_no=order_no,
            account_id=2001,
            sku=MembershipSku.ANNUAL_NORMAL,
            amount_fen=50000,
            status=OrderStatus.PENDING,
            code_url=code_url,
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


class Snowflake:
    def generate(self) -> int:
        return 1


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 5, 18, 10, 0, 0)


class Gateway:
    async def create_native_order(
        self,
        request: WechatPayNativeCreateOrderRequest,
    ) -> WechatPayNativeCreateOrderResult:
        return WechatPayNativeCreateOrderResult(code_url="weixin://wxpay/native-secret-tail")

    def parse_notification(self, *, headers, body):
        raise NotImplementedError

    async def query_order(self, *, order_no: str):
        return None


@pytest.mark.asyncio
async def test_create_order_logs_context_without_full_code_url(caplog) -> None:
    caplog.set_level(logging.DEBUG, logger="mz_ai_backend.account_membership")
    use_case = CreateMembershipOrderUseCase(
        repository=Repository(),
        snowflake_id_generator=Snowflake(),
        current_time_provider=Clock(),
        wechat_pay_gateway=Gateway(),
        annual_amount_fen=50000,
    )

    await use_case.execute(
        CreateMembershipOrderCommand(account_id=2001, sku=MembershipSku.ANNUAL_NORMAL)
    )

    messages = "\n".join(record.getMessage() for record in caplog.records)
    assert "account_membership.order.created" in messages
    assert "account_id=2001" in messages
    assert "native-secret-tail" not in messages
