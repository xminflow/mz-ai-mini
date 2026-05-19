from __future__ import annotations

from datetime import UTC, datetime
from http import HTTPStatus
from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import (
    get_async_session_dependency,
    get_settings_dependency,
)
from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException, SystemException

from ..application import (
    GetPublicBloggerInsightUseCase,
    ListPublicBloggerInsightsUseCase,
    UpsertBloggerInsightUseCase,
)
from .repositories import SqlAlchemyBloggerInsightRepository


class SystemCurrentTimeProvider:
    """提供无时区的当前 UTC 时间戳。"""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_blogger_insight_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyBloggerInsightRepository:
    return SqlAlchemyBloggerInsightRepository(session=session)


def get_current_time_provider() -> SystemCurrentTimeProvider:
    return SystemCurrentTimeProvider()


def get_get_public_blogger_insight_use_case(
    blogger_insight_repository: Annotated[
        SqlAlchemyBloggerInsightRepository,
        Depends(get_blogger_insight_repository),
    ],
) -> GetPublicBloggerInsightUseCase:
    return GetPublicBloggerInsightUseCase(
        blogger_insight_repository=blogger_insight_repository
    )


def get_list_public_blogger_insights_use_case(
    blogger_insight_repository: Annotated[
        SqlAlchemyBloggerInsightRepository,
        Depends(get_blogger_insight_repository),
    ],
) -> ListPublicBloggerInsightsUseCase:
    return ListPublicBloggerInsightsUseCase(
        blogger_insight_repository=blogger_insight_repository
    )


def get_upsert_blogger_insight_use_case(
    blogger_insight_repository: Annotated[
        SqlAlchemyBloggerInsightRepository,
        Depends(get_blogger_insight_repository),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider, Depends(get_current_time_provider)
    ],
) -> UpsertBloggerInsightUseCase:
    return UpsertBloggerInsightUseCase(
        blogger_insight_repository=blogger_insight_repository,
        current_time_provider=current_time_provider,
    )


def get_import_token(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> str:
    """读取导入 token；未配置时抛出系统异常以拒绝任何 import 请求。"""

    token = settings.blogger_insight_import_token
    if token is None or token.strip() == "":
        raise SystemException(
            error_code=ErrorCode.BLOGGER_INSIGHT_IMPORT_NOT_CONFIGURED,
            message="Blogger insight import token is not configured.",
            http_status=HTTPStatus.SERVICE_UNAVAILABLE,
        )
    return token.strip()


def require_blogger_insight_import_token(
    expected_token: Annotated[str, Depends(get_import_token)],
    provided_token: Annotated[
        str | None,
        Header(alias="X-Import-Token", description="Blogger insight import token"),
    ] = None,
) -> None:
    """校验请求头中的 import token。"""

    if provided_token is None or provided_token.strip() == "":
        raise BusinessException(
            error_code=ErrorCode.BLOGGER_INSIGHT_IMPORT_UNAUTHORIZED,
            message="Missing blogger insight import token.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )
    if provided_token.strip() != expected_token:
        raise BusinessException(
            error_code=ErrorCode.BLOGGER_INSIGHT_IMPORT_UNAUTHORIZED,
            message="Invalid blogger insight import token.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )
