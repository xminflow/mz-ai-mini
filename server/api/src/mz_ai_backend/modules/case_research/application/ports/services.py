from __future__ import annotations

from datetime import datetime
from typing import Protocol

from mz_ai_backend.shared.wechat_pay import (
    WechatPayCreateOrderRequest,
    WechatPayCreateOrderResult,
    WechatPayNotification,
)


class SnowflakeIdGenerator(Protocol):
    """Contract for generating business identifiers."""

    def generate(self) -> int:
        """Generate one business identifier."""


class CurrentTimeProvider(Protocol):
    """Contract for retrieving current time."""

    def now(self) -> datetime:
        """Return current naive UTC datetime."""


class WechatPayGateway(Protocol):
    """Contract for WeChat Pay order and callback operations."""

    async def create_order(
        self,
        request: WechatPayCreateOrderRequest,
    ) -> WechatPayCreateOrderResult:
        """Create one JSAPI prepay order."""

    def parse_notification(
        self,
        *,
        headers: dict[str, str],
        body: bytes,
    ) -> WechatPayNotification:
        """Verify and decrypt callback payload from WeChat Pay."""
