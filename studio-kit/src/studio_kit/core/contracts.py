"""产物数据契约（outline.json / script.json）。"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, field_validator


class BloggerStats(BaseModel):
    display_name: str
    followers: str = ""
    likes: str = ""
    works_count: int = 0


class QuoteItem(BaseModel):
    text: str
    source_chapter: str = ""


class FrameRef(BaseModel):
    path: str
    caption: str = ""


class ChapterSummary(BaseModel):
    id: str
    title: str
    summary: str = ""
    bullets: list[str] = []
    quotes: list[str] = []


class OutlineDoc(BaseModel):
    """extract 子命令产物。"""
    blogger_slug: str
    run_id: str
    stats: BloggerStats
    verdict: str = ""
    chapters: list[ChapterSummary] = []
    top_quotes: list[QuoteItem] = []
    frame_refs: list[FrameRef] = []


SlideType = Literal["cover", "stats", "quote", "bullets", "compare", "cta"]


class SlideItem(BaseModel):
    """script.json 中的单张幻灯片。"""
    index: int
    slide_type: SlideType
    title: str = ""
    narration: str
    bullets: list[str] = []
    quote: str = ""
    frame_ref: str = ""
    compare_before: str = ""
    compare_after: str = ""
    duration_estimate_s: float = 0.0
    # cover 专用
    subtitle: str = ""
    verdict: str = ""
    # stats 专用
    stat_1_label: str = ""
    stat_1_value: str = ""
    stat_2_label: str = ""
    stat_2_value: str = ""
    stat_3_label: str = ""
    stat_3_value: str = ""
    extra: str = ""

    @field_validator("narration")
    @classmethod
    def narration_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("narration 不能为空")
        return v


class ScriptDoc(BaseModel):
    """script.json（由 Claude skill 写，CLI 只校验）。"""
    blogger_slug: str
    run_id: str
    target_seconds: int = 110
    speed_chars_per_sec: float = 5.5
    slides: list[SlideItem]

    @property
    def total_chars(self) -> int:
        return sum(len(s.narration) for s in self.slides)

    @property
    def char_limit(self) -> int:
        return int(self.target_seconds * self.speed_chars_per_sec)
