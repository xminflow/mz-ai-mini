"""Presentation exports for the system module.

Usage:
- Import `router` to expose module HTTP endpoints.

Development rules:
- Keep request/response adaptation here.
- Do not embed business logic in router functions.
"""

from .router import router

__all__ = ["router"]
