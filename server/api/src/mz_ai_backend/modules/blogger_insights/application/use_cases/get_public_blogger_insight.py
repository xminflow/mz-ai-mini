from __future__ import annotations

from typing import Any

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import UnauthorizedException

from ...domain import (
    BloggerInsight,
    BloggerInsightAccessDeniedException,
    BloggerInsightNotFoundException,
    BloggerInsightStatus,
)
from ..dtos import BloggerInsightDetailResult, GetBloggerInsightQuery
from ..ports import BloggerInsightRepository


class GetPublicBloggerInsightUseCase:
    """根据 slug 返回已发布的博主洞察详情，并执行付费墙鉴权。"""

    def __init__(self, *, blogger_insight_repository: BloggerInsightRepository) -> None:
        self._blogger_insight_repository = blogger_insight_repository

    async def execute(
        self,
        query: GetBloggerInsightQuery,
        *,
        account_id: int | None,
        is_active_member: bool,
    ) -> BloggerInsightDetailResult:
        aggregate = await self._blogger_insight_repository.get_by_slug(query.slug)
        if aggregate is None or aggregate.status != BloggerInsightStatus.PUBLISHED:
            raise BloggerInsightNotFoundException(slug=query.slug)

        if not aggregate.is_free:
            if account_id is None:
                raise UnauthorizedException(
                    error_code=ErrorCode.BLOGGER_INSIGHT_ACCESS_DENIED,
                    message="Login required to view this blogger insight.",
                    details={"slug": query.slug},
                )
            if not is_active_member:
                raise BloggerInsightAccessDeniedException(
                    slug=query.slug,
                    meta=_build_paywall_meta(aggregate),
                )

        return _to_detail_result(aggregate)


def _build_paywall_meta(aggregate: BloggerInsight) -> dict[str, Any]:
    """提取供付费墙 UI 展示的非敏感元数据（不含报告 HTML）。"""
    return {
        "display_name": aggregate.display_name,
        "avatar_url": aggregate.avatar_url,
        "platform": aggregate.platform.value,
        "industry": aggregate.industry,
        "positioning": aggregate.positioning,
        "tags": list(aggregate.tags),
        "report_summary": aggregate.report_summary,
    }


def _to_detail_result(aggregate: BloggerInsight) -> BloggerInsightDetailResult:
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
        is_free=aggregate.is_free,
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
