"""Presentation exports for the camp_auth module.

Usage:
- Import `router` to register camp_auth HTTP endpoints.

Development rules:
- Keep HTTP concerns here; delegate business logic to use cases.
"""

from .router import router

__all__ = ["router"]
