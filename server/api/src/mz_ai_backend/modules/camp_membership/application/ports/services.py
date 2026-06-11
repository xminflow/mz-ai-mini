from __future__ import annotations

from datetime import datetime
from typing import Protocol

from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
    WechatPayNotification,
)


class SnowflakeIdGenerator(Protocol):
    """生成业务 id 的契约。"""

    def generate(self) -> int:
        """生成一个唯一 id。"""


class CurrentTimeProvider(Protocol):
    """读取当前时间的契约。"""

    def now(self) -> datetime:
        """返回当前 naive UTC datetime。"""


class WechatPayNativeGateway(Protocol):
    """微信支付 Native 下单与回调契约。"""

    async def create_native_order(
        self,
        request: WechatPayNativeCreateOrderRequest,
    ) -> WechatPayNativeCreateOrderResult:
        """创建一笔 Native 订单。"""

    def parse_notification(
        self,
        *,
        headers: dict[str, str],
        body: bytes,
    ) -> WechatPayNotification:
        """验签并解析一次回调。"""
