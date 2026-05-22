from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..domain import TrackAnalysisStatus, TrackReportMeta


class TrackReportInput(BaseModel):
    """Upsert 命令中的单份报告子项，含 HTML 主体。"""

    model_config = ConfigDict(frozen=True)

    key: str
    title: str
    type: str
    sections: int
    charts: int
    description: str
    html: str


class TrackAnalysisUpsertCommand(BaseModel):
    """Upsert 命令：由 research-kit 通过受保护 API 上传时使用。"""

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
    reports: tuple[TrackReportInput, ...]
    source_run_id: str | None
    captured_at: datetime | None
    is_free: bool = False
    status: TrackAnalysisStatus = TrackAnalysisStatus.PUBLISHED


class GetTrackAnalysisQuery(BaseModel):
    """根据 slug 拉取赛道详情元数据（不含 HTML 主体）。"""

    model_config = ConfigDict(frozen=True)

    slug: str


class GetTrackReportQuery(BaseModel):
    """根据 slug + report_key 拉取单份报告 HTML。"""

    model_config = ConfigDict(frozen=True)

    slug: str
    report_key: str


class ListPublicTrackAnalysesQuery(BaseModel):
    """公开列表查询参数。"""

    model_config = ConfigDict(frozen=True)

    limit: int
    cursor: str | None
    industry: str | None = None
    stance: str | None = None
    keyword: str | None = None


class TrackAnalysisCursor(BaseModel):
    """列表分页 cursor。"""

    model_config = ConfigDict(frozen=True)

    sort_value: datetime
    slug: str


class TrackAnalysisListItemResult(BaseModel):
    """列表场景的展示结果（不含 HTML 主体）。"""

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
    captured_at: datetime | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    report_metas: tuple[TrackReportMeta, ...]


class TrackAnalysisDetailResult(TrackAnalysisListItemResult):
    """详情场景：与列表项同构，额外暴露 source_run_id。报告主体仍走单独端点。"""

    source_run_id: str | None


class TrackReportContentResult(BaseModel):
    """单份报告主体响应。"""

    model_config = ConfigDict(frozen=True)

    slug: str
    key: str
    title: str
    type: str
    sections: int
    charts: int
    description: str
    html: str


class TrackAnalysisPageSlice(BaseModel):
    """Repository 层返回的页面切片。"""

    model_config = ConfigDict(frozen=True)

    items: tuple[TrackAnalysisListItemResult, ...]
    has_more: bool
    available_industries: tuple[str, ...] = ()
    available_stances: tuple[str, ...] = ()


class ListPublicTrackAnalysesResult(BaseModel):
    """公开列表结果（带下一页 cursor）。"""

    model_config = ConfigDict(frozen=True)

    items: tuple[TrackAnalysisListItemResult, ...]
    next_cursor: str | None
    available_industries: tuple[str, ...] = ()
    available_stances: tuple[str, ...] = ()
