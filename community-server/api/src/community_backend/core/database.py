"""Database primitives shared across backend modules.

Usage:
- Import `Base` for ORM models.
- Import dependency helpers through `core.dependencies`.

Development rules:
- Keep engine and session factory creation centralized here.
- Keep ORM model declarations outside this package.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from functools import lru_cache

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from .config import Settings
from .exceptions import InternalServerException


class Base(DeclarativeBase):
    """Base class for ORM models."""


@lru_cache(maxsize=8)
def get_async_engine(database_url: str) -> AsyncEngine:
    """Return a cached async engine for the configured database."""

    return create_async_engine(
        database_url,
        pool_pre_ping=True,
        future=True,
    )


@lru_cache(maxsize=8)
def get_async_session_maker(database_url: str) -> async_sessionmaker[AsyncSession]:
    """Return a cached async session factory."""

    return async_sessionmaker(
        bind=get_async_engine(database_url),
        expire_on_commit=False,
        autoflush=False,
    )


async def get_async_session(settings: Settings) -> AsyncIterator[AsyncSession]:
    """Yield a request-scoped async database session."""

    if settings.database_url is None:
        raise InternalServerException(message="Database is not configured.")

    session_maker = get_async_session_maker(settings.database_url)
    async with session_maker() as session:
        yield session


def clear_database_caches() -> None:
    """Clear cached database engines and session factories."""

    get_async_session_maker.cache_clear()
    get_async_engine.cache_clear()
