from __future__ import annotations

from mz_ai_backend.core.exceptions import InternalServerException

from ..dtos import ListPublicBloggerInsightsQuery, ListPublicBloggerInsightsResult
from ..ports import BloggerInsightRepository
from ._common import build_list_result, decode_cursor


class ListPublicBloggerInsightsUseCase:
    """返回公开博主洞察列表切片。"""

    def __init__(self, *, blogger_insight_repository: BloggerInsightRepository) -> None:
        self._blogger_insight_repository = blogger_insight_repository

    async def execute(
        self,
        query: ListPublicBloggerInsightsQuery,
    ) -> ListPublicBloggerInsightsResult:
        page = await self._blogger_insight_repository.list_public(
            limit=query.limit,
            cursor=decode_cursor(query.cursor),
            platform=query.platform,
            industry=query.industry,
            keyword=query.keyword,
        )
        return build_list_result(
            page,
            sort_value_resolver=lambda item: _resolve_published_at(
                item.slug, item.published_at
            ),
        )


def _resolve_published_at(slug: str, published_at):
    if published_at is None:
        raise InternalServerException(
            message="Published blogger insight is missing published_at.",
            details={"slug": slug},
        )
    return published_at
