"""Domain exports for the agent_auth module.

Usage:
- Import account entities and domain exceptions from this package.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import (
    AgentAccount,
    AgentAccountStatus,
    AgentAccessTokenRecord,
    AgentAuthSession,
    AgentEmailLoginChallenge,
    AgentWechatIdentity,
    AgentWechatLoginSession,
    AgentWechatLoginSessionStatus,
    AgentWechatSubscribeStatus,
)
from .exceptions import (
    AgentAccessTokenExpiredException,
    AgentAccountDisabledException,
    AgentEmailConfigMissingException,
    AgentEmailDeliveryFailedException,
    AgentEmailLoginChallengeExpiredException,
    AgentEmailLoginCodeInvalidException,
    AgentEmailSendCooldownException,
    AgentEmailTakenException,
    AgentRefreshTokenExpiredException,
    AgentSessionRevokedException,
    AgentWechatCallbackInvalidException,
    AgentWechatConfigMissingException,
    AgentWechatIdentityNotSubscribedException,
    AgentWechatLoginSessionExpiredException,
    AgentWechatLoginSessionPendingException,
    AgentUsernameInvalidFormatException,
    AgentUsernameTakenException,
)

__all__ = [
    "AgentAccessTokenExpiredException",
    "AgentAccessTokenRecord",
    "AgentAccount",
    "AgentAccountDisabledException",
    "AgentAccountStatus",
    "AgentAuthSession",
    "AgentEmailConfigMissingException",
    "AgentEmailDeliveryFailedException",
    "AgentEmailLoginChallenge",
    "AgentEmailLoginChallengeExpiredException",
    "AgentEmailLoginCodeInvalidException",
    "AgentEmailSendCooldownException",
    "AgentRefreshTokenExpiredException",
    "AgentSessionRevokedException",
    "AgentWechatCallbackInvalidException",
    "AgentWechatConfigMissingException",
    "AgentWechatIdentity",
    "AgentWechatIdentityNotSubscribedException",
    "AgentEmailTakenException",
    "AgentWechatLoginSession",
    "AgentWechatLoginSessionExpiredException",
    "AgentWechatLoginSessionPendingException",
    "AgentWechatLoginSessionStatus",
    "AgentWechatSubscribeStatus",
    "AgentUsernameInvalidFormatException",
    "AgentUsernameTakenException",
]
