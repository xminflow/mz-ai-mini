"""Public entrypoints for the membership module.

Usage:
- Import `router` to register membership HTTP endpoints.

Development rules:
- Keep public exports limited to stable routing contracts.
- Hide implementation details behind package boundaries.
"""

from .presentation import router

__all__ = ["router"]
