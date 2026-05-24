from __future__ import annotations

from datetime import datetime, timedelta

import pytest

from mz_ai_backend.modules.account_membership.application import (
    SweepPendingOrdersUseCase,
)
from mz_ai_backend.modules.account_membership.domain import (
    SKU_TIER_MAP,
    AccountMembershipOrder,
    MembershipSku,
    OrderStatus,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification


def _pending_order(order_no: str) -> AccountMembershipOrder:
    now = datetime(2026, 5, 22, 10, 0, 0)
    return AccountMembershipOrder(
        order_id=int(order_no.removeprefix("WEB")) if order_no.startswith("WEB") else 0,
        order_no=order_no,
        account_id=2001,
        sku=MembershipSku.ANNUAL_PREMIUM,
        amount_fen=49900,
        status=OrderStatus.PENDING,
        code_url="weixin://wxpay/native",
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


def _paid_order(order_no: str, *, now: datetime) -> AccountMembershipOrder:
    base = _pending_order(order_no)
    return base.model_copy(
        update={
            "status": OrderStatus.PAID,
            "paid_at": now,
            "membership_applied": True,
            "membership_started_at": now,
            "membership_expires_at": now,
            "transaction_id": "wx-tx-1",
            "trade_state": "SUCCESS",
        }
    )


class Repository:
    def __init__(self, claimed: list[AccountMembershipOrder]) -> None:
        self._claimed = claimed
        self.claim_calls = 0
        self.process_calls: list[str] = []
        # order_no -> notification handed back from process_wechat_pay_notification
        self.process_results: dict[str, AccountMembershipOrder] = {}
        self.process_raises: dict[str, Exception] = {}

    async def claim_pending_orders_for_sweep(
        self, *, now, batch_size, retry_after, lookback,
    ) -> list[AccountMembershipOrder]:
        self.claim_calls += 1
        return list(self._claimed)

    async def process_wechat_pay_notification(
        self, *, notification, now, sku_tier_map,
    ) -> AccountMembershipOrder:
        self.process_calls.append(notification.order_no)
        if notification.order_no in self.process_raises:
            raise self.process_raises[notification.order_no]
        return self.process_results[notification.order_no]


class Gateway:
    def __init__(self, notifications: dict[str, WechatPayNotification | None]) -> None:
        self._notifications = notifications
        self.raises: dict[str, Exception] = {}
        self.calls: list[str] = []

    async def query_order(self, *, order_no: str):
        self.calls.append(order_no)
        if order_no in self.raises:
            raise self.raises[order_no]
        return self._notifications.get(order_no)


class Clock:
    def __init__(self, now: datetime) -> None:
        self._now = now

    def now(self) -> datetime:
        return self._now


def _notification(order_no: str) -> WechatPayNotification:
    return WechatPayNotification(
        order_no=order_no,
        transaction_id="wx-tx-1",
        trade_state="SUCCESS",
        amount_fen=49900,
        payer_openid=None,
        success_time=datetime(2026, 5, 22, 10, 0, 0),
        raw_payload="{}",
    )


@pytest.mark.asyncio
async def test_sweep_recovers_paid_orders() -> None:
    now = datetime(2026, 5, 22, 10, 0, 0)
    order = _pending_order("WEB1")
    repository = Repository(claimed=[order])
    repository.process_results["WEB1"] = _paid_order("WEB1", now=now)
    gateway = Gateway({"WEB1": _notification("WEB1")})

    use_case = SweepPendingOrdersUseCase(
        repository=repository,
        wechat_pay_gateway=gateway,
        current_time_provider=Clock(now),
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(
        batch_size=50, retry_after_seconds=60, lookback_hours=24,
    )

    assert result.scanned == 1
    assert result.paid == 1
    assert result.still_pending == 0
    assert result.errors == 0
    assert gateway.calls == ["WEB1"]
    assert repository.process_calls == ["WEB1"]


@pytest.mark.asyncio
async def test_sweep_treats_missing_notification_as_still_pending() -> None:
    # 微信侧暂时没结果（query_order 返回 None）→ 不算错误，下一轮再试
    now = datetime(2026, 5, 22, 10, 0, 0)
    order = _pending_order("WEB1")
    repository = Repository(claimed=[order])
    gateway = Gateway({"WEB1": None})

    use_case = SweepPendingOrdersUseCase(
        repository=repository,
        wechat_pay_gateway=gateway,
        current_time_provider=Clock(now),
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(
        batch_size=50, retry_after_seconds=60, lookback_hours=24,
    )

    assert result.scanned == 1
    assert result.paid == 0
    assert result.still_pending == 1
    assert result.errors == 0
    assert repository.process_calls == []  # 没拿到 notification 就不应进 process


@pytest.mark.asyncio
async def test_sweep_isolates_per_order_errors() -> None:
    # 一笔 query_order 抛、一笔 process 抛、一笔成功 → errors=2 paid=1，整批不中断
    now = datetime(2026, 5, 22, 10, 0, 0)
    o1, o2, o3 = _pending_order("WEB1"), _pending_order("WEB2"), _pending_order("WEB3")
    repository = Repository(claimed=[o1, o2, o3])
    repository.process_results["WEB3"] = _paid_order("WEB3", now=now)
    repository.process_raises["WEB2"] = RuntimeError("simulated process error")
    gateway = Gateway({"WEB2": _notification("WEB2"), "WEB3": _notification("WEB3")})
    gateway.raises["WEB1"] = RuntimeError("simulated query error")

    use_case = SweepPendingOrdersUseCase(
        repository=repository,
        wechat_pay_gateway=gateway,
        current_time_provider=Clock(now),
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(
        batch_size=50, retry_after_seconds=60, lookback_hours=24,
    )

    assert result.scanned == 3
    assert result.paid == 1
    assert result.errors == 2
    assert result.still_pending == 0
    assert gateway.calls == ["WEB1", "WEB2", "WEB3"]
    # WEB1 query 抛，没进 process；WEB2 process 抛；WEB3 成功
    assert repository.process_calls == ["WEB2", "WEB3"]


@pytest.mark.asyncio
async def test_sweep_no_pending_orders_yields_zero_result() -> None:
    repository = Repository(claimed=[])
    gateway = Gateway({})

    use_case = SweepPendingOrdersUseCase(
        repository=repository,
        wechat_pay_gateway=gateway,
        current_time_provider=Clock(datetime(2026, 5, 22, 10, 0, 0)),
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(
        batch_size=50, retry_after_seconds=60, lookback_hours=24,
    )

    assert result.scanned == 0
    assert result.paid == 0
    assert result.still_pending == 0
    assert result.errors == 0
    assert gateway.calls == []


@pytest.mark.asyncio
async def test_sweep_passes_correct_timedeltas_to_repository() -> None:
    # 验证 sweep 把 retry_after/lookback 正确换算为 timedelta 传给 repository
    captured: dict[str, object] = {}

    class CapturingRepository(Repository):
        async def claim_pending_orders_for_sweep(
            self, *, now, batch_size, retry_after, lookback,
        ):
            captured["now"] = now
            captured["batch_size"] = batch_size
            captured["retry_after"] = retry_after
            captured["lookback"] = lookback
            return await super().claim_pending_orders_for_sweep(
                now=now,
                batch_size=batch_size,
                retry_after=retry_after,
                lookback=lookback,
            )

    repository = CapturingRepository(claimed=[])
    use_case = SweepPendingOrdersUseCase(
        repository=repository,
        wechat_pay_gateway=Gateway({}),
        current_time_provider=Clock(datetime(2026, 5, 22, 10, 0, 0)),
        sku_tier_map=SKU_TIER_MAP,
    )

    await use_case.execute(
        batch_size=25, retry_after_seconds=90, lookback_hours=12,
    )

    assert captured["batch_size"] == 25
    assert captured["retry_after"] == timedelta(seconds=90)
    assert captured["lookback"] == timedelta(hours=12)
