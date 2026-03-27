"""Public entrypoints for the business_cases module.

Usage:
- Import `router` to register business case HTTP endpoints.

Development rules:
- Keep public exports limited to stable routing contracts.
- Hide implementation details behind package boundaries.
"""

from .presentation import router

__all__ = ["router"]
