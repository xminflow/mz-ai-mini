from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..domain import CampMembershipSnapshot, CampMembershipSku, CampOrderStatus


class CreateCampMembershipOrderCommand(BaseModel):
    """创建一笔 camp 会员订单的输入命令。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    sku: CampMembershipSku


class CreateCampMembershipOrderResult(BaseModel):
    """Native 订单创建后的返回。"""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: CampMembershipSku
    amount_fen: int
    status: CampOrderStatus
    code_url: str
    qr_expires_at: datetime


class CampMembershipOrderRegistration(BaseModel):
    """仓储建单入参。"""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    account_id: int
    sku: CampMembershipSku
    amount_fen: int


class GetCampOrderStatusQuery(BaseModel):
    """轮询订单的输入查询。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    order_no: str


class CampMembershipOrderStatusResult(BaseModel):
    """订单状态返回。"""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: CampMembershipSku
    amount_fen: int
    status: CampOrderStatus
    code_url: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None


class HandleCampWechatPayNotifyCommand(BaseModel):
    """处理一次微信支付回调的输入命令。"""

    model_config = ConfigDict(frozen=True)

    headers: dict[str, str]
    body: bytes


class GetMyCampMembershipQuery(BaseModel):
    """读当前账号会员快照的输入查询。"""

    model_config = ConfigDict(frozen=True)

    account_id: int


MyCampMembershipResult = CampMembershipSnapshot
