"""Shared FastAPI dependency providers.

Usage:
- Import `get_settings_dependency` for request-time access to settings.
- Import `get_async_session_dependency` for request-time database access.

Development rules:
- Keep dependency providers thin and side-effect free.
- Delegate object construction to module-specific dependency files when possible.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .config import Settings, get_settings
from .database import get_async_session

__all__ = [
    "get_async_session_dependency",
    "get_settings_dependency",
]


def get_settings_dependency() -> Settings:
    """Expose cached settings through FastAPI dependency injection."""

    return get_settings()


async def get_async_session_dependency(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> AsyncIterator[AsyncSession]:
    """Expose an async database session through FastAPI dependency injection."""

    async for session in get_async_session(settings):
        yield session
