from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class TrackAnalysisStatus(StrEnum):
    """赛道分析记录的生命周期状态。"""

    DRAFT = "draft"
    PUBLISHED = "published"


class TrackReport(BaseModel):
    """单份赛道报告值对象。

    每个赛道有 6 份独立 HTML 报告（执行摘要 / 行业研判 / 竞争格局 / 商业模式 /
    AI 落地 / 操盘手册），都包含完整的 <html><head><body>，前端按需通过 iframe
    渲染。key 用于路由 (?report_key=overview)，title 给 Tab UI 显示。
    """

    model_config = ConfigDict(frozen=True)

    key: str
    title: str
    type: str
    sections: int
    charts: int
    description: str
    html: str


class TrackReportMeta(BaseModel):
    """单份报告的元数据（不含 html 主体），供列表 / 详情元信息使用。"""

    model_config = ConfigDict(frozen=True)

    key: str
    title: str
    type: str
    sections: int
    charts: int
    description: str


class TrackAnalysisSummary(BaseModel):
    """列表卡片场景使用的精简字段集合（不含 html 主体）。"""

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


class TrackAnalysis(TrackAnalysisSummary):
    """赛道分析聚合根，包含全部报告 HTML 主体。"""

    source_run_id: str | None
    reports: tuple[TrackReport, ...]
    is_deleted: bool
