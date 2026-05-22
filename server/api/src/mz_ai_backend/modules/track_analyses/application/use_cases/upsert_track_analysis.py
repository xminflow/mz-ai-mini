from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ...domain import TrackAnalysis
from ..dtos import TrackAnalysisUpsertCommand
from ..ports import TrackAnalysisRepository


class CurrentTimeProvider(Protocol):
    def now(self) -> datetime: ...


class UpsertTrackAnalysisUseCase:
    """根据 slug 创建或全量覆盖赛道分析记录（research-kit 导入路径）。"""

    def __init__(
        self,
        *,
        track_analysis_repository: TrackAnalysisRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._track_analysis_repository = track_analysis_repository
        self._current_time_provider = current_time_provider

    async def execute(self, command: TrackAnalysisUpsertCommand) -> TrackAnalysis:
        now = self._current_time_provider.now()
        return await self._track_analysis_repository.upsert(
            command=command,
            now=now,
        )
