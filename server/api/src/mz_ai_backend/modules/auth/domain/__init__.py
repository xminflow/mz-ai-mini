"""Domain exports for the auth module.

Usage:
- Import user entities and auth-specific exceptions from this package.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import User, UserStatus
from .exceptions import (
    CloudIdentityMissingException,
    UserAlreadyExistsException,
    UserDisabledException,
    UserNotFoundException,
)

__all__ = [
    "CloudIdentityMissingException",
    "User",
    "UserAlreadyExistsException",
    "UserDisabledException",
    "UserNotFoundException",
    "UserStatus",
]
