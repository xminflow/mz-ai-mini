from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


CAMP_MEMBERSHIP_DURATION_DAYS = 365
MEMBERSHIP_QR_TTL_SECONDS = 15 * 60


class CampMembershipTier(StrEnum):
    """ai-camp 会员等级；序为 NONE < BASIC < PREMIUM。"""

    NONE = "none"
    BASIC = "basic"
    PREMIUM = "premium"


class CampMembershipSku(StrEnum):
    """ai-camp 会员 SKU。"""

    ANNUAL_BASIC = "annual_basic"
    ANNUAL_PREMIUM = "annual_premium"


# SKU → 等级映射；基础设施层无需感知此规则，由领域层统一定义。
SKU_TIER_MAP: dict["CampMembershipSku", "CampMembershipTier"] = {
    CampMembershipSku.ANNUAL_BASIC: CampMembershipTier.BASIC,
    CampMembershipSku.ANNUAL_PREMIUM: CampMembershipTier.PREMIUM,
}


# 等级序值；门禁判定基于此序，禁止用枚举字符串字典序判断。
_TIER_ORDER: dict["CampMembershipTier", int] = {
    CampMembershipTier.NONE: 0,
    CampMembershipTier.BASIC: 1,
    CampMembershipTier.PREMIUM: 2,
}


class CampOrderStatus(StrEnum):
    """ai-camp 会员订单状态。"""

    PENDING = "pending"
    PAID = "paid"
    CLOSED = "closed"


class CampMembershipSnapshot(BaseModel):
    """挂在单个 camp 账号上的会员快照。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    tier: CampMembershipTier
    started_at: datetime | None
    expires_at: datetime | None
    is_active: bool
    remaining_days: int


class CampMembershipOrder(BaseModel):
    """一笔 ai-camp 会员订单聚合。"""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    account_id: int
    sku: CampMembershipSku
    amount_fen: int
    status: CampOrderStatus
    code_url: str | None
    transaction_id: str | None
    trade_state: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    notify_payload: str | None
    created_at: datetime
    updated_at: datetime


def tier_satisfies(current: CampMembershipTier, required: CampMembershipTier) -> bool:
    """判定当前等级是否满足所需等级；高档自动满足低档。"""

    return _TIER_ORDER[current] >= _TIER_ORDER[required]
