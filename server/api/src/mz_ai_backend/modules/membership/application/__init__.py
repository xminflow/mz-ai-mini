"""Application exports for the membership module.

Usage:
- Import membership DTOs and use cases through this package.

Development rules:
- Keep orchestration logic in use cases.
- Depend on ports instead of concrete infrastructure implementations.
"""

from .dtos import (
    CreateMembershipOrderCommand,
    CreateMembershipOrderResult,
    GetMembershipOrderQuery,
    GetMembershipOrderResult,
    HandleWechatPayNotifyCommand,
    HandleWechatPayNotifyResult,
    MiniProgramIdentity,
)
from .use_cases import (
    CreateMembershipOrderUseCase,
    GetMembershipOrderUseCase,
    HandleWechatPayNotifyUseCase,
)

__all__ = [
    "CreateMembershipOrderCommand",
    "CreateMembershipOrderResult",
    "CreateMembershipOrderUseCase",
    "GetMembershipOrderQuery",
    "GetMembershipOrderResult",
    "GetMembershipOrderUseCase",
    "HandleWechatPayNotifyCommand",
    "HandleWechatPayNotifyResult",
    "HandleWechatPayNotifyUseCase",
    "MiniProgramIdentity",
]
