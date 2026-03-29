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
    UserMembershipSummary,
    UpdateCurrentMiniProgramUserProfileCommand,
    UpdateCurrentMiniProgramUserProfileResult,
    UserRegistration,
    build_membership_summary,
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
    "UserMembershipSummary",
    "UpdateCurrentMiniProgramUserProfileCommand",
    "UpdateCurrentMiniProgramUserProfileResult",
    "UpdateCurrentMiniProgramUserProfileUseCase",
    "UserRegistration",
    "build_membership_summary",
]
