"""Public module registry for application routers.

Usage:
- Import exported routers from this package when wiring the application.

Development rules:
- Re-export routers only.
- Keep module internals behind their own package boundaries.
"""

from .system import router as system_router

__all__ = ["system_router"]
