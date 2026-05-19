from __future__ import annotations

from typing import Protocol

from ...domain import BloggerInsight, BloggerInsightPlatform
from ..dtos import (
    BloggerInsightCursor,
    BloggerInsightPageSlice,
    BloggerInsightUpsertCommand,
)


class BloggerInsightRepository(Protocol):
    """博主洞察聚合的持久化契约。"""

    async def get_by_slug(self, slug: str) -> BloggerInsight | None:
        """根据 slug 加载完整聚合，未找到返回 None。"""

    async def upsert(
        self,
        *,
        command: BloggerInsightUpsertCommand,
        now: object,
    ) -> BloggerInsight:
        """根据 slug 创建或全量覆盖博主洞察记录。"""

    async def list_public(
        self,
        *,
        limit: int,
        cursor: BloggerInsightCursor | None,
        platform: BloggerInsightPlatform | None,
        industry: str | None,
        keyword: str | None,
    ) -> BloggerInsightPageSlice:
        """按发布时间倒序返回公开列表切片。"""
