"""数据契约。Pydantic 模型用于插件间数据交换与磁盘持久化。

设计原则：
- 字段命名与 ua-agent 的 blogger-frames 目录结构兼容，未来可直接复用其数据。
- 所有时间戳用 ISO 8601 字符串，避免时区与序列化歧义。
- 所有任务对象都带 run_id，方便贯通日志与产物。
"""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ===================== 博主与作品 =====================


class BloggerProfile(BaseModel):
    """博主主页资料。与 ua-agent profile.json 字段保持兼容。"""

    model_config = ConfigDict(extra="allow")  # 兼容 ua-agent 未来追加字段

    blogger_id: str = Field(description="本地稳定 ID（通常用 sec_uid）")
    display_name: str
    home_url: str
    sec_uid: str | None = None
    douyin_id: str | None = None
    avatar_url: str | None = None
    avatar_path: Path | None = Field(
        default=None,
        description="头像本地落盘路径，相对 workspace 根目录（例如 avatar.jpg）。"
        "下载失败时为 None。报告生成与官网部署优先用这个本地文件，避免抖音 CDN 外链断链或风控。",
    )
    description: str | None = None
    follower_count: int | None = None
    following_count: int | None = None
    liked_count: int | None = None
    total_works_count: int | None = None
    captured_at: str = Field(description="ISO 8601 时间戳")

    @field_validator("captured_at")
    @classmethod
    def _validate_iso(cls, v: str) -> str:
        datetime.fromisoformat(v.replace("Z", "+00:00"))
        return v


class VideoSample(BaseModel):
    """单条采样作品的元数据。"""

    model_config = ConfigDict(extra="allow")

    aweme_id: str = Field(description="抖音视频 ID")
    title: str
    url: str
    position: int = Field(description="主页展示顺序，0 表示最新")
    duration_seconds: float | None = None
    transcript_path: Path | None = None
    frame_paths: list[Path] = Field(default_factory=list)
    captured_at: str

    @field_validator("captured_at")
    @classmethod
    def _validate_iso(cls, v: str) -> str:
        datetime.fromisoformat(v.replace("Z", "+00:00"))
        return v


# ===================== 任务对象 =====================


class CollectJob(BaseModel):
    """采集任务输入。"""

    run_id: str
    workspace: Path
    url: str = Field(description="博主主页 URL")
    sample_count: int = 15
    sample_seed: int | None = None
    options: dict[str, str] = Field(default_factory=dict)


class CollectResult(BaseModel):
    """采集任务产出。"""

    run_id: str
    blogger: BloggerProfile
    samples: list[VideoSample]
    workspace: Path
    failures: list[str] = Field(default_factory=list, description="失败样本的简短说明，便于日志")


class AnalyzeJob(BaseModel):
    """分析任务输入。需要 collect 阶段写好的 workspace。"""

    run_id: str
    workspace: Path
    focus_count: int = 5
    options: dict[str, str] = Field(default_factory=dict)

    @field_validator("focus_count")
    @classmethod
    def _validate_focus(cls, v: int) -> int:
        if not (3 <= v <= 8):
            raise ValueError(f"focus_count 必须在 [3, 8]，收到 {v}")
        return v


class AnalyzeResult(BaseModel):
    """分析任务产出。"""

    run_id: str
    workspace: Path
    artifacts_dir: Path = Field(description="HTML / Markdown 产物目录")
    artifact_paths: list[Path] = Field(default_factory=list)
    summary: str = Field(default="", description="一句话总结，便于 CLI 输出")


class ReportJob(BaseModel):
    """报告整理任务输入。"""

    run_id: str
    workspace: Path
    artifacts_dir: Path
    options: dict[str, str] = Field(default_factory=dict)


class ReportResult(BaseModel):
    """报告整理任务产出。"""

    run_id: str
    artifacts: list[Path]


# ===================== Pipeline 顶层契约 =====================


PipelineStage = Literal["collect", "analyze", "report"]


class PipelineJob(BaseModel):
    """完整 pipeline 一次性运行所需的输入。"""

    run_id: str
    workspace: Path
    url: str | None = None
    focus_count: int = 5
    sample_count: int = 15
    stages: list[PipelineStage] = Field(default_factory=lambda: ["collect", "analyze", "report"])
    options: dict[str, str] = Field(default_factory=dict)


def make_run_id() -> str:
    """生成 ISO 8601 紧凑格式的 run_id，例如 20260519T143022Z。"""
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


__all__ = [
    "AnalyzeJob",
    "AnalyzeResult",
    "BloggerProfile",
    "CollectJob",
    "CollectResult",
    "PipelineJob",
    "PipelineStage",
    "ReportJob",
    "ReportResult",
    "VideoSample",
    "make_run_id",
]
