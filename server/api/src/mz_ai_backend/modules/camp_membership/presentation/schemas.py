from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..application import (
    CampMembershipOrderStatusResult,
    CreateCampMembershipOrderCommand,
    CreateCampMembershipOrderResult,
)
from ..domain import CampMembershipSku, CampMembershipSnapshot


class CreateCampMembershipOrderRequest(BaseModel):
    """下单 HTTP 请求体。"""

    model_config = ConfigDict(frozen=True)

    sku: CampMembershipSku

    def to_command(self, *, account_id: int) -> CreateCampMembershipOrderCommand:
        return CreateCampMembershipOrderCommand(account_id=account_id, sku=self.sku)


class CreateCampMembershipOrderResponse(BaseModel):
    """下单 HTTP 响应。"""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: str
    amount_fen: int
    status: str
    code_url: str
    qr_expires_at: datetime

    @classmethod
    def from_result(cls, result: CreateCampMembershipOrderResult) -> "CreateCampMembershipOrderResponse":
        return cls(
            order_no=result.order_no,
            sku=result.sku.value,
            amount_fen=result.amount_fen,
            status=result.status.value,
            code_url=result.code_url,
            qr_expires_at=result.qr_expires_at,
        )


class CampMembershipOrderStatusResponse(BaseModel):
    """订单状态 HTTP 响应。"""

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
    def from_result(cls, result: CampMembershipOrderStatusResult) -> "CampMembershipOrderStatusResponse":
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


class MyCampMembershipResponse(BaseModel):
    """会员快照 HTTP 响应。"""

    model_config = ConfigDict(frozen=True)

    tier: str
    started_at: datetime | None
    expires_at: datetime | None
    is_active: bool
    remaining_days: int

    @classmethod
    def from_result(cls, result: CampMembershipSnapshot) -> "MyCampMembershipResponse":
        return cls(
            tier=result.tier.value,
            started_at=result.started_at,
            expires_at=result.expires_at,
            is_active=result.is_active,
            remaining_days=result.remaining_days,
        )


class CampWechatPayNotifyAcknowledgeResponse(BaseModel):
    """微信支付回调协议要求的应答体。"""

    model_config = ConfigDict(frozen=True)

    code: str
    message: str
