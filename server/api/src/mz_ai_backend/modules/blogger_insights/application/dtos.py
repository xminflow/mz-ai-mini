from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from ..domain import BloggerInsightPlatform, BloggerInsightStatus


class BloggerInsightUpsertCommand(BaseModel):
    """Upsert 命令：由 research-kit 通过受保护 API 上传时使用。"""

    model_config = ConfigDict(frozen=True)

    slug: str
    platform: BloggerInsightPlatform
    display_name: str
    avatar_url: str | None
    signature: str | None
    fans_count: int | None
    total_works_count: int | None
    industry: str | None
    positioning: str | None
    tags: tuple[str, ...]
    cover_image_url: str | None
    report_html: str
    report_summary: dict[str, Any] | None
    source_run_id: str | None
    captured_at: datetime | None
    status: BloggerInsightStatus = BloggerInsightStatus.PUBLISHED


class GetBloggerInsightQuery(BaseModel):
    """根据 slug 拉取详情。"""

    model_config = ConfigDict(frozen=True)

    slug: str


class ListPublicBloggerInsightsQuery(BaseModel):
    """公开列表查询参数。"""

    model_config = ConfigDict(frozen=True)

    limit: int
    cursor: str | None
    platform: BloggerInsightPlatform | None = None
    industry: str | None = None
    keyword: str | None = None


class BloggerInsightCursor(BaseModel):
    """列表分页 cursor。"""

    model_config = ConfigDict(frozen=True)

    sort_value: datetime
    slug: str


class BloggerInsightListItemResult(BaseModel):
    """列表场景的展示结果。"""

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


class BloggerInsightDetailResult(BloggerInsightListItemResult):
    """详情场景包含完整 HTML 报告与摘要。"""

    signature: str | None
    report_html: str
    report_summary: dict[str, Any] | None
    source_run_id: str | None


class BloggerInsightPageSlice(BaseModel):
    """Repository 层返回的页面切片。"""

    model_config = ConfigDict(frozen=True)

    items: tuple[BloggerInsightListItemResult, ...]
    has_more: bool
    available_platforms: tuple[str, ...] = ()
    available_industries: tuple[str, ...] = ()


class ListPublicBloggerInsightsResult(BaseModel):
    """公开列表结果（带下一页 cursor）。"""

    model_config = ConfigDict(frozen=True)

    items: tuple[BloggerInsightListItemResult, ...]
    next_cursor: str | None
    available_platforms: tuple[str, ...] = ()
    available_industries: tuple[str, ...] = ()
