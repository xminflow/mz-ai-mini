"""Port exports for the camp_auth module.

Usage:
- Import repository contract from this package.
- Service ports (TokenService, OfficialWechatGateway) are reused from agent_auth.

Development rules:
- Keep ports minimal and oriented around use case needs.
- Depend on abstractions only.
"""

from .repositories import CampAccountRepository
from mz_ai_backend.modules.agent_auth.application.ports.services import (
    OfficialWechatGateway,
    OfficialWechatInboundMessage,
    OfficialWechatQrTicket,
    OfficialWechatUserProfile,
    TokenService,
)

__all__ = [
    "CampAccountRepository",
    "OfficialWechatGateway",
    "OfficialWechatInboundMessage",
    "OfficialWechatQrTicket",
    "OfficialWechatUserProfile",
    "TokenService",
]
