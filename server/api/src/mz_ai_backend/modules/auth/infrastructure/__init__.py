"""Infrastructure exports for the auth module.

Usage:
- Import auth dependency factories and repository implementations from this package.

Development rules:
- Keep framework and persistence details here.
- Convert infrastructure objects into domain entities before returning.
"""

from .dependencies import (
    get_ensure_current_mini_program_user_use_case,
    get_update_current_mini_program_user_profile_use_case,
)

__all__ = [
    "get_ensure_current_mini_program_user_use_case",
    "get_update_current_mini_program_user_profile_use_case",
]
