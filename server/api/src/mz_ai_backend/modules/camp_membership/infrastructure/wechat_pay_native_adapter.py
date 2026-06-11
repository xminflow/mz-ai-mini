from __future__ import annotations

from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
    WechatPayNotification,
    WechatPayV3Gateway,
)


class CampWechatPayNativeAdapter:
    """基于 shared 网关的 ai-camp Native 操作适配器。"""

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
