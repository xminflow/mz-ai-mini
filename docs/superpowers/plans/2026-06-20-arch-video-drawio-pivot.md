# 架构/技术方案讲解视频 drawio 化重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `studio-kit` 的"架构讲解视频"从 HTML 实时高亮改为 **drawio 统一出图 → 导 PNG → 图片驱动视频**，高亮用多版本图实现。

**Architecture:** 保留 IndexTTS-2 音色 TTS、ffmpeg 合成、字幕、横版规格、CLI 骨架；退役 HTML 渲染器（`arch_diagram.py`/`arch_renderer.py`/`recorder.py`）；新增 drawio→PNG 导出与 PNG→片段渲染；schema 改为图片驱动；skill 扩展为"文字方案→drawio→PNG预览→json→视频"两道确认门。

**Tech Stack:** Python 3.11、pydantic v2、typer、ffmpeg（CLI + ffmpeg-python）、draw.io Desktop CLI、IndexTTS-2、pytest。

## Global Constraints

- 运行目录 `D:\code\weelume-base\studio-kit`；包根 `src/studio_kit`；命令用 `uv run`。**不新增第三方依赖**。
- **不静默兜底/不吞异常**：drawio exe 缺失、导出失败、缺 PNG/meta、未知 backend、ffmpeg 失败一律 `raise` + 日志。
- **可见层品牌铁律**：drawio 角标固定 `微域生光 | 十一AI编程`；**禁止** `weelume.com`、任何域名、英文品牌名。
- drawio exe 默认 `D:\software\drawio\draw.io\draw.io.exe`，可用环境变量 `DRAWIO_EXE` 覆盖；**禁止把路径只硬编码无覆盖**。
- 已验证导出命令：`<exe> --export --no-sandbox --format png --scale 2 --output <out> <in>`（exit 0）。
- 视频规格 1920×1080 / 30fps / h264 yuv420p / aac 192k；补边色 `#12141C`。默认音色 `assets/voice-samples/chenchangzhang-desktop.wav`。
- Python 全量类型标注。commit message 用中文，结尾附 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- **不改动现有竖屏口播 / 小红书图文行为。**

## File Structure

- `src/studio_kit/core/contracts.py` — **改**：新增 `ArchVideoSegment`/`ArchVideoDoc`（与旧 ArchDoc 暂共存）；T5 删旧 `ArchNode/ArchLayer/ArchDiagram/ArchSegment/ArchDoc`。
- `src/studio_kit/render/drawio_export.py` — **新建**：drawio→PNG（Desktop CLI）。
- `src/studio_kit/render/image_clip.py` — **新建**：PNG + 时长 → 静音片段 mp4。
- `src/studio_kit/arch/tts.py` — **改**：接 `ArchVideoDoc`。
- `src/studio_kit/render/ffmpeg_compose.py` — **改**：`compose_arch` 接 `ArchVideoDoc`。
- `src/studio_kit/arch/build.py` — **改**：`run_arch_build` 走 TTS→图片片段→合成。
- `src/studio_kit/cli.py` — **改**：`arch-video` 接新 doc；新增 `drawio-export` 命令。
- 退役删除：`render/arch_diagram.py`、`render/arch_renderer.py`、`render/recorder.py`、`tests/test_arch_diagram_html.py`、旧 `tests/test_arch_contracts.py`。
- `.claude/skills/arch-diagram-narration/SKILL.md` — **重写**。
- 测试新增：`tests/test_arch_video_contracts.py`、`tests/test_drawio_export.py`、`tests/test_image_clip.py`；改 `tests/test_arch_tts_placeholder.py`。
- 冒烟新增：`scripts/arch_fixtures/`（最小 drawio 基础图 + 高亮变体）。

---

## Task 1: 图片驱动的 ArchVideoDoc（与旧 ArchDoc 暂共存）

**Files:**
- Modify: `src/studio_kit/core/contracts.py`（末尾追加，**不动**旧 Arch* 类）
- Test: `tests/test_arch_video_contracts.py`

**Interfaces:**
- Produces:
  - `ArchVideoSegment(index: int, narration: str, image: str)`
  - `ArchVideoDoc(slug: str, run_id: str, title: str, subtitle: str = "", segments: list[ArchVideoSegment])`

- [ ] **Step 1: 写失败测试**

```python
# tests/test_arch_video_contracts.py
import pytest
from pydantic import ValidationError
from studio_kit.core.contracts import ArchVideoDoc

def _doc(**over):
    base = {
        "slug": "im", "run_id": "r1", "title": "T",
        "segments": [
            {"index": 0, "narration": "总览", "image": "images/arch.png"},
            {"index": 1, "narration": "客户端", "image": "images/arch.client.png"},
        ],
    }
    base.update(over)
    return base

def test_valid_doc_parses():
    doc = ArchVideoDoc.model_validate(_doc())
    assert len(doc.segments) == 2
    assert doc.segments[1].image == "images/arch.client.png"

def test_non_contiguous_index_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[{"index": 3, "narration": "x", "image": "a.png"}]))

def test_empty_narration_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[{"index": 0, "narration": " ", "image": "a.png"}]))

def test_empty_image_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[{"index": 0, "narration": "x", "image": ""}]))

def test_empty_segments_rejected():
    with pytest.raises(ValidationError):
        ArchVideoDoc.model_validate(_doc(segments=[]))
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd D:\code\weelume-base\studio-kit && uv run pytest tests/test_arch_video_contracts.py -v`
Expected: FAIL（`ImportError: cannot import name 'ArchVideoDoc'`）

- [ ] **Step 3: 实现（追加到 contracts.py 末尾，勿改旧类）**

```python
# ════════════════════════════════════════════════════════════════════
# 图片驱动的架构讲解视频 schema（drawio 导出 PNG → 视频）
# ════════════════════════════════════════════════════════════════════
class ArchVideoSegment(BaseModel):
    """一段讲解：文案 + 要显示的 PNG（相对工作区路径）。"""
    index: int
    narration: str
    image: str

    @field_validator("narration")
    @classmethod
    def _narration_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("ArchVideoSegment.narration 不能为空")
        return v

    @field_validator("image")
    @classmethod
    def _image_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("ArchVideoSegment.image 不能为空")
        return v


class ArchVideoDoc(BaseModel):
    """arch 讲解视频 script.json（skill 写，CLI 只校验）。"""
    slug: str
    run_id: str
    title: str
    subtitle: str = ""
    segments: list[ArchVideoSegment]

    @model_validator(mode="after")
    def _check(self) -> "ArchVideoDoc":
        if not self.segments:
            raise ValueError("segments 至少 1 段")
        for i, seg in enumerate(self.segments):
            if seg.index != i:
                raise ValueError(f"segments[{i}].index 必须为 {i}，实际 {seg.index}")
        return self
```

> `field_validator` / `model_validator` 顶部已导入（前一特性已加）。

- [ ] **Step 4: 跑测试确认通过**

Run: `uv run pytest tests/test_arch_video_contracts.py -v`
Expected: PASS（5 passed）

- [ ] **Step 5: 提交**

```bash
git add src/studio_kit/core/contracts.py tests/test_arch_video_contracts.py
git commit -m "feat(studio-kit): 新增图片驱动 ArchVideoDoc（drawio→视频）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: drawio → PNG 导出（Desktop CLI）+ CLI 命令

**Files:**
- Create: `src/studio_kit/render/drawio_export.py`
- Modify: `src/studio_kit/cli.py`（新增 `drawio-export` 命令，version 命令前）
- Test: `tests/test_drawio_export.py`

**Interfaces:**
- Produces:
  - `resolve_drawio_exe() -> Path`（`DRAWIO_EXE` 或默认常量；缺失 raise FileNotFoundError）
  - `build_export_cmd(exe: Path, drawio_path: Path, png_path: Path, scale: int) -> list[str]`
  - `export_drawio_to_png(drawio_path: Path, png_path: Path, *, scale: int = 2) -> None`
  - `export_dir(src_dir: Path, out_dir: Path, *, scale: int = 2, force: bool = False) -> list[Path]`

- [ ] **Step 1: 写失败测试（纯函数 + exe 缺失路径，不实跑导出）**

```python
# tests/test_drawio_export.py
import os
from pathlib import Path
import pytest
from studio_kit.render.drawio_export import build_export_cmd, resolve_drawio_exe

def test_build_export_cmd():
    cmd = build_export_cmd(Path("X:/drawio.exe"), Path("a.drawio"), Path("a.png"), 2)
    assert cmd[0] == "X:/drawio.exe" or cmd[0] == str(Path("X:/drawio.exe"))
    assert "--export" in cmd
    assert "--no-sandbox" in cmd
    assert "png" in cmd
    assert "2" in cmd  # scale
    # 输入输出都在
    assert any("a.drawio" in c for c in cmd)
    assert any("a.png" in c for c in cmd)

def test_resolve_exe_missing_raises(monkeypatch):
    monkeypatch.setenv("DRAWIO_EXE", "Z:/nonexistent/drawio.exe")
    with pytest.raises(FileNotFoundError):
        resolve_drawio_exe()
```

- [ ] **Step 2: 跑测试确认失败**

Run: `uv run pytest tests/test_drawio_export.py -v`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 drawio_export.py**

```python
# src/studio_kit/render/drawio_export.py
"""drawio → PNG 导出，封装 draw.io Desktop CLI。

已验证命令：<exe> --export --no-sandbox --format png --scale N --output <out> <in>
exe 路径：环境变量 DRAWIO_EXE 优先，否则默认常量。
"""
from __future__ import annotations

import os
import subprocess
from pathlib import Path

from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

_DEFAULT_DRAWIO_EXE = Path(r"D:\software\drawio\draw.io\draw.io.exe")


def resolve_drawio_exe() -> Path:
    raw = os.environ.get("DRAWIO_EXE")
    exe = Path(raw) if raw else _DEFAULT_DRAWIO_EXE
    if not exe.exists():
        raise FileNotFoundError(
            f"draw.io Desktop 可执行文件不存在：{exe}\n"
            "请安装 draw.io Desktop，或用环境变量 DRAWIO_EXE 指定其路径。"
        )
    return exe


def build_export_cmd(exe: Path, drawio_path: Path, png_path: Path, scale: int) -> list[str]:
    return [
        str(exe), "--export", "--no-sandbox",
        "--format", "png", "--scale", str(scale),
        "--output", str(png_path), str(drawio_path),
    ]


def export_drawio_to_png(drawio_path: Path, png_path: Path, *, scale: int = 2) -> None:
    if not drawio_path.exists():
        raise FileNotFoundError(f"drawio 源文件不存在：{drawio_path}")
    exe = resolve_drawio_exe()
    png_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = build_export_cmd(exe, drawio_path, png_path, scale)
    logger.info("drawio 导出：%s → %s", drawio_path.name, png_path.name)
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    if result.returncode != 0:
        raise RuntimeError(
            f"drawio 导出失败（exit={result.returncode}）：{drawio_path}\n"
            f"STDERR:\n{result.stderr}"
        )
    if not png_path.exists():
        raise RuntimeError(f"drawio 导出未生成 PNG：{png_path}（exit=0 但文件缺失）")


def export_dir(src_dir: Path, out_dir: Path, *, scale: int = 2, force: bool = False) -> list[Path]:
    if not src_dir.is_dir():
        raise FileNotFoundError(f"drawio 源目录不存在：{src_dir}")
    out_dir.mkdir(parents=True, exist_ok=True)
    results: list[Path] = []
    drawios = sorted(src_dir.glob("*.drawio"))
    if not drawios:
        raise FileNotFoundError(f"{src_dir} 下没有 .drawio 文件")
    for d in drawios:
        png = out_dir / f"{d.stem}.png"
        if png.exists() and not force:
            logger.info("%s 已存在，跳过", png.name)
            results.append(png)
            continue
        export_drawio_to_png(d, png, scale=scale)
        results.append(png)
    return results
```

- [ ] **Step 4: 新增 CLI `drawio-export`（cli.py，version 前）**

```python
@app.command("drawio-export")
def cmd_drawio_export(
    src: Path = typer.Option(..., "--src", help="含 .drawio 的源目录"),
    out: Path = typer.Option(..., "--out", help="PNG 输出目录"),
    scale: int = typer.Option(2, "--scale", help="导出倍率"),
    force: bool = typer.Option(False, "--force", is_flag=True, help="覆盖已有 PNG"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """用 draw.io Desktop 批量把 src/*.drawio 导出为 PNG 到 out/。"""
    configure_logging(log_level)
    from studio_kit.render.drawio_export import export_dir
    try:
        pngs = export_dir(src.resolve(), out.resolve(), scale=scale, force=force)
    except Exception as e:
        err_console.print(f"[red]drawio-export 失败：{e}[/red]")
        raise typer.Exit(1)
    console.print(f"[green]drawio-export 完成：{len(pngs)} 张 PNG → {out}[/green]")
```

- [ ] **Step 5: 跑测试 + CLI 自检**

Run: `uv run pytest tests/test_drawio_export.py -v && uv run studio-kit drawio-export --help`
Expected: 测试 PASS；help 打印含 `--src/--out/--scale/--force`

- [ ] **Step 6: 提交**

```bash
git add src/studio_kit/render/drawio_export.py src/studio_kit/cli.py tests/test_drawio_export.py
git commit -m "feat(studio-kit): drawio→PNG 导出（Desktop CLI）+ drawio-export 命令

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: PNG → 静音片段渲染器

**Files:**
- Create: `src/studio_kit/render/image_clip.py`
- Test: `tests/test_image_clip.py`

**Interfaces:**
- Consumes: `ArchVideoDoc`（Task 1）。
- Produces:
  - `build_ffmpeg_clip_cmd(png_path: Path, out_mp4: Path, duration_s: float, *, width: int = 1920, height: int = 1080, bg: str = "#12141C", fps: int = 30) -> list[str]`
  - `render_segment_clips(doc: ArchVideoDoc, audio_dir: Path, clips_dir: Path, work_dir: Path, *, force: bool = False) -> list[Path]`

- [ ] **Step 1: 写失败测试（纯命令构造）**

```python
# tests/test_image_clip.py
from pathlib import Path
from studio_kit.render.image_clip import build_ffmpeg_clip_cmd

def test_clip_cmd_has_loop_scale_pad_and_codec():
    cmd = build_ffmpeg_clip_cmd(Path("a.png"), Path("00.mp4"), 3.5)
    s = " ".join(cmd)
    assert "-loop" in cmd and "1" in cmd
    assert "-t" in cmd and "3.5" in cmd
    assert "libx264" in s and "yuv420p" in s
    assert "1920" in s and "1080" in s          # 目标分辨率
    assert "force_original_aspect_ratio=decrease" in s  # 按比例缩放
    assert "pad=" in s and "12141C" in s.replace("#", "")  # 补边色
    assert cmd[0] == "ffmpeg"
```

- [ ] **Step 2: 跑测试确认失败**

Run: `uv run pytest tests/test_image_clip.py -v`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现 image_clip.py**

```python
# src/studio_kit/render/image_clip.py
"""把单张 PNG 铺成定长静音 mp4 片段（1920×1080，按比例缩放 + 深色补边）。"""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from studio_kit.core.contracts import ArchVideoDoc
from studio_kit.core.logging import get_logger

logger = get_logger(__name__)


def _idx(i: int) -> str:
    return f"{i:02d}"


def build_ffmpeg_clip_cmd(
    png_path: Path, out_mp4: Path, duration_s: float,
    *, width: int = 1920, height: int = 1080, bg: str = "#12141C", fps: int = 30,
) -> list[str]:
    # 缩放到不超过目标尺寸后居中补边；setsar=1 防非方像素
    vf = (
        f"scale={width}:{height}:force_original_aspect_ratio=decrease,"
        f"pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color={bg},setsar=1"
    )
    return [
        "ffmpeg", "-y", "-loop", "1", "-i", str(png_path),
        "-t", str(duration_s), "-vf", vf, "-r", str(fps),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", str(out_mp4),
    ]


def render_segment_clips(
    doc: ArchVideoDoc, audio_dir: Path, clips_dir: Path, work_dir: Path,
    *, force: bool = False,
) -> list[Path]:
    clips_dir.mkdir(parents=True, exist_ok=True)
    results: list[Path] = []
    for seg in doc.segments:
        idx = _idx(seg.index)
        out_mp4 = clips_dir / f"{idx}.mp4"
        if out_mp4.exists() and not force:
            logger.info("片段 %s.mp4 已存在，跳过", idx)
            results.append(out_mp4)
            continue
        png = (work_dir / seg.image).resolve()
        if not png.exists():
            raise FileNotFoundError(f"片段 {idx} 引用的 PNG 不存在：{png}")
        meta = audio_dir / f"{idx}.meta.json"
        if not meta.exists():
            raise FileNotFoundError(f"缺少 {meta}（请先运行 TTS）")
        duration_s = float(json.loads(meta.read_text(encoding="utf-8"))["duration_ms"]) / 1000.0
        cmd = build_ffmpeg_clip_cmd(png, out_mp4, duration_s)
        result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg 生成片段失败（{idx}）：\n{result.stderr}")
        results.append(out_mp4)
        logger.info("片段 mp4 已生成：%s", out_mp4)
    return results
```

- [ ] **Step 4: 跑测试确认通过**

Run: `uv run pytest tests/test_image_clip.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/studio_kit/render/image_clip.py tests/test_image_clip.py
git commit -m "feat(studio-kit): PNG→静音片段渲染器（缩放+深色补边）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: build/tts/compose/CLI 切到图片驱动

**Files:**
- Modify: `src/studio_kit/arch/tts.py`（类型改 `ArchVideoDoc`）
- Modify: `src/studio_kit/render/ffmpeg_compose.py`（`compose_arch` 类型改 `ArchVideoDoc`）
- Modify: `src/studio_kit/arch/build.py`（走图片片段链路）
- Modify: `src/studio_kit/cli.py`（`arch-video` 加载 `ArchVideoDoc`）
- Modify: `tests/test_arch_tts_placeholder.py`（改用 `ArchVideoDoc`）

**Interfaces:**
- Consumes: `run_arch_tts`、`render_segment_clips`（Task 3）、`compose_arch`、`ArchVideoDoc`。
- `run_arch_build(script_path, *, voice_sample, backend, force) -> Path` 改为：校验 `ArchVideoDoc` → `run_arch_tts` → `render_segment_clips(doc, audio_dir, clips_dir, work_dir, force)` → `compose_arch(doc, audio_dir, clips_dir, final_mp4, force)`。

- [ ] **Step 1: 改 tts.py 类型并更新其测试**

`arch/tts.py`：把 `doc: ArchDoc` 改为 `doc: ArchVideoDoc`（import 改 `from studio_kit.core.contracts import ArchVideoDoc`），其余逻辑不变（仍遍历 `doc.segments` 的 `.index`/`.narration`）。

`tests/test_arch_tts_placeholder.py`：把 fixture 改为 `ArchVideoDoc` 结构（段含 `image` 字段，可填任意占位 `"images/x.png"`，TTS 不读 image）：

```python
from studio_kit.core.contracts import ArchVideoDoc
from studio_kit.arch.tts import run_arch_tts

def _doc():
    return ArchVideoDoc.model_validate({
        "slug": "im", "run_id": "r1", "title": "T",
        "segments": [
            {"index": 0, "narration": "第一段讲解", "image": "images/a.png"},
            {"index": 1, "narration": "第二段讲解", "image": "images/b.png"},
        ],
    })
# 其余两个测试体不变（断言 wav+meta 生成、未知 backend raise）
```

- [ ] **Step 2: 改 compose_arch 类型**

`ffmpeg_compose.py`：`def compose_arch(doc: ArchVideoDoc, ...)`，import 改为 `from studio_kit.core.contracts import ArchVideoDoc`。函数体不变（用 `doc.segments` 的 index/narration，clips/NN.mp4 + audio/NN.wav）。

- [ ] **Step 3: 改 build.py**

```python
# src/studio_kit/arch/build.py（替换核心实现）
from studio_kit.arch.tts import run_arch_tts
from studio_kit.core.contracts import ArchVideoDoc
from studio_kit.core.logging import get_logger
from studio_kit.render.image_clip import render_segment_clips
from studio_kit.render.ffmpeg_compose import compose_arch
from pathlib import Path

logger = get_logger(__name__)
_DEFAULT_VOICE = Path(r"D:\code\weelume-base\studio-kit\assets\voice-samples\chenchangzhang-desktop.wav")

def run_arch_build(script_path: Path, *, voice_sample: Path | None,
                   backend: str, force: bool) -> Path:
    doc = ArchVideoDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    work_dir = script_path.parent
    audio_dir = work_dir / "audio"
    clips_dir = work_dir / "clips"
    final_mp4 = work_dir / "final.mp4"
    voice = voice_sample or (_DEFAULT_VOICE if backend == "indextts" else None)
    if backend == "indextts" and voice is not None and not voice.exists():
        raise FileNotFoundError(f"音色样本不存在：{voice}（用 --voice-sample 指定）")
    logger.info("[1/3] TTS（%s）→ %s", backend, audio_dir)
    run_arch_tts(doc, audio_dir, backend=backend, voice_sample=voice, force=force)
    logger.info("[2/3] 渲染图片片段 → %s", clips_dir)
    render_segment_clips(doc, audio_dir, clips_dir, work_dir, force=force)
    logger.info("[3/3] 合成 → %s", final_mp4)
    compose_arch(doc, audio_dir, clips_dir, final_mp4, force=force)
    return final_mp4
```

- [ ] **Step 4: 改 cli.py 的 arch-video**

把 `cmd_arch_video` 里加载 doc 处由旧 `ArchDoc` 改为不再直接加载（`run_arch_build` 内部已 `ArchVideoDoc.model_validate_json`），保持命令签名与错误处理不变。确认 import 不再引用旧 `ArchDoc`。

- [ ] **Step 5: 跑 tts 测试 + 全量回归 + arch-video 帮助**

Run: `uv run pytest tests/test_arch_tts_placeholder.py -v && uv run pytest -q && uv run studio-kit arch-video --help`
Expected: tts 2 passed；全量绿（旧 `test_arch_contracts.py`/`test_arch_diagram_html.py` 仍在、仍绿，因旧 ArchDoc 与 arch_diagram 尚未删）；help 正常。

- [ ] **Step 6: 提交**

```bash
git add src/studio_kit/arch/tts.py src/studio_kit/render/ffmpeg_compose.py src/studio_kit/arch/build.py src/studio_kit/cli.py tests/test_arch_tts_placeholder.py
git commit -m "feat(studio-kit): arch-video 切换为图片驱动链路（TTS→PNG片段→合成）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: 退役 HTML 渲染器与旧 ArchDoc

**Files:**
- Delete: `src/studio_kit/render/arch_diagram.py`、`src/studio_kit/render/arch_renderer.py`、`src/studio_kit/render/recorder.py`
- Delete: `tests/test_arch_diagram_html.py`、`tests/test_arch_contracts.py`
- Modify: `src/studio_kit/core/contracts.py`（删旧 `ArchNode/ArchLayer/ArchDiagram/ArchSegment/ArchDoc` 五类及其专属 import 如不再用）

**Interfaces:** 无新增。删除后 `ArchVideoDoc` 成为唯一 arch 视频 schema。

- [ ] **Step 1: 确认无引用残留**

Run（应无输出，确认没有任何源码再引用旧符号/退役模块）：
```bash
cd D:\code\weelume-base\studio-kit
grep -rnE "arch_diagram|arch_renderer|render\.recorder|\bArchDoc\b|ArchLayer|ArchNode|ArchDiagram\b" src tests | grep -v "ArchVideo"
```
Expected: 空（若有命中，先在对应文件改掉再继续）

- [ ] **Step 2: 删除退役文件与旧类**

删除上述 3 个源文件 + 2 个测试文件；从 `contracts.py` 移除旧 `ArchNode/ArchLayer/ArchDiagram/ArchSegment/ArchDoc` 五个类（保留 `ArchVideoSegment/ArchVideoDoc` 与 `ScriptDoc/XhsDoc`）。

- [ ] **Step 3: 全量回归**

Run: `uv run pytest -q && uv run python -c "import studio_kit.cli; print('import ok')"`
Expected: 全绿；import ok（无残留引用导致的 ImportError）

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "refactor(studio-kit): 退役 HTML 架构图渲染器与旧 ArchDoc（drawio 化）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 端到端冒烟（drawio→PNG→placeholder 视频）

**Files:**
- Create: `scripts/arch_fixtures/arch.drawio`（基础图，含品牌角标）
- Create: `scripts/arch_fixtures/arch.client.drawio`（高亮变体：非 client 元素 `opacity=25`）

**Interfaces:** 全链路（Task 1-5）。

- [ ] **Step 1: 写两份最小 drawio fixture**

`arch.drawio`：深色画布（`background="#12141C"`），两层 client/logic 各一个框，右下角文本元素 `微域生光 | 十一AI编程`。`arch.client.drawio`：同图，但 logic 层元素 `style` 追加 `opacity=25;`。（XML 用本仓库 `im-architecture.drawio` 同款 mxfile 结构，精简到 2 层即可。**画面/文本不得出现 weelume 或域名**。）

- [ ] **Step 2: 实跑全链路（placeholder，无 GPU）**

Run:
```bash
cd D:\code\weelume-base\studio-kit
mkdir -p output/arch/smoke/t1/diagrams output/arch/smoke/t1/images
cp scripts/arch_fixtures/*.drawio output/arch/smoke/t1/diagrams/
uv run studio-kit drawio-export --src output/arch/smoke/t1/diagrams --out output/arch/smoke/t1/images --force
```
Expected: 退出码 0，`output/arch/smoke/t1/images/arch.png` 与 `arch.client.png` 生成。若 `DRAWIO_EXE`/默认 exe 缺失则明确报错（环境问题，非 bug）。

然后写 `output/arch/smoke/t1/script.json`：
```json
{ "slug": "smoke", "run_id": "t1", "title": "冒烟",
  "segments": [
    { "index": 0, "narration": "这是一张冒烟用的两层架构总览。", "image": "images/arch.png" },
    { "index": 1, "narration": "现在重点看客户端层。", "image": "images/arch.client.png" } ] }
```

Run:
```bash
uv run studio-kit arch-video --script output/arch/smoke/t1/script.json --backend placeholder --force --log-level DEBUG
```
Expected: 退出码 0，末行 `final.mp4 已生成`；`ffprobe` 确认 1920×1080：
`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 output/arch/smoke/t1/final.mp4` → `1920,1080`。

- [ ] **Step 3: 提交 fixtures（不提交 output/ 产物）**

```bash
git add scripts/arch_fixtures/arch.drawio scripts/arch_fixtures/arch.client.drawio
git commit -m "test(studio-kit): arch-video drawio 化端到端冒烟 fixture

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

> Step 2 的 PNG 与 final.mp4 由控制者做视觉核验（图正确、高亮变体生效、品牌角标、音画对齐）。

---

## Task 7: 重写 arch-diagram-narration Skill（两道确认门）

**Files:**
- Rewrite: `.claude/skills/arch-diagram-narration/SKILL.md`

**Interfaces:** 产出符合新流程的 skill。

- [ ] **Step 1: 重写 SKILL.md**

参照 `blogger-breakdown-xhs/SKILL.md` 风格，frontmatter：
```yaml
---
name: arch-diagram-narration
description: 把一个技术主题/需求做成"技术方案 + drawio 架构/流程图 + 本人音色讲解"的横版视频。先出文字方案确认，再出 drawio 多图导 PNG 预览确认，再做 json 与视频。触发词：架构讲解视频、技术方案视频、把架构讲一遍、arch-diagram-narration。
---
```

正文必含（逐字落实）：
1. **Step 0 路径硬等式**：`workspace = D:\code\weelume-base\studio-kit\output\arch\<slug>\<run_id>`，子目录 `diagrams\`、`images\`、`audio\`、`clips\`。
2. **Step 1 文字方案**：起草结构化技术方案（目标/分层组件/关键流程/选型）。**🚦 Gate 1：用户确认文字方案，未确认禁止往下。无例外。**
3. **Step 2 写 drawio**：据方案产出多张 `diagrams\*.drawio`（mxGraph XML，`background="#12141C"`，右下角文本 `微域生光 | 十一AI编程`）；需分段高亮的图产出"高亮变体"（基础图 `<id>.drawio`、变体 `<id>.<focus>.drawio`，变体把非目标 cell 的 `style` 加 `opacity=25;`）。图型不限（架构/流程/时序，drawio 原生支持）。
4. **Step 3 导 PNG**：`cd D:\code\weelume-base\studio-kit && uv run studio-kit drawio-export --src <workspace>\diagrams --out <workspace>\images`。**🚦 Gate 2：用户预览 images\*.png 确认，未确认禁止往下。无例外。**
5. **Step 4 写 script.json**：`ArchVideoDoc` 结构——`{slug, run_id, title, subtitle?, segments:[{index(从0连续), narration(非空), image:"images/xxx.png"}]}`；高亮段指向对应高亮变体 PNG。
6. **Step 5 渲染**：`uv run studio-kit arch-video --script <workspace>\script.json`（GPU 不可用时加 `--backend placeholder` 先验证画面）。
7. **品牌铁律**：可见层只允许 `微域生光 | 十一AI编程`；**禁止** `weelume.com`、任何域名、英文品牌名（drawio 文本与字幕同此约束）。
8. **管线 ASCII 图**：标注 Gate 1 / Gate 2 两个 ⏸️ 强制人工卡点。

- [ ] **Step 2: 发现性自检**

Run: `uv run python -c "from pathlib import Path; t=Path('.claude/skills/arch-diagram-narration/SKILL.md').read_text(encoding='utf-8'); assert t.startswith('---') and 'name: arch-diagram-narration' in t and 'Gate 1' in t and 'Gate 2' in t; print('ok')"`
Expected: 打印 `ok`

- [ ] **Step 3: 提交**

```bash
git add .claude/skills/arch-diagram-narration/SKILL.md
git commit -m "feat(studio-kit): 重写 arch-diagram-narration skill（文字方案+drawio 两道确认门）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review

**1. Spec coverage：**
- drawio→PNG 导出（Desktop CLI，可配 exe）→ Task 2。✅
- 图片驱动 schema → Task 1。✅
- PNG→片段 + 合成复用 → Task 3 + Task 4。✅
- 高亮=多版本图 → Task 6 fixture（opacity 变体）+ Task 7 skill 约定。✅
- 退役 HTML 渲染器 → Task 5。✅
- 两道确认门 + 文字方案 + drawio 编写约定 + 品牌铁律 → Task 7。✅
- 复用 TTS/compose/字幕/横版规格 → Task 4。✅
- 不静默兜底 → 各 Task 显式 raise。✅
- 不动竖屏口播/xhs → 仅改 arch 链路，Task 5 grep 守住无残留。✅

**2. Placeholder 扫描：** 无 TBD/TODO；可单测部分含真实断言（schema、export cmd、clip cmd）；外部进程部分用冒烟 + 人工核验，已说明原因。✅

**3. Type 一致性：**
- `ArchVideoDoc`/`ArchVideoSegment` 字段在 Task 1 定义，Task 3/4/6/7 一致引用（segments[].index/narration/image）。✅
- `render_segment_clips(doc, audio_dir, clips_dir, work_dir, *, force)` Task 3 定义、Task 4 build 调用一致。✅
- `compose_arch(doc, audio_dir, clips_dir, out_mp4, *, force)` 既有签名，Task 4 仅改 doc 类型，调用一致。✅
- `export_dir(src_dir, out_dir, *, scale, force)`、`export_drawio_to_png(...)`、`build_export_cmd(...)` Task 2 定义并自用 + CLI。✅
- Task 5 删除旧 `ArchDoc` 后，全树仅 `ArchVideoDoc`（grep 守住）。✅

计划完成。
