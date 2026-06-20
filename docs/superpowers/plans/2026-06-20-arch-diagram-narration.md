# 架构图音色讲解视频（arch-diagram-narration）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `studio-kit` 内新增"架构描述 → 本人音色逐段讲解 + 分段高亮的横版架构图视频"能力。

**Architecture:** 沿用 studio-kit 双段式产线（Claude skill 写 `script.json`、CLI 校验+渲染）。复用 IndexTTS-2 音色克隆（`tts/run_batch`）与 ffmpeg 合成；新增对任意架构通用的"分层架构图 HTML 渲染器 + 分段明暗高亮"。新增 `ArchDoc` 契约与 `arch-video` 命令，**不改动现有竖屏口播/小红书图文行为**。

**Tech Stack:** Python 3.11（studio-kit 现有 venv）、pydantic v2、typer、Patchright（录屏）、ffmpeg-python + ffmpeg CLI、IndexTTS-2（GPU，经 ua-agent venv 子进程）、pytest。

## Global Constraints

- 运行目录：`D:\code\weelume-base\studio-kit`；包根 `src/studio_kit`；Python `>=3.11,<3.13`。
- 包管理 **uv**：装依赖用 `uv add`，跑命令用 `uv run`；**不新增第三方依赖**（现有依赖已足够）。
- **禁止重复实现已有能力**：TTS 用 `studio_kit.tts.indextts.run_batch`；录屏沿用 Patchright 模式；合成沿用 ffmpeg。
- **不静默兜底、不吞异常**：缺失 venv/voice-sample、悬空 highlight 引用、ffmpeg 失败一律 `raise` + 日志。
- **可见层品牌铁律**：角标固定 `微域生光 | 十一AI编程`；**禁止** `weelume.com`、任何域名、任何英文品牌名出现在画面或字幕。
- TypeScript 不涉及；Python 全量类型标注，禁止无约束动态类型。
- 视频规格：1920×1080 / 30fps / h264 `yuv420p` / aac 192k；深色主题 `#12141C`。
- 默认音色：`assets/voice-samples/chenchangzhang-desktop.wav`。
- 产物工作区：`studio-kit/output/arch/<slug>/<run_id>/`，含 `script.json`、`audio/`、`clips/`、`final.mp4`。
- 中文注释只加在复杂逻辑/边界/异常处；commit message 用中文，结尾附 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。

---

## File Structure

新增：
- `src/studio_kit/core/contracts.py` — **修改**：追加 `ArchNode / ArchLayer / ArchDiagram / ArchSegment / ArchDoc`。
- `src/studio_kit/core/audio.py` — **新建**：`write_audio_meta(...)`（NN.meta.json 写出，供 arch 复用）。
- `src/studio_kit/arch/__init__.py` — **新建**：空包标记。
- `src/studio_kit/arch/tts.py` — **新建**：`run_arch_tts(...)`，逐段合成 `audio/NN.wav` + `NN.meta.json`。
- `src/studio_kit/arch/build.py` — **新建**：`run_arch_build(...)`，串行 tts→render→compose。
- `src/studio_kit/render/recorder.py` — **新建**：`record_html_to_mp4(...)` 通用 Patchright 录屏（从 slide 模式抽象，可配分辨率/背景）。
- `src/studio_kit/render/arch_diagram.py` — **新建**：`build_diagram_html(doc, highlight)` 纯函数，产出完整架构图 HTML（含品牌角标、已烘焙高亮类）。
- `src/studio_kit/render/arch_renderer.py` — **新建**：`render_all_segments(...)`，逐段写 HTML + 录屏 → `clips/NN.mp4`。
- `src/studio_kit/render/video_format.py` — **新建**：`VideoFormat` 值对象 + `HORIZONTAL` / `VERTICAL` 常量。
- `src/studio_kit/render/ffmpeg_compose.py` — **修改**：抽 `_compose_core(...)`，按 `VideoFormat` 参数化 ASS；新增 `compose_arch(...)`；现有 `compose(script,...)` 行为不变（内部走 VERTICAL）。
- `src/studio_kit/cli.py` — **修改**：新增 `arch-video` 命令。
- `.claude/skills/arch-diagram-narration/SKILL.md` — **新建**：起草 ArchDoc + 强制确认卡点。
- 测试：`tests/test_arch_contracts.py`、`tests/test_arch_diagram_html.py`、`tests/test_video_format_ass.py`、`tests/test_arch_tts_placeholder.py`。
- 冒烟：`scripts/arch_smoke_fixture.json`（2 段最小样例）+ 文档化的人工核验步骤。

> 录屏/合成/GPU 无法纯单测：用 placeholder TTS 后端 + 纯函数测 HTML/ASS 覆盖逻辑；端到端用冒烟脚本人工核验。

---

## Task 1: ArchDoc 数据契约与校验

**Files:**
- Modify: `src/studio_kit/core/contracts.py`（文件末尾追加）
- Test: `tests/test_arch_contracts.py`

**Interfaces:**
- Produces:
  - `ArchNode(id: str, title: str, sub: str = "", accent: str = "")`
  - `ArchLayer(id: str, title: str, accent: str, nodes: list[ArchNode])`
  - `ArchDiagram(layers: list[ArchLayer])`
  - `ArchSegment(index: int, narration: str, highlight: str | list[str])`
  - `ArchDoc(slug: str, run_id: str, title: str, subtitle: str = "", diagram: ArchDiagram, segments: list[ArchSegment])`
  - `ArchDoc.layer_ids() -> set[str]`、`ArchDoc.node_ids() -> set[str]`
  - `ArchDoc.resolve_highlight(seg: ArchSegment) -> set[str]`（返回 `{"all"}` 或被点亮的 layer/node id 集合）

- [ ] **Step 1: 写失败测试**

```python
# tests/test_arch_contracts.py
import pytest
from pydantic import ValidationError
from studio_kit.core.contracts import ArchDoc

def _doc(**over):
    base = {
        "slug": "im", "run_id": "r1", "title": "T",
        "diagram": {"layers": [
            {"id": "client", "title": "客户端层", "accent": "#4DA3FF",
             "nodes": [{"id": "client.mobile", "title": "iOS/Android"}]},
            {"id": "logic", "title": "业务逻辑层", "accent": "#A78BFA",
             "nodes": [{"id": "logic.msg", "title": "消息服务"},
                       {"id": "logic.user", "title": "用户服务"}]},
        ]},
        "segments": [
            {"index": 0, "narration": "总览", "highlight": "all"},
            {"index": 1, "narration": "客户端", "highlight": "client"},
            {"index": 2, "narration": "消息", "highlight": ["logic.msg"]},
        ],
    }
    base.update(over)
    return base

def test_valid_doc_parses():
    doc = ArchDoc.model_validate(_doc())
    assert doc.layer_ids() == {"client", "logic"}
    assert "logic.msg" in doc.node_ids()
    assert doc.resolve_highlight(doc.segments[0]) == {"all"}
    assert doc.resolve_highlight(doc.segments[1]) == {"client"}
    assert doc.resolve_highlight(doc.segments[2]) == {"logic.msg"}

def test_dangling_highlight_rejected():
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(_doc(segments=[{"index": 0, "narration": "x", "highlight": "nope"}]))

def test_non_contiguous_index_rejected():
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(_doc(segments=[{"index": 5, "narration": "x", "highlight": "all"}]))

def test_duplicate_layer_id_rejected():
    bad = _doc()
    bad["diagram"]["layers"][1]["id"] = "client"
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(bad)

def test_empty_nodes_rejected():
    bad = _doc()
    bad["diagram"]["layers"][0]["nodes"] = []
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(bad)

def test_empty_narration_rejected():
    with pytest.raises(ValidationError):
        ArchDoc.model_validate(_doc(segments=[{"index": 0, "narration": "  ", "highlight": "all"}]))
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd D:\code\weelume-base\studio-kit && uv run pytest tests/test_arch_contracts.py -v`
Expected: FAIL（`ImportError: cannot import name 'ArchDoc'`）

- [ ] **Step 3: 实现 schema（追加到 contracts.py 末尾）**

```python
# ════════════════════════════════════════════════════════════════════
# 架构图讲解视频（arch）独立 schema —— 与 ScriptDoc / XhsDoc 解耦
# ════════════════════════════════════════════════════════════════════
from pydantic import model_validator  # 若文件顶部已导入则合并，勿重复


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
```

> 注意：`field_validator` 已在文件顶部导入；`model_validator` 需确保已导入（顶部 `from pydantic import BaseModel, field_validator, model_validator`）。

- [ ] **Step 4: 跑测试确认通过**

Run: `uv run pytest tests/test_arch_contracts.py -v`
Expected: PASS（6 passed）

- [ ] **Step 5: 提交**

```bash
git add src/studio_kit/core/contracts.py tests/test_arch_contracts.py
git commit -m "feat(studio-kit): 新增 ArchDoc 架构图讲解视频数据契约与校验

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 架构图 HTML 生成器（纯函数 + 烘焙高亮）

**Files:**
- Create: `src/studio_kit/render/arch_diagram.py`
- Test: `tests/test_arch_diagram_html.py`

**Interfaces:**
- Consumes: `ArchDoc`（Task 1）
- Produces:
  - `BRAND: str = "微域生光 | 十一AI编程"`
  - `build_diagram_html(doc: ArchDoc, highlight: str | list[str]) -> str`
  - 规则：非高亮的层/框烘焙 `dim` 类；高亮目标烘焙 `glow` 类；`highlight=="all"` 时无 `dim`。框级高亮时，其所属层不 `dim`、层内其它框 `dim`。

- [ ] **Step 1: 写失败测试**

```python
# tests/test_arch_diagram_html.py
from studio_kit.core.contracts import ArchDoc
from studio_kit.render.arch_diagram import build_diagram_html, BRAND

def _doc():
    return ArchDoc.model_validate({
        "slug": "im", "run_id": "r1", "title": "标题T",
        "diagram": {"layers": [
            {"id": "client", "title": "客户端层", "accent": "#4DA3FF",
             "nodes": [{"id": "client.mobile", "title": "iOS/Android", "sub": "本地库"}]},
            {"id": "logic", "title": "业务逻辑层", "accent": "#A78BFA",
             "nodes": [{"id": "logic.msg", "title": "消息服务"},
                       {"id": "logic.user", "title": "用户服务"}]},
        ]},
        "segments": [{"index": 0, "narration": "x", "highlight": "all"}],
    })

def test_all_ids_and_brand_present():
    html = build_diagram_html(_doc(), "all")
    assert 'data-layer-id="client"' in html
    assert 'data-layer-id="logic"' in html
    assert 'data-node-id="logic.msg"' in html
    assert "标题T" in html
    assert BRAND in html
    assert "weelume" not in html.lower()  # 可见层禁域名

def test_highlight_all_has_no_dim():
    html = build_diagram_html(_doc(), "all")
    assert "dim" not in html

def test_layer_highlight_dims_others():
    html = build_diagram_html(_doc(), "client")
    # client 层标签块不 dim，logic 层 dim
    assert _layer_block(html, "logic").count("dim") >= 1
    assert "dim" not in _layer_block(html, "client")

def test_node_highlight_keeps_layer_dims_siblings():
    html = build_diagram_html(_doc(), ["logic.msg"])
    # 所属 logic 层整体不 dim，但兄弟框 logic.user dim、目标框 logic.msg 不 dim 且 glow
    assert "dim" not in _node_block(html, "logic.msg")
    assert "glow" in _node_block(html, "logic.msg")
    assert "dim" in _node_block(html, "logic.user")
    assert "dim" not in _layer_label_block(html, "logic")

# 辅助：从 html 截取某层/框的 class 串（实现用正则定位 data-*-id 所在元素的 class 属性）
def _layer_block(html: str, lid: str) -> str: ...
def _node_block(html: str, nid: str) -> str: ...
def _layer_label_block(html: str, lid: str) -> str: ...
```

> 实现 `_layer_block` 等辅助：用 `re` 定位含对应 `data-layer-id="<id>"` / `data-node-id="<id>"` 的开标签，回取其 `class="..."`。具体实现写在测试文件内。

- [ ] **Step 2: 跑测试确认失败**

Run: `uv run pytest tests/test_arch_diagram_html.py -v`
Expected: FAIL（`ModuleNotFoundError: studio_kit.render.arch_diagram`）

- [ ] **Step 3: 实现生成器**

```python
# src/studio_kit/render/arch_diagram.py
"""把 ArchDoc.diagram 渲染成完整架构图 HTML（内联 CSS，深色主题）。

高亮在 Python 侧"烘焙"成 class：非目标层/框加 dim，目标加 glow。
highlight=="all" 时所有层正常亮度。纯函数，便于无浏览器单测。
"""
from __future__ import annotations

import html as _html

from studio_kit.core.contracts import ArchDoc, ArchLayer, ArchNode

BRAND = "微域生光 | 十一AI编程"

_CSS = """
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1920px; height:1080px; background:#12141C;
    font-family:"Microsoft YaHei","PingFang SC",sans-serif; overflow:hidden; }
  .stage { width:1920px; height:1080px; padding:40px 56px; display:flex; flex-direction:column; }
  .title { color:#fff; font-size:38px; font-weight:700; text-align:center; }
  .subtitle { color:#8FA0B5; font-size:18px; text-align:center; margin-top:6px; }
  .layers { flex:1; display:flex; flex-direction:column; gap:14px; margin-top:18px; }
  .layer { display:flex; align-items:stretch; gap:14px; flex:1;
    border:2px solid var(--accent); border-radius:10px; background:#1B2130;
    padding:12px 14px; transition:opacity .25s, filter .25s; }
  .layer-label { writing-mode:vertical-rl; text-orientation:upright; min-width:56px;
    background:var(--accent); color:#0B0E14; font-weight:700; font-size:16px;
    border-radius:8px; display:flex; align-items:center; justify-content:center; }
  .nodes { flex:1; display:flex; gap:12px; }
  .node { flex:1; background:#283142; border:1.5px solid var(--accent); border-radius:8px;
    color:#EAEEF5; padding:10px 12px; display:flex; flex-direction:column; justify-content:center;
    transition:opacity .25s, filter .25s, box-shadow .25s; }
  .node .n-title { font-size:18px; font-weight:600; }
  .node .n-sub { font-size:12px; color:#90A0B5; margin-top:4px; }
  /* 高亮态 */
  .dim { opacity:.22; filter:saturate(.4); }
  .glow { box-shadow:0 0 18px 2px var(--accent); border-width:2.5px; }
  .brand { position:fixed; right:24px; bottom:18px; color:#9AA7B8; font-size:16px;
    letter-spacing:1px; opacity:.85; }
</style>
"""


def _esc(s: str) -> str:
    return _html.escape(s, quote=True)


def _node_classes(node: ArchNode, targets: set[str], layer_is_target: bool, all_on: bool) -> str:
    cls = ["node"]
    if all_on:
        return "node"
    if node.id in targets:
        cls.append("glow")
    elif layer_is_target:
        # 框级高亮：同层非目标框压暗
        cls.append("dim")
    else:
        cls.append("dim")
    return " ".join(cls)


def _render_layer(layer: ArchLayer, targets: set[str], all_on: bool) -> str:
    # 该层是否被点亮：层 id 命中，或层内有任一框命中
    node_hit = any(n.id in targets for n in layer.nodes)
    layer_is_target = layer.id in targets or node_hit
    layer_cls = "layer" if (all_on or layer_is_target) else "layer dim"
    nodes_html = "".join(
        f'<div class="{_node_classes(n, targets, layer_is_target, all_on)}" '
        f'data-node-id="{_esc(n.id)}"'
        f'{f" style=\"--accent:{_esc(n.accent)}\"" if n.accent else ""}>'
        f'<div class="n-title">{_esc(n.title)}</div>'
        + (f'<div class="n-sub">{_esc(n.sub)}</div>' if n.sub else "")
        + "</div>"
        for n in layer.nodes
    )
    return (
        f'<div class="{layer_cls}" data-layer-id="{_esc(layer.id)}" '
        f'style="--accent:{_esc(layer.accent)}">'
        f'<div class="layer-label">{_esc(layer.title)}</div>'
        f'<div class="nodes">{nodes_html}</div>'
        f"</div>"
    )


def build_diagram_html(doc: ArchDoc, highlight: str | list[str]) -> str:
    """渲染完整架构图 HTML。highlight 同 ArchSegment.highlight 语义。"""
    targets = doc.resolve_highlight(_FakeSeg(highlight))
    all_on = targets == {"all"}
    layers_html = "".join(_render_layer(l, targets, all_on) for l in doc.diagram.layers)
    subtitle_html = f'<div class="subtitle">{_esc(doc.subtitle)}</div>' if doc.subtitle else ""
    return (
        "<!DOCTYPE html><html><head><meta charset='utf-8'>" + _CSS + "</head><body>"
        f'<div class="stage"><div class="title">{_esc(doc.title)}</div>{subtitle_html}'
        f'<div class="layers">{layers_html}</div></div>'
        f'<div class="brand">{_esc(BRAND)}</div>'
        "</body></html>"
    )


class _FakeSeg:
    """复用 ArchDoc.resolve_highlight 的轻量壳（只需 .highlight 字段）。"""
    def __init__(self, highlight: str | list[str]) -> None:
        self.highlight = highlight
```

> `build_diagram_html` 借 `doc.resolve_highlight` 归一 highlight；`_FakeSeg` 仅承载 `.highlight`。`resolve_highlight` 只读 `seg.highlight`，类型兼容。

- [ ] **Step 4: 跑测试确认通过**

Run: `uv run pytest tests/test_arch_diagram_html.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/studio_kit/render/arch_diagram.py tests/test_arch_diagram_html.py
git commit -m "feat(studio-kit): 架构图 HTML 生成器（分段明暗高亮 + 品牌角标）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: VideoFormat 值对象 + ASS 字幕参数化（含竖屏回归）

**Files:**
- Create: `src/studio_kit/render/video_format.py`
- Modify: `src/studio_kit/render/ffmpeg_compose.py`（抽 `_generate_ass` 接受 `VideoFormat`）
- Test: `tests/test_video_format_ass.py`

**Interfaces:**
- Produces:
  - `VideoFormat(width:int, height:int, sub_fontsize:int, sub_margin_v:int)`（frozen dataclass）
  - `VERTICAL = VideoFormat(1080, 1920, 80, 480)`、`HORIZONTAL = VideoFormat(1920, 1080, 52, 64)`
  - `ffmpeg_compose._generate_ass(segments, audio_dir, out_ass, fmt)`：`segments` 为 `list[tuple[int, str]]`（index, narration）。
- Consumes: 现有 `_chunk_narration`、`_seconds_to_ass_time`（不变）。

- [ ] **Step 1: 写失败测试**

```python
# tests/test_video_format_ass.py
from pathlib import Path
from studio_kit.render.video_format import VERTICAL, HORIZONTAL
from studio_kit.render.ffmpeg_compose import _generate_ass

def test_horizontal_ass_header(tmp_path: Path):
    out = tmp_path / "h.ass"
    _generate_ass([(0, "你好。世界。")], tmp_path, out, HORIZONTAL)
    txt = out.read_text(encoding="utf-8")
    assert "PlayResX: 1920" in txt
    assert "PlayResY: 1080" in txt
    assert ",52," in txt           # 字号 52
    assert "Dialogue:" in txt

def test_vertical_ass_unchanged(tmp_path: Path):
    out = tmp_path / "v.ass"
    _generate_ass([(0, "你好。世界。")], tmp_path, out, VERTICAL)
    txt = out.read_text(encoding="utf-8")
    assert "PlayResX: 1080" in txt
    assert "PlayResY: 1920" in txt
    assert ",80," in txt           # 竖屏字号仍 80（回归）
```

- [ ] **Step 2: 跑测试确认失败**

Run: `uv run pytest tests/test_video_format_ass.py -v`
Expected: FAIL（`ModuleNotFoundError: studio_kit.render.video_format` 或 `_generate_ass` 签名不符）

- [ ] **Step 3: 实现 VideoFormat + 重构 _generate_ass**

```python
# src/studio_kit/render/video_format.py
"""视频规格值对象：驱动 compose 的分辨率与字幕样式。"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class VideoFormat:
    width: int
    height: int
    sub_fontsize: int   # ASS 字号（像素，PlayRes 与分辨率 1:1）
    sub_margin_v: int   # 字幕距底边像素


VERTICAL = VideoFormat(1080, 1920, 80, 480)     # 现有竖屏口播
HORIZONTAL = VideoFormat(1920, 1080, 52, 64)    # 架构讲解横版
```

在 `ffmpeg_compose.py` 把现有 `_generate_ass(script, audio_dir, out_ass)` 改造为按 `VideoFormat` 参数化，并接受 `segments: list[tuple[int, str]]`：

```python
from studio_kit.render.video_format import VideoFormat, VERTICAL

def _generate_ass(
    segments: list[tuple[int, str]],
    audio_dir: Path,
    out_ass: Path,
    fmt: VideoFormat = VERTICAL,
) -> None:
    header = (
        "[Script Info]\n"
        "ScriptType: v4.00+\n"
        f"PlayResX: {fmt.width}\n"
        f"PlayResY: {fmt.height}\n"
        "ScaledBorderAndShadow: yes\n"
        "WrapStyle: 1\n\n"
        "[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, "
        "OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, "
        "ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, "
        "Alignment, MarginL, MarginR, MarginV, Encoding\n"
        f"Style: Default,Microsoft YaHei,{fmt.sub_fontsize},"
        "&H00FFFFFF,&H000000FF,&H00000000,&H00000000,"
        f"-1,0,0,0,100,100,0,0,1,3,0,2,40,40,{fmt.sub_margin_v},1\n\n"
        "[Events]\n"
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n"
    )
    dialogue_lines: list[str] = []
    current_s = 0.0
    for index, narration in segments:
        idx_str = _slide_index_str(index)
        meta_path = audio_dir / f"{idx_str}.meta.json"
        duration_s = 3.0
        if meta_path.exists():
            try:
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
                duration_s = meta.get("duration_ms", duration_s * 1000) / 1000.0
            except Exception as e:
                logger.warning("读取 audio meta 失败，使用默认时长：%s", e)
        chunks = _chunk_narration(narration)
        if not chunks:
            current_s += duration_s
            continue
        chunk_dur = duration_s / len(chunks)
        for i, chunk in enumerate(chunks):
            t0 = current_s + i * chunk_dur
            t1 = t0 + chunk_dur
            dialogue_lines.append(
                f"Dialogue: 0,{_seconds_to_ass_time(t0)},{_seconds_to_ass_time(t1)},"
                f"Default,,0,0,0,,{chunk}"
            )
        current_s += duration_s
    out_ass.parent.mkdir(parents=True, exist_ok=True)
    out_ass.write_text(header + "\n".join(dialogue_lines) + "\n", encoding="utf-8")
    logger.info("ASS 字幕已生成：%s", out_ass)
```

在 `compose(...)`（现有竖屏入口）内，把原 `_generate_ass(script, audio_dir, ass_path)` 调用改为：

```python
    segments = [(s.index, s.narration) for s in script.slides]
    _generate_ass(segments, audio_dir, ass_path, VERTICAL)
```

> 仅此一处调用改动；竖屏字号/边距由 `VERTICAL` 保持 80/480，行为不变（由 `test_vertical_ass_unchanged` 守住）。

- [ ] **Step 4: 跑测试确认通过（含竖屏回归）**

Run: `uv run pytest tests/test_video_format_ass.py -v`
Expected: PASS（2 passed）

- [ ] **Step 5: 提交**

```bash
git add src/studio_kit/render/video_format.py src/studio_kit/render/ffmpeg_compose.py tests/test_video_format_ass.py
git commit -m "refactor(studio-kit): ASS 字幕按 VideoFormat 参数化（竖屏行为不变）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 横版合成入口 compose_arch

**Files:**
- Modify: `src/studio_kit/render/ffmpeg_compose.py`（新增 `compose_arch`）

**Interfaces:**
- Consumes: `_merge_slide_av`、`_write_concat_txt`、`_generate_ass`、`_concat_with_subtitles`（均现有/Task 3）、`HORIZONTAL`（Task 3）、`ArchDoc`（Task 1）。
- Produces: `compose_arch(doc: ArchDoc, audio_dir: Path, clips_dir: Path, out_mp4: Path, *, force: bool = False) -> None`。

- [ ] **Step 1: 实现 compose_arch**

```python
# 追加到 ffmpeg_compose.py
from studio_kit.core.contracts import ArchDoc
from studio_kit.render.video_format import HORIZONTAL

def compose_arch(
    doc: ArchDoc,
    audio_dir: Path,
    clips_dir: Path,
    out_mp4: Path,
    *,
    force: bool = False,
) -> None:
    """把 clips/NN.mp4（无音轨）+ audio/NN.wav 合成横版 final.mp4（1920×1080）。

    复用竖屏同款 helper：逐段合并音轨 → concat → 烧 ASS 字幕。
    """
    if out_mp4.exists() and not force:
        logger.info("final.mp4 已存在，跳过（--force 强制重生）")
        return
    work_dir = out_mp4.parent
    clip_av_dir = work_dir / "clip_av"
    clip_av_dir.mkdir(parents=True, exist_ok=True)

    av_paths: list[Path] = []
    for seg in doc.segments:
        idx_str = _slide_index_str(seg.index)
        clip_mp4 = clips_dir / f"{idx_str}.mp4"
        audio_wav = audio_dir / f"{idx_str}.wav"
        if not clip_mp4.exists():
            raise FileNotFoundError(f"片段视频不存在：{clip_mp4}")
        if not audio_wav.exists():
            raise FileNotFoundError(f"音频不存在：{audio_wav}")
        out_av = clip_av_dir / f"{idx_str}.mp4"
        _merge_slide_av(clip_mp4, audio_wav, out_av)
        av_paths.append(out_av)
    if not av_paths:
        raise ValueError("没有可合成的片段")

    concat_txt = work_dir / "concat.txt"
    _write_concat_txt(av_paths, concat_txt)
    ass_path = work_dir / "subtitles.ass"
    _generate_ass([(s.index, s.narration) for s in doc.segments], audio_dir, ass_path, HORIZONTAL)
    _concat_with_subtitles(concat_txt, ass_path, out_mp4)
    logger.info("横版 final.mp4 合成完成：%s", out_mp4)
```

> `_concat_with_subtitles` 已含 h264/aac/30fps/faststart，分辨率随片段实际尺寸（横版片段由 Task 6 录制为 1920×1080），无需改它。

- [ ] **Step 2: 语法/导入自检**

Run: `uv run python -c "from studio_kit.render.ffmpeg_compose import compose_arch; print('ok')"`
Expected: 打印 `ok`（无导入错误）

- [ ] **Step 3: 提交**

```bash
git add src/studio_kit/render/ffmpeg_compose.py
git commit -m "feat(studio-kit): 新增横版 compose_arch（复用竖屏合成 helper）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 通用录屏 recorder + arch 片段渲染器

**Files:**
- Create: `src/studio_kit/render/recorder.py`
- Create: `src/studio_kit/render/arch_renderer.py`

**Interfaces:**
- Consumes: `build_diagram_html`（Task 2）、`ArchDoc`（Task 1）。
- Produces:
  - `recorder.record_html_to_mp4(html_path: Path, out_mp4: Path, duration_ms: int, webm_dir: Path, *, width: int, height: int, bg_rgb: tuple[int,int,int]) -> None`
  - `arch_renderer.render_all_segments(doc: ArchDoc, audio_dir: Path, clips_dir: Path, *, force: bool = False) -> list[Path]`

- [ ] **Step 1: 实现通用录屏 recorder（抽象自 slide_renderer 的录屏逻辑）**

```python
# src/studio_kit/render/recorder.py
"""通用 Patchright 录屏：HTML → 定长 mp4。分辨率与背景可配。

抽象自 slide_renderer 的录屏写法，供 arch 横版复用。slide_renderer 暂不改动。
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import ffmpeg

from studio_kit.core.logging import get_logger

logger = get_logger(__name__)


async def _record(html_path: Path, out_mp4: Path, duration_ms: int, webm_dir: Path,
                  width: int, height: int, bg_rgb: tuple[int, int, int]) -> None:
    from patchright.async_api import async_playwright
    webm_dir.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": width, "height": height},
            record_video_dir=str(webm_dir),
            record_video_size={"width": width, "height": height},
        )
        page = await ctx.new_page()
        client = await ctx.new_cdp_session(page)
        r, g, b = bg_rgb
        await client.send("Emulation.setDefaultBackgroundColorOverride",
                          {"color": {"r": r, "g": g, "b": b, "a": 1.0}})
        await page.goto(html_path.as_uri(), wait_until="load", timeout=15000)
        await page.wait_for_timeout(duration_ms + 300)
        video = page.video
        await ctx.close()
        if video is None:
            raise RuntimeError(f"录屏失败：无 video 对象，html={html_path}")
        webm_path = Path(await video.path())
    (
        ffmpeg.input(str(webm_path))
        .output(str(out_mp4), vcodec="libx264", pix_fmt="yuv420p", r=30)
        .overwrite_output().run(quiet=True)
    )
    webm_path.unlink(missing_ok=True)
    logger.info("片段 mp4 已生成：%s", out_mp4)


def record_html_to_mp4(html_path: Path, out_mp4: Path, duration_ms: int, webm_dir: Path,
                       *, width: int, height: int, bg_rgb: tuple[int, int, int]) -> None:
    """同步包装：录制单个 HTML 为定长 mp4。"""
    asyncio.run(_record(html_path, out_mp4, duration_ms, webm_dir, width, height, bg_rgb))
```

- [ ] **Step 2: 实现 arch_renderer**

```python
# src/studio_kit/render/arch_renderer.py
"""逐段渲染架构图片段：build_diagram_html → 录屏 → clips/NN.mp4。"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from studio_kit.core.contracts import ArchDoc
from studio_kit.core.logging import get_logger
from studio_kit.render.arch_diagram import build_diagram_html
from studio_kit.render.recorder import record_html_to_mp4
from studio_kit.render.video_format import HORIZONTAL

logger = get_logger(__name__)

_BG = (18, 20, 28)  # #12141C


def _idx(i: int) -> str:
    return f"{i:02d}"


def render_all_segments(doc: ArchDoc, audio_dir: Path, clips_dir: Path,
                        *, force: bool = False) -> list[Path]:
    clips_dir.mkdir(parents=True, exist_ok=True)
    webm_dir = clips_dir / "_webm"
    results: list[Path] = []
    for seg in doc.segments:
        idx = _idx(seg.index)
        out_html = clips_dir / f"{idx}.html"
        out_mp4 = clips_dir / f"{idx}.mp4"
        if out_mp4.exists() and not force:
            logger.info("片段 %s.mp4 已存在，跳过（--force 重生）", idx)
            results.append(out_mp4)
            continue
        # 读 TTS 实际时长
        meta_path = audio_dir / f"{idx}.meta.json"
        if not meta_path.exists():
            raise FileNotFoundError(f"缺少 {meta_path}（请先运行 TTS）")
        duration_ms = int(json.loads(meta_path.read_text(encoding="utf-8"))["duration_ms"])
        # 生成高亮 HTML
        out_html.write_text(build_diagram_html(doc, seg.highlight), encoding="utf-8")
        record_html_to_mp4(out_html, out_mp4, duration_ms, webm_dir,
                           width=HORIZONTAL.width, height=HORIZONTAL.height, bg_rgb=_BG)
        results.append(out_mp4)
    if webm_dir.exists():
        try:
            shutil.rmtree(webm_dir)
        except Exception as e:
            logger.warning("清理 webm 失败：%s", e)
    return results
```

- [ ] **Step 3: 导入自检**

Run: `uv run python -c "from studio_kit.render.arch_renderer import render_all_segments; from studio_kit.render.recorder import record_html_to_mp4; print('ok')"`
Expected: 打印 `ok`

- [ ] **Step 4: 提交**

```bash
git add src/studio_kit/render/recorder.py src/studio_kit/render/arch_renderer.py
git commit -m "feat(studio-kit): 通用录屏 recorder + 架构图逐段渲染器（横版 1920×1080）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: arch TTS 编排（含 placeholder 单测）

**Files:**
- Create: `src/studio_kit/core/audio.py`
- Create: `src/studio_kit/arch/__init__.py`
- Create: `src/studio_kit/arch/tts.py`
- Test: `tests/test_arch_tts_placeholder.py`

**Interfaces:**
- Consumes: `studio_kit.tts.placeholder.synthesize`、`studio_kit.tts.indextts.run_batch`、`ArchDoc`。
- Produces:
  - `core.audio.write_audio_meta(meta_path: Path, index: int, duration_s: float, chars: int, backend: str) -> None`
  - `arch.tts.run_arch_tts(doc: ArchDoc, audio_dir: Path, *, backend: str, voice_sample: Path | None, force: bool) -> None`

- [ ] **Step 1: 写失败测试（用 placeholder 后端，无需 GPU）**

```python
# tests/test_arch_tts_placeholder.py
import json
from pathlib import Path
from studio_kit.core.contracts import ArchDoc
from studio_kit.arch.tts import run_arch_tts

def _doc():
    return ArchDoc.model_validate({
        "slug": "im", "run_id": "r1", "title": "T",
        "diagram": {"layers": [
            {"id": "a", "title": "A层", "accent": "#4DA3FF",
             "nodes": [{"id": "a.x", "title": "X"}]}]},
        "segments": [
            {"index": 0, "narration": "第一段讲解", "highlight": "all"},
            {"index": 1, "narration": "第二段讲解", "highlight": "a"},
        ],
    })

def test_placeholder_tts_writes_wav_and_meta(tmp_path: Path):
    audio_dir = tmp_path / "audio"
    run_arch_tts(_doc(), audio_dir, backend="placeholder", voice_sample=None, force=False)
    for i in ("00", "01"):
        assert (audio_dir / f"{i}.wav").exists()
        meta = json.loads((audio_dir / f"{i}.meta.json").read_text(encoding="utf-8"))
        assert meta["duration_ms"] > 0
        assert meta["backend"] == "placeholder"

def test_unknown_backend_raises(tmp_path: Path):
    import pytest
    with pytest.raises(ValueError):
        run_arch_tts(_doc(), tmp_path / "a", backend="bogus", voice_sample=None, force=False)
```

- [ ] **Step 2: 跑测试确认失败**

Run: `uv run pytest tests/test_arch_tts_placeholder.py -v`
Expected: FAIL（`ModuleNotFoundError: studio_kit.arch.tts`）

- [ ] **Step 3: 实现 audio meta + arch tts**

```python
# src/studio_kit/core/audio.py
"""音频元数据写出（NN.meta.json）。arch 与口播共享同一约定。"""
from __future__ import annotations

import json
from pathlib import Path


def write_audio_meta(meta_path: Path, index: int, duration_s: float, chars: int, backend: str) -> None:
    meta = {
        "slide_index": index,
        "duration_s": duration_s,
        "duration_ms": int(duration_s * 1000),
        "chars": chars,
        "backend": backend,
    }
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
```

```python
# src/studio_kit/arch/__init__.py
```
（空文件，包标记）

```python
# src/studio_kit/arch/tts.py
"""arch 讲解逐段语音合成：复用 IndexTTS-2 / placeholder，产 audio/NN.wav + NN.meta.json。"""
from __future__ import annotations

from pathlib import Path

from studio_kit.core.audio import write_audio_meta
from studio_kit.core.contracts import ArchDoc
from studio_kit.core.logging import get_logger

logger = get_logger(__name__)


def _idx(i: int) -> str:
    return f"{i:02d}"


def run_arch_tts(doc: ArchDoc, audio_dir: Path, *, backend: str,
                 voice_sample: Path | None, force: bool) -> None:
    """逐段合成语音。backend：'indextts'（GPU 音色克隆）或 'placeholder'（静音，测试用）。"""
    audio_dir.mkdir(parents=True, exist_ok=True)

    if backend == "placeholder":
        from studio_kit.tts import placeholder as be
        for seg in doc.segments:
            idx = _idx(seg.index)
            wav = audio_dir / f"{idx}.wav"
            meta = audio_dir / f"{idx}.meta.json"
            if wav.exists() and meta.exists() and not force:
                continue
            dur = be.synthesize(seg.narration, wav, voice_sample)
            write_audio_meta(meta, seg.index, dur, len(seg.narration), backend)
            logger.debug("TTS[%s] %.1fs → %s", idx, dur, wav)

    elif backend == "indextts":
        from studio_kit.tts.indextts import run_batch
        pending: list[dict] = []
        for seg in doc.segments:
            idx = _idx(seg.index)
            wav = audio_dir / f"{idx}.wav"
            meta = audio_dir / f"{idx}.meta.json"
            if wav.exists() and meta.exists() and not force:
                continue
            pending.append({"index": seg.index, "text": seg.narration, "output": str(wav)})
        if not pending:
            logger.info("audio/ 已完整，跳过 indextts")
            return
        logger.info("IndexTTS-2 批量合成 %d 段…", len(pending))
        durations = run_batch(pending, voice_sample)
        by_index = {s.index: s for s in doc.segments}
        for task, dur in zip(pending, durations):
            i = task["index"]
            write_audio_meta(audio_dir / f"{_idx(i)}.meta.json", i, dur,
                             len(by_index[i].narration), backend)
    else:
        raise ValueError(f"未知 TTS 后端：{backend}（支持 placeholder, indextts）")
```

- [ ] **Step 4: 跑测试确认通过**

Run: `uv run pytest tests/test_arch_tts_placeholder.py -v`
Expected: PASS（2 passed）

- [ ] **Step 5: 提交**

```bash
git add src/studio_kit/core/audio.py src/studio_kit/arch/__init__.py src/studio_kit/arch/tts.py tests/test_arch_tts_placeholder.py
git commit -m "feat(studio-kit): arch 逐段 TTS 编排（IndexTTS-2 / placeholder）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: arch build 编排 + CLI arch-video 命令

**Files:**
- Create: `src/studio_kit/arch/build.py`
- Modify: `src/studio_kit/cli.py`（新增 `arch-video` 命令）

**Interfaces:**
- Consumes: `run_arch_tts`（Task 6）、`render_all_segments`（Task 5）、`compose_arch`（Task 4）、`ArchDoc`。
- Produces:
  - `arch.build.run_arch_build(script_path: Path, *, voice_sample: Path | None, backend: str, force: bool) -> Path`（返回 final.mp4 路径）
  - CLI 子命令 `studio-kit arch-video --script <path> [--voice-sample <wav>] [--backend indextts] [--force]`

- [ ] **Step 1: 实现 run_arch_build**

```python
# src/studio_kit/arch/build.py
"""arch-video 串行编排：校验 → TTS → 渲染 → 合成。产物落 script.json 同级目录。"""
from __future__ import annotations

from pathlib import Path

from studio_kit.arch.tts import run_arch_tts
from studio_kit.core.contracts import ArchDoc
from studio_kit.core.logging import get_logger
from studio_kit.render.arch_renderer import render_all_segments
from studio_kit.render.ffmpeg_compose import compose_arch

logger = get_logger(__name__)

# 默认音色样本（绝对路径，可被 --voice-sample 覆盖）
_DEFAULT_VOICE = Path(
    r"D:\code\weelume-base\studio-kit\assets\voice-samples\chenchangzhang-desktop.wav"
)


def run_arch_build(script_path: Path, *, voice_sample: Path | None,
                   backend: str, force: bool) -> Path:
    doc = ArchDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    work_dir = script_path.parent
    audio_dir = work_dir / "audio"
    clips_dir = work_dir / "clips"
    final_mp4 = work_dir / "final.mp4"

    voice = voice_sample or (_DEFAULT_VOICE if backend == "indextts" else None)
    if backend == "indextts" and voice is not None and not voice.exists():
        raise FileNotFoundError(f"音色样本不存在：{voice}（用 --voice-sample 指定）")

    logger.info("[1/3] TTS（%s）→ %s", backend, audio_dir)
    run_arch_tts(doc, audio_dir, backend=backend, voice_sample=voice, force=force)
    logger.info("[2/3] 渲染片段 → %s", clips_dir)
    render_all_segments(doc, audio_dir, clips_dir, force=force)
    logger.info("[3/3] 合成 → %s", final_mp4)
    compose_arch(doc, audio_dir, clips_dir, final_mp4, force=force)
    return final_mp4
```

- [ ] **Step 2: 新增 CLI 命令（追加到 cli.py，version 命令之前）**

```python
# ════════════════════════════════════════════════════════════════════
# arch-video  （架构图音色讲解视频，1920×1080）
# ════════════════════════════════════════════════════════════════════

@app.command("arch-video")
def cmd_arch_video(
    script_path: Path = typer.Option(..., "--script", help="arch script.json 路径"),
    voice_sample: Optional[Path] = typer.Option(None, "--voice-sample", help="音色样本 wav（默认 chenchangzhang-desktop.wav）"),
    backend: str = typer.Option("indextts", "--backend", help="TTS 后端（indextts / placeholder）"),
    force: bool = typer.Option(False, "--force", is_flag=True, help="强制重跑所有步骤"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """架构图音色讲解视频：TTS → 分段高亮录屏 → ffmpeg 合成 → final.mp4 (1920×1080)。

    script.json 由 arch-diagram-narration skill 在用户确认后写出，本命令只校验+渲染。
    """
    configure_logging(log_level)
    script_path = script_path.resolve()
    if not script_path.exists():
        err_console.print(f"[red]script.json 不存在：{script_path}[/red]")
        raise typer.Exit(1)

    from studio_kit.arch.build import run_arch_build
    try:
        final_mp4 = run_arch_build(
            script_path,
            voice_sample=voice_sample.resolve() if voice_sample else None,
            backend=backend,
            force=force,
        )
    except Exception as e:
        err_console.print(f"[red]arch-video 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"[green]final.mp4 已生成：{final_mp4}[/green]")
```

- [ ] **Step 3: CLI 自检（命令已注册）**

Run: `uv run studio-kit arch-video --help`
Expected: 打印该命令帮助，含 `--script`、`--voice-sample`、`--backend`、`--force`

- [ ] **Step 4: 全量回归测试**

Run: `uv run pytest -q`
Expected: 全绿（含既有口播/xhs 测试与本特性 4 个测试文件）

- [ ] **Step 5: 提交**

```bash
git add src/studio_kit/arch/build.py src/studio_kit/cli.py
git commit -m "feat(studio-kit): 新增 arch-video CLI 命令与串行编排

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: 端到端冒烟（placeholder 全链路，无 GPU）

**Files:**
- Create: `scripts/arch_smoke_fixture.json`

**Interfaces:**
- Consumes: 全链路（Task 1-7）。

- [ ] **Step 1: 写最小 fixture（2 段）**

```json
// scripts/arch_smoke_fixture.json
{
  "slug": "smoke", "run_id": "t1", "title": "冒烟架构",
  "subtitle": "端到端校验",
  "diagram": { "layers": [
    { "id": "client", "title": "客户端层", "accent": "#4DA3FF",
      "nodes": [ { "id": "client.app", "title": "App", "sub": "本地库" } ] },
    { "id": "logic", "title": "业务逻辑层", "accent": "#A78BFA",
      "nodes": [ { "id": "logic.msg", "title": "消息服务" },
                 { "id": "logic.user", "title": "用户服务" } ] }
  ] },
  "segments": [
    { "index": 0, "narration": "这是一套用于冒烟测试的两层架构。", "highlight": "all" },
    { "index": 1, "narration": "重点看消息服务这个框。", "highlight": ["logic.msg"] }
  ]
}
```

- [ ] **Step 2: 跑 placeholder 全链路**

把 fixture 拷到工作区再跑（避免污染脚本目录）：

Run:
```bash
cd D:\code\weelume-base\studio-kit
mkdir -p output/arch/smoke/t1
cp scripts/arch_smoke_fixture.json output/arch/smoke/t1/script.json
uv run studio-kit arch-video --script output/arch/smoke/t1/script.json --backend placeholder --force --log-level DEBUG
```
Expected: 退出码 0，末行 `final.mp4 已生成：...output/arch/smoke/t1/final.mp4`

- [ ] **Step 3: 人工核验产物**

逐项确认（无法自动断言，需人工看）：
- `output/arch/smoke/t1/final.mp4` 存在且可播放，分辨率 1920×1080。
- 第 1 段：全部层正常亮度；第 2 段：`消息服务` 框发光、`用户服务` 框压暗、client 层压暗。
- 右下角角标显示 `微域生光 | 十一AI编程`，画面/字幕无 `weelume`、无域名、无英文品牌。
- 首帧无白底（深色 `#12141C`）。
- 字幕底部居中、与（静音）时长对齐。

> placeholder 后端为静音，仅验证画面/字幕/合成链路。音色验证见 Step 4。

- [ ] **Step 4: （可选，需 GPU）真音色验证**

Run:
```bash
uv run studio-kit arch-video --script output/arch/smoke/t1/script.json --backend indextts --force
```
Expected: 退出码 0；播放 `final.mp4` 听到本人音色逐段讲解、音画同步。
若 IndexTTS venv 缺失则明确报错（预期行为，非 bug）。

- [ ] **Step 5: 提交 fixture**

```bash
git add scripts/arch_smoke_fixture.json
git commit -m "test(studio-kit): arch-video 端到端冒烟 fixture

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: arch-diagram-narration Skill

**Files:**
- Create: `.claude/skills/arch-diagram-narration/SKILL.md`

**Interfaces:**
- Produces：能产出符合 `ArchDoc` 的 `script.json` 并调用 `studio-kit arch-video` 的 Claude skill。

- [ ] **Step 1: 写 SKILL.md**

按 `blogger-breakdown-xhs/SKILL.md` 同款结构编写，必须包含以下 frontmatter 与硬约束（逐字落实）：

frontmatter：
```yaml
---
name: arch-diagram-narration
description: 把一份架构描述/文档做成"横版架构图 + 本人音色逐段讲解 + 讲到哪层高亮哪层"的解说视频（1920×1080 mp4）。触发词：架构图讲解视频、把架构讲一遍、架构讲解、arch-diagram-narration。
---
```

正文必须含的章节与铁律：
1. **Step 0 路径硬等式**：
   ```
   source        = <用户提供的架构描述/文档绝对路径，或对话中给出的架构要点>
   slug          = <用户指定或从标题推断的英文 slug>
   run_id        = <用户指定或日期，如 20260620>
   workspace     = D:\code\weelume-base\studio-kit\output\arch\<slug>\<run_id>
   kit_root      = D:\code\weelume-base\studio-kit
   ```
2. **Step 1 抽取图模型**：从 source 抽出层与框 → 生成 `diagram`（layers/nodes，每层配深色系强调色）。层数建议 ≤7，每层框 ≤5（横版排版约束）。
3. **Step 2 起草讲解段**：顺序 = 先 `highlight:"all"` 总览，再逐层 `highlight:"<layerId>"`，关键服务用 `highlight:["<nodeId>"]` 点到框。每段 narration 面向**零技术背景也能听懂**、术语口语化（用户偏好），单段建议 40-80 字。
4. **🚦 Step 3 强制用户确认（无例外）**：先输出**讲解大纲 + 每段文案 + 每段高亮目标清单**给用户确认；未确认禁止写 `script.json`、禁止渲染。即使用户说"你看着办"也必须先出清单让其确认（呼应用户长期偏好）。
5. **Step 4 Write script.json**：确认后写 `workspace/script.json`，结构严格匹配 `ArchDoc`。
6. **Step 5 渲染**：`cd D:\code\weelume-base\studio-kit && uv run studio-kit arch-video --script <workspace>\script.json`（GPU 不可用时加 `--backend placeholder` 先验证画面）。
7. **品牌铁律**：可见层只允许 `微域生光 | 十一AI编程`；**禁止** `weelume.com`、任何域名、任何英文品牌名。
8. **管线图**（ASCII）与 xhs skill 同风格，标注 Step 3 为强制人工卡点。

- [ ] **Step 2: 校验 frontmatter 可被发现**

Run: `uv run python -c "from pathlib import Path; t=Path('.claude/skills/arch-diagram-narration/SKILL.md').read_text(encoding='utf-8'); assert t.startswith('---') and 'name: arch-diagram-narration' in t; print('ok')"`
Expected: 打印 `ok`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/arch-diagram-narration/SKILL.md
git commit -m "feat(studio-kit): 新增 arch-diagram-narration skill（强制确认卡点）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage（逐节对照设计文档）：**
- 双段式形态 → Task 7（CLI）+ Task 9（skill）。✅
- `ArchDoc` 契约 → Task 1。✅
- 复用 IndexTTS / voice-samples → Task 6（`run_batch`）+ Task 7（默认音色）。✅
- 通用架构图渲染 + 分段高亮 → Task 2（HTML）+ Task 5（录屏）。✅
- compose 参数化（不破坏竖屏）→ Task 3（含竖屏回归测试）+ Task 4。✅
- 品牌角标 / 禁域名 → Task 2（BRAND 常量 + 测试 `weelume` 不出现）+ Task 9（skill 铁律）。✅
- 错误处理不兜底 → Task 6/Task 4/Task 5/Task 7 均显式 raise。✅
- 测试策略（纯函数单测 + placeholder + 冒烟）→ Task 1/2/3/6 单测 + Task 8 冒烟。✅
- 默认参数（分辨率/音色/工作区）→ Global Constraints + Task 3/7。✅
- YAGNI（不做缩放、不复用 drawio PNG）→ 计划未涉及，符合。✅

**2. Placeholder 扫描：** 无 TBD/TODO；每个代码步骤含完整代码；测试含真实断言。Task 2 的 `_layer_block` 等测试辅助标注为"实现写在测试文件内"，已给出实现指引（正则定位 data-id 取 class），非占位。✅

**3. Type 一致性：**
- `_generate_ass` 在 Task 3 改为 `(segments: list[tuple[int,str]], audio_dir, out_ass, fmt)`，Task 4 `compose_arch` 与 Task 3 内 `compose` 调用均按此签名。✅
- `run_arch_tts(doc, audio_dir, *, backend, voice_sample, force)` 在 Task 6 定义、Task 7 调用一致。✅
- `render_all_segments(doc, audio_dir, clips_dir, *, force)`、`compose_arch(doc, audio_dir, clips_dir, out_mp4, *, force)`、`build_diagram_html(doc, highlight)`、`record_html_to_mp4(...)` 跨任务签名一致。✅
- `write_audio_meta(meta_path, index, duration_s, chars, backend)` Task 6 定义并自用。✅

无新增未定义符号。计划完成。
