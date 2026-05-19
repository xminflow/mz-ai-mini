"""音频转录 · 走 ua-agent backend 的 FunASR-Nano CLI。

直接 subprocess 调：
    uv run --directory <ua-agent/backend> ua-agent transcript run \
        --post-id <id> --media-path <wav> --json

ua-agent backend 内置了 Fun-ASR-Nano-2512 模型（~2.1 GB，已预下载到
%APPDATA%\\ua-agent\\asr\\Fun-ASR-Nano-2512\\），跑 CPU 也能用。

CLI 通过 stdout 输出 JSON-line（每行一个 event）：
    {"event":"progress","stage":"loading_model","percent":0.0}
    {"event":"progress","stage":"transcribing","percent":50.0}
    {"event":"result","text":"...","language":"zh","duration_s":45.3}
    {"event":"error","code":"...","message":"..."}

本模块解析这些事件，回吐最终文本。
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Callable

from research_kit.core.logging import get_logger

_log = get_logger(__name__)


def _find_ua_agent_backend(start: Path) -> Path | None:
    """从给定路径向上查找 ua-agent/backend 目录。

    research-kit 与 ua-agent 通常在同一 monorepo 下，两个子工程平级。
    """
    here = start.resolve()
    for parent in [here, *here.parents]:
        candidate = parent / "ua-agent" / "backend"
        if (candidate / "pyproject.toml").exists():
            return candidate
    return None


def _resolve_ua_agent_backend() -> Path:
    """定位 ua-agent backend 目录。允许通过 RK_UA_AGENT_BACKEND 环境变量覆盖。"""
    override = os.environ.get("RK_UA_AGENT_BACKEND")
    if override:
        path = Path(override).expanduser().resolve()
        if (path / "pyproject.toml").exists():
            return path
        raise RuntimeError(
            f"RK_UA_AGENT_BACKEND 指向的目录不存在 pyproject.toml：{path}"
        )

    found = _find_ua_agent_backend(Path(__file__))
    if found is not None:
        return found
    raise RuntimeError(
        "未在仓库内找到 ua-agent/backend 目录。"
        "请把 ua-agent 与 research-kit 放在同一 monorepo 下，"
        "或设置环境变量 RK_UA_AGENT_BACKEND=<ua-agent/backend 路径>"
    )


def transcribe_with_ua_agent(
    audio_path: Path,
    *,
    post_id: str | None = None,
    on_progress: Callable[[str, float], None] | None = None,
    timeout_seconds: int = 900,
) -> str:
    """调用 ua-agent backend 的 transcript CLI 对一个 wav/mp4 做转录，返回纯文本。

    audio_path 推荐传 16kHz 单声道 WAV（ua-agent 在 Windows 上对 mp4 走 librosa
    可能死锁，frames.py 已经统一走 wav 路径，调用方应在调用本函数前用
    `extract_audio` 提取 wav）。
    """
    if not audio_path.exists():
        raise RuntimeError(f"音频文件不存在：{audio_path}")

    backend_dir = _resolve_ua_agent_backend()
    uv = shutil.which("uv") or "uv"

    pid = post_id or audio_path.stem
    cmd = [
        uv,
        "run",
        "--directory",
        str(backend_dir),
        "ua-agent",
        "transcript",
        "run",
        "--post-id",
        pid,
        "--media-path",
        str(audio_path.resolve()),
        "--json",
    ]
    _log.info("调用 ua-agent 转录: post_id=%s media=%s", pid, audio_path.name)

    text = ""
    language = ""
    duration_s = 0.0
    last_error: dict | None = None

    # 把 PYTHONUNBUFFERED 注入子进程环境，让 ua-agent CLI 的 stdout 行缓冲，
    # 这样进度事件能实时被父进程读到（默认 Python 在非 tty 模式下 stdout 是全缓冲）。
    child_env = {**os.environ, "PYTHONUNBUFFERED": "1"}

    # 关键陷阱：funasr/torch/transformers 加载时会往 stderr 喷大量进度/警告日志。
    # 如果用 stderr=subprocess.PIPE 但没主动读，OS pipe buffer（Windows ~64KB）
    # 满了之后子进程 write 阻塞，整个 funasr 推理就 deadlock。
    # 解决方案：把 stderr 合并到 stdout，统一在 stdout 循环里读取并丢弃非 JSON 行。
    try:
        proc = subprocess.Popen(
            cmd,
            cwd=str(backend_dir),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,  # 行缓冲
            env=child_env,
        )
    except FileNotFoundError as exc:
        raise RuntimeError(f"无法启动 uv 子进程：{exc}") from exc

    try:
        assert proc.stdout is not None
        for raw_line in proc.stdout:
            line = raw_line.strip()
            if not line:
                continue
            # 试图解析 JSON-line 事件；非 JSON 行（funasr/torch 的 stderr 日志）丢弃。
            if not line.startswith("{"):
                _log.debug("ua-agent stderr/log: %s", line[:200])
                continue
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                _log.debug("跳过非 JSON 输出: %s", line[:200])
                continue
            kind = event.get("event")
            if kind == "progress":
                stage = event.get("stage", "?")
                percent = float(event.get("percent", 0.0))
                _log.info("ua-agent %s %.1f%%", stage, percent)
                if on_progress is not None:
                    on_progress(stage, percent)
            elif kind == "result":
                text = str(event.get("text", ""))
                language = str(event.get("language", ""))
                duration_s = float(event.get("duration_s", 0.0))
            elif kind == "error":
                last_error = event

        try:
            proc.wait(timeout=timeout_seconds)
        except subprocess.TimeoutExpired:
            proc.kill()
            raise RuntimeError(f"ua-agent 转录超时（>{timeout_seconds}s）")
    finally:
        pass  # stderr 已合并到 stdout，不需要单独清理

    if last_error is not None:
        code = last_error.get("code", "UNKNOWN")
        message = last_error.get("message", "")
        raise RuntimeError(f"ua-agent 转录失败 [{code}]: {message}")

    if proc.returncode != 0:
        raise RuntimeError(f"ua-agent 转录子进程退出码 {proc.returncode}")

    _log.info("转录完成: %d 字, lang=%s, duration=%.1fs", len(text), language, duration_s)
    return text


# 保留旧入口名 `transcribe_audio` 以兼容 runner.py
def transcribe_audio(
    audio_path: Path,
    *,
    model_name: str = "",  # 兼容性参数；ua-agent 用固定 funasr-nano 模型
    language: str = "zh",  # 兼容性参数；ua-agent 默认中文
    cache_dir: Path | None = None,  # 兼容性参数
    use_gpu: bool = False,  # 兼容性参数；ua-agent 自动检测 CUDA
    beam_size: int = 5,  # 兼容性参数
) -> str:
    """兼容旧接口的转录函数。底层走 ua-agent FunASR CLI。

    旧的 model_name/use_gpu 等参数仅作占位，实际行为由 ua-agent 决定。
    """
    del model_name, language, cache_dir, use_gpu, beam_size
    return transcribe_with_ua_agent(audio_path)


__all__ = ["transcribe_audio", "transcribe_with_ua_agent"]
