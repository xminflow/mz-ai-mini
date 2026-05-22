from __future__ import annotations

from ...domain import (
    TrackAnalysis,
    TrackAnalysisNotFoundException,
    TrackAnalysisStatus,
)
from ..dtos import GetTrackAnalysisQuery, TrackAnalysisDetailResult
from ..ports import TrackAnalysisRepository


class GetPublicTrackAnalysisUseCase:
    """根据 slug 返回已发布的赛道分析详情（元数据 + 报告清单，但不含 HTML 主体）。"""

    def __init__(self, *, track_analysis_repository: TrackAnalysisRepository) -> None:
        self._track_analysis_repository = track_analysis_repository

    async def execute(self, query: GetTrackAnalysisQuery) -> TrackAnalysisDetailResult:
        aggregate = await self._track_analysis_repository.get_by_slug(query.slug)
        if aggregate is None or aggregate.status != TrackAnalysisStatus.PUBLISHED:
            raise TrackAnalysisNotFoundException(slug=query.slug)

        return _to_detail_result(aggregate)


def _to_detail_result(aggregate: TrackAnalysis) -> TrackAnalysisDetailResult:
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
