from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..application import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderResult,
    MembershipOrderStatusResult,
)
from ..domain import AccountMembershipSnapshot, MembershipSku


class CreateMembershipOrderRequest(BaseModel):
    """HTTP payload for creating one website membership order."""

    model_config = ConfigDict(frozen=True)

    sku: MembershipSku

    def to_command(self, *, account_id: int) -> CreateMembershipOrderCommand:
        return CreateMembershipOrderCommand(account_id=account_id, sku=self.sku)


class CreateMembershipOrderResponse(BaseModel):
    """HTTP response for Native QR order creation."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: str
    amount_fen: int
    status: str
    code_url: str
    qr_expires_at: datetime

    @classmethod
    def from_result(cls, result: CreateMembershipOrderResult) -> "CreateMembershipOrderResponse":
        return cls(
            order_no=result.order_no,
            sku=result.sku.value,
            amount_fen=result.amount_fen,
            status=result.status.value,
            code_url=result.code_url,
            qr_expires_at=result.qr_expires_at,
        )


class MembershipOrderStatusResponse(BaseModel):
    """HTTP response for one order status."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: str
    amount_fen: int
    status: str
    code_url: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None

    @classmethod
    def from_result(cls, result: MembershipOrderStatusResult) -> "MembershipOrderStatusResponse":
        return cls(
            order_no=result.order_no,
            sku=result.sku.value,
            amount_fen=result.amount_fen,
            status=result.status.value,
            code_url=result.code_url,
            paid_at=result.paid_at,
            membership_applied=result.membership_applied,
            membership_started_at=result.membership_started_at,
            membership_expires_at=result.membership_expires_at,
        )


class MyMembershipResponse(BaseModel):
    """HTTP response for current account membership snapshot."""

    model_config = ConfigDict(frozen=True)

    tier: str
    started_at: datetime | None
    expires_at: datetime | None
    is_active: bool
    remaining_days: int

    @classmethod
    def from_result(cls, result: AccountMembershipSnapshot) -> "MyMembershipResponse":
        return cls(
            tier=result.tier.value,
            started_at=result.started_at,
            expires_at=result.expires_at,
            is_active=result.is_active,
            remaining_days=result.remaining_days,
        )


class WechatPayNotifyAcknowledgeResponse(BaseModel):
    """Acknowledgement payload required by WeChat Pay callback protocol."""

    model_config = ConfigDict(frozen=True)

    code: str
    message: str
