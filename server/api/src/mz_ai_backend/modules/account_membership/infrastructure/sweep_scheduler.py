from __future__ import annotations

import asyncio

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.logging import get_logger

from ..application import SweepPendingOrdersUseCase
from ..domain import SKU_TIER_MAP
from .dependencies import SystemCurrentTimeProvider
from .repositories import SqlAlchemyAccountMembershipRepository
from .wechat_pay_native_adapter import WechatPayNativeAdapter

logger = get_logger("mz_ai_backend.account_membership.sweep")


class PendingOrderSweepScheduler:
    """Background task that periodically reconciles PENDING orders.

    Lives for the entire FastAPI process lifecycle. One instance per
    application process is sufficient because the underlying SQL uses
    ``SELECT ... FOR UPDATE SKIP LOCKED``, which lets multiple replicas
    cooperate safely without an external scheduler or distributed lock.
    """

    def __init__(
        self,
        *,
        session_maker: async_sessionmaker[AsyncSession],
        wechat_pay_gateway: WechatPayNativeAdapter,
        interval_seconds: int,
        batch_size: int,
        retry_after_seconds: int,
        lookback_hours: int,
    ) -> None:
        self._session_maker = session_maker
        self._wechat_pay_gateway = wechat_pay_gateway
        self._interval_seconds = interval_seconds
        self._batch_size = batch_size
        self._retry_after_seconds = retry_after_seconds
        self._lookback_hours = lookback_hours
        self._stop_event = asyncio.Event()
        self._task: asyncio.Task[None] | None = None

    async def start(self) -> None:
        if self._task is not None:
            return
        self._stop_event.clear()
        self._task = asyncio.create_task(self._run_loop(), name="account-membership-sweep")
        logger.info(
            "sweep.scheduler.started interval_seconds=%d batch_size=%d retry_after_seconds=%d lookback_hours=%d",
            self._interval_seconds,
            self._batch_size,
            self._retry_after_seconds,
            self._lookback_hours,
        )

    async def stop(self) -> None:
        if self._task is None:
            return
        self._stop_event.set()
        try:
            await self._task
        except asyncio.CancelledError:
            pass
        finally:
            self._task = None
            logger.info("sweep.scheduler.stopped")

    async def _run_loop(self) -> None:
        while not self._stop_event.is_set():
            try:
                await self._tick()
            except asyncio.CancelledError:
                raise
            except Exception as exc:  # noqa: BLE001
                # 任一轮失败不能让循环死掉；下一轮继续
                logger.exception("sweep.tick_failed exc=%s", exc)

            try:
                await asyncio.wait_for(
                    self._stop_event.wait(),
                    timeout=self._interval_seconds,
                )
            except asyncio.TimeoutError:
                continue

    async def _tick(self) -> None:
        async with self._session_maker() as session:
            repository = SqlAlchemyAccountMembershipRepository(session=session)
            use_case = SweepPendingOrdersUseCase(
                repository=repository,
                wechat_pay_gateway=self._wechat_pay_gateway,
                current_time_provider=SystemCurrentTimeProvider(),
                sku_tier_map=SKU_TIER_MAP,
            )
            await use_case.execute(
                batch_size=self._batch_size,
                retry_after_seconds=self._retry_after_seconds,
                lookback_hours=self._lookback_hours,
            )


def build_pending_order_sweep_scheduler(
    *,
    settings: Settings,
    session_maker: async_sessionmaker[AsyncSession],
    wechat_pay_gateway: WechatPayNativeAdapter,
) -> PendingOrderSweepScheduler:
    """Construct the scheduler from settings; caller decides whether to start."""

    return PendingOrderSweepScheduler(
        session_maker=session_maker,
        wechat_pay_gateway=wechat_pay_gateway,
        interval_seconds=settings.account_membership_sweep_interval_seconds,
        batch_size=settings.account_membership_sweep_batch_size,
        retry_after_seconds=settings.account_membership_sweep_retry_after_seconds,
        lookback_hours=settings.account_membership_sweep_lookback_hours,
    )
