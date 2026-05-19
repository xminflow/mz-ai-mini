from __future__ import annotations

from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
    WechatPayNotification,
    WechatPayV3Gateway,
)


class WechatPayNativeAdapter:
    """Adapter for website Native QR operations over the shared WeChat gateway."""

    def __init__(self, *, gateway: WechatPayV3Gateway) -> None:
        self._gateway = gateway

    async def create_native_order(
        self,
        request: WechatPayNativeCreateOrderRequest,
    ) -> WechatPayNativeCreateOrderResult:
        return await self._gateway.create_native_order(request)

    def parse_notification(
        self,
        *,
        headers: dict[str, str],
        body: bytes,
    ) -> WechatPayNotification:
        return self._gateway.parse_notification(headers=headers, body=body)

    async def query_order(self, *, order_no: str) -> WechatPayNotification | None:
        return await self._gateway.query_order(order_no=order_no)
