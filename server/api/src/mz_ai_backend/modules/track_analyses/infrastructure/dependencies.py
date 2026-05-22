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
    GetPublicTrackAnalysisUseCase,
    GetPublicTrackReportUseCase,
    ListPublicTrackAnalysesUseCase,
    UpsertTrackAnalysisUseCase,
)
from .repositories import SqlAlchemyTrackAnalysisRepository


class SystemCurrentTimeProvider:
    """提供无时区的当前 UTC 时间戳。"""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_track_analysis_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyTrackAnalysisRepository:
    return SqlAlchemyTrackAnalysisRepository(session=session)


def get_current_time_provider() -> SystemCurrentTimeProvider:
    return SystemCurrentTimeProvider()


def get_get_public_track_analysis_use_case(
    track_analysis_repository: Annotated[
        SqlAlchemyTrackAnalysisRepository,
        Depends(get_track_analysis_repository),
    ],
) -> GetPublicTrackAnalysisUseCase:
    return GetPublicTrackAnalysisUseCase(
        track_analysis_repository=track_analysis_repository
    )


def get_get_public_track_report_use_case(
    track_analysis_repository: Annotated[
        SqlAlchemyTrackAnalysisRepository,
        Depends(get_track_analysis_repository),
    ],
) -> GetPublicTrackReportUseCase:
    return GetPublicTrackReportUseCase(
        track_analysis_repository=track_analysis_repository
    )


def get_list_public_track_analyses_use_case(
    track_analysis_repository: Annotated[
        SqlAlchemyTrackAnalysisRepository,
        Depends(get_track_analysis_repository),
    ],
) -> ListPublicTrackAnalysesUseCase:
    return ListPublicTrackAnalysesUseCase(
        track_analysis_repository=track_analysis_repository
    )


def get_upsert_track_analysis_use_case(
    track_analysis_repository: Annotated[
        SqlAlchemyTrackAnalysisRepository,
        Depends(get_track_analysis_repository),
    ],
    current_time_provider: Annotated[
        SystemCurrentTimeProvider, Depends(get_current_time_provider)
    ],
) -> UpsertTrackAnalysisUseCase:
    return UpsertTrackAnalysisUseCase(
        track_analysis_repository=track_analysis_repository,
        current_time_provider=current_time_provider,
    )


def get_import_token(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> str:
    """读取导入 token；未配置时抛出系统异常以拒绝任何 import 请求。"""

    token = settings.track_analysis_import_token
    if token is None or token.strip() == "":
        raise SystemException(
            error_code=ErrorCode.TRACK_ANALYSIS_IMPORT_NOT_CONFIGURED,
            message="Track analysis import token is not configured.",
            http_status=HTTPStatus.SERVICE_UNAVAILABLE,
        )
    return token.strip()


def require_track_analysis_import_token(
    expected_token: Annotated[str, Depends(get_import_token)],
    provided_token: Annotated[
        str | None,
        Header(alias="X-Import-Token", description="Track analysis import token"),
    ] = None,
) -> None:
    """校验请求头中的 import token。"""

    if provided_token is None or provided_token.strip() == "":
        raise BusinessException(
            error_code=ErrorCode.TRACK_ANALYSIS_IMPORT_UNAUTHORIZED,
            message="Missing track analysis import token.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )
    if provided_token.strip() != expected_token:
        raise BusinessException(
            error_code=ErrorCode.TRACK_ANALYSIS_IMPORT_UNAUTHORIZED,
            message="Invalid track analysis import token.",
            http_status=HTTPStatus.UNAUTHORIZED,
        )
