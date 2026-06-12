"""Application exports for the camp_auth module.

Usage:
- Import DTOs through this package.

Development rules:
- Keep orchestration logic in use cases.
- Depend on ports instead of concrete infrastructure implementations.
"""

from .dtos import (
    CampAccountRegistration,
    CampAccountSummary,
    CampAuthenticationResult,
    CampMembershipSummary,
    CampSessionIssue,
    CampTokenPair,
    CampWechatIdentityUpsert,
    CampWechatLoginGrantIssue,
    CampWechatLoginSessionCreate,
    CampWechatLoginSessionStatusResult,
    CreateCampWechatLoginSessionCommand,
    CreateCampWechatLoginSessionResult,
    DEV_FAKE_LOGIN_DEFAULT_USERNAME,
    DevCampFakeLoginCommand,
    ExchangeCampWechatLoginCommand,
    GetCurrentCampAccountQuery,
    GetCampWechatLoginSessionQuery,
    LogoutCampSessionCommand,
    LogoutCampSessionResult,
    RefreshCampSessionCommand,
    normalize_camp_username,
)

__all__ = [
    "CampAccountRegistration",
    "CampAccountSummary",
    "CampAuthenticationResult",
    "CampMembershipSummary",
    "CampSessionIssue",
    "CampTokenPair",
    "CampWechatIdentityUpsert",
    "CampWechatLoginGrantIssue",
    "CampWechatLoginSessionCreate",
    "CampWechatLoginSessionStatusResult",
    "CreateCampWechatLoginSessionCommand",
    "CreateCampWechatLoginSessionResult",
    "DEV_FAKE_LOGIN_DEFAULT_USERNAME",
    "DevCampFakeLoginCommand",
    "ExchangeCampWechatLoginCommand",
    "GetCurrentCampAccountQuery",
    "GetCampWechatLoginSessionQuery",
    "LogoutCampSessionCommand",
    "LogoutCampSessionResult",
    "RefreshCampSessionCommand",
    "normalize_camp_username",
]
