"""产物数据契约（outline.json / script.json）。"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, field_validator, model_validator


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


SlideType = Literal["cover", "hook", "stats", "quote", "bullets", "compare", "cta"]


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
    avatar_path: str = ""  # 相对于 slide HTML 同目录的头像图片路径（如 avatar.jpg）；为空时模板降级为 CSS 占位
    # cover "本期看点 · KEY MOVES" 4 个招式块（title 是招式名 ≤ 12 字，sub 是补充说明 ≤ 24 字）
    move_1_title: str = ""
    move_1_sub: str = ""
    move_2_title: str = ""
    move_2_sub: str = ""
    move_3_title: str = ""
    move_3_sub: str = ""
    move_4_title: str = ""
    move_4_sub: str = ""
    # stats 专用
    stat_1_label: str = ""
    stat_1_value: str = ""
    stat_2_label: str = ""
    stat_2_value: str = ""
    stat_3_label: str = ""
    stat_3_value: str = ""
    extra: str = ""
    # hook 专用：黄金 3 秒视觉冲击的大字与副标
    hook_big_text: str = ""
    hook_sub_text: str = ""

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
    target_seconds: int = 70
    speed_chars_per_sec: float = 5.5
    slides: list[SlideItem]

    @property
    def total_chars(self) -> int:
        return sum(len(s.narration) for s in self.slides)

    @property
    def char_limit(self) -> int:
        return int(self.target_seconds * self.speed_chars_per_sec)


# ════════════════════════════════════════════════════════════════════
# 小红书图文（xhs）独立 schema —— 与 ScriptDoc 解耦
# 8 张固定结构：00 cover · 01 hook · 02-06 point × 5 · 07 cta
# 3:4 1242×1656 PNG
# ════════════════════════════════════════════════════════════════════

XhsCardType = Literal["cover", "hook", "point", "cta"]


class XhsCard(BaseModel):
    """xhs script.json 中的单张图文卡片。

    字段按 card_type 分组：未使用字段保持空字符串即可，渲染器会做空值降级。
    """
    index: int  # 0 ~ 7
    card_type: XhsCardType
    page_label: str = ""  # 右上角页码标签，如 "01 / 08"

    # cover（00）
    blogger_name: str = ""
    blogger_followers: str = ""   # 显示文本，如 "98.3w 粉丝"
    cover_title_line_1: str = ""  # 主标题第 1 行
    cover_title_line_2: str = ""  # 主标题第 2 行
    cover_title_line_3: str = ""  # 主标题第 3 行（可空）
    cover_kicker: str = ""        # 主标题上方小字（如赛道/期数）
    cover_badge: str = "08p"      # 角标，默认 08p

    # hook（01）
    hook_kicker: str = ""         # 钩子上方小字（如 "一句话答卷"）
    hook_big_line_1: str = ""     # 钩子主文第 1 行
    hook_big_line_2: str = ""     # 钩子主文第 2 行
    hook_big_line_3: str = ""     # 第 3 行（可空）
    hook_sub: str = ""            # 副文（≤24 字）

    # point（02~06）
    point_no: str = ""            # 显示编号，如 "01" "02"
    point_kicker: str = ""        # 章节出处，如 "选题策略"
    point_title: str = ""         # 亮点标题（≤16 字）
    point_insight: str = ""       # 解读，2~3 行，≤60 字
    point_quote: str = ""         # 原话引用（可空）
    point_quote_source: str = ""  # 引用来源（如章节名），可空

    # cta（07）
    cta_kicker: str = ""          # 顶部小字
    cta_big_line_1: str = ""      # 行动号召主文第 1 行
    cta_big_line_2: str = ""      # 第 2 行
    cta_sub: str = ""             # 副文
    cta_brand: str = "微域生光"   # 品牌闭环，固定不可改为英文/域名


class XhsDoc(BaseModel):
    """xhs script.json：8 张图文卡片清单（由 Claude skill 写，CLI 只校验）。"""
    blogger_slug: str
    run_id: str
    cards: list[XhsCard]

    @field_validator("cards")
    @classmethod
    def cards_must_be_eight(cls, v: list[XhsCard]) -> list[XhsCard]:
        if len(v) != 8:
            raise ValueError(f"xhs cards 必须固定 8 张（封面+钩子+5亮点+CTA），实际 {len(v)} 张")
        expected = ["cover", "hook", "point", "point", "point", "point", "point", "cta"]
        actual = [c.card_type for c in v]
        if actual != expected:
            raise ValueError(f"xhs cards 类型顺序必须为 {expected}，实际 {actual}")
        for i, c in enumerate(v):
            if c.index != i:
                raise ValueError(f"xhs cards[{i}].index 必须为 {i}，实际 {c.index}")
        return v


# ════════════════════════════════════════════════════════════════════
# 架构图讲解视频（arch）独立 schema —— 与 ScriptDoc / XhsDoc 解耦
# ════════════════════════════════════════════════════════════════════


class ArchNode(BaseModel):
    """架构图中的一个框（一个组件/服务）。"""
    id: str            # 层内唯一，约定形如 "<layerId>.<name>"
    title: str
    sub: str = ""      # 副标题，可空
    accent: str = ""   # 可空：覆盖所属层强调色

    @field_validator("id", "title")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("ArchNode.id / title 不能为空")
        return v


class ArchLayer(BaseModel):
    """架构图中的一层（含若干框）。"""
    id: str
    title: str
    accent: str        # 十六进制色，如 "#4DA3FF"
    nodes: list[ArchNode]

    @field_validator("id", "title", "accent")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("ArchLayer.id / title / accent 不能为空")
        return v

    @field_validator("nodes")
    @classmethod
    def _nodes_non_empty(cls, v: list[ArchNode]) -> list[ArchNode]:
        if not v:
            raise ValueError("ArchLayer.nodes 至少 1 个")
        return v


class ArchDiagram(BaseModel):
    layers: list[ArchLayer]

    @field_validator("layers")
    @classmethod
    def _layers_non_empty(cls, v: list[ArchLayer]) -> list[ArchLayer]:
        if not v:
            raise ValueError("ArchDiagram.layers 至少 1 层")
        return v


class ArchSegment(BaseModel):
    """一段讲解：文本 + 高亮目标。"""
    index: int
    narration: str
    highlight: str | list[str]  # "all" | "<layerId>" | ["<layerId|nodeId>", ...]

    @field_validator("narration")
    @classmethod
    def _narration_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("ArchSegment.narration 不能为空")
        return v


class ArchDoc(BaseModel):
    """arch script.json（由 Claude skill 写，CLI 只校验）。"""
    slug: str
    run_id: str
    title: str
    subtitle: str = ""
    diagram: ArchDiagram
    segments: list[ArchSegment]

    def layer_ids(self) -> set[str]:
        return {layer.id for layer in self.diagram.layers}

    def node_ids(self) -> set[str]:
        return {node.id for layer in self.diagram.layers for node in layer.nodes}

    def resolve_highlight(self, seg: "ArchSegment") -> set[str]:
        """把 segment.highlight 归一为集合。'all' 原样返回 {'all'}。"""
        if isinstance(seg.highlight, str):
            if seg.highlight == "all":
                return {"all"}
            return {seg.highlight}
        return set(seg.highlight)

    @model_validator(mode="after")
    def _check_integrity(self) -> "ArchDoc":
        # 层 id 唯一
        lids = [layer.id for layer in self.diagram.layers]
        if len(lids) != len(set(lids)):
            raise ValueError("diagram.layers 存在重复 layer id")
        # 框 id 全局唯一
        nids = [n.id for layer in self.diagram.layers for n in layer.nodes]
        if len(nids) != len(set(nids)):
            raise ValueError("diagram 存在重复 node id")
        valid = {"all"} | set(lids) | set(nids)
        # segment.index 从 0 连续
        for i, seg in enumerate(self.segments):
            if seg.index != i:
                raise ValueError(f"segments[{i}].index 必须为 {i}，实际 {seg.index}")
            for ref in self.resolve_highlight(seg):
                if ref not in valid:
                    raise ValueError(f"segment {i} 的 highlight 引用了不存在的 id：{ref}")
        if not self.segments:
            raise ValueError("segments 至少 1 段")
        return self
