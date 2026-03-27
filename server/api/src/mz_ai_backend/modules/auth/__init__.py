"""Public entrypoints for the auth module.

Usage:
- Import `router` to register auth HTTP endpoints.

Development rules:
- Keep public exports limited to stable routing contracts.
- Hide implementation details behind package boundaries.
"""

from .presentation import router

__all__ = ["router"]
