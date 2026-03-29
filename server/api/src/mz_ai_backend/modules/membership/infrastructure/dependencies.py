from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
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
    CreateMembershipOrderUseCase,
    GetMembershipOrderUseCase,
    HandleWechatPayNotifyUseCase,
    MiniProgramIdentity,
)
from ..domain import WechatPayConfigMissingException
from .repositories import SqlAlchemyMembershipRepository
from .wechat_pay_gateway import WechatPayV3Gateway


class SystemCurrentTimeProvider:
    """Return current naive UTC datetime for persistence."""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def _resolve_private_key(settings: Settings) -> str:
    if settings.wechat_pay_private_key and settings.wechat_pay_private_key.strip():
        return settings.wechat_pay_private_key

    if settings.wechat_pay_private_key_path and settings.wechat_pay_private_key_path.strip():
        key_path = Path(settings.wechat_pay_private_key_path).resolve()
        if key_path.exists():
            return key_path.read_text(encoding="utf-8")

    raise WechatPayConfigMissingException()


def get_membership_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyMembershipRepository:
    """Construct membership repository."""

    return SqlAlchemyMembershipRepository(session=session)


def get_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """Construct the business id generator."""

    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_current_time_provider() -> SystemCurrentTimeProvider:
    """Construct current time provider."""

    return SystemCurrentTimeProvider()


def get_current_mini_program_identity(
    openid: Annotated[str | None, Header(alias="X-WX-OPENID")] = None,
    union_id: Annotated[str | None, Header(alias="X-WX-UNIONID")] = None,
    app_id: Annotated[str | None, Header(alias="X-WX-APPID")] = None,
) -> MiniProgramIdentity:
    """Read trusted cloud identity from request headers."""

    if openid is None or openid.strip() == "":
        from mz_ai_backend.modules.auth.domain import CloudIdentityMissingException

        raise CloudIdentityMissingException()

    return MiniProgramIdentity(
        openid=openid.strip(),
        union_id=union_id.strip() if union_id else None,
        app_id=app_id.strip() if app_id else None,
    )


def get_wechat_pay_gateway(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> WechatPayV3Gateway:
    """Construct WeChat Pay APIv3 gateway."""

    required_values = (
        settings.wechat_pay_mchid,
        settings.wechat_pay_appid,
        settings.wechat_pay_cert_serial_no,
        settings.wechat_pay_apiv3_key,
        settings.wechat_pay_notify_url,
    )
    if any(value is None or value.strip() == "" for value in required_values):
        raise WechatPayConfigMissingException()

    return WechatPayV3Gateway(
        mchid=settings.wechat_pay_mchid.strip(),
        appid=settings.wechat_pay_appid.strip(),
        private_key=_resolve_private_key(settings).strip(),
        cert_serial_no=settings.wechat_pay_cert_serial_no.strip(),
        apiv3_key=settings.wechat_pay_apiv3_key.strip(),
        notify_url=settings.wechat_pay_notify_url.strip(),
        cert_dir=settings.wechat_pay_cert_dir.strip()
        if settings.wechat_pay_cert_dir
        else None,
    )


def get_create_membership_order_use_case(
    membership_repository: Annotated[
        SqlAlchemyMembershipRepository,
        Depends(get_membership_repository),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
    wechat_pay_gateway: Annotated[
        WechatPayV3Gateway,
        Depends(get_wechat_pay_gateway),
    ],
) -> CreateMembershipOrderUseCase:
    """Construct membership order creation use case."""

    return CreateMembershipOrderUseCase(
        membership_repository=membership_repository,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
    )


def get_get_membership_order_use_case(
    membership_repository: Annotated[
        SqlAlchemyMembershipRepository,
        Depends(get_membership_repository),
    ],
) -> GetMembershipOrderUseCase:
    """Construct membership order query use case."""

    return GetMembershipOrderUseCase(
        membership_repository=membership_repository,
    )


def get_handle_wechat_pay_notify_use_case(
    membership_repository: Annotated[
        SqlAlchemyMembershipRepository,
        Depends(get_membership_repository),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider,
        Depends(get_current_time_provider),
    ],
    wechat_pay_gateway: Annotated[
        WechatPayV3Gateway,
        Depends(get_wechat_pay_gateway),
    ],
) -> HandleWechatPayNotifyUseCase:
    """Construct WeChat Pay notify handling use case."""

    return HandleWechatPayNotifyUseCase(
        membership_repository=membership_repository,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
    )
