"""Application exports for the consultations module.

Usage:
- Import consultation DTOs and use cases through this package.

Development rules:
- Keep orchestration logic in use cases.
- Depend on ports instead of concrete infrastructure implementations.
"""

from .dtos import (
    AuthenticatedConsultationUser,
    ConsultationRequestRegistration,
    CreateConsultationRequestCommand,
    CreateConsultationRequestResult,
)
from .use_cases import CreateConsultationRequestUseCase

__all__ = [
    "AuthenticatedConsultationUser",
    "ConsultationRequestRegistration",
    "CreateConsultationRequestCommand",
    "CreateConsultationRequestResult",
    "CreateConsultationRequestUseCase",
]
