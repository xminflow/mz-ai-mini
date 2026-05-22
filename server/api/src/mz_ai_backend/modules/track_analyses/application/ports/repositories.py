from __future__ import annotations

from typing import Protocol

from ...domain import TrackAnalysis
from ..dtos import (
    TrackAnalysisCursor,
    TrackAnalysisPageSlice,
    TrackAnalysisUpsertCommand,
)


class TrackAnalysisRepository(Protocol):
    """赛道分析聚合的持久化契约。"""

    async def get_by_slug(self, slug: str) -> TrackAnalysis | None:
        """根据 slug 加载完整聚合（含全部报告 HTML），未找到返回 None。"""

    async def upsert(
        self,
        *,
        command: TrackAnalysisUpsertCommand,
        now: object,
    ) -> TrackAnalysis:
        """根据 slug 创建或全量覆盖赛道分析记录。"""

    async def list_public(
        self,
        *,
        limit: int,
        cursor: TrackAnalysisCursor | None,
        industry: str | None,
        stance: str | None,
        keyword: str | None,
    ) -> TrackAnalysisPageSlice:
        """按发布时间倒序返回公开列表切片（不含 HTML 主体）。"""
