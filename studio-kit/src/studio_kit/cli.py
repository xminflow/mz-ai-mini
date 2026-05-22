"""studio-kit CLI 入口。

子命令：
    extract    解析博主拆解 HTML 报告 → outline.json
    script     校验 script.json 字数约束
    tts        为每张幻灯片生成语音 WAV
    render     用 Patchright 录制每张幻灯片 mp4
    compose    ffmpeg concat + 字幕烧入 → final.mp4
    build      串行调用上面全部步骤
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

# Windows 控制台编码修正
for _stream in (sys.stdout, sys.stderr):
    reconfigure = getattr(_stream, "reconfigure", None)
    if reconfigure is not None:
        try:
            reconfigure(encoding="utf-8")
        except Exception:
            pass

import typer
from rich.console import Console
from rich.table import Table

from studio_kit import __version__
from studio_kit.core.logging import configure_logging, get_logger
from studio_kit.core.settings import Settings

app = typer.Typer(
    name="studio-kit",
    help="自媒体素材产线 CLI。首版：博主拆解报告 → 2 分钟竖屏短视频。",
    no_args_is_help=True,
    add_completion=False,
)

console = Console(stderr=False)
err_console = Console(stderr=True)

logger = get_logger(__name__)

_settings: Settings | None = None


def _get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings.load()
    return _settings


# ════════════════════════════════════════════════════════════════════
# extract
# ════════════════════════════════════════════════════════════════════

@app.command("extract")
def cmd_extract(
    report_dir: Path = typer.Option(..., "--report-dir", help="博主拆解报告目录（含 overview.html + index.json）"),
    out: Optional[Path] = typer.Option(None, "--out", help="输出 outline.json 路径（默认自动推导）"),
    log_level: str = typer.Option("INFO", "--log-level", help="日志级别"),
) -> None:
    """解析博主拆解 HTML 报告，产出 outline.json。"""
    configure_logging(log_level)
    settings = _get_settings()

    report_dir = report_dir.resolve()
    if not report_dir.exists():
        err_console.print(f"[red]报告目录不存在：{report_dir}[/red]")
        raise typer.Exit(1)

    # 先解析取 slug/run_id，再确定输出路径
    from studio_kit.extract.parser import parse_report, run_extract

    try:
        outline = parse_report(report_dir)
    except Exception as e:
        err_console.print(f"[red]解析失败：{e}[/red]")
        raise typer.Exit(1)

    if out is None:
        run_dir = settings.workspace_root / outline.blogger_slug / outline.run_id
        out = run_dir / "outline.json"
    else:
        out = out.resolve()

    try:
        run_extract(report_dir, out)
    except Exception as e:
        err_console.print(f"[red]写出 outline.json 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"[green]outline.json 已写出：{out}[/green]")
    console.print(f"  博主：{outline.stats.display_name}  章节数：{len(outline.chapters)}")


# ════════════════════════════════════════════════════════════════════
# script
# ════════════════════════════════════════════════════════════════════

@app.command("script")
def cmd_script(
    script_path: Path = typer.Option(..., "--script", help="script.json 路径"),
    validate: bool = typer.Option(False, "--validate", is_flag=True, help="只校验，不写内容"),
    target_seconds: int = typer.Option(110, "--target-seconds", help="目标时长（秒）"),
    speed: float = typer.Option(5.5, "--speed", help="语速（字/秒）"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """校验 script.json 字数约束。script.json 由 Claude skill 写，CLI 只负责校验。"""
    configure_logging(log_level)

    script_path = script_path.resolve()
    if not script_path.exists():
        err_console.print(f"[red]script.json 不存在：{script_path}[/red]")
        raise typer.Exit(1)

    from studio_kit.core.contracts import ScriptDoc

    try:
        script = ScriptDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    except Exception as e:
        err_console.print(f"[red]script.json 解析失败：{e}[/red]")
        raise typer.Exit(1)

    char_limit = int(target_seconds * speed)
    total_chars = script.total_chars

    table = Table(title="script.json 校验结果", show_header=True)
    table.add_column("指标", style="cyan")
    table.add_column("值", style="white")
    table.add_column("状态", style="green")

    status_chars = "[green]通过[/green]" if total_chars <= char_limit else "[red]超限[/red]"
    table.add_row("幻灯片数量", str(len(script.slides)), "[green]✓[/green]")
    table.add_row("总字数", str(total_chars), status_chars)
    table.add_row("字数上限", str(char_limit), "")
    table.add_row("预估时长", f"{total_chars / speed:.1f}s", "")
    table.add_row("目标时长", f"{target_seconds}s", "")

    console.print(table)

    if total_chars > char_limit:
        err_console.print(
            f"[red]字数超限：{total_chars} > {char_limit}（{total_chars - char_limit} 字需删减）[/red]"
        )
        raise typer.Exit(1)

    console.print("[green]校验通过[/green]")


# ════════════════════════════════════════════════════════════════════
# tts
# ════════════════════════════════════════════════════════════════════

@app.command("tts")
def cmd_tts(
    script_path: Path = typer.Option(..., "--script", help="script.json 路径"),
    voice_sample: Optional[Path] = typer.Option(None, "--voice-sample", help="声音样本路径（placeholder 后端忽略）"),
    backend: str = typer.Option("placeholder", "--backend", help="TTS 后端（目前仅支持 placeholder）"),
    force: bool = typer.Option(False, "--force", is_flag=True, help="覆盖已有 audio/"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """为每张幻灯片生成语音 WAV（placeholder 后端生成静音）。"""
    configure_logging(log_level)

    script_path = script_path.resolve()
    if not script_path.exists():
        err_console.print(f"[red]script.json 不存在：{script_path}[/red]")
        raise typer.Exit(1)

    from studio_kit.core.contracts import ScriptDoc
    from studio_kit.pipeline import _run_tts

    try:
        script = ScriptDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    except Exception as e:
        err_console.print(f"[red]script.json 解析失败：{e}[/red]")
        raise typer.Exit(1)

    audio_dir = script_path.parent / "audio"

    try:
        _run_tts(
            script,
            audio_dir,
            tts_backend=backend,
            voice_sample=voice_sample.resolve() if voice_sample else None,
            force=force,
        )
    except Exception as e:
        err_console.print(f"[red]TTS 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"[green]TTS 完成：{len(script.slides)} 个 WAV → {audio_dir}[/green]")


# ════════════════════════════════════════════════════════════════════
# render
# ════════════════════════════════════════════════════════════════════

@app.command("render")
def cmd_render(
    script_path: Path = typer.Option(..., "--script", help="script.json 路径"),
    audio_dir: Optional[Path] = typer.Option(None, "--audio-dir", help="audio/ 目录（默认 script 同级）"),
    force: bool = typer.Option(False, "--force", is_flag=True, help="强制重新渲染所有幻灯片"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """用 Patchright 录制每张幻灯片生成 mp4。"""
    configure_logging(log_level)

    script_path = script_path.resolve()
    if not script_path.exists():
        err_console.print(f"[red]script.json 不存在：{script_path}[/red]")
        raise typer.Exit(1)

    from studio_kit.core.contracts import ScriptDoc
    from studio_kit.render.slide_renderer import render_all_slides

    try:
        script = ScriptDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    except Exception as e:
        err_console.print(f"[red]script.json 解析失败：{e}[/red]")
        raise typer.Exit(1)

    resolved_audio_dir = (audio_dir.resolve() if audio_dir else script_path.parent / "audio")
    slides_dir = script_path.parent / "slides"

    if not resolved_audio_dir.exists():
        err_console.print(f"[red]audio/ 目录不存在：{resolved_audio_dir}（请先运行 tts 命令）[/red]")
        raise typer.Exit(1)

    try:
        mp4_paths = render_all_slides(script, resolved_audio_dir, slides_dir, force=force)
    except Exception as e:
        err_console.print(f"[red]render 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"[green]render 完成：{len(mp4_paths)} 个 mp4 → {slides_dir}[/green]")


# ════════════════════════════════════════════════════════════════════
# compose
# ════════════════════════════════════════════════════════════════════

@app.command("compose")
def cmd_compose(
    script_path: Path = typer.Option(..., "--script", help="script.json 路径"),
    audio_dir: Optional[Path] = typer.Option(None, "--audio-dir", help="audio/ 目录（默认 script 同级）"),
    slides_dir: Optional[Path] = typer.Option(None, "--slides-dir", help="slides/ 目录（默认 script 同级）"),
    out: Optional[Path] = typer.Option(None, "--out", help="输出 final.mp4 路径（默认 script 同级）"),
    force: bool = typer.Option(False, "--force", is_flag=True, help="覆盖已有 final.mp4"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """ffmpeg concat + 字幕烧入 → final.mp4 (1080×1920, 30fps, h264, aac 192k)。"""
    configure_logging(log_level)

    script_path = script_path.resolve()
    if not script_path.exists():
        err_console.print(f"[red]script.json 不存在：{script_path}[/red]")
        raise typer.Exit(1)

    from studio_kit.core.contracts import ScriptDoc
    from studio_kit.render.ffmpeg_compose import compose

    try:
        script = ScriptDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    except Exception as e:
        err_console.print(f"[red]script.json 解析失败：{e}[/red]")
        raise typer.Exit(1)

    resolved_audio_dir = (audio_dir.resolve() if audio_dir else script_path.parent / "audio")
    resolved_slides_dir = (slides_dir.resolve() if slides_dir else script_path.parent / "slides")
    resolved_out = (out.resolve() if out else script_path.parent / "final.mp4")

    for d, label in [(resolved_audio_dir, "audio/"), (resolved_slides_dir, "slides/")]:
        if not d.exists():
            err_console.print(f"[red]{label} 目录不存在：{d}[/red]")
            raise typer.Exit(1)

    try:
        compose(script, resolved_audio_dir, resolved_slides_dir, resolved_out, force=force)
    except Exception as e:
        err_console.print(f"[red]compose 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"[green]final.mp4 已生成：{resolved_out}[/green]")


# ════════════════════════════════════════════════════════════════════
# build
# ════════════════════════════════════════════════════════════════════

@app.command("build")
def cmd_build(
    report_dir: Path = typer.Option(..., "--report-dir", help="博主拆解报告目录"),
    voice_sample: Optional[Path] = typer.Option(None, "--voice-sample", help="声音样本（placeholder 忽略）"),
    target_seconds: int = typer.Option(110, "--target-seconds", help="目标时长（秒）"),
    tts_backend: str = typer.Option("placeholder", "--tts-backend", help="TTS 后端"),
    force: bool = typer.Option(False, "--force", is_flag=True, help="强制重跑所有步骤"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """一键串行执行 extract → tts → render → compose，产出 final.mp4。

    注意：script.json 必须先由 Claude skill 生成后，build 才能继续。
    """
    configure_logging(log_level)
    settings = _get_settings()

    report_dir = report_dir.resolve()
    if not report_dir.exists():
        err_console.print(f"[red]报告目录不存在：{report_dir}[/red]")
        raise typer.Exit(1)

    from studio_kit.pipeline import run_build

    try:
        final_mp4 = run_build(
            report_dir=report_dir,
            settings=settings,
            voice_sample=voice_sample.resolve() if voice_sample else None,
            target_seconds=target_seconds,
            tts_backend=tts_backend,
            force=force,
        )
    except SystemExit:
        # pipeline 内部 sys.exit(1) 时（script.json 缺失）直接透传
        raise typer.Exit(1)
    except Exception as e:
        err_console.print(f"[red]build 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"\n[bold green]build 完成！[/bold green]")
    console.print(f"  final.mp4 → {final_mp4}")


# ════════════════════════════════════════════════════════════════════
# version
# ════════════════════════════════════════════════════════════════════

@app.command("version")
def cmd_version() -> None:
    """显示版本号。"""
    console.print(f"studio-kit v{__version__}")


if __name__ == "__main__":
    app()
