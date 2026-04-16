"""Presentation exports for the case_research module.

Usage:
- Import `router` to register case research HTTP endpoints.

Development rules:
- Keep route handlers thin; delegate all logic to use cases.
"""

from .router import router

__all__ = ["router"]
