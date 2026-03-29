"""Domain exports for the auth module.

Usage:
- Import user entities and auth-specific exceptions from this package.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import User, UserMembershipTier, UserStatus
from .exceptions import (
    CloudIdentityMissingException,
    UserAlreadyExistsException,
    UserDisabledException,
    UserNotFoundException,
)

__all__ = [
    "CloudIdentityMissingException",
    "User",
    "UserMembershipTier",
    "UserAlreadyExistsException",
    "UserDisabledException",
    "UserNotFoundException",
    "UserStatus",
]
