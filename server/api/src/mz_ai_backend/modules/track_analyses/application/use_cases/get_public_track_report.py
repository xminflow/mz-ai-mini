from __future__ import annotations

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import UnauthorizedException

from ...domain import (
    TrackAnalysisAccessDeniedException,
    TrackAnalysisNotFoundException,
    TrackAnalysisStatus,
    TrackReportNotFoundException,
)
from ..dtos import GetTrackReportQuery, TrackReportContentResult
from ..ports import TrackAnalysisRepository


class GetPublicTrackReportUseCase:
    """根据 slug + report_key 返回单份赛道报告的完整 HTML，并执行付费墙鉴权。"""

    def __init__(self, *, track_analysis_repository: TrackAnalysisRepository) -> None:
        self._track_analysis_repository = track_analysis_repository

    async def execute(
        self,
        query: GetTrackReportQuery,
        *,
        account_id: int | None,
        is_active_member: bool,
    ) -> TrackReportContentResult:
        aggregate = await self._track_analysis_repository.get_by_slug(query.slug)
        if aggregate is None or aggregate.status != TrackAnalysisStatus.PUBLISHED:
            raise TrackAnalysisNotFoundException(slug=query.slug)

        if not aggregate.is_free:
            if account_id is None:
                raise UnauthorizedException(
                    error_code=ErrorCode.TRACK_ANALYSIS_ACCESS_DENIED,
                    message="Login required to view this track analysis report.",
                    details={"slug": query.slug},
                )
            if not is_active_member:
                raise TrackAnalysisAccessDeniedException(slug=query.slug)

        for report in aggregate.reports:
            if report.key == query.report_key:
                return TrackReportContentResult(
                    slug=aggregate.slug,
                    key=report.key,
                    title=report.title,
                    type=report.type,
                    sections=report.sections,
                    charts=report.charts,
                    description=report.description,
                    html=report.html,
                )

        raise TrackReportNotFoundException(slug=query.slug, report_key=query.report_key)
