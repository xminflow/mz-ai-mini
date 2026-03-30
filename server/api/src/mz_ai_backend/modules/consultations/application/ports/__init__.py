"""Application ports for the consultations module.

Usage:
- Import repository and service contracts through this package.

Development rules:
- Keep contracts stable and implementation-agnostic.
- Avoid framework-specific types in signatures.
"""

from .repositories import ConsultationRequestRepository, ConsultationUserReader
from .services import CurrentTimeProvider, SnowflakeIdGenerator

__all__ = [
    "ConsultationRequestRepository",
    "ConsultationUserReader",
    "CurrentTimeProvider",
    "SnowflakeIdGenerator",
]
