"""Application ports for the membership module.

Usage:
- Import repository and service contracts through this package.

Development rules:
- Keep contracts stable and implementation-agnostic.
- Avoid framework-specific types in signatures.
"""

from .repositories import MembershipRepository
from .services import CurrentTimeProvider, SnowflakeIdGenerator, WechatPayGateway

__all__ = [
    "CurrentTimeProvider",
    "MembershipRepository",
    "SnowflakeIdGenerator",
    "WechatPayGateway",
]
