from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from ..modules import system_router
from .config import get_settings
from .exception_handlers import register_exception_handlers
from .logging import configure_logging
from .middleware import register_middlewares


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:
    # 本期无后台任务；保留 lifespan 钩子以便后续模块注册启动/关闭逻辑。
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    settings = get_settings()
    configure_logging(settings)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        lifespan=_lifespan,
    )
    register_middlewares(app)
    register_exception_handlers(app)
    app.include_router(system_router, prefix=settings.api_prefix)
    return app


__all__ = ["create_app"]
