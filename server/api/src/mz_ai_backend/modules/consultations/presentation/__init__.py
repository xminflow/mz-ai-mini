"""Presentation exports for the consultations module.

Usage:
- Import `router` to expose consultation HTTP endpoints.

Development rules:
- Keep request validation and response mapping here.
- Do not place business logic in routers.
"""

from .router import router

__all__ = ["router"]
