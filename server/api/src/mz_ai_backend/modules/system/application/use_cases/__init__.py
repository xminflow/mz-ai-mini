"""Use case exports for the system module.

Usage:
- Import `GetHealthStatusUseCase` from this package within the module boundary.

Development rules:
- Keep use cases small and deterministic.
- Hide concrete object construction behind infrastructure dependencies.
"""

from .get_health_status import GetHealthStatusUseCase

__all__ = ["GetHealthStatusUseCase"]
