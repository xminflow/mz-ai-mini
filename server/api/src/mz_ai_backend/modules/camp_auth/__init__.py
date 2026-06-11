"""Public entrypoints for the camp_auth module.

Usage:
- Import `router` to register camp_auth HTTP endpoints.

Development rules:
- Keep public exports limited to stable routing contracts.
- Hide implementation details behind package boundaries.
"""

from .presentation.router import router

__all__ = ["router"]
