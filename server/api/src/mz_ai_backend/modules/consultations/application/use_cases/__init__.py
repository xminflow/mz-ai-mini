"""Use case exports for the consultations module.

Usage:
- Import consultation use cases from this package.

Development rules:
- Keep use cases small and deterministic.
- Handle business branching here instead of routers.
"""

from .create_consultation_request import CreateConsultationRequestUseCase

__all__ = ["CreateConsultationRequestUseCase"]
