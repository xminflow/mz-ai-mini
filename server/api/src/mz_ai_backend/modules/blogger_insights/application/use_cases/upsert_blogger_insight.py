from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ..dtos import BloggerInsightUpsertCommand
from ..ports import BloggerInsightRepository
from ...domain import BloggerInsight


class CurrentTimeProvider(Protocol):
    def now(self) -> datetime: ...


class UpsertBloggerInsightUseCase:
    """根据 slug 创建或全量覆盖博主洞察记录（research-kit 导入路径）。"""

    def __init__(
        self,
        *,
        blogger_insight_repository: BloggerInsightRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._blogger_insight_repository = blogger_insight_repository
        self._current_time_provider = current_time_provider

    async def execute(self, command: BloggerInsightUpsertCommand) -> BloggerInsight:
        now = self._current_time_provider.now()
        return await self._blogger_insight_repository.upsert(
            command=command,
            now=now,
        )
