"""Application exports for the auth module.

Usage:
- Import auth DTOs and use cases through this package.

Development rules:
- Keep orchestration logic in use cases.
- Depend on ports instead of concrete infrastructure implementations.
"""

from .dtos import (
    AuthorizedUserProfile,
    AuthenticatedUserSummary,
    EnsureCurrentMiniProgramUserCommand,
    EnsureCurrentMiniProgramUserResult,
    MiniProgramIdentity,
    UpdateCurrentMiniProgramUserProfileCommand,
    UpdateCurrentMiniProgramUserProfileResult,
    UserRegistration,
)
from .use_cases import (
    EnsureCurrentMiniProgramUserUseCase,
    UpdateCurrentMiniProgramUserProfileUseCase,
)

__all__ = [
    "AuthorizedUserProfile",
    "AuthenticatedUserSummary",
    "EnsureCurrentMiniProgramUserCommand",
    "EnsureCurrentMiniProgramUserResult",
    "EnsureCurrentMiniProgramUserUseCase",
    "MiniProgramIdentity",
    "UpdateCurrentMiniProgramUserProfileCommand",
    "UpdateCurrentMiniProgramUserProfileResult",
    "UpdateCurrentMiniProgramUserProfileUseCase",
    "UserRegistration",
]
