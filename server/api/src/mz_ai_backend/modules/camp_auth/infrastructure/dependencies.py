from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import (
    get_async_session_dependency,
    get_settings_dependency,
)
from mz_ai_backend.shared import SnowflakeGenerator

# 复用 agent_auth 的微信网关和雪花 ID 提供者（camp_auth 不重复实现）
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import (
    Sha256TokenService,
    get_official_wechat_gateway,
    get_snowflake_id_generator,
)

from ..application.use_cases import (
    CreateCampWechatLoginSessionUseCase,
    DevCampFakeLoginUseCase,
    ExchangeCampWechatLoginUseCase,
    GetCurrentCampAccountUseCase,
    GetCampWechatLoginSessionUseCase,
    HandleCampWechatCallbackUseCase,
    LogoutCampSessionUseCase,
    RefreshCampSessionUseCase,
)
from ..domain import CampAccessTokenExpiredException
from .repositories import SqlAlchemyCampAccountRepository


def get_camp_account_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyCampAccountRepository:
    """Construct the camp auth repository."""

    return SqlAlchemyCampAccountRepository(session=session)


def get_camp_token_service(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> Sha256TokenService:
    """Construct the camp token service using the camp pepper."""

    return Sha256TokenService(pepper=settings.camp_auth_token_pepper)


def get_current_camp_access_token(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> str:
    """Extract the bearer token from the Authorization header for camp routes."""

    if authorization is None:
        raise CampAccessTokenExpiredException()
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        raise CampAccessTokenExpiredException()
    token = authorization[len(prefix):].strip()
    if token == "":
        raise CampAccessTokenExpiredException()
    return token


def get_refresh_camp_session_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_camp_token_service)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> RefreshCampSessionUseCase:
    """Construct the camp refresh use case."""

    return RefreshCampSessionUseCase(
        account_repository=account_repository,
        token_service=token_service,
        snowflake_id_generator=snowflake_id_generator,
        access_token_ttl_seconds=settings.camp_auth_access_token_ttl_seconds,
        refresh_token_ttl_days=settings.camp_auth_refresh_token_ttl_days,
    )


def get_logout_camp_session_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_camp_token_service)],
) -> LogoutCampSessionUseCase:
    """Construct the camp logout use case."""

    return LogoutCampSessionUseCase(
        account_repository=account_repository,
        token_service=token_service,
    )


def get_get_current_camp_account_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_camp_token_service)],
) -> GetCurrentCampAccountUseCase:
    """Construct the camp current account use case."""

    return GetCurrentCampAccountUseCase(
        account_repository=account_repository,
        token_service=token_service,
    )


def get_create_wechat_login_session_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    wechat_gateway: Annotated[object, Depends(get_official_wechat_gateway)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> CreateCampWechatLoginSessionUseCase:
    """Construct the camp create WeChat login session use case."""

    return CreateCampWechatLoginSessionUseCase(
        account_repository=account_repository,
        wechat_gateway=wechat_gateway,
        snowflake_id_generator=snowflake_id_generator,
        login_session_ttl_seconds=settings.camp_auth_wechat_login_session_ttl_seconds,
        qr_expire_seconds=settings.wechat_official_qr_expire_seconds,
    )


def get_get_wechat_login_session_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
) -> GetCampWechatLoginSessionUseCase:
    """Construct the camp query WeChat login session use case."""

    return GetCampWechatLoginSessionUseCase(account_repository=account_repository)


def get_exchange_wechat_login_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_camp_token_service)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> ExchangeCampWechatLoginUseCase:
    """Construct the camp exchange WeChat login use case."""

    return ExchangeCampWechatLoginUseCase(
        account_repository=account_repository,
        token_service=token_service,
        snowflake_id_generator=snowflake_id_generator,
        access_token_ttl_seconds=settings.camp_auth_access_token_ttl_seconds,
        refresh_token_ttl_days=settings.camp_auth_refresh_token_ttl_days,
    )


def get_handle_camp_wechat_callback_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
) -> HandleCampWechatCallbackUseCase:
    """Construct the camp WeChat callback handler use case (no auto-reply)."""

    return HandleCampWechatCallbackUseCase(
        account_repository=account_repository,
        snowflake_id_generator=snowflake_id_generator,
    )


def get_dev_camp_fake_login_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_camp_token_service)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> DevCampFakeLoginUseCase:
    """Construct the dev-only camp fake login use case (env=production 时路由层 404 拒绝)。"""

    return DevCampFakeLoginUseCase(
        account_repository=account_repository,
        token_service=token_service,
        snowflake_id_generator=snowflake_id_generator,
        access_token_ttl_seconds=settings.camp_auth_access_token_ttl_seconds,
        refresh_token_ttl_days=settings.camp_auth_refresh_token_ttl_days,
    )
