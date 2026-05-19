from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from mz_ai_backend.core.exceptions import ValidationException
from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import (
    GetBloggerInsightQuery,
    GetPublicBloggerInsightUseCase,
    ListPublicBloggerInsightsQuery,
    ListPublicBloggerInsightsUseCase,
    UpsertBloggerInsightUseCase,
)
from ..domain import BloggerInsightPlatform
from ..infrastructure import (
    get_get_public_blogger_insight_use_case,
    get_list_public_blogger_insights_use_case,
    get_upsert_blogger_insight_use_case,
    require_blogger_insight_import_token,
)
from .schemas import (
    BloggerInsightDetailResponse,
    BloggerInsightImportRequest,
    BloggerInsightListResponse,
)


router = APIRouter()
public_router = APIRouter(prefix="/blogger-insights", tags=["blogger-insights"])
import_router = APIRouter(
    prefix="/blogger-insights",
    tags=["blogger-insights-import"],
    dependencies=[Depends(require_blogger_insight_import_token)],
)


@public_router.get(
    "",
    response_model=ApiResponse[BloggerInsightListResponse],
    summary="List published blogger insights",
)
async def list_public_blogger_insights(
    use_case: Annotated[
        ListPublicBloggerInsightsUseCase,
        Depends(get_list_public_blogger_insights_use_case),
    ],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    cursor: Annotated[str | None, Query()] = None,
    platform: Annotated[str | None, Query()] = None,
    industry: Annotated[str | None, Query()] = None,
    keyword: Annotated[str | None, Query()] = None,
) -> ApiResponse[BloggerInsightListResponse]:
    """返回公开博主洞察列表切片。"""

    result = await use_case.execute(
        ListPublicBloggerInsightsQuery(
            limit=limit,
            cursor=cursor,
            platform=_normalize_platform(platform),
            industry=_normalize_industry(industry),
            keyword=_normalize_keyword(keyword),
        )
    )
    return success_response(data=BloggerInsightListResponse.from_result(result))


@public_router.get(
    "/{slug}",
    response_model=ApiResponse[BloggerInsightDetailResponse],
    summary="Get a published blogger insight",
)
async def get_public_blogger_insight(
    slug: str,
    use_case: Annotated[
        GetPublicBloggerInsightUseCase,
        Depends(get_get_public_blogger_insight_use_case),
    ],
) -> ApiResponse[BloggerInsightDetailResponse]:
    """根据 slug 返回博主洞察详情。"""

    result = await use_case.execute(GetBloggerInsightQuery(slug=slug))
    return success_response(data=BloggerInsightDetailResponse.from_result(result))


@import_router.post(
    "/import",
    response_model=ApiResponse[BloggerInsightDetailResponse],
    summary="Import or update a blogger insight from research-kit",
)
async def import_blogger_insight(
    request: BloggerInsightImportRequest,
    use_case: Annotated[
        UpsertBloggerInsightUseCase,
        Depends(get_upsert_blogger_insight_use_case),
    ],
) -> ApiResponse[BloggerInsightDetailResponse]:
    """接收来自 research-kit 的导入请求，按 slug 创建或全量覆盖。"""

    aggregate = await use_case.execute(request.to_command())
    detail_result = _aggregate_to_detail(aggregate)
    return success_response(data=BloggerInsightDetailResponse.from_result(detail_result))


router.include_router(public_router)
router.include_router(import_router)


def _normalize_platform(value: str | None) -> BloggerInsightPlatform | None:
    if value is None:
        return None
    stripped = value.strip()
    if stripped == "":
        return None
    try:
        return BloggerInsightPlatform(stripped)
    except ValueError as exc:
        raise ValidationException(message="Platform filter is invalid.") from exc


def _normalize_industry(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped != "" else None


def _normalize_keyword(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped if stripped != "" else None


def _aggregate_to_detail(aggregate):
    from ..application import BloggerInsightDetailResult

    return BloggerInsightDetailResult(
        slug=aggregate.slug,
        platform=aggregate.platform,
        display_name=aggregate.display_name,
        avatar_url=aggregate.avatar_url,
        fans_count=aggregate.fans_count,
        total_works_count=aggregate.total_works_count,
        industry=aggregate.industry,
        positioning=aggregate.positioning,
        tags=aggregate.tags,
        cover_image_url=aggregate.cover_image_url,
        status=aggregate.status,
        captured_at=aggregate.captured_at,
        published_at=aggregate.published_at,
        created_at=aggregate.created_at,
        updated_at=aggregate.updated_at,
        signature=aggregate.signature,
        report_html=aggregate.report_html,
        report_summary=aggregate.report_summary,
        source_run_id=aggregate.source_run_id,
    )
