from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, ConfigDict


class BloggerInsightStatus(StrEnum):
    """博主洞察记录的生命周期状态。"""

    DRAFT = "draft"
    PUBLISHED = "published"


class BloggerInsightPlatform(StrEnum):
    """博主分析支持的平台来源。"""

    DOUYIN = "douyin"
    XIAOHONGSHU = "xiaohongshu"
    BILIBILI = "bilibili"
    WECHAT = "wechat"
    OTHER = "other"


class BloggerInsightSummary(BaseModel):
    """列表卡片场景使用的精简字段集合。"""

    model_config = ConfigDict(frozen=True)

    slug: str
    platform: BloggerInsightPlatform
    display_name: str
    avatar_url: str | None
    fans_count: int | None
    total_works_count: int | None
    industry: str | None
    positioning: str | None
    tags: tuple[str, ...]
    cover_image_url: str | None
    status: BloggerInsightStatus
    captured_at: datetime | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime


class BloggerInsight(BloggerInsightSummary):
    """博主洞察聚合根，包含完整 HTML 报告与结构化摘要。"""

    signature: str | None
    report_html: str
    report_summary: dict[str, Any] | None
    source_run_id: str | None
    is_deleted: bool
