"""单条抖音视频采集编排。

输入：视频页 URL + workspace 根目录。
输出：workspace/<aweme_id>/ 下的 meta.json / 1-4.jpg / transcript.txt / index.json。
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from research_kit.collectors.douyin_browser.download import download_video
from research_kit.collectors.douyin_browser.frames import extract_audio, extract_key_frames
from research_kit.collectors.douyin_browser.transcribe import transcribe_with_ua_agent
from research_kit.collectors.single_video.meta import VideoMeta, fetch_video_meta
from research_kit.core.logging import get_logger

_log = get_logger(__name__)


@dataclass(slots=True)
class VideoCollectOptions:
    proxy: str | None = None
    keep_video: bool = False
    skip_transcribe: bool = False
    skip_frames: bool = False
    frame_count: int = 4


@dataclass(slots=True)
class VideoCollectResult:
    aweme_id: str
    workspace: Path
    meta: VideoMeta
    frame_paths: list[Path] = field(default_factory=list)
    transcript: str = ""
    transcript_ok: bool = False
    failures: list[str] = field(default_factory=list)


def run_video_collect(
    page_url: str,
    workspace_root: Path,
    *,
    options: VideoCollectOptions | None = None,
) -> VideoCollectResult:
    """单条视频采集编排主函数。

    幂等：各阶段产物已存在则跳过重复执行。
    步骤：
    1. fetch_video_meta()   → workspace/meta.json
    2. download_video()     → workspace/video.mp4
    3. extract_key_frames() → workspace/1.jpg…N.jpg
    4. extract_audio()      → workspace/audio.wav
    5. transcribe()         → workspace/transcript.txt
    6. cleanup video.mp4（unless keep_video）
    7. 写 workspace/index.json
    """
    opts = options or VideoCollectOptions()

    # Step 1: 获取元数据
    _log.info("Step 1: 获取视频元数据 %s", page_url)
    meta = fetch_video_meta(page_url, proxy=opts.proxy)
    _log.info(
        "视频元数据: aweme_id=%s title=%s duration=%.1fs",
        meta.aweme_id,
        meta.title[:40],
        meta.duration_seconds,
    )

    workspace = workspace_root / meta.aweme_id
    workspace.mkdir(parents=True, exist_ok=True)

    failures: list[str] = []

    meta_path = workspace / "meta.json"
    if not meta_path.exists():
        meta_path.write_text(
            json.dumps(meta.to_dict(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        _log.debug("写入 meta.json: %s", meta_path)

    result = VideoCollectResult(aweme_id=meta.aweme_id, workspace=workspace, meta=meta)

    # Step 2: 下载视频
    video_path = workspace / "video.mp4"
    if not video_path.exists():
        _log.info("Step 2: 下载视频 mp4")
        try:
            download_video(page_url, video_path, proxy=opts.proxy)
        except Exception as exc:
            failures.append(f"video_download: {exc}")
            _log.error("视频下载失败: %s", exc)
            result.failures = failures
            _write_index(result)
            return result

    # Step 3: 抽关键帧
    if not opts.skip_frames:
        expected_frames = [workspace / f"{i}.jpg" for i in range(1, opts.frame_count + 1)]
        existing_frames = [p for p in expected_frames if p.exists()]
        if len(existing_frames) == opts.frame_count:
            _log.debug("关键帧已存在，跳过抽帧")
            result.frame_paths = existing_frames
        else:
            _log.info("Step 3: 抽关键帧 (frame_count=%d)", opts.frame_count)
            try:
                result.frame_paths = extract_key_frames(
                    video_path, workspace, frame_count=opts.frame_count
                )
                _log.info("抽帧完成: %d 帧", len(result.frame_paths))
            except Exception as exc:
                failures.append(f"extract_frames: {exc}")
                _log.warning("抽帧失败: %s", exc)

    # Step 4 + 5: 提取音频 + 转录
    if not opts.skip_transcribe:
        transcript_path = workspace / "transcript.txt"
        if transcript_path.exists():
            result.transcript = transcript_path.read_text(encoding="utf-8")
            result.transcript_ok = len(result.transcript.strip()) >= 10
            _log.debug("转录文件已存在，跳过")
        else:
            wav_path = workspace / "audio.wav"
            _log.info("Step 4: 提取音频 WAV")
            try:
                if not wav_path.exists():
                    extract_audio(video_path, wav_path)
            except Exception as exc:
                failures.append(f"extract_audio: {exc}")
                _log.warning("音频提取失败: %s", exc)
            else:
                _log.info("Step 5: 转录")
                try:
                    text = transcribe_with_ua_agent(wav_path, post_id=meta.aweme_id)
                    transcript_path.write_text(text, encoding="utf-8")
                    result.transcript = text
                    result.transcript_ok = len(text.strip()) >= 10
                    _log.info("转录完成: %d 字", len(text))
                except Exception as exc:
                    failures.append(f"transcribe: {exc}")
                    _log.warning("转录失败: %s", exc)
                    transcript_path.write_text("", encoding="utf-8")
                finally:
                    if wav_path.exists():
                        wav_path.unlink(missing_ok=True)
    else:
        # 跳过转录时写空文件占位，确保 workspace 结构完整
        transcript_path = workspace / "transcript.txt"
        if not transcript_path.exists():
            transcript_path.write_text("", encoding="utf-8")

    # Step 6: 清理 video.mp4
    if not opts.keep_video and video_path.exists():
        video_path.unlink(missing_ok=True)
        _log.debug("清理 video.mp4")

    # Step 7: 写 index.json
    result.failures = failures
    _write_index(result)

    return result


def _write_index(result: VideoCollectResult) -> None:
    """写入 workspace/index.json，供 skill Bash 阶段解析。"""
    video_ok = not any("video_download" in f for f in result.failures)
    index = {
        "ok": video_ok,
        "aweme_id": result.aweme_id,
        "workspace": str(result.workspace),
        "title": result.meta.title,
        "duration_seconds": result.meta.duration_seconds,
        "frames": len(result.frame_paths),
        "transcript_ok": result.transcript_ok,
        "failures": result.failures,
    }
    (result.workspace / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


__all__ = ["VideoCollectOptions", "VideoCollectResult", "run_video_collect"]
