"""IndexTTS-2 后端：通过 subprocess 调用专属 venv 做 GPU 语音合成。

模型复用 ua-agent 已安装的 IndexTTS-2：
  venv:   D:\\code\\weelume-base\\ua-agent\\.venvs\\index-tts\\Scripts\\python.exe
  source: C:\\Users\\xmin\\AppData\\Roaming\\ua-agent\\oral-models\\index-tts
  ckpts:  ...\\index-tts\\checkpoints\\

默认音色：ua-agent 已有的参考音频（68e055bf）。
"""
from __future__ import annotations

import json
import os
import subprocess
import tempfile
import wave
from pathlib import Path

from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

_INDEXTTS_PYTHON = Path(
    r"D:\code\weelume-base\ua-agent\.venvs\index-tts\Scripts\python.exe"
)
_WORKER_SCRIPT = Path(__file__).resolve().parent / "_indextts_worker.py"

_DEFAULT_VOICE = Path(
    r"C:\Users\xmin\AppData\Roaming\ua-agent-frontend\oral-video\voices"
    r"\68e055bf-2129-4cfc-b199-6321d56cf35c\reference.mp3"
)


def _check_env() -> None:
    if not _INDEXTTS_PYTHON.exists():
        raise RuntimeError(
            f"IndexTTS venv 不存在：{_INDEXTTS_PYTHON}\n"
            "请先在 ua-agent 中安装 IndexTTS-2。"
        )


def synthesize_batch(
    tasks: list[dict],
    voice_sample: Path | None = None,
    *,
    use_fp16: bool = True,
) -> list[float]:
    """
    批量合成所有 slide 的语音。

    tasks 格式：[{"index": 0, "text": "...", "output": "/abs/path/00.wav"}, ...]
    返回与 tasks 等长的 duration_s 列表。
    """
    _check_env()

    ref_audio = voice_sample or _DEFAULT_VOICE
    if not ref_audio.exists():
        raise FileNotFoundError(
            f"音色参考文件不存在：{ref_audio}\n"
            "请提供 --voice-sample 参数，或将参考音频放到默认路径。"
        )

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False, encoding="utf-8"
    ) as f:
        json.dump(tasks, f, ensure_ascii=False)
        input_json_path = f.name

    cmd = [
        str(_INDEXTTS_PYTHON),
        str(_WORKER_SCRIPT),
        "--input-json", input_json_path,
        "--voice-sample", str(ref_audio),
    ]
    if use_fp16:
        cmd.append("--use-fp16")

    logger.info("IndexTTS-2 启动（%d 段，fp16=%s）…", len(tasks), use_fp16)
    result = subprocess.run(cmd, capture_output=False, text=True, check=False)

    Path(input_json_path).unlink(missing_ok=True)

    if result.returncode != 0:
        raise RuntimeError(
            f"IndexTTS-2 合成失败（exit={result.returncode}）\n"
            "请检查上方终端输出获取详细错误。"
        )

    # worker 最后一行：RESULT_JSON:[...]
    # 由于 capture_output=False，stdout 已直接打印到终端，需从 result.stdout 读
    # 改为 capture stdout 以解析结果
    raise RuntimeError("内部错误：应使用 _run_batch() 而不是直接调用此函数")


def _run_batch(
    tasks: list[dict],
    voice_sample: Path | None,
    *,
    use_fp16: bool = True,
) -> list[float]:
    """执行 subprocess 并解析 RESULT_JSON。"""
    _check_env()

    ref_audio = voice_sample or _DEFAULT_VOICE
    if not ref_audio.exists():
        raise FileNotFoundError(
            f"音色参考文件不存在：{ref_audio}\n"
            "请提供 --voice-sample 参数，或将参考音频放到默认路径。"
        )

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".json", delete=False, encoding="utf-8"
    ) as f:
        json.dump(tasks, f, ensure_ascii=False)
        input_json_path = f.name

    cmd = [
        str(_INDEXTTS_PYTHON),
        str(_WORKER_SCRIPT),
        "--input-json", input_json_path,
        "--voice-sample", str(ref_audio),
    ]
    if use_fp16:
        cmd.append("--use-fp16")

    logger.info("IndexTTS-2 启动（%d 段，fp16=%s）…", len(tasks), use_fp16)

    # 从 IndexTTS repo 根目录运行，使 infer_v2.py 的 ./checkpoints/hf_cache 路径正确。
    # 默认随 studio-kit 安装在 model/index-tts，可用环境变量 INDEXTTS_REPO 覆盖。
    _INDEXTTS_REPO = Path(
        os.environ.get("INDEXTTS_REPO", r"D:\code\weelume-base\studio-kit\model\index-tts")
    )
    if not _INDEXTTS_REPO.exists():
        raise RuntimeError(
            f"IndexTTS-2 repo 目录不存在：{_INDEXTTS_REPO}\n"
            "请确认已安装 IndexTTS-2（model/index-tts），或用环境变量 INDEXTTS_REPO 指定。"
        )
    env = os.environ.copy()
    # worker 用同一个 repo 路径
    env["INDEXTTS_REPO"] = str(_INDEXTTS_REPO)
    # 覆盖系统级 HF_ENDPOINT（hf-mirror.com 在国内也不稳定），改用代理访问真实 HF
    env["HF_ENDPOINT"] = "https://huggingface.co"
    env["HTTPS_PROXY"] = "http://192.168.32.1:7078"
    env["HTTP_PROXY"] = "http://192.168.32.1:7078"

    # stderr → terminal（实时日志），stdout → 捕获（解析 RESULT_JSON）
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=None,
        text=True,
        cwd=str(_INDEXTTS_REPO),
        env=env,
    )
    stdout, _ = proc.communicate()
    Path(input_json_path).unlink(missing_ok=True)

    if proc.returncode != 0:
        raise RuntimeError(
            f"IndexTTS-2 合成失败（exit={proc.returncode}）\n"
            "请检查上方终端输出获取详细错误。"
        )

    # 解析最后一行 RESULT_JSON
    result_line = ""
    for line in stdout.splitlines():
        # worker 的 [worker] 日志前缀打到 stdout，过滤掉
        print(line)  # 实时显示 worker 日志
        if line.startswith("RESULT_JSON:"):
            result_line = line[len("RESULT_JSON:"):]

    if not result_line:
        raise RuntimeError(
            "IndexTTS-2 worker 未输出 RESULT_JSON，合成可能失败。\n"
            "请检查以上日志。"
        )

    raw = json.loads(result_line)
    duration_map = {item["index"]: item["duration_s"] for item in raw}
    return [duration_map[t["index"]] for t in tasks]


# 公开接口（供 pipeline.py 调用）
run_batch = _run_batch


def synthesize(text: str, output_wav: Path, voice_sample: Path | None = None) -> float:
    """单段合成（包装 batch）。仅用于 CLI `tts` 命令单步测试。"""
    results = _run_batch(
        [{"index": 0, "text": text, "output": str(output_wav)}],
        voice_sample,
    )
    return results[0]
