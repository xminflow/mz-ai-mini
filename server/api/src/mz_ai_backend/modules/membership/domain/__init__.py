"""Domain exports for the membership module.

Usage:
- Import membership entities and exceptions from this package.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import (
    NORMAL_MEMBERSHIP_DURATION_DAYS,
    NORMAL_MEMBERSHIP_PRICE_FEN,
    MembershipOrder,
    MembershipOrderStatus,
    MembershipTier,
    UserMembershipSnapshot,
)
from .exceptions import (
    MembershipAlreadyActiveException,
    MembershipOrderNotFoundException,
    MembershipOrderStatusInvalidException,
    MembershipPlanNotOpenException,
    WechatPayConfigMissingException,
    WechatPayNotifyInvalidException,
    WechatPayNotifyMismatchException,
    WechatPayOrderCreateFailedException,
)

__all__ = [
    "MembershipAlreadyActiveException",
    "MembershipOrder",
    "MembershipOrderNotFoundException",
    "MembershipOrderStatus",
    "MembershipOrderStatusInvalidException",
    "MembershipPlanNotOpenException",
    "MembershipTier",
    "NORMAL_MEMBERSHIP_DURATION_DAYS",
    "NORMAL_MEMBERSHIP_PRICE_FEN",
    "UserMembershipSnapshot",
    "WechatPayConfigMissingException",
    "WechatPayNotifyInvalidException",
    "WechatPayNotifyMismatchException",
    "WechatPayOrderCreateFailedException",
]
