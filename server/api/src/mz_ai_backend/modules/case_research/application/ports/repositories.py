from __future__ import annotations

from typing import Protocol

from mz_ai_backend.shared.wechat_pay import WechatPayNotification

from ...domain import CaseResearchOrder, CaseResearchRequest
from ..dtos import CaseResearchOrderRegistration, CaseResearchRequestRegistration


class CaseResearchRepository(Protocol):
    """Contract for case research request and order persistence."""

    async def get_user_id_by_openid(self, *, openid: str) -> int | None:
        """Return the user_id for the given openid, or None if not found."""

    async def create_request(
        self,
        registration: CaseResearchRequestRegistration,
    ) -> CaseResearchRequest:
        """Create one case research request."""

    async def create_pending_order(
        self,
        registration: CaseResearchOrderRegistration,
    ) -> CaseResearchOrder:
        """Create one pending case research order."""

    async def update_order_prepay_id(
        self,
        *,
        order_no: str,
        prepay_id: str,
    ) -> CaseResearchOrder:
        """Persist prepay id for one existing order."""

    async def get_order_by_order_no_and_openid(
        self,
        *,
        order_no: str,
        openid: str,
    ) -> CaseResearchOrder | None:
        """Return one order for the current user."""

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        snowflake_id: int,
    ) -> CaseResearchOrder:
        """Persist callback result and create request when paid."""

    async def list_private_requests_by_openid(
        self,
        *,
        openid: str,
    ) -> list[CaseResearchRequest]:
        """Return all non-deleted private requests for the given openid."""
