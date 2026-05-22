from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..application import (
    BloggerInsightDetailResult,
    BloggerInsightListItemResult,
    BloggerInsightUpsertCommand,
    ListPublicBloggerInsightsResult,
)
from ..domain import BloggerInsightPlatform, BloggerInsightStatus


def _strip_required(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


class BloggerInsightImportRequest(BaseModel):
    """research-kit 上传分析报告时的请求体。"""

    model_config = ConfigDict(frozen=True)

    slug: str = Field(min_length=1, max_length=128)
    platform: BloggerInsightPlatform
    display_name: str = Field(min_length=1, max_length=128)
    # 跟随 migration 0020 把 avatar_url 字段扩成 TEXT；research-kit publish 会把本地
    # avatar.jpg 编成 base64 data URI 上传（典型 30-100KB），所以这里放宽到 256KB，
    # 既覆盖 base64 头像，又防恶意巨型串。
    avatar_url: str | None = Field(default=None, max_length=262144)
    signature: str | None = Field(default=None, max_length=2048)
    fans_count: int | None = Field(default=None, ge=0)
    total_works_count: int | None = Field(default=None, ge=0)
    industry: str | None = Field(default=None, max_length=32)
    positioning: str | None = Field(default=None, max_length=512)
    tags: tuple[str, ...] = ()
    cover_image_url: str | None = Field(default=None, max_length=2048)
    report_html: str = Field(min_length=1)
    report_summary: dict[str, Any] | None = None
    source_run_id: str | None = Field(default=None, max_length=64)
    captured_at: datetime | None = None
    is_free: bool = False
    status: BloggerInsightStatus = BloggerInsightStatus.PUBLISHED

    @field_validator("slug", "display_name")
    @classmethod
    def validate_required_text(cls, value: str, info) -> str:
        return _strip_required(value, field_name=info.field_name)

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, value: tuple[str, ...]) -> tuple[str, ...]:
        normalized: list[str] = []
        seen: set[str] = set()
        for raw in value:
            stripped = raw.strip()
            if stripped == "" or stripped in seen:
                continue
            seen.add(stripped)
            normalized.append(stripped)
        return tuple(normalized)

    def to_command(self) -> BloggerInsightUpsertCommand:
        return BloggerInsightUpsertCommand(
            slug=self.slug,
            platform=self.platform,
            display_name=self.display_name,
            avatar_url=self.avatar_url,
            signature=self.signature,
            fans_count=self.fans_count,
            total_works_count=self.total_works_count,
            industry=self.industry,
            positioning=self.positioning,
            tags=self.tags,
            cover_image_url=self.cover_image_url,
            report_html=self.report_html,
            report_summary=self.report_summary,
            source_run_id=self.source_run_id,
            captured_at=self.captured_at,
            is_free=self.is_free,
            status=self.status,
        )


class BloggerInsightListItemResponse(BaseModel):
    """列表场景的对外响应。"""

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
    is_free: bool
    status: BloggerInsightStatus
    captured_at: str | None
    published_at: str | None
    created_at: str
    updated_at: str

    @classmethod
    def from_result(
        cls,
        result: BloggerInsightListItemResult,
    ) -> "BloggerInsightListItemResponse":
        payload = result.model_dump(mode="json")
        return cls.model_validate(payload)


class BloggerInsightListResponse(BaseModel):
    """公开列表响应（含 next cursor 与筛选枚举）。"""

    model_config = ConfigDict(frozen=True)

    items: tuple[BloggerInsightListItemResponse, ...]
    next_cursor: str | None
    available_platforms: tuple[str, ...]
    available_industries: tuple[str, ...]

    @classmethod
    def from_result(
        cls,
        result: ListPublicBloggerInsightsResult,
    ) -> "BloggerInsightListResponse":
        return cls(
            items=tuple(
                BloggerInsightListItemResponse.from_result(item) for item in result.items
            ),
            next_cursor=result.next_cursor,
            available_platforms=result.available_platforms,
            available_industries=result.available_industries,
        )


class BloggerInsightDetailResponse(BaseModel):
    """详情场景对外响应（含 HTML 报告全文与摘要）。"""

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
    is_free: bool
    status: BloggerInsightStatus
    captured_at: str | None
    published_at: str | None
    created_at: str
    updated_at: str
    report_html: str
    report_summary: dict[str, Any] | None
    source_run_id: str | None

    @classmethod
    def from_result(
        cls,
        result: BloggerInsightDetailResult,
    ) -> "BloggerInsightDetailResponse":
        payload = result.model_dump(mode="json")
        return cls.model_validate(payload)
