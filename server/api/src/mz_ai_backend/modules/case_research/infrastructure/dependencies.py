from __future__ import annotations

import re
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
from mz_ai_backend.modules.membership.domain import WechatPayConfigMissingException
from mz_ai_backend.shared import SnowflakeGenerator, WechatPayV3Gateway, get_snowflake_generator

from ..application import (
    CreateCaseResearchOrderUseCase,
    CreatePublicCaseResearchRequestUseCase,
    GetCaseResearchOrderUseCase,
    HandleWechatPayNotifyUseCase,
    ListUserCaseResearchRequestsUseCase,
    MiniProgramIdentity,
)
from .repositories import SqlAlchemyCaseResearchRepository


class _CurrentTimeProvider:
    """Return current naive UTC datetime for persistence."""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def _normalize_pem_body(*, value: str, begin_marker: str, end_marker: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise WechatPayConfigMissingException()
    if (
        (normalized.startswith('"') and normalized.endswith('"'))
        or (normalized.startswith("'") and normalized.endswith("'"))
    ) and len(normalized) >= 2:
        normalized = normalized[1:-1].strip()
    normalized = normalized.replace("\\n", "\n").replace("\r\n", "\n").replace("\r", "\n")
    marker_pattern = re.compile(rf"{re.escape(begin_marker)}|{re.escape(end_marker)}")
    normalized = marker_pattern.sub("\n", normalized)
    body_lines = [line.strip() for line in normalized.split("\n") if line.strip()]
    body = "".join(body_lines).strip()
    if body == "":
        raise WechatPayConfigMissingException()
    return body


def _resolve_private_key(settings: Settings) -> str:
    if settings.wechat_pay_private_key and settings.wechat_pay_private_key.strip():
        return _normalize_pem_body(
            value=settings.wechat_pay_private_key,
            begin_marker="-----BEGIN PRIVATE KEY-----",
            end_marker="-----END PRIVATE KEY-----",
        )
    if settings.wechat_pay_private_key_path and settings.wechat_pay_private_key_path.strip():
        key_path = Path(settings.wechat_pay_private_key_path).resolve()
        if key_path.exists():
            return _normalize_pem_body(
                value=key_path.read_text(encoding="utf-8"),
                begin_marker="-----BEGIN PRIVATE KEY-----",
                end_marker="-----END PRIVATE KEY-----",
            )
    raise WechatPayConfigMissingException()


def _resolve_optional_public_key(settings: Settings) -> tuple[str | None, str | None]:
    public_key: str | None = None
    if settings.wechat_pay_public_key and settings.wechat_pay_public_key.strip():
        public_key = _normalize_pem_body(
            value=settings.wechat_pay_public_key,
            begin_marker="-----BEGIN PUBLIC KEY-----",
            end_marker="-----END PUBLIC KEY-----",
        )
    elif settings.wechat_pay_public_key_path and settings.wechat_pay_public_key_path.strip():
        key_path = Path(settings.wechat_pay_public_key_path).resolve()
        if key_path.exists():
            public_key = _normalize_pem_body(
                value=key_path.read_text(encoding="utf-8"),
                begin_marker="-----BEGIN PUBLIC KEY-----",
                end_marker="-----END PUBLIC KEY-----",
            )
    public_key_id = (
        settings.wechat_pay_public_key_id.strip()
        if settings.wechat_pay_public_key_id and settings.wechat_pay_public_key_id.strip()
        else None
    )
    if (public_key is None) != (public_key_id is None):
        raise WechatPayConfigMissingException(
            message=(
                "WeChat Pay platform public key and public key id must be configured together."
            ),
        )
    return public_key, public_key_id


def get_case_research_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyCaseResearchRepository:
    """Construct case research repository."""
    return SqlAlchemyCaseResearchRepository(session=session)


def get_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """Construct the business id generator."""
    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_current_time_provider() -> _CurrentTimeProvider:
    """Construct current time provider."""
    return _CurrentTimeProvider()


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
    public_key, public_key_id = _resolve_optional_public_key(settings)
    try:
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
            public_key=public_key,
            public_key_id=public_key_id,
        )
    except Exception as exc:  # noqa: BLE001
        raise WechatPayConfigMissingException(
            message=(
                "Failed to initialize WeChat Pay gateway. Configure either "
                "MZ_AI_BACKEND_WECHAT_PAY_PUBLIC_KEY + "
                "MZ_AI_BACKEND_WECHAT_PAY_PUBLIC_KEY_ID, or ensure "
                "MZ_AI_BACKEND_WECHAT_PAY_CERT_DIR has valid platform certificates."
            ),
        ) from exc


def get_create_public_request_use_case(
    repository: Annotated[
        SqlAlchemyCaseResearchRepository,
        Depends(get_case_research_repository),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
) -> CreatePublicCaseResearchRequestUseCase:
    """Construct public case research request creation use case."""
    return CreatePublicCaseResearchRequestUseCase(
        case_research_repository=repository,
        snowflake_id_generator=snowflake_id_generator,
    )


def get_create_order_use_case(
    repository: Annotated[
        SqlAlchemyCaseResearchRepository,
        Depends(get_case_research_repository),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    wechat_pay_gateway: Annotated[
        WechatPayV3Gateway,
        Depends(get_wechat_pay_gateway),
    ],
) -> CreateCaseResearchOrderUseCase:
    """Construct case research order creation use case."""
    return CreateCaseResearchOrderUseCase(
        case_research_repository=repository,
        snowflake_id_generator=snowflake_id_generator,
        wechat_pay_gateway=wechat_pay_gateway,
    )


def get_get_order_use_case(
    repository: Annotated[
        SqlAlchemyCaseResearchRepository,
        Depends(get_case_research_repository),
    ],
) -> GetCaseResearchOrderUseCase:
    """Construct case research order query use case."""
    return GetCaseResearchOrderUseCase(case_research_repository=repository)


def get_handle_notify_use_case(
    repository: Annotated[
        SqlAlchemyCaseResearchRepository,
        Depends(get_case_research_repository),
    ],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    wechat_pay_gateway: Annotated[
        WechatPayV3Gateway,
        Depends(get_wechat_pay_gateway),
    ],
) -> HandleWechatPayNotifyUseCase:
    """Construct WeChat Pay notify handling use case."""
    return HandleWechatPayNotifyUseCase(
        case_research_repository=repository,
        snowflake_id_generator=snowflake_id_generator,
        wechat_pay_gateway=wechat_pay_gateway,
    )


def get_list_requests_use_case(
    repository: Annotated[
        SqlAlchemyCaseResearchRepository,
        Depends(get_case_research_repository),
    ],
) -> ListUserCaseResearchRequestsUseCase:
    """Construct user case research requests list use case."""
    return ListUserCaseResearchRequestsUseCase(case_research_repository=repository)
