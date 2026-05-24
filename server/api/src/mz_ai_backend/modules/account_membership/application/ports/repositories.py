from __future__ import annotations

from datetime import datetime, timedelta
from typing import Protocol

from mz_ai_backend.shared.wechat_pay import WechatPayNotification

from ...domain import AccountMembershipOrder, AccountMembershipSnapshot, MembershipSku, MembershipTier
from ..dtos import MembershipOrderRegistration


class AccountMembershipRepository(Protocol):
    """Persistence contract for website account membership."""

    async def create_pending_order(
        self,
        registration: MembershipOrderRegistration,
    ) -> AccountMembershipOrder:
        """Create one pending order."""

    async def update_order_code_url(
        self,
        *,
        order_no: str,
        code_url: str,
    ) -> AccountMembershipOrder:
        """Persist the Native QR code URL."""

    async def get_order_by_order_no(self, *, order_no: str) -> AccountMembershipOrder | None:
        """Return one order by merchant order number."""

    async def mark_order_wechat_query_attempted(
        self,
        *,
        order_no: str,
        queried_at: datetime,
    ) -> None:
        """Record one proactive WeChat query attempt."""

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        sku_tier_map: dict[MembershipSku, MembershipTier],
    ) -> AccountMembershipOrder:
        """Persist callback result and atomically grant membership."""

    async def claim_pending_orders_for_sweep(
        self,
        *,
        now: datetime,
        batch_size: int,
        retry_after: timedelta,
        lookback: timedelta,
    ) -> list[AccountMembershipOrder]:
        """Atomically claim a batch of pending orders for the sweep job.

        Uses ``SELECT ... FOR UPDATE SKIP LOCKED`` so concurrent sweep
        instances never pick up the same row. Updates ``last_wechat_query_at``
        on the returned rows to throttle the next sweep cycle.
        """

    async def get_membership_snapshot(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> AccountMembershipSnapshot:
        """Return the membership snapshot for one account."""
