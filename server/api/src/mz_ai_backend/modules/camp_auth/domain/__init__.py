"""Domain exports for the camp_auth module.

Usage:
- Import account entities and domain exceptions from this package.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import (
    CampAccount,
    CampAccountStatus,
    CampAccessTokenRecord,
    CampAuthSession,
    CampWechatIdentity,
    CampWechatLoginSession,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)
from .exceptions import (
    CampAccessTokenExpiredException,
    CampAccountDisabledException,
    CampRefreshTokenExpiredException,
    CampSessionRevokedException,
    CampWechatCallbackInvalidException,
    CampWechatConfigMissingException,
    CampWechatIdentityNotSubscribedException,
    CampWechatLoginSessionConsumedException,
    CampWechatLoginSessionExpiredException,
    CampWechatLoginSessionPendingException,
)

__all__ = [
    "CampAccessTokenExpiredException",
    "CampAccessTokenRecord",
    "CampAccount",
    "CampAccountDisabledException",
    "CampAccountStatus",
    "CampAuthSession",
    "CampRefreshTokenExpiredException",
    "CampSessionRevokedException",
    "CampWechatCallbackInvalidException",
    "CampWechatConfigMissingException",
    "CampWechatIdentity",
    "CampWechatIdentityNotSubscribedException",
    "CampWechatLoginSession",
    "CampWechatLoginSessionConsumedException",
    "CampWechatLoginSessionExpiredException",
    "CampWechatLoginSessionPendingException",
    "CampWechatLoginSessionStatus",
    "CampWechatSubscribeStatus",
]
