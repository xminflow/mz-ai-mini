from __future__ import annotations

from fastapi import FastAPI

from ..modules import (
    auth_router,
    business_cases_router,
    consultations_router,
    membership_router,
    system_router,
)
from .config import get_settings
from .exception_handlers import register_exception_handlers
from .logging import configure_logging
from .middleware import register_middlewares


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""

    settings = get_settings()
    configure_logging(settings)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
    )
    register_middlewares(app)
    register_exception_handlers(app)
    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(business_cases_router, prefix=settings.api_prefix)
    app.include_router(consultations_router, prefix=settings.api_prefix)
    app.include_router(membership_router, prefix=settings.api_prefix)
    app.include_router(system_router, prefix=settings.api_prefix)
    return app


__all__ = ["create_app"]
