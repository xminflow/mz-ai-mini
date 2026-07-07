"""studio-kit CLI 入口。

子命令：
    extract    解析博主拆解 HTML 报告 → outline.json
    script     校验 script.json 字数约束
    tts        为每张幻灯片生成语音 WAV
    cosyvoice  用 DashScope 百炼 CosyVoice 生成单段语音 WAV
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
    target_seconds: int | None = typer.Option(
        None,
        "--target-seconds",
        help="目标时长（秒），未指定时使用 script.json 中的 target_seconds 字段（默认 70）",
    ),
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

    # 命令行未显式覆盖时，使用 JSON 中的 target_seconds（默认 70）
    effective_target_seconds = target_seconds if target_seconds is not None else script.target_seconds
    char_limit = int(effective_target_seconds * speed)
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
    table.add_row("目标时长", f"{effective_target_seconds}s", "")

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
# cosyvoice（DashScope 百炼单段语音生成）
# ════════════════════════════════════════════════════════════════════

@app.command("cosyvoice")
def cmd_cosyvoice(
    text: str = typer.Argument(..., help="要合成的文本"),
    output: Path = typer.Option(..., "-o", "--output", help="输出 WAV 路径"),
    model: str = typer.Option("cosyvoice-v2", "--model", help="CosyVoice 模型"),
    voice: str = typer.Option("longxiaochun_v2", "--voice", help="预置音色名（未用克隆时生效）"),
    ref_url: Optional[str] = typer.Option(None, "--ref-url", help="克隆参考音频公网 URL（10-20s/≥16kHz/单声道）"),
    design_prompt: Optional[str] = typer.Option(None, "--design-prompt", help="音色设计：用文字描述生成音色（需 v3/v3.5 模型）"),
    prefix: Optional[str] = typer.Option(None, "--prefix", help="克隆/设计音色前缀名（仅字母数字，≤10 字符）"),
    voice_id: Optional[str] = typer.Option(None, "--voice-id", help="复用已建好的克隆/设计音色 voice_id"),
    instruction: Optional[str] = typer.Option(None, "--instruction", help="Instruct 情感/风格指令（仅部分 v3/v3.5 音色支持，如 longanyang）"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """用 DashScope 百炼 CosyVoice 生成单段语音 WAV。

    四选一音色来源：
      默认            使用 --voice 预置音色；
      --ref-url       配合 --prefix 先克隆音色再合成（结束打印 voice_id 便于复用）；
      --design-prompt 配合 --prefix 先按文字描述设计音色再合成（需 v3/v3.5 模型）；
      --voice-id      直接复用已建好的克隆/设计音色。
    可选 --instruction 用自然语言控制情感/语气（仅支持 Instruct 的音色生效）。
    需设置环境变量 DASHSCOPE_API_KEY。
    """
    configure_logging(log_level)

    # 参数互斥校验：--ref-url / --design-prompt / --voice-id 三者只能用其一。
    sources = [bool(ref_url), bool(design_prompt), bool(voice_id)]
    if sum(sources) > 1:
        err_console.print("[red]--ref-url / --design-prompt / --voice-id 三者互斥，只能用其一[/red]")
        raise typer.Exit(1)
    if (ref_url or design_prompt) and not prefix:
        err_console.print("[red]克隆/设计模式必须同时提供 --prefix[/red]")
        raise typer.Exit(1)
    # 音色设计/克隆只支持 v3/v3.5 模型（v2 不支持设计），显式校验避免无意义的云端报错。
    if design_prompt and not model.startswith("cosyvoice-v3"):
        err_console.print(
            f"[red]音色设计需 v3/v3.5 模型，当前 --model={model}；请用 --model cosyvoice-v3.5-plus[/red]"
        )
        raise typer.Exit(1)

    from studio_kit.tts import cosyvoice

    output = output.resolve()
    try:
        if ref_url:
            assert prefix is not None  # 上面已校验
            synth_voice = cosyvoice.create_clone_voice(ref_url, prefix, model=model)
            console.print(f"[cyan]克隆音色已创建：voice_id={synth_voice}[/cyan]")
        elif design_prompt:
            assert prefix is not None  # 上面已校验
            synth_voice = cosyvoice.design_voice(design_prompt, prefix, model=model)
            console.print(f"[cyan]设计音色已创建：voice_id={synth_voice}[/cyan]")
        elif voice_id:
            synth_voice = voice_id
        else:
            synth_voice = voice

        duration = cosyvoice.synthesize(
            text, output, model=model, voice=synth_voice, instruction=instruction
        )
    except Exception as e:
        err_console.print(f"[red]CosyVoice 合成失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"[green]合成完成：{duration:.2f}s → {output}[/green]")


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
    target_seconds: int = typer.Option(70, "--target-seconds", help="目标时长（秒），默认 70（区间 60-75）"),
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
# render-xhs  （小红书图文 8 张 PNG）
# ════════════════════════════════════════════════════════════════════

@app.command("render-xhs")
def cmd_render_xhs(
    script_path: Path = typer.Option(..., "--script", help="xhs script.json 路径"),
    out: Optional[Path] = typer.Option(None, "--out", help="输出目录（默认 script 同级 images/）"),
    force: bool = typer.Option(False, "--force", is_flag=True, help="强制重新渲染所有卡片"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """渲染小红书图文 8 张 PNG（3:4 1242×1656）。

    script.json 由 blogger-breakdown-xhs skill 在用户确认后写出，本命令只负责渲染。
    """
    configure_logging(log_level)

    script_path = script_path.resolve()
    if not script_path.exists():
        err_console.print(f"[red]script.json 不存在：{script_path}[/red]")
        raise typer.Exit(1)

    from studio_kit.core.contracts import XhsDoc
    from studio_kit.render.xhs import render_all_cards

    try:
        script = XhsDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    except Exception as e:
        err_console.print(f"[red]xhs script.json 解析失败：{e}[/red]")
        raise typer.Exit(1)

    out_dir = (out.resolve() if out else script_path.parent / "images")

    try:
        png_paths = render_all_cards(script, out_dir, force=force)
    except Exception as e:
        err_console.print(f"[red]render-xhs 失败：{e}[/red]")
        raise typer.Exit(1)

    table = Table(title="xhs 图文渲染结果", show_header=True)
    table.add_column("#", style="cyan", width=4)
    table.add_column("类型", style="white", width=8)
    table.add_column("PNG", style="green")
    for card, png in zip(script.cards, png_paths):
        table.add_row(f"{card.index:02d}", card.card_type, str(png))
    console.print(table)
    console.print(f"[green]render-xhs 完成：{len(png_paths)} 张 PNG → {out_dir}[/green]")


# ════════════════════════════════════════════════════════════════════
# arch-video  （架构图音色讲解视频，1920×1080）
# ════════════════════════════════════════════════════════════════════

@app.command("arch-video")
def cmd_arch_video(
    script_path: Path = typer.Option(..., "--script", help="arch script.json 路径"),
    voice_sample: Optional[Path] = typer.Option(
        None, "--voice-sample", help="音色样本 wav（默认 chenchangzhang-desktop.wav）"
    ),
    backend: str = typer.Option(
        "indextts", "--backend", help="TTS 后端（indextts / placeholder）"
    ),
    portrait: bool = typer.Option(
        False, "--portrait", is_flag=True, help="竖版 1080×1920（默认横版 1920×1080）"
    ),
    force: bool = typer.Option(False, "--force", is_flag=True, help="强制重跑所有步骤"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """架构图音色讲解视频：TTS → 图片片段 → ffmpeg 合成 → final.mp4。

    默认横版 1920×1080；加 --portrait 出竖版 1080×1920。
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
            portrait=portrait,
        )
    except Exception as e:
        err_console.print(f"[red]arch-video 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(f"[green]final.mp4 已生成：{final_mp4}[/green]")


# ════════════════════════════════════════════════════════════════════
# drawio-export  （批量把 .drawio 导出为 PNG，使用 draw.io Desktop CLI）
# ════════════════════════════════════════════════════════════════════

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


# ════════════════════════════════════════════════════════════════════
# arch-ppt  （把图片序列组装成横版 16:9 PPT，文案进演讲者备注）
# ════════════════════════════════════════════════════════════════════

@app.command("arch-ppt")
def cmd_arch_ppt(
    script_path: Path = typer.Option(..., "--script", help="script.json 路径（与视频共用）"),
    out: Optional[Path] = typer.Option(None, "--out", help="输出 .pptx 路径（默认 script 同级 <slug>.pptx）"),
    no_notes: bool = typer.Option(False, "--no-notes", is_flag=True, help="不把文案写入演讲者备注"),
    log_level: str = typer.Option("INFO", "--log-level"),
) -> None:
    """把 script.json 引用的图片组装成横版 16:9 PPT（每图铺满一页，文案进备注）。

    注意：横版 PPT 需用横版（1920×1080）图；竖版图会上下留白。
    """
    configure_logging(log_level)
    script_path = script_path.resolve()
    if not script_path.exists():
        err_console.print(f"[red]script.json 不存在：{script_path}[/red]")
        raise typer.Exit(1)

    from studio_kit.core.contracts import ArchVideoDoc
    from studio_kit.render.pptx_build import build_pptx

    try:
        doc = ArchVideoDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
        out_pptx = (out.resolve() if out else script_path.parent / f"{doc.slug}.pptx")
        saved = build_pptx(doc, script_path.parent, out_pptx, notes=not no_notes)
    except Exception as e:
        err_console.print(f"[red]arch-ppt 失败：{e}[/red]")
        raise typer.Exit(1)

    if saved != out_pptx:
        console.print(f"[yellow]原文件被占用，已另存：{saved}[/yellow]")
    console.print(f"[green]PPT 已生成（{len(doc.segments)} 页）：{saved}[/green]")


# ════════════════════════════════════════════════════════════════════
# slide-render  （HTML 幻灯片 → 1920×1080 PNG，配合 arch-ppt 出 PPT）
# ════════════════════════════════════════════════════════════════════

@app.command("slide-render")
def cmd_slide_render(
    html_dir: Path = typer.Option(..., "--html-dir", help="含 *.html 幻灯片的源目录"),
    out_dir: Optional[Path] = typer.Option(
        None, "--out-dir", help="PNG 输出目录（默认 html-dir 同级 images/）"
    ),
    only: Optional[list[str]] = typer.Option(
        None, "--only", help="只渲染指定页名（不带 .html，可多次指定）"
    ),
    width: int = typer.Option(1920, "--width", help="渲染宽度（横版 1920，竖版 1080）"),
    height: int = typer.Option(1080, "--height", help="渲染高度（横版 1080，竖版 1920）"),
    log_level: str = typer.Option("INFO", "--log-level", help="日志级别"),
) -> None:
    """把 HTML 幻灯片用无头 Chrome 渲成 PNG（默认 1920×1080，竖版传 --width 1080 --height 1920）。

    产物为每页一张 width×height PNG（跳过以 `_` 开头的辅助文件），
    可直接配合 arch-ppt 命令组装成横版 16:9 PPT。
    Chrome 路径取环境变量 CHROME_PATH，未设置时用默认安装路径。
    """
    configure_logging(log_level)

    html_dir = html_dir.resolve()
    if not html_dir.is_dir():
        err_console.print(f"[red]HTML 源目录不存在：{html_dir}[/red]")
        raise typer.Exit(1)

    from studio_kit.render.html_render import render_dir, resolve_chrome_path

    resolved_out = (out_dir.resolve() if out_dir else html_dir.parent / "images")
    chrome_path = resolve_chrome_path()

    try:
        pngs = render_dir(
            html_dir,
            resolved_out,
            chrome_path=chrome_path,
            only=only or None,
            width=width,
            height=height,
        )
    except Exception as e:
        err_console.print(f"[red]slide-render 失败：{e}[/red]")
        raise typer.Exit(1)

    console.print(
        f"[green]slide-render 完成：{len(pngs)} 张 {width}×{height} PNG → {resolved_out}[/green]"
    )


# ════════════════════════════════════════════════════════════════════
# version
# ════════════════════════════════════════════════════════════════════

@app.command("version")
def cmd_version() -> None:
    """显示版本号。"""
    console.print(f"studio-kit v{__version__}")


if __name__ == "__main__":
    app()
