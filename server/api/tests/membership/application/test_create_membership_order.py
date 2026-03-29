from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.membership.application import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderUseCase,
    MiniProgramIdentity,
)
from mz_ai_backend.modules.membership.application.dtos import (
    MembershipOrderRegistration,
    WechatPayCreateOrderRequest,
    WechatPayCreateOrderResult,
    WechatPayPaymentParams,
)
from mz_ai_backend.modules.membership.domain import (
    MembershipAlreadyActiveException,
    MembershipOrder,
    MembershipOrderStatus,
    MembershipPlanNotOpenException,
    MembershipTier,
    UserMembershipSnapshot,
)


class InMemoryMembershipRepository:
    def __init__(self, *, user_membership: UserMembershipSnapshot | None) -> None:
        self._user_membership = user_membership
        self.created_order: MembershipOrder | None = None

    async def get_user_membership_by_openid(self, *, openid: str, now: datetime):
        if self._user_membership and self._user_membership.openid == openid:
            return self._user_membership
        return None

    async def create_pending_order(
        self,
        registration: MembershipOrderRegistration,
    ) -> MembershipOrder:
        now = datetime.now(UTC)
        self.created_order = MembershipOrder(
            order_id=registration.order_id,
            order_no=registration.order_no,
            user_id=registration.user_id,
            openid=registration.openid,
            tier=registration.tier,
            amount_fen=registration.amount_fen,
            status=MembershipOrderStatus.PENDING,
            prepay_id=None,
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
        return self.created_order

    async def update_order_prepay_id(self, *, order_no: str, prepay_id: str) -> MembershipOrder:
        assert self.created_order is not None
        assert self.created_order.order_no == order_no
        now = datetime.now(UTC)
        self.created_order = self.created_order.model_copy(
            update={"prepay_id": prepay_id, "updated_at": now}
        )
        return self.created_order

    async def get_order_by_order_no_and_openid(self, *, order_no: str, openid: str):
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


class StubSnowflakeGenerator:
    def generate(self) -> int:
        return 12345678901


class StubCurrentTimeProvider:
    def now(self) -> datetime:
        return datetime(2026, 3, 29, 10, 0, 0)


class StubWechatPayGateway:
    def __init__(self) -> None:
        self.requests: list[WechatPayCreateOrderRequest] = []

    async def create_order(
        self,
        request: WechatPayCreateOrderRequest,
    ) -> WechatPayCreateOrderResult:
        self.requests.append(request)
        return WechatPayCreateOrderResult(
            prepay_id="wx-prepay-001",
            payment_params=WechatPayPaymentParams(
                time_stamp="123456",
                nonce_str="nonce-1",
                package="prepay_id=wx-prepay-001",
                sign_type="RSA",
                pay_sign="signature",
            ),
        )

    def parse_notification(self, *, headers: dict[str, str], body: bytes):
        raise NotImplementedError


@pytest.mark.asyncio
async def test_create_membership_order_creates_normal_order() -> None:
    repository = InMemoryMembershipRepository(
        user_membership=UserMembershipSnapshot(
            user_id=10001,
            openid="openid-10001",
            tier=MembershipTier.NONE,
            started_at=None,
            expires_at=None,
            is_active=False,
        )
    )
    gateway = StubWechatPayGateway()
    use_case = CreateMembershipOrderUseCase(
        membership_repository=repository,
        snowflake_id_generator=StubSnowflakeGenerator(),
        current_time_provider=StubCurrentTimeProvider(),
        wechat_pay_gateway=gateway,
    )

    result = await use_case.execute(
        CreateMembershipOrderCommand(
            identity=MiniProgramIdentity(
                openid="openid-10001",
                app_id="wx-app-id",
                union_id=None,
            ),
            tier=MembershipTier.NORMAL,
        )
    )

    assert result.order_no == "12345678901"
    assert result.amount_fen == 10
    assert result.tier == MembershipTier.NORMAL
    assert result.status == MembershipOrderStatus.PENDING
    assert result.payment_params.package == "prepay_id=wx-prepay-001"
    assert gateway.requests


@pytest.mark.asyncio
async def test_create_membership_order_rejects_not_open_plan() -> None:
    repository = InMemoryMembershipRepository(
        user_membership=UserMembershipSnapshot(
            user_id=10001,
            openid="openid-10001",
            tier=MembershipTier.NONE,
            started_at=None,
            expires_at=None,
            is_active=False,
        )
    )
    use_case = CreateMembershipOrderUseCase(
        membership_repository=repository,
        snowflake_id_generator=StubSnowflakeGenerator(),
        current_time_provider=StubCurrentTimeProvider(),
        wechat_pay_gateway=StubWechatPayGateway(),
    )

    with pytest.raises(MembershipPlanNotOpenException):
        await use_case.execute(
            CreateMembershipOrderCommand(
                identity=MiniProgramIdentity(
                    openid="openid-10001",
                    app_id="wx-app-id",
                    union_id=None,
                ),
                tier=MembershipTier.PLATINUM,
            )
        )


@pytest.mark.asyncio
async def test_create_membership_order_rejects_active_normal_membership() -> None:
    repository = InMemoryMembershipRepository(
        user_membership=UserMembershipSnapshot(
            user_id=10001,
            openid="openid-10001",
            tier=MembershipTier.NORMAL,
            started_at=datetime(2026, 1, 1, 0, 0, 0),
            expires_at=datetime(2027, 1, 1, 0, 0, 0),
            is_active=True,
        )
    )
    use_case = CreateMembershipOrderUseCase(
        membership_repository=repository,
        snowflake_id_generator=StubSnowflakeGenerator(),
        current_time_provider=StubCurrentTimeProvider(),
        wechat_pay_gateway=StubWechatPayGateway(),
    )

    with pytest.raises(MembershipAlreadyActiveException):
        await use_case.execute(
            CreateMembershipOrderCommand(
                identity=MiniProgramIdentity(
                    openid="openid-10001",
                    app_id="wx-app-id",
                    union_id=None,
                ),
                tier=MembershipTier.NORMAL,
            )
        )
