from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.shared.auth_dependencies import get_is_active_member, get_optional_account_id

from ..application import (
    GetPublicTrackAnalysisUseCase,
    GetPublicTrackReportUseCase,
    GetTrackAnalysisQuery,
    GetTrackReportQuery,
    ListPublicTrackAnalysesQuery,
    ListPublicTrackAnalysesUseCase,
    TrackAnalysisDetailResult,
    UpsertTrackAnalysisUseCase,
)
from ..domain import TrackAnalysis
from ..infrastructure import (
    get_get_public_track_analysis_use_case,
    get_get_public_track_report_use_case,
    get_list_public_track_analyses_use_case,
    get_upsert_track_analysis_use_case,
    require_track_analysis_import_token,
)
from .schemas import (
    TrackAnalysisDetailResponse,
    TrackAnalysisImportRequest,
    TrackAnalysisListResponse,
    TrackReportContentResponse,
)


router = APIRouter()
public_router = APIRouter(prefix="/track-analyses", tags=["track-analyses"])
import_router = APIRouter(
    prefix="/track-analyses",
    tags=["track-analyses-import"],
    dependencies=[Depends(require_track_analysis_import_token)],
)


@public_router.get(
    "",
    response_model=ApiResponse[TrackAnalysisListResponse],
    summary="List published track analyses",
)
async def list_public_track_analyses(
    use_case: Annotated[
        ListPublicTrackAnalysesUseCase,
        Depends(get_list_public_track_analyses_use_case),
    ],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    cursor: Annotated[str | None, Query()] = None,
    industry: Annotated[str | None, Query()] = None,
    stance: Annotated[str | None, Query()] = None,
    keyword: Annotated[str | None, Query()] = None,
) -> ApiResponse[TrackAnalysisListResponse]:
    """返回公开赛道分析列表切片（不含 HTML 主体）。"""

    result = await use_case.execute(
        ListPublicTrackAnalysesQuery(
            limit=limit,
            cursor=cursor,
            industry=_normalize_optional(industry),
            stance=_normalize_optional(stance),
            keyword=_normalize_optional(keyword),
        )
    )
    return success_response(data=TrackAnalysisListResponse.from_result(result))


@public_router.get(
    "/{slug}",
    response_model=ApiResponse[TrackAnalysisDetailResponse],
    summary="Get a published track analysis (metadata + report list)",
)
async def get_public_track_analysis(
    slug: str,
    use_case: Annotated[
        GetPublicTrackAnalysisUseCase,
        Depends(get_get_public_track_analysis_use_case),
    ],
) -> ApiResponse[TrackAnalysisDetailResponse]:
    """根据 slug 返回赛道详情元数据 + 报告清单，但不含 HTML 主体。"""

    result = await use_case.execute(GetTrackAnalysisQuery(slug=slug))
    return success_response(data=TrackAnalysisDetailResponse.from_result(result))


@public_router.get(
    "/{slug}/reports/{report_key}",
    response_model=ApiResponse[TrackReportContentResponse],
    summary="Get one HTML report inside a track analysis",
)
async def get_public_track_report(
    slug: str,
    report_key: str,
    use_case: Annotated[
        GetPublicTrackReportUseCase,
        Depends(get_get_public_track_report_use_case),
    ],
    account_id: Annotated[int | None, Depends(get_optional_account_id)],
    is_active_member: Annotated[bool, Depends(get_is_active_member)],
) -> ApiResponse[TrackReportContentResponse]:
    """根据 slug + report_key 返回单份报告完整 HTML。免费内容无需鉴权，会员内容需要有效会员。"""

    result = await use_case.execute(
        GetTrackReportQuery(slug=slug, report_key=report_key),
        account_id=account_id,
        is_active_member=is_active_member,
    )
    return success_response(data=TrackReportContentResponse.from_result(result))


@import_router.post(
    "/import",
    response_model=ApiResponse[TrackAnalysisDetailResponse],
    summary="Import or update a track analysis from research-kit",
)
async def import_track_analysis(
    request: TrackAnalysisImportRequest,
    use_case: Annotated[
        UpsertTrackAnalysisUseCase,
        Depends(get_upsert_track_analysis_use_case),
    ],
) -> ApiResponse[TrackAnalysisDetailResponse]:
    """接收来自 research-kit 的导入请求，按 slug 创建或全量覆盖。

    响应体故意不返回 HTML 主体，与公开详情端点保持一致；
    需要校验 HTML 内容时单独走 reports/{key} 子端点。
    """

    aggregate = await use_case.execute(request.to_command())
    detail_result = _aggregate_to_detail(aggregate)
    return success_response(data=TrackAnalysisDetailResponse.from_result(detail_result))


router.include_router(public_router)
router.include_router(import_router)


def _normalize_optional(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped != "" else None


def _aggregate_to_detail(aggregate: TrackAnalysis) -> TrackAnalysisDetailResult:
    return TrackAnalysisDetailResult(
        slug=aggregate.slug,
        track_keyword=aggregate.track_keyword,
        region=aggregate.region,
        audience=aggregate.audience,
        industry=aggregate.industry,
        stance=aggregate.stance,
        stance_summary=aggregate.stance_summary,
        cover_image_url=aggregate.cover_image_url,
        tags=aggregate.tags,
        key_numbers=aggregate.key_numbers,
        data_sources_count=aggregate.data_sources_count,
        is_free=aggregate.is_free,
        status=aggregate.status,
        captured_at=aggregate.captured_at,
        published_at=aggregate.published_at,
        created_at=aggregate.created_at,
        updated_at=aggregate.updated_at,
        report_metas=aggregate.report_metas,
        source_run_id=aggregate.source_run_id,
    )
