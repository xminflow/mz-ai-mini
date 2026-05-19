from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..domain import AccountMembershipSnapshot, MembershipSku, OrderStatus


class CreateMembershipOrderCommand(BaseModel):
    """Input command for creating one website membership order."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    sku: MembershipSku


class CreateMembershipOrderResult(BaseModel):
    """Result returned after one Native order is created."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: MembershipSku
    amount_fen: int
    status: OrderStatus
    code_url: str
    qr_expires_at: datetime


class MembershipOrderRegistration(BaseModel):
    """Repository payload for creating one pending website membership order."""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    account_id: int
    sku: MembershipSku
    amount_fen: int


class GetOrderStatusQuery(BaseModel):
    """Input query for polling one website membership order."""

    model_config = ConfigDict(frozen=True)

    account_id: int
    order_no: str


class MembershipOrderStatusResult(BaseModel):
    """Order status returned to website clients."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: MembershipSku
    amount_fen: int
    status: OrderStatus
    code_url: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None


class HandleWechatPayNotifyCommand(BaseModel):
    """Input command for handling one WeChat Pay callback."""

    model_config = ConfigDict(frozen=True)

    headers: dict[str, str]
    body: bytes


class GetMyMembershipQuery(BaseModel):
    """Input query for reading the current account membership snapshot."""

    model_config = ConfigDict(frozen=True)

    account_id: int


MyMembershipResult = AccountMembershipSnapshot
