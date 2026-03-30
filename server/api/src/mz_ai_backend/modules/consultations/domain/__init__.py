"""Domain exports for the consultations module.

Usage:
- Import consultation entities through this package.

Development rules:
- Keep domain types stable and framework-agnostic.
- Avoid persistence or transport concerns in this layer.
"""

from .entities import ConsultationBusinessType, ConsultationRequest

__all__ = ["ConsultationBusinessType", "ConsultationRequest"]
