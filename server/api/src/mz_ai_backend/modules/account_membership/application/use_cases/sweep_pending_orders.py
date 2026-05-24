from __future__ import annotations

from datetime import timedelta

from mz_ai_backend.core.logging import get_logger

from ...domain import MembershipSku, MembershipTier, OrderStatus
from ..dtos import SweepPendingOrdersResult
from ..ports import AccountMembershipRepository, CurrentTimeProvider, WechatPayNativeGateway

logger = get_logger("mz_ai_backend.account_membership.sweep")


class SweepPendingOrdersUseCase:
    """Periodically reconcile PENDING membership orders against WeChat Pay.

    Covers the case where WeChat's async callback never reaches our notify
    endpoint AND the user closes the page before the front-end polling can
    trigger the per-request fallback. Without this sweep such orders would
    stay PENDING forever and the paying user would never receive membership.
    """

    def __init__(
        self,
        *,
        repository: AccountMembershipRepository,
        wechat_pay_gateway: WechatPayNativeGateway,
        current_time_provider: CurrentTimeProvider,
        sku_tier_map: dict[MembershipSku, MembershipTier],
    ) -> None:
        self._repository = repository
        self._wechat_pay_gateway = wechat_pay_gateway
        self._current_time_provider = current_time_provider
        self._sku_tier_map = sku_tier_map

    async def execute(
        self,
        *,
        batch_size: int,
        retry_after_seconds: int,
        lookback_hours: int,
    ) -> SweepPendingOrdersResult:
        now = self._current_time_provider.now()
        orders = await self._repository.claim_pending_orders_for_sweep(
            now=now,
            batch_size=batch_size,
            retry_after=timedelta(seconds=retry_after_seconds),
            lookback=timedelta(hours=lookback_hours),
        )

        scanned = len(orders)
        paid = 0
        still_pending = 0
        errors = 0

        for order in orders:
            try:
                notification = await self._wechat_pay_gateway.query_order(
                    order_no=order.order_no,
                )
            except Exception as exc:  # noqa: BLE001
                # 单订单查询异常吞掉，不影响整批；明确记录便于巡检
                errors += 1
                logger.warning(
                    "sweep.query_failed order_no=%s exc_type=%s exc=%s",
                    order.order_no,
                    type(exc).__name__,
                    exc,
                )
                continue

            if notification is None:
                still_pending += 1
                continue

            try:
                updated = await self._repository.process_wechat_pay_notification(
                    notification=notification,
                    now=self._current_time_provider.now(),
                    sku_tier_map=self._sku_tier_map,
                )
            except Exception as exc:  # noqa: BLE001
                errors += 1
                logger.warning(
                    "sweep.process_failed order_no=%s exc_type=%s exc=%s",
                    order.order_no,
                    type(exc).__name__,
                    exc,
                )
                continue

            if updated.status == OrderStatus.PAID:
                paid += 1
                logger.info(
                    "sweep.order_recovered order_no=%s account_id=%s sku=%s",
                    updated.order_no,
                    updated.account_id,
                    updated.sku.value,
                )
            else:
                still_pending += 1

        result = SweepPendingOrdersResult(
            scanned=scanned,
            paid=paid,
            still_pending=still_pending,
            errors=errors,
        )
        if scanned > 0 or errors > 0:
            logger.info(
                "sweep.completed scanned=%d paid=%d still_pending=%d errors=%d",
                result.scanned,
                result.paid,
                result.still_pending,
                result.errors,
            )
        return result
