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


class EmailLoginDeliveryGateway(Protocol):
    """Email delivery contract for login verification codes."""

    async def send_login_code(self, *, email: str, verification_code: str) -> None:
        """Deliver one login verification code to the target email."""


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


class OfficialWechatEvent(BaseModel):
    """Normalized official account callback event."""

    model_config = ConfigDict(frozen=True)

    event_type: str
    official_openid: str
    event_key: str | None
    ticket: str | None
    event_time: datetime


class OfficialWechatGateway(Protocol):
    """Gateway contract for official account QR and event operations."""

    def verify_callback_signature(
        self,
        *,
        signature: str | None,
        timestamp: str | None,
        nonce: str | None,
    ) -> bool:
        """Return whether the callback signature is valid."""

    def parse_callback_event(self, xml_body: str) -> OfficialWechatEvent:
        """Parse one official account callback XML body."""

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
