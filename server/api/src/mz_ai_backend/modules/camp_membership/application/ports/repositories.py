from __future__ import annotations

from datetime import datetime
from typing import Protocol

from mz_ai_backend.shared.wechat_pay import WechatPayNotification

from ...domain import (
    CampMembershipOrder,
    CampMembershipSnapshot,
    CampMembershipSku,
    CampMembershipTier,
)
from ..dtos import CampMembershipOrderRegistration


class CampMembershipRepository(Protocol):
    """ai-camp 会员持久化契约。"""

    async def create_pending_order(
        self,
        registration: CampMembershipOrderRegistration,
    ) -> CampMembershipOrder:
        """创建一笔 pending 订单。"""

    async def update_order_code_url(
        self,
        *,
        order_no: str,
        code_url: str,
    ) -> CampMembershipOrder:
        """回写 Native 二维码 URL。"""

    async def get_order_by_order_no(self, *, order_no: str) -> CampMembershipOrder | None:
        """按商户订单号取订单。"""

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        sku_tier_map: dict[CampMembershipSku, CampMembershipTier],
    ) -> CampMembershipOrder:
        """持久化回调结果并原子化授予会员（幂等）。"""

    async def get_membership_snapshot(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> CampMembershipSnapshot:
        """返回单个账号的会员快照。"""
