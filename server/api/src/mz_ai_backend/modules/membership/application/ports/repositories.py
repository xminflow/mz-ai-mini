from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ...domain import MembershipOrder, MembershipTier, UserMembershipSnapshot
from ..dtos import MembershipOrderRegistration, WechatPayNotification


class MembershipRepository(Protocol):
    """Contract for membership and order persistence."""

    async def get_user_membership_by_openid(
        self,
        *,
        openid: str,
        now: datetime,
    ) -> UserMembershipSnapshot | None:
        """Return one user membership snapshot by openid."""

    async def create_pending_order(
        self,
        registration: MembershipOrderRegistration,
    ) -> MembershipOrder:
        """Create one pending membership order."""

    async def update_order_prepay_id(
        self,
        *,
        order_no: str,
        prepay_id: str,
    ) -> MembershipOrder:
        """Persist prepay id for one existing order."""

    async def get_order_by_order_no_and_openid(
        self,
        *,
        order_no: str,
        openid: str,
    ) -> MembershipOrder | None:
        """Return one order for the current user."""

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        membership_duration_days: int,
        expected_tier: MembershipTier,
    ) -> MembershipOrder:
        """Persist callback result and apply membership upgrades when paid."""
