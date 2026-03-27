"""Presentation exports for the business_cases module.

Usage:
- Import `router` to expose business case HTTP endpoints.
- Validate case-level `tags` at the HTTP boundary.

Development rules:
- Keep request validation and response mapping here.
- Do not place business logic in routers.
"""

from .router import router

__all__ = ["router"]
