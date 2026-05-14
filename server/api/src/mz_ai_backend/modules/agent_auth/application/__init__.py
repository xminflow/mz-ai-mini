"""Application exports for the agent_auth module.

Usage:
- Import DTOs and use cases through this package.

Development rules:
- Keep orchestration logic in use cases.
- Depend on ports instead of concrete infrastructure implementations.
"""

from .dtos import (
    AgentAccountRegistration,
    AgentAccountSummary,
    AgentAuthenticationResult,
    AgentEmailLoginChallengeCreate,
    AgentSessionIssue,
    AgentTokenPair,
    AgentWechatIdentityUpsert,
    AgentWechatLoginGrantIssue,
    AgentWechatLoginSessionCreate,
    AgentWechatLoginSessionStatusResult,
    CreateAgentWechatLoginSessionCommand,
    CreateAgentWechatLoginSessionResult,
    ExchangeAgentWechatLoginCommand,
    GetCurrentAgentAccountQuery,
    GetAgentWechatLoginSessionQuery,
    HandleAgentWechatCallbackCommand,
    LogoutAgentSessionCommand,
    LogoutAgentSessionResult,
    RequestAgentEmailLoginChallengeCommand,
    RequestAgentEmailLoginChallengeResult,
    RefreshAgentSessionCommand,
    VerifyAgentEmailLoginChallengeCommand,
    normalize_agent_email,
    normalize_agent_username,
)
from .use_cases import (
    CreateAgentWechatLoginSessionUseCase,
    ExchangeAgentWechatLoginUseCase,
    GetCurrentAgentAccountUseCase,
    GetAgentWechatLoginSessionUseCase,
    HandleAgentWechatCallbackUseCase,
    LogoutAgentSessionUseCase,
    RequestAgentEmailLoginChallengeUseCase,
    RefreshAgentSessionUseCase,
    VerifyAgentEmailLoginChallengeUseCase,
)

__all__ = [
    "AgentAccountRegistration",
    "AgentAccountSummary",
    "AgentAuthenticationResult",
    "AgentEmailLoginChallengeCreate",
    "AgentSessionIssue",
    "AgentTokenPair",
    "AgentWechatIdentityUpsert",
    "AgentWechatLoginGrantIssue",
    "AgentWechatLoginSessionCreate",
    "AgentWechatLoginSessionStatusResult",
    "CreateAgentWechatLoginSessionCommand",
    "CreateAgentWechatLoginSessionResult",
    "CreateAgentWechatLoginSessionUseCase",
    "ExchangeAgentWechatLoginCommand",
    "ExchangeAgentWechatLoginUseCase",
    "GetCurrentAgentAccountQuery",
    "GetCurrentAgentAccountUseCase",
    "GetAgentWechatLoginSessionQuery",
    "GetAgentWechatLoginSessionUseCase",
    "HandleAgentWechatCallbackCommand",
    "HandleAgentWechatCallbackUseCase",
    "LogoutAgentSessionCommand",
    "LogoutAgentSessionResult",
    "LogoutAgentSessionUseCase",
    "RequestAgentEmailLoginChallengeCommand",
    "RequestAgentEmailLoginChallengeResult",
    "RequestAgentEmailLoginChallengeUseCase",
    "RefreshAgentSessionCommand",
    "RefreshAgentSessionUseCase",
    "VerifyAgentEmailLoginChallengeCommand",
    "VerifyAgentEmailLoginChallengeUseCase",
    "normalize_agent_email",
    "normalize_agent_username",
]
