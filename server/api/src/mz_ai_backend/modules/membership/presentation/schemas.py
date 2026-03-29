from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..application import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderResult,
    GetMembershipOrderResult,
    MiniProgramIdentity,
)
from ..domain import MembershipTier


class CreateMembershipOrderRequest(BaseModel):
    """HTTP payload for creating one membership order."""

    model_config = ConfigDict(frozen=True)

    tier: MembershipTier

    def to_command(
        self,
        *,
        identity: MiniProgramIdentity,
    ) -> CreateMembershipOrderCommand:
        return CreateMembershipOrderCommand(
            identity=identity,
            tier=self.tier,
        )


class MembershipPaymentParamsResponse(BaseModel):
    """HTTP payment params used by wx.requestPayment."""

    model_config = ConfigDict(frozen=True)

    time_stamp: str
    nonce_str: str
    package: str
    sign_type: str
    pay_sign: str


class CreateMembershipOrderResponse(BaseModel):
    """HTTP response payload for membership order creation."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    tier: str
    amount_fen: int
    status: str
    payment_params: MembershipPaymentParamsResponse

    @classmethod
    def from_result(
        cls,
        result: CreateMembershipOrderResult,
    ) -> "CreateMembershipOrderResponse":
        payload = result.model_dump(mode="json")
        payload["tier"] = result.tier.value
        payload["status"] = result.status.value
        return cls.model_validate(payload)


class GetMembershipOrderResponse(BaseModel):
    """HTTP response payload for one membership order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    tier: str
    amount_fen: int
    status: str
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None

    @classmethod
    def from_result(
        cls,
        result: GetMembershipOrderResult,
    ) -> "GetMembershipOrderResponse":
        payload = result.model_dump(mode="json")
        payload["tier"] = result.tier.value
        payload["status"] = result.status.value
        return cls.model_validate(payload)


class WechatPayNotifyAcknowledgeResponse(BaseModel):
    """Acknowledgement payload required by WeChat Pay callback protocol."""

    model_config = ConfigDict(frozen=True)

    code: str
    message: str
