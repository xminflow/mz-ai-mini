from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..modules import (
    admin_auth_router,
    agent_auth_router,
    camp_auth_router,
    camp_membership_router,
    wechat_callback_router,
    account_membership_router,
    auth_router,
    blogger_insights_router,
    business_cases_router,
    case_research_router,
    consultations_router,
    member_submissions_router,
    membership_router,
    system_router,
    track_analyses_router,
)
from ..modules.account_membership.infrastructure import (
    PendingOrderSweepScheduler,
    build_pending_order_sweep_scheduler,
)
from ..modules.account_membership.infrastructure.dependencies import (
    get_website_wechat_pay_gateway,
)
from ..shared.wechat_pay import WechatPayConfigMissingException
from .config import Settings, get_settings
from .database import get_async_session_maker
from .exception_handlers import register_exception_handlers
from .logging import configure_logging, get_logger
from .middleware import register_middlewares

_app_logger = get_logger("mz_ai_backend.app")


def _build_sweep_scheduler(settings: Settings) -> PendingOrderSweepScheduler | None:
    if not settings.account_membership_sweep_enabled:
        return None
    if settings.database_url is None:
        _app_logger.warning("sweep.scheduler.skipped reason=database_url_missing")
        return None
    try:
        wechat_pay_gateway = get_website_wechat_pay_gateway(settings)
    except WechatPayConfigMissingException:
        _app_logger.warning("sweep.scheduler.skipped reason=wechat_pay_config_missing")
        return None

    session_maker = get_async_session_maker(settings.database_url)
    return build_pending_order_sweep_scheduler(
        settings=settings,
        session_maker=session_maker,
        wechat_pay_gateway=wechat_pay_gateway,
    )


@asynccontextmanager
async def _lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    scheduler = _build_sweep_scheduler(settings)
    if scheduler is not None:
        await scheduler.start()
        app.state.sweep_scheduler = scheduler
    try:
        yield
    finally:
        scheduler = getattr(app.state, "sweep_scheduler", None)
        if scheduler is not None:
            await scheduler.stop()


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
    _admin_origins = [o.strip() for o in (settings.admin_cors_origins or "").split(",") if o.strip()]
    if _admin_origins:
        # 管理端用 Bearer 头鉴权（非 cookie），故 allow_credentials=False
        app.add_middleware(
            CORSMiddleware,
            allow_origins=_admin_origins,
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    register_exception_handlers(app)
    app.include_router(admin_auth_router, prefix=settings.api_prefix)
    app.include_router(agent_auth_router, prefix=settings.api_prefix)
    app.include_router(camp_auth_router, prefix=settings.api_prefix)
    app.include_router(camp_membership_router, prefix=settings.api_prefix)
    app.include_router(wechat_callback_router, prefix=settings.api_prefix)
    app.include_router(account_membership_router, prefix=settings.api_prefix)
    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(blogger_insights_router, prefix=settings.api_prefix)
    app.include_router(business_cases_router, prefix=settings.api_prefix)
    app.include_router(case_research_router, prefix=settings.api_prefix)
    app.include_router(consultations_router, prefix=settings.api_prefix)
    app.include_router(member_submissions_router, prefix=settings.api_prefix)
    app.include_router(membership_router, prefix=settings.api_prefix)
    app.include_router(system_router, prefix=settings.api_prefix)
    app.include_router(track_analyses_router, prefix=settings.api_prefix)
    return app


__all__ = ["create_app"]
