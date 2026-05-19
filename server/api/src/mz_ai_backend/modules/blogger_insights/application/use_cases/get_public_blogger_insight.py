from __future__ import annotations

from ...domain import BloggerInsight, BloggerInsightNotFoundException, BloggerInsightStatus
from ..dtos import BloggerInsightDetailResult, GetBloggerInsightQuery
from ..ports import BloggerInsightRepository


class GetPublicBloggerInsightUseCase:
    """根据 slug 返回已发布的博主洞察详情。"""

    def __init__(self, *, blogger_insight_repository: BloggerInsightRepository) -> None:
        self._blogger_insight_repository = blogger_insight_repository

    async def execute(self, query: GetBloggerInsightQuery) -> BloggerInsightDetailResult:
        aggregate = await self._blogger_insight_repository.get_by_slug(query.slug)
        if aggregate is None or aggregate.status != BloggerInsightStatus.PUBLISHED:
            raise BloggerInsightNotFoundException(slug=query.slug)

        return _to_detail_result(aggregate)


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
