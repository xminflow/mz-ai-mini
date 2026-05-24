from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import get_async_session_dependency, get_settings_dependency
from mz_ai_backend.modules.agent_auth.application import GetCurrentAgentAccountQuery
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import (
    get_current_agent_access_token,
    get_get_current_agent_account_use_case,
)
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator
from mz_ai_backend.shared.wechat_pay import WechatPayConfigMissingException, WechatPayV3Gateway

from ..application import (
    CreateMembershipOrderUseCase,
    GetMyMembershipUseCase,
    GetOrderStatusUseCase,
    HandleWechatPayNotifyUseCase,
)
from ..domain import SKU_TIER_MAP, MembershipSku
from .repositories import SqlAlchemyAccountMembershipRepository
from .wechat_pay_native_adapter import WechatPayNativeAdapter


class SystemCurrentTimeProvider:
    """Return current naive UTC datetime for persistence."""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_account_membership_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyAccountMembershipRepository:
    """Construct account membership repository."""

    return SqlAlchemyAccountMembershipRepository(session=session)


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


async def get_current_account_id(
    access_token: Annotated[str, Depends(get_current_agent_access_token)],
    use_case: Annotated[object, Depends(get_get_current_agent_account_use_case)],
) -> int:
    """Resolve current website account id from bearer access token."""

    account = await use_case.execute(GetCurrentAgentAccountQuery(access_token=access_token))
    return account.account_id


def get_website_wechat_pay_gateway(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> WechatPayNativeAdapter:
    """Construct website WeChat Native gateway."""

    required_values = (
        settings.wechat_pay_mchid,
        settings.wechat_pay_web_appid,
        settings.wechat_pay_cert_serial_no,
        settings.wechat_pay_apiv3_key,
        settings.wechat_pay_web_notify_url,
    )
    if any(value is None or value.strip() == "" for value in required_values):
        raise WechatPayConfigMissingException()

    from mz_ai_backend.modules.membership.infrastructure.dependencies import (
        _resolve_optional_public_key,
        _resolve_private_key,
    )
    from wechatpayv3 import WeChatPayType

    public_key, public_key_id = _resolve_optional_public_key(settings)
    gateway = WechatPayV3Gateway(
        mchid=settings.wechat_pay_mchid.strip(),
        appid=settings.wechat_pay_web_appid.strip(),
        private_key=_resolve_private_key(settings).strip(),
        cert_serial_no=settings.wechat_pay_cert_serial_no.strip(),
        apiv3_key=settings.wechat_pay_apiv3_key.strip(),
        notify_url=settings.wechat_pay_web_notify_url.strip(),
        cert_dir=settings.wechat_pay_cert_dir.strip() if settings.wechat_pay_cert_dir else None,
        public_key=public_key,
        public_key_id=public_key_id,
        pay_type=WeChatPayType.NATIVE,
    )
    return WechatPayNativeAdapter(gateway=gateway)


def get_create_membership_order_use_case(
    repository: Annotated[
        SqlAlchemyAccountMembershipRepository,
        Depends(get_account_membership_repository),
    ],
    snowflake_id_generator: Annotated[SnowflakeGenerator, Depends(get_snowflake_id_generator)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_current_time_provider)],
    wechat_pay_gateway: Annotated[WechatPayNativeAdapter, Depends(get_website_wechat_pay_gateway)],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> CreateMembershipOrderUseCase:
    """Construct create order use case."""

    sku_prices = {
        MembershipSku.ANNUAL_NORMAL: settings.account_membership_normal_fen,
        MembershipSku.ANNUAL_PREMIUM: settings.account_membership_premium_fen,
    }
    return CreateMembershipOrderUseCase(
        repository=repository,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
        sku_prices=sku_prices,
    )


def get_get_order_status_use_case(
    repository: Annotated[
        SqlAlchemyAccountMembershipRepository,
        Depends(get_account_membership_repository),
    ],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_current_time_provider)],
    wechat_pay_gateway: Annotated[WechatPayNativeAdapter, Depends(get_website_wechat_pay_gateway)],
) -> GetOrderStatusUseCase:
    """Construct order status use case."""

    return GetOrderStatusUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
        sku_tier_map=SKU_TIER_MAP,
    )


def get_get_my_membership_use_case(
    repository: Annotated[
        SqlAlchemyAccountMembershipRepository,
        Depends(get_account_membership_repository),
    ],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_current_time_provider)],
) -> GetMyMembershipUseCase:
    """Construct my membership use case."""

    return GetMyMembershipUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
    )


def get_handle_wechat_pay_notify_use_case(
    repository: Annotated[
        SqlAlchemyAccountMembershipRepository,
        Depends(get_account_membership_repository),
    ],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_current_time_provider)],
    wechat_pay_gateway: Annotated[WechatPayNativeAdapter, Depends(get_website_wechat_pay_gateway)],
) -> HandleWechatPayNotifyUseCase:
    """Construct WeChat notify use case."""

    return HandleWechatPayNotifyUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
        sku_tier_map=SKU_TIER_MAP,
    )
