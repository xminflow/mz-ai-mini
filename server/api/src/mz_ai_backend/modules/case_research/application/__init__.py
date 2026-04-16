"""Application exports for the case_research module.

Usage:
- Import case research DTOs and use cases through this package.

Development rules:
- Keep orchestration logic in use cases.
- Depend on ports instead of concrete infrastructure implementations.
"""

from .dtos import (
    CaseResearchRequestSummary,
    CreateCaseResearchOrderCommand,
    CreateCaseResearchOrderResult,
    CreatePublicCaseResearchRequestCommand,
    CreatePublicCaseResearchRequestResult,
    GetCaseResearchOrderQuery,
    GetCaseResearchOrderResult,
    HandleWechatPayNotifyCommand,
    HandleWechatPayNotifyResult,
    ListUserCaseResearchRequestsQuery,
    ListUserCaseResearchRequestsResult,
    MiniProgramIdentity,
)
from .use_cases import (
    CreateCaseResearchOrderUseCase,
    CreatePublicCaseResearchRequestUseCase,
    GetCaseResearchOrderUseCase,
    HandleWechatPayNotifyUseCase,
    ListUserCaseResearchRequestsUseCase,
)

__all__ = [
    "CaseResearchRequestSummary",
    "CreateCaseResearchOrderCommand",
    "CreateCaseResearchOrderResult",
    "CreateCaseResearchOrderUseCase",
    "CreatePublicCaseResearchRequestCommand",
    "CreatePublicCaseResearchRequestResult",
    "CreatePublicCaseResearchRequestUseCase",
    "GetCaseResearchOrderQuery",
    "GetCaseResearchOrderResult",
    "GetCaseResearchOrderUseCase",
    "HandleWechatPayNotifyCommand",
    "HandleWechatPayNotifyResult",
    "HandleWechatPayNotifyUseCase",
    "ListUserCaseResearchRequestsQuery",
    "ListUserCaseResearchRequestsResult",
    "ListUserCaseResearchRequestsUseCase",
    "MiniProgramIdentity",
]
