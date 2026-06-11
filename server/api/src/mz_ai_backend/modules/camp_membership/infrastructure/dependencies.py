from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import get_async_session_dependency, get_settings_dependency
from mz_ai_backend.modules.camp_auth.application import GetCurrentCampAccountQuery
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_current_camp_access_token,
    get_get_current_camp_account_use_case,
)
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator
from mz_ai_backend.shared.wechat_pay import WechatPayConfigMissingException, WechatPayV3Gateway

from ..application import (
    CreateCampMembershipOrderUseCase,
    GetCampOrderStatusUseCase,
    GetMyCampMembershipUseCase,
    HandleCampWechatPayNotifyUseCase,
)
from ..domain import SKU_TIER_MAP, CampMembershipSku
from .repositories import SqlAlchemyCampMembershipRepository
from .wechat_pay_native_adapter import CampWechatPayNativeAdapter


class SystemCurrentTimeProvider:
    """返回 naive UTC datetime 供持久化。"""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_camp_membership_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyCampMembershipRepository:
    """构造 ai-camp 会员仓储。"""

    return SqlAlchemyCampMembershipRepository(session=session)


def get_camp_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """构造业务 id 生成器。"""

    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_camp_current_time_provider() -> SystemCurrentTimeProvider:
    """构造当前时间提供者。"""

    return SystemCurrentTimeProvider()


async def get_current_camp_account_id(
    access_token: Annotated[str, Depends(get_current_camp_access_token)],
    use_case: Annotated[object, Depends(get_get_current_camp_account_use_case)],
) -> int:
    """从 camp access token 解析当前账号 id（复用 camp_auth 鉴权，不重复实现）。"""

    account = await use_case.execute(GetCurrentCampAccountQuery(access_token=access_token))
    return account.account_id


def get_camp_wechat_pay_gateway(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> CampWechatPayNativeAdapter:
    """构造 ai-camp 微信 Native 网关（复用 website 的支付商户配置）。"""

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
    return CampWechatPayNativeAdapter(gateway=gateway)


def get_create_camp_membership_order_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    snowflake_id_generator: Annotated[SnowflakeGenerator, Depends(get_camp_snowflake_id_generator)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
    wechat_pay_gateway: Annotated[CampWechatPayNativeAdapter, Depends(get_camp_wechat_pay_gateway)],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> CreateCampMembershipOrderUseCase:
    """构造下单用例。"""

    sku_prices = {
        CampMembershipSku.ANNUAL_BASIC: settings.camp_membership_basic_fen,
        CampMembershipSku.ANNUAL_PREMIUM: settings.camp_membership_premium_fen,
    }
    return CreateCampMembershipOrderUseCase(
        repository=repository,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
        sku_prices=sku_prices,
    )


def get_get_camp_order_status_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
) -> GetCampOrderStatusUseCase:
    """构造查单用例。"""

    return GetCampOrderStatusUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
    )


def get_get_my_camp_membership_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
) -> GetMyCampMembershipUseCase:
    """构造会员快照用例。"""

    return GetMyCampMembershipUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
    )


def get_handle_camp_wechat_pay_notify_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
    wechat_pay_gateway: Annotated[CampWechatPayNativeAdapter, Depends(get_camp_wechat_pay_gateway)],
) -> HandleCampWechatPayNotifyUseCase:
    """构造回调用例。"""

    return HandleCampWechatPayNotifyUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
        sku_tier_map=SKU_TIER_MAP,
    )
