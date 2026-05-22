from __future__ import annotations

from mz_ai_backend.core.exceptions import InternalServerException

from ..dtos import ListPublicTrackAnalysesQuery, ListPublicTrackAnalysesResult
from ..ports import TrackAnalysisRepository
from ._common import build_list_result, decode_cursor


class ListPublicTrackAnalysesUseCase:
    """返回公开赛道分析列表切片。"""

    def __init__(self, *, track_analysis_repository: TrackAnalysisRepository) -> None:
        self._track_analysis_repository = track_analysis_repository

    async def execute(
        self,
        query: ListPublicTrackAnalysesQuery,
    ) -> ListPublicTrackAnalysesResult:
        page = await self._track_analysis_repository.list_public(
            limit=query.limit,
            cursor=decode_cursor(query.cursor),
            industry=query.industry,
            stance=query.stance,
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
            message="Published track analysis is missing published_at.",
            details={"slug": slug},
        )
    return published_at
