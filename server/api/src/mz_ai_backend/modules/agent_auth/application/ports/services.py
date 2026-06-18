from __future__ import annotations

from datetime import datetime
from typing import Protocol

from pydantic import BaseModel, ConfigDict


class TokenService(Protocol):
    """Opaque token issuing and hashing contract."""

    def generate_token(self) -> str:
        """Generate one opaque bearer token."""

    def hash_token(self, token: str) -> str:
        """Return the stable persisted hash for one opaque token."""


class EmailVerificationDeliveryGateway(Protocol):
    """邮箱验证码发送契约（用于绑定邮箱、修改邮箱等场景）。"""

    async def send_verification_code(self, *, email: str, verification_code: str) -> None:
        """Deliver one verification code to the target email."""


class OfficialWechatQrTicket(BaseModel):
    """Issued QR ticket returned by the official account gateway."""

    model_config = ConfigDict(frozen=True)

    ticket: str
    expires_in_seconds: int
    qr_code_url: str


class OfficialWechatUserProfile(BaseModel):
    """Official account user profile snapshot used for subscribe checks."""

    model_config = ConfigDict(frozen=True)

    official_openid: str
    subscribed: bool


class OfficialWechatInboundMessage(BaseModel):
    """Normalized official account inbound callback message.

    覆盖两类入站消息：事件消息（subscribe/SCAN/unsubscribe 等，MsgType=event）与
    普通消息（文本/图片等，MsgType=text/image/...）。event_type 仅在事件消息时有值。
    """

    model_config = ConfigDict(frozen=True)

    msg_type: str
    official_openid: str
    # 入站 XML 的 ToUserName，即公众号自身的原始 ID（gh_xxx），被动回复时用作 FromUserName
    to_user_name: str
    event_type: str | None
    event_key: str | None
    ticket: str | None
    content: str | None
    message_time: datetime


class OfficialWechatGateway(Protocol):
    """Gateway contract for official account QR, event and passive-reply operations."""

    def verify_callback_signature(
        self,
        *,
        signature: str | None,
        timestamp: str | None,
        nonce: str | None,
    ) -> bool:
        """Return whether the callback signature is valid."""

    def parse_inbound_message(self, xml_body: str) -> OfficialWechatInboundMessage:
        """Parse one official account inbound callback XML body (event or user message)."""

    def build_subscribe_news_reply(
        self,
        *,
        to_user_openid: str,
        from_user_name: str,
        title: str,
        description: str,
        pic_url: str,
        url: str,
    ) -> str:
        """Build the passive-reply XML for one single-article news message.

        安全模式下返回加密包裹（含 Encrypt/MsgSignature/TimeStamp/Nonce）；明文模式返回明文 XML。
        被动回复对 subscribe 事件无 48h 客服窗口限制，是开发模式下关注自动回复的可靠通道。
        """

    async def create_temporary_qr_ticket(
        self,
        *,
        scene_key: str,
        expire_seconds: int,
    ) -> OfficialWechatQrTicket:
        """Create one temporary QR ticket for login."""

    async def get_user_profile(
        self,
        *,
        official_openid: str,
    ) -> OfficialWechatUserProfile:
        """Return the current official account user profile."""
