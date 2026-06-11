from __future__ import annotations

from datetime import datetime, timedelta

import pytest

from mz_ai_backend.modules.camp_membership.application import (
    CreateCampMembershipOrderCommand,
    CreateCampMembershipOrderUseCase,
)
from mz_ai_backend.modules.camp_membership.application.dtos import (
    CampMembershipOrderRegistration,
)
from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipAlreadyActiveException,
    CampMembershipOrder,
    CampMembershipSku,
    CampMembershipSnapshot,
    CampMembershipTier,
    CampOrderStatus,
)
from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
)


class Repository:
    def __init__(self, *, snapshot: CampMembershipSnapshot) -> None:
        self._snapshot = snapshot
        self.order: CampMembershipOrder | None = None

    async def get_membership_snapshot(self, *, account_id: int, now: datetime) -> CampMembershipSnapshot:
        return self._snapshot

    async def create_pending_order(self, registration: CampMembershipOrderRegistration) -> CampMembershipOrder:
        now = datetime(2026, 6, 12, 10, 0, 0)
        self.order = CampMembershipOrder(
            order_id=registration.order_id,
            order_no=registration.order_no,
            account_id=registration.account_id,
            sku=registration.sku,
            amount_fen=registration.amount_fen,
            status=CampOrderStatus.PENDING,
            code_url=None,
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
        return self.order

    async def update_order_code_url(self, *, order_no: str, code_url: str) -> CampMembershipOrder:
        assert self.order is not None
        self.order = self.order.model_copy(update={"code_url": code_url})
        return self.order


class Snowflake:
    def generate(self) -> int:
        return 1900000000000000001


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 6, 12, 10, 0, 0)


class Gateway:
    def __init__(self) -> None:
        self.requests: list[WechatPayNativeCreateOrderRequest] = []

    async def create_native_order(self, request: WechatPayNativeCreateOrderRequest) -> WechatPayNativeCreateOrderResult:
        self.requests.append(request)
        return WechatPayNativeCreateOrderResult(code_url="weixin://wxpay/native")

    def parse_notification(self, *, headers, body):
        raise NotImplementedError


def _snapshot(*, tier: CampMembershipTier, is_active: bool) -> CampMembershipSnapshot:
    return CampMembershipSnapshot(
        account_id=3001,
        tier=tier,
        started_at=None,
        expires_at=datetime(2027, 6, 12) if is_active else None,
        is_active=is_active,
        remaining_days=365 if is_active else 0,
    )


def _use_case(repo: Repository) -> CreateCampMembershipOrderUseCase:
    return CreateCampMembershipOrderUseCase(
        repository=repo,
        snowflake_id_generator=Snowflake(),
        current_time_provider=Clock(),
        wechat_pay_gateway=Gateway(),
        sku_prices={
            CampMembershipSku.ANNUAL_BASIC: 199900,
            CampMembershipSku.ANNUAL_PREMIUM: 399900,
        },
    )


@pytest.mark.asyncio
async def test_create_order_allowed_when_no_active_membership() -> None:
    repo = Repository(snapshot=_snapshot(tier=CampMembershipTier.NONE, is_active=False))
    use_case = _use_case(repo)

    result = await use_case.execute(
        CreateCampMembershipOrderCommand(account_id=3001, sku=CampMembershipSku.ANNUAL_BASIC)
    )

    assert result.order_no == "CAMP1900000000000000001"
    assert result.amount_fen == 199900
    assert result.code_url == "weixin://wxpay/native"
    assert result.status == CampOrderStatus.PENDING


@pytest.mark.asyncio
async def test_create_order_rejected_when_membership_active() -> None:
    repo = Repository(snapshot=_snapshot(tier=CampMembershipTier.BASIC, is_active=True))
    use_case = _use_case(repo)

    with pytest.raises(CampMembershipAlreadyActiveException):
        await use_case.execute(
            CreateCampMembershipOrderCommand(account_id=3001, sku=CampMembershipSku.ANNUAL_PREMIUM)
        )
