"""Use case exports for the auth module.

Usage:
- Import auth use cases from this package.

Development rules:
- Keep use cases small and deterministic.
- Handle business branching here instead of routers.
"""

from .sync_current_mini_program_user import EnsureCurrentMiniProgramUserUseCase
from .update_current_mini_program_user_profile import (
    UpdateCurrentMiniProgramUserProfileUseCase,
)

__all__ = [
    "EnsureCurrentMiniProgramUserUseCase",
    "UpdateCurrentMiniProgramUserProfileUseCase",
]
