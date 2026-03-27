"""Application ports for the auth module.

Usage:
- Import repository and service contracts from this package.

Development rules:
- Keep ports small, explicit, and stable.
- Depend on contracts in use cases, not implementations.
"""

from .repositories import UserRepository
from .services import SnowflakeIdGenerator

__all__ = [
    "SnowflakeIdGenerator",
    "UserRepository",
]
