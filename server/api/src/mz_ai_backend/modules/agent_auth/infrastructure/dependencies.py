from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import (
    get_async_session_dependency,
    get_settings_dependency,
)
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator

from ..application import (
    CreateAgentWechatLoginSessionUseCase,
    ExchangeAgentWechatLoginUseCase,
    GetCurrentAgentAccountUseCase,
    GetAgentWechatLoginSessionUseCase,
    HandleAgentWechatCallbackUseCase,
    LogoutAgentSessionUseCase,
    RequestAgentEmailLoginChallengeUseCase,
    RefreshAgentSessionUseCase,
    VerifyAgentEmailLoginChallengeUseCase,
)
from ..domain import AgentAccessTokenExpiredException
from .email_delivery import SmtpEmailLoginDeliveryGateway
from .repositories import SqlAlchemyAgentAccountRepository
from .wechat_official import WechatOfficialAccountGateway


class Sha256TokenService:
    """Opaque token generator and stable token hasher."""

    def __init__(self, *, pepper: str | None) -> None:
        import hashlib
        import secrets

        from mz_ai_backend.core.exceptions import InternalServerException

        if pepper is None or pepper.strip() == "":
            raise InternalServerException(message="Agent auth token pepper is not configured.")
        self._pepper = pepper
        self._hashlib = hashlib
        self._secrets = secrets

    def generate_token(self) -> str:
        return self._secrets.token_urlsafe(48)

    def hash_token(self, token: str) -> str:
        return self._hashlib.sha256(f"{self._pepper}:{token}".encode("utf-8")).hexdigest()


def get_agent_account_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyAgentAccountRepository:
    """Construct the agent auth repository."""

    return SqlAlchemyAgentAccountRepository(session=session)


def get_token_service(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> Sha256TokenService:
    """Construct the token service."""

    return Sha256TokenService(pepper=settings.agent_auth_token_pepper)


def get_email_login_delivery_gateway(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SmtpEmailLoginDeliveryGateway:
    """Construct the email login delivery gateway."""

    return SmtpEmailLoginDeliveryGateway(
        host=settings.agent_auth_email_smtp_host,
        port=settings.agent_auth_email_smtp_port,
        username=settings.agent_auth_email_smtp_username,
        password=settings.agent_auth_email_smtp_password,
        use_ssl=settings.agent_auth_email_smtp_use_ssl,
        from_address=settings.agent_auth_email_from_address,
        from_name=settings.agent_auth_email_from_name,
    )


def get_official_wechat_gateway(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> WechatOfficialAccountGateway:
    """Construct the official account gateway."""

    return WechatOfficialAccountGateway(
        appid=settings.wechat_official_appid.strip() if settings.wechat_official_appid else "",
        app_secret=(
            settings.wechat_official_app_secret.strip()
            if settings.wechat_official_app_secret
            else ""
        ),
        token=settings.wechat_official_token.strip() if settings.wechat_official_token else "",
    )


def get_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """Construct the business id generator."""

    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_refresh_agent_session_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_token_service)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> RefreshAgentSessionUseCase:
    """Construct the refresh use case."""

    return RefreshAgentSessionUseCase(
        account_repository=account_repository,
        token_service=token_service,
        snowflake_id_generator=snowflake_id_generator,
        access_token_ttl_seconds=settings.agent_auth_access_token_ttl_seconds,
        refresh_token_ttl_days=settings.agent_auth_refresh_token_ttl_days,
    )


def get_logout_agent_session_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_token_service)],
) -> LogoutAgentSessionUseCase:
    """Construct the logout use case."""

    return LogoutAgentSessionUseCase(
        account_repository=account_repository,
        token_service=token_service,
    )


def get_current_agent_access_token(
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> str:
    """Extract the bearer token from the Authorization header."""

    if authorization is None:
        raise AgentAccessTokenExpiredException()
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        raise AgentAccessTokenExpiredException()
    token = authorization[len(prefix):].strip()
    if token == "":
        raise AgentAccessTokenExpiredException()
    return token


def get_get_current_agent_account_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_token_service)],
) -> GetCurrentAgentAccountUseCase:
    """Construct the current account use case."""

    return GetCurrentAgentAccountUseCase(
        account_repository=account_repository,
        token_service=token_service,
    )


def get_create_wechat_login_session_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    wechat_gateway: Annotated[WechatOfficialAccountGateway, Depends(get_official_wechat_gateway)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> CreateAgentWechatLoginSessionUseCase:
    """Construct the create WeChat login session use case."""

    return CreateAgentWechatLoginSessionUseCase(
        account_repository=account_repository,
        wechat_gateway=wechat_gateway,
        snowflake_id_generator=snowflake_id_generator,
        login_session_ttl_seconds=settings.agent_auth_wechat_login_session_ttl_seconds,
        qr_expire_seconds=settings.wechat_official_qr_expire_seconds,
    )


def get_request_email_login_challenge_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_token_service)],
    email_delivery_gateway: Annotated[
        SmtpEmailLoginDeliveryGateway,
        Depends(get_email_login_delivery_gateway),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> RequestAgentEmailLoginChallengeUseCase:
    """Construct the email login challenge request use case."""

    return RequestAgentEmailLoginChallengeUseCase(
        account_repository=account_repository,
        token_service=token_service,
        email_delivery_gateway=email_delivery_gateway,
        snowflake_id_generator=snowflake_id_generator,
        code_ttl_seconds=settings.agent_auth_email_code_ttl_seconds,
        send_cooldown_seconds=settings.agent_auth_email_send_cooldown_seconds,
    )


def get_get_wechat_login_session_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
) -> GetAgentWechatLoginSessionUseCase:
    """Construct the query WeChat login session use case."""

    return GetAgentWechatLoginSessionUseCase(account_repository=account_repository)


def get_exchange_wechat_login_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_token_service)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> ExchangeAgentWechatLoginUseCase:
    """Construct the exchange WeChat login use case."""

    return ExchangeAgentWechatLoginUseCase(
        account_repository=account_repository,
        token_service=token_service,
        snowflake_id_generator=snowflake_id_generator,
        access_token_ttl_seconds=settings.agent_auth_access_token_ttl_seconds,
        refresh_token_ttl_days=settings.agent_auth_refresh_token_ttl_days,
    )


def get_handle_wechat_callback_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    wechat_gateway: Annotated[WechatOfficialAccountGateway, Depends(get_official_wechat_gateway)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
) -> HandleAgentWechatCallbackUseCase:
    """Construct the WeChat callback handler use case."""

    return HandleAgentWechatCallbackUseCase(
        account_repository=account_repository,
        wechat_gateway=wechat_gateway,
        snowflake_id_generator=snowflake_id_generator,
    )


def get_verify_email_login_challenge_use_case(
    account_repository: Annotated[
        SqlAlchemyAgentAccountRepository,
        Depends(get_agent_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_token_service)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> VerifyAgentEmailLoginChallengeUseCase:
    """Construct the email login challenge verification use case."""

    return VerifyAgentEmailLoginChallengeUseCase(
        account_repository=account_repository,
        token_service=token_service,
        snowflake_id_generator=snowflake_id_generator,
        access_token_ttl_seconds=settings.agent_auth_access_token_ttl_seconds,
        refresh_token_ttl_days=settings.agent_auth_refresh_token_ttl_days,
    )
