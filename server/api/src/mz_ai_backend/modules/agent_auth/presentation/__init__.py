"""Presentation exports for the agent_auth module.

Usage:
- Import `router` to expose agent_auth HTTP endpoints.

Development rules:
- Keep request validation and response mapping here.
- Do not place business logic in routers.
"""

from .router import router

__all__ = ["router"]
