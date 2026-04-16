"""Public entrypoints for the case_research module.

Usage:
- Import `router` to register case research HTTP endpoints.

Development rules:
- Keep public exports limited to stable routing contracts.
- Hide implementation details behind package boundaries.
"""

from .presentation import router

__all__ = ["router"]
