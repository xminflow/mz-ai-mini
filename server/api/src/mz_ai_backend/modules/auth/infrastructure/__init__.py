"""Infrastructure exports for the auth module.

Usage:
- Import auth dependency factories and repository implementations from this package.

Development rules:
- Keep framework and persistence details here.
- Convert infrastructure objects into domain entities before returning.
"""

from .dependencies import (
    get_current_mini_program_identity,
    get_ensure_current_mini_program_user_use_case,
    get_user_repository,
    get_update_current_mini_program_user_profile_use_case,
)
from .repositories import SqlAlchemyUserRepository

__all__ = [
    "SqlAlchemyUserRepository",
    "get_current_mini_program_identity",
    "get_ensure_current_mini_program_user_use_case",
    "get_user_repository",
    "get_update_current_mini_program_user_profile_use_case",
]
