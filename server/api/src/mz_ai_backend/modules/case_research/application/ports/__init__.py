"""Application ports for the case_research module.

Usage:
- Import repository and service contracts through this package.

Development rules:
- Keep contracts stable and implementation-agnostic.
- Avoid framework-specific types in signatures.
"""

from .repositories import CaseResearchRepository
from .services import CurrentTimeProvider, SnowflakeIdGenerator, WechatPayGateway

__all__ = [
    "CaseResearchRepository",
    "CurrentTimeProvider",
    "SnowflakeIdGenerator",
    "WechatPayGateway",
]
