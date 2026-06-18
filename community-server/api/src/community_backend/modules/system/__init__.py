"""Public entrypoints for the system module.

Usage:
- Import `router` to register system-facing HTTP endpoints.

Development rules:
- Keep module public API limited to routers and approved DTOs.
- Do not expose internal dependency wiring outside this package.
"""

from .presentation import router

__all__ = ["router"]
