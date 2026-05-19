from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.account_membership.application import MembershipOrderStatusResult
from mz_ai_backend.modules.account_membership.domain import MembershipSku, OrderStatus
from mz_ai_backend.modules.account_membership.infrastructure.dependencies import (
    get_handle_wechat_pay_notify_use_case,
)


class IdempotentRenewalNotifyUseCase:
    def __init__(self) -> None:
        self.calls = 0

    async def execute(self, command) -> MembershipOrderStatusResult:
        self.calls += 1
        assert command.body == b'{"id":"notify"}'
        return MembershipOrderStatusResult(
            order_no="WEB1",
            sku=MembershipSku.ANNUAL_NORMAL,
            amount_fen=50000,
            status=OrderStatus.PAID,
            code_url=None,
            paid_at=datetime(2026, 5, 18, 10, 0, 0),
            membership_applied=True,
            membership_started_at=datetime(2026, 1, 1, 0, 0, 0),
            membership_expires_at=datetime(2027, 6, 17, 0, 0, 0),
        )


def test_repeat_purchase_notify_endpoint_preserves_success_ack() -> None:
    use_case = IdempotentRenewalNotifyUseCase()
    app = create_app()
    app.dependency_overrides[get_handle_wechat_pay_notify_use_case] = lambda: use_case

    with TestClient(app, raise_server_exceptions=False) as client:
        first = client.post(
            "/api/v1/account-membership/wechat-pay/notify",
            content=b'{"id":"notify"}',
        )
        second = client.post(
            "/api/v1/account-membership/wechat-pay/notify",
            content=b'{"id":"notify"}',
        )

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == {"code": "SUCCESS", "message": "success"}
    assert second.json() == {"code": "SUCCESS", "message": "success"}
    assert use_case.calls == 2
