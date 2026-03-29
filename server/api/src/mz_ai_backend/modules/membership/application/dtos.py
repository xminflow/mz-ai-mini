from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..domain import MembershipOrderStatus, MembershipTier


class MiniProgramIdentity(BaseModel):
    """Trusted mini program identity injected by cloud hosting."""

    model_config = ConfigDict(frozen=True)

    openid: str
    app_id: str | None
    union_id: str | None


class CreateMembershipOrderCommand(BaseModel):
    """Input command for creating one membership order."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity
    tier: MembershipTier


class WechatPayPaymentParams(BaseModel):
    """Mini program payment fields used by wx.requestPayment."""

    model_config = ConfigDict(frozen=True)

    time_stamp: str
    nonce_str: str
    package: str
    sign_type: str
    pay_sign: str


class CreateMembershipOrderResult(BaseModel):
    """Result returned after creating one membership order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    tier: MembershipTier
    amount_fen: int
    status: MembershipOrderStatus
    payment_params: WechatPayPaymentParams


class GetMembershipOrderQuery(BaseModel):
    """Input query for fetching one membership order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    identity: MiniProgramIdentity


class GetMembershipOrderResult(BaseModel):
    """Result returned after fetching one membership order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    tier: MembershipTier
    amount_fen: int
    status: MembershipOrderStatus
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None


class MembershipOrderRegistration(BaseModel):
    """Repository payload for creating one pending membership order."""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    user_id: int
    openid: str
    tier: MembershipTier
    amount_fen: int


class WechatPayCreateOrderRequest(BaseModel):
    """Outbound payload for creating a WeChat Pay JSAPI order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    amount_fen: int
    description: str
    payer_openid: str


class WechatPayCreateOrderResult(BaseModel):
    """Outbound result returned by WeChat Pay gateway."""

    model_config = ConfigDict(frozen=True)

    prepay_id: str
    payment_params: WechatPayPaymentParams


class HandleWechatPayNotifyCommand(BaseModel):
    """Input command for handling one WeChat Pay callback request."""

    model_config = ConfigDict(frozen=True)

    headers: dict[str, str]
    body: bytes


class WechatPayNotification(BaseModel):
    """Verified and decrypted WeChat Pay callback content."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    transaction_id: str | None
    trade_state: str
    amount_fen: int
    payer_openid: str | None
    success_time: datetime | None
    raw_payload: str


class HandleWechatPayNotifyResult(BaseModel):
    """Result returned after one WeChat Pay callback is handled."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    status: MembershipOrderStatus
