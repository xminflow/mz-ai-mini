"""build 命令的串行编排逻辑。

流程：
  1. extract：outline.json 不存在时执行
  2. script 检查：script.json 必须由 Claude skill 预先生成
  3. tts：audio/ 不完整时执行
  4. render：slides/ 不完整时执行
  5. compose：final.mp4 不存在或 force 时执行
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from studio_kit.core.contracts import ScriptDoc
from studio_kit.core.logging import get_logger
from studio_kit.core.settings import Settings

logger = get_logger(__name__)

_SCRIPT_MISSING_MSG = """
script.json 不存在。请先用 Claude Code 触发 skill 生成脚本：
  在 Claude Code 中输入「把这个博主拆解做成短视频」并提供 report_dir
生成后再运行 studio-kit build。
""".strip()


def _resolve_run_dir(settings: Settings, blogger_slug: str, run_id: str) -> Path:
    return settings.workspace_root / blogger_slug / run_id


def _is_audio_complete(audio_dir: Path, n_slides: int) -> bool:
    """检查 audio/ 下是否已有所有 WAV 和对应 meta.json。"""
    for i in range(n_slides):
        idx = f"{i:02d}"
        if not (audio_dir / f"{idx}.wav").exists():
            return False
        if not (audio_dir / f"{idx}.meta.json").exists():
            return False
    return True


def _is_slides_complete(slides_dir: Path, n_slides: int) -> bool:
    """检查 slides/ 下是否已有所有 mp4。"""
    for i in range(n_slides):
        if not (slides_dir / f"{i:02d}.mp4").exists():
            return False
    return True


def run_build(
    report_dir: Path,
    settings: Settings,
    *,
    voice_sample: Path | None = None,
    target_seconds: int = 70,
    tts_backend: str = "placeholder",
    force: bool = False,
) -> Path:
    """
    串行执行完整产线，返回 final.mp4 路径。

    报错策略：任何步骤失败均 raise，不静默吞异常。
    """
    # ── 步骤 1：extract ──────────────────────────────────────────────
    from studio_kit.extract.parser import run_extract, parse_report

    # 先解析 report_dir 取 slug/run_id，以确定 run_dir
    outline_doc = parse_report(report_dir)
    run_dir = _resolve_run_dir(settings, outline_doc.blogger_slug, outline_doc.run_id)
    run_dir.mkdir(parents=True, exist_ok=True)

    outline_path = run_dir / "outline.json"
    if not outline_path.exists() or force:
        logger.info("[1/5] extract → %s", outline_path)
        run_extract(report_dir, outline_path)
    else:
        logger.info("[1/5] outline.json 已存在，跳过 extract")

    # ── 步骤 2：校验 script.json ─────────────────────────────────────
    script_path = run_dir / "script.json"
    if not script_path.exists():
        # 硬退出，给出明确指引
        print(_SCRIPT_MISSING_MSG, file=sys.stderr)
        sys.exit(1)

    logger.info("[2/5] 加载 script.json：%s", script_path)
    script = ScriptDoc.model_validate_json(script_path.read_text(encoding="utf-8"))
    n_slides = len(script.slides)

    # ── 步骤 3：TTS ──────────────────────────────────────────────────
    audio_dir = run_dir / "audio"
    if not _is_audio_complete(audio_dir, n_slides) or force:
        logger.info("[3/5] tts → %s", audio_dir)
        _run_tts(script, audio_dir, tts_backend=tts_backend, voice_sample=voice_sample, force=force)
    else:
        logger.info("[3/5] audio/ 已完整，跳过 tts")

    # ── 步骤 4：render ───────────────────────────────────────────────
    slides_dir = run_dir / "slides"
    if not _is_slides_complete(slides_dir, n_slides) or force:
        logger.info("[4/5] render → %s", slides_dir)
        slides_dir.mkdir(parents=True, exist_ok=True)
        # 把 research-kit 抓的 raw/avatar.jpg 拷贝到 slides/avatar.jpg，
        # 让 cover 模板可以通过 {{avatar_path}} = "avatar.jpg" 直接 <img src> 引用。
        raw_avatar = report_dir.parent.parent / "raw" / "avatar.jpg"
        if raw_avatar.is_file():
            import shutil
            target_avatar = slides_dir / "avatar.jpg"
            shutil.copy2(raw_avatar, target_avatar)
            logger.info("avatar 已复制：%s → %s", raw_avatar, target_avatar)
        else:
            logger.warning("未找到 raw/avatar.jpg（%s），cover 头像将降级为占位", raw_avatar)
        from studio_kit.render.slide_renderer import render_all_slides
        render_all_slides(script, audio_dir, slides_dir, force=force)
    else:
        logger.info("[4/5] slides/ 已完整，跳过 render")

    # ── 步骤 5：compose ──────────────────────────────────────────────
    final_mp4 = run_dir / "final.mp4"
    logger.info("[5/5] compose → %s", final_mp4)
    from studio_kit.render.ffmpeg_compose import compose
    compose(script, audio_dir, slides_dir, final_mp4, force=force)

    return final_mp4


def _run_tts(
    script: ScriptDoc,
    audio_dir: Path,
    *,
    tts_backend: str,
    voice_sample: Path | None,
    force: bool,
) -> None:
    """对每个 slide 调用 TTS 后端，写出 NN.wav + NN.meta.json。

    placeholder：逐段调用，无 GPU。
    indextts：批量调用，模型只加载一次，GPU 加速。
    """
    audio_dir.mkdir(parents=True, exist_ok=True)

    if tts_backend == "placeholder":
        from studio_kit.tts import placeholder as backend
        for slide in script.slides:
            idx_str = f"{slide.index:02d}"
            wav_path = audio_dir / f"{idx_str}.wav"
            meta_path = audio_dir / f"{idx_str}.meta.json"
            if wav_path.exists() and meta_path.exists() and not force:
                logger.debug("audio/%s.wav 已存在，跳过", idx_str)
                continue
            duration_s = backend.synthesize(slide.narration, wav_path, voice_sample)
            _write_meta(meta_path, slide.index, duration_s, len(slide.narration), tts_backend)
            logger.debug("TTS [%s]: %.1fs → %s", idx_str, duration_s, wav_path)

    elif tts_backend == "indextts":
        from studio_kit.tts.indextts import run_batch

        # 收集需要合成的幻灯片（跳过已有产物）
        pending: list[dict] = []
        for slide in script.slides:
            idx_str = f"{slide.index:02d}"
            wav_path = audio_dir / f"{idx_str}.wav"
            meta_path = audio_dir / f"{idx_str}.meta.json"
            if wav_path.exists() and meta_path.exists() and not force:
                logger.debug("audio/%s.wav 已存在，跳过", idx_str)
                continue
            pending.append({
                "index": slide.index,
                "text": slide.narration,
                "output": str(audio_dir / f"{idx_str}.wav"),
            })

        if not pending:
            logger.info("所有 audio/ 已存在，跳过 indextts 合成")
            return

        logger.info("IndexTTS-2 批量合成 %d 段…", len(pending))
        durations = run_batch(pending, voice_sample)

        # 根据 pending 列表写 meta.json
        for task, duration_s in zip(pending, durations):
            idx = task["index"]
            idx_str = f"{idx:02d}"
            meta_path = audio_dir / f"{idx_str}.meta.json"
            _write_meta(meta_path, idx, duration_s, len(script.slides[idx].narration), tts_backend)
            logger.debug("TTS [%s]: %.1fs", idx_str, duration_s)

    else:
        raise ValueError(
            f"未知 TTS 后端：{tts_backend}（支持：placeholder, indextts）"
        )


def _write_meta(
    meta_path: Path,
    slide_index: int,
    duration_s: float,
    chars: int,
    backend: str,
) -> None:
    meta: dict[str, float | int | str] = {
        "slide_index": slide_index,
        "duration_s": duration_s,
        "duration_ms": int(duration_s * 1000),
        "chars": chars,
        "backend": backend,
    }
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
