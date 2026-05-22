from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ..application import (
    ListPublicTrackAnalysesResult,
    TrackAnalysisDetailResult,
    TrackAnalysisListItemResult,
    TrackAnalysisUpsertCommand,
    TrackReportContentResult,
    TrackReportInput,
)
from ..domain import TrackAnalysisStatus, TrackReportMeta


_REPORT_HTML_MAX_LENGTH = 2_097_152  # 2 MiB; 单份报告通常 30-80KB，留足余量
_REPORT_TITLE_MAX_LENGTH = 64
_REPORT_KEY_MAX_LENGTH = 32
_REPORT_DESCRIPTION_MAX_LENGTH = 1024


def _strip_required(value: str, *, field_name: str) -> str:
    normalized = value.strip()
    if normalized == "":
        raise ValueError(f"{field_name} must not be blank.")
    return normalized


class TrackReportImportItem(BaseModel):
    """import 请求中的单份报告子项。"""

    model_config = ConfigDict(frozen=True)

    key: str = Field(min_length=1, max_length=_REPORT_KEY_MAX_LENGTH)
    title: str = Field(min_length=1, max_length=_REPORT_TITLE_MAX_LENGTH)
    type: str = Field(min_length=1, max_length=_REPORT_TITLE_MAX_LENGTH)
    sections: int = Field(ge=0)
    charts: int = Field(ge=0)
    description: str = Field(default="", max_length=_REPORT_DESCRIPTION_MAX_LENGTH)
    html: str = Field(min_length=1, max_length=_REPORT_HTML_MAX_LENGTH)

    @field_validator("key", "title", "type")
    @classmethod
    def validate_required_text(cls, value: str, info) -> str:
        return _strip_required(value, field_name=info.field_name)

    def to_command_input(self) -> TrackReportInput:
        return TrackReportInput(
            key=self.key,
            title=self.title,
            type=self.type,
            sections=self.sections,
            charts=self.charts,
            description=self.description,
            html=self.html,
        )


class TrackAnalysisImportRequest(BaseModel):
    """research-kit 上传赛道分析报告时的请求体。"""

    model_config = ConfigDict(frozen=True)

    slug: str = Field(min_length=1, max_length=128)
    track_keyword: str = Field(min_length=1, max_length=128)
    region: str = Field(min_length=1, max_length=32)
    audience: str = Field(min_length=1, max_length=64)
    industry: str | None = Field(default=None, max_length=64)
    stance: str | None = Field(default=None, max_length=32)
    stance_summary: str | None = Field(default=None, max_length=512)
    cover_image_url: str | None = Field(default=None, max_length=2048)
    tags: tuple[str, ...] = ()
    key_numbers: dict[str, float] | None = None
    data_sources_count: int | None = Field(default=None, ge=0)
    reports: tuple[TrackReportImportItem, ...]
    source_run_id: str | None = Field(default=None, max_length=64)
    captured_at: datetime | None = None
    is_free: bool = False
    status: TrackAnalysisStatus = TrackAnalysisStatus.PUBLISHED

    @field_validator("slug", "track_keyword", "region", "audience")
    @classmethod
    def validate_required_text(cls, value: str, info) -> str:
        return _strip_required(value, field_name=info.field_name)

    @field_validator("industry", "stance", "stance_summary")
    @classmethod
    def normalize_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped if stripped != "" else None

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

    @field_validator("reports")
    @classmethod
    def validate_reports(
        cls, value: tuple[TrackReportImportItem, ...]
    ) -> tuple[TrackReportImportItem, ...]:
        if not value:
            raise ValueError("reports must not be empty.")
        seen: set[str] = set()
        for item in value:
            if item.key in seen:
                raise ValueError(f"Duplicate report key: {item.key}")
            seen.add(item.key)
        return value

    def to_command(self) -> TrackAnalysisUpsertCommand:
        return TrackAnalysisUpsertCommand(
            slug=self.slug,
            track_keyword=self.track_keyword,
            region=self.region,
            audience=self.audience,
            industry=self.industry,
            stance=self.stance,
            stance_summary=self.stance_summary,
            cover_image_url=self.cover_image_url,
            tags=self.tags,
            key_numbers=self.key_numbers,
            data_sources_count=self.data_sources_count,
            reports=tuple(item.to_command_input() for item in self.reports),
            source_run_id=self.source_run_id,
            captured_at=self.captured_at,
            is_free=self.is_free,
            status=self.status,
        )


class TrackReportMetaResponse(BaseModel):
    """单份报告的元信息响应（不含 html 主体）。"""

    model_config = ConfigDict(frozen=True)

    key: str
    title: str
    type: str
    sections: int
    charts: int
    description: str

    @classmethod
    def from_meta(cls, meta: TrackReportMeta) -> "TrackReportMetaResponse":
        return cls(
            key=meta.key,
            title=meta.title,
            type=meta.type,
            sections=meta.sections,
            charts=meta.charts,
            description=meta.description,
        )


class TrackAnalysisListItemResponse(BaseModel):
    """列表场景的对外响应。"""

    model_config = ConfigDict(frozen=True)

    slug: str
    track_keyword: str
    region: str
    audience: str
    industry: str | None
    stance: str | None
    stance_summary: str | None
    cover_image_url: str | None
    tags: tuple[str, ...]
    key_numbers: dict[str, float] | None
    data_sources_count: int | None
    is_free: bool
    status: TrackAnalysisStatus
    captured_at: str | None
    published_at: str | None
    created_at: str
    updated_at: str
    report_metas: tuple[TrackReportMetaResponse, ...]

    @classmethod
    def from_result(
        cls,
        result: TrackAnalysisListItemResult,
    ) -> "TrackAnalysisListItemResponse":
        payload = result.model_dump(mode="json")
        return cls.model_validate(payload)


class TrackAnalysisListResponse(BaseModel):
    """公开列表响应（含 next cursor 与筛选枚举）。"""

    model_config = ConfigDict(frozen=True)

    items: tuple[TrackAnalysisListItemResponse, ...]
    next_cursor: str | None
    available_industries: tuple[str, ...]
    available_stances: tuple[str, ...]

    @classmethod
    def from_result(
        cls,
        result: ListPublicTrackAnalysesResult,
    ) -> "TrackAnalysisListResponse":
        return cls(
            items=tuple(
                TrackAnalysisListItemResponse.from_result(item)
                for item in result.items
            ),
            next_cursor=result.next_cursor,
            available_industries=result.available_industries,
            available_stances=result.available_stances,
        )


class TrackAnalysisDetailResponse(BaseModel):
    """详情场景对外响应（元数据 + 报告清单，不含 html 主体）。"""

    model_config = ConfigDict(frozen=True)

    slug: str
    track_keyword: str
    region: str
    audience: str
    industry: str | None
    stance: str | None
    stance_summary: str | None
    cover_image_url: str | None
    tags: tuple[str, ...]
    key_numbers: dict[str, float] | None
    data_sources_count: int | None
    is_free: bool
    status: TrackAnalysisStatus
    captured_at: str | None
    published_at: str | None
    created_at: str
    updated_at: str
    report_metas: tuple[TrackReportMetaResponse, ...]
    source_run_id: str | None

    @classmethod
    def from_result(
        cls,
        result: TrackAnalysisDetailResult,
    ) -> "TrackAnalysisDetailResponse":
        payload = result.model_dump(mode="json")
        return cls.model_validate(payload)


class TrackReportContentResponse(BaseModel):
    """单份报告 HTML 内容的对外响应。"""

    model_config = ConfigDict(frozen=True)

    slug: str
    key: str
    title: str
    type: str
    sections: int
    charts: int
    description: str
    html: str

    @classmethod
    def from_result(
        cls,
        result: TrackReportContentResult,
    ) -> "TrackReportContentResponse":
        return cls(
            slug=result.slug,
            key=result.key,
            title=result.title,
            type=result.type,
            sections=result.sections,
            charts=result.charts,
            description=result.description,
            html=result.html,
        )
