from __future__ import annotations

from datetime import datetime
from typing import Protocol

from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
    WechatPayNotification,
)


class SnowflakeIdGenerator(Protocol):
    """Contract for generating business ids."""

    def generate(self) -> int:
        """Generate one unique id."""


class CurrentTimeProvider(Protocol):
    """Contract for reading current time."""

    def now(self) -> datetime:
        """Return current naive UTC datetime."""


class WechatPayNativeGateway(Protocol):
    """Contract for WeChat Pay Native order and callback operations."""

    async def create_native_order(
        self,
        request: WechatPayNativeCreateOrderRequest,
    ) -> WechatPayNativeCreateOrderResult:
        """Create one Native order."""

    def parse_notification(
        self,
        *,
        headers: dict[str, str],
        body: bytes,
    ) -> WechatPayNotification:
        """Verify and parse one callback."""

    async def query_order(self, *, order_no: str) -> WechatPayNotification | None:
        """Query a WeChat order by merchant order number when supported."""
