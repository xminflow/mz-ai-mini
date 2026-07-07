"""CosyVoice（DashScope 百炼）TTS 后端：云端语音合成 + 零样本音色克隆。

通过官方 dashscope SDK 调用阿里云百炼的 CosyVoice 模型：
  - 预置音色：直接指定内置发音人 voice 合成。
  - 零样本音色克隆：用公网参考音频 URL 建一个自定义音色，再用其 voice_id 合成。

API Key 从环境变量 DASHSCOPE_API_KEY 读取，不硬编码。
dashscope 为延迟导入，仅在真正调用云服务时加载，便于无依赖环境下被 mock 测试。
"""
from __future__ import annotations

import os
import struct
from pathlib import Path
from typing import Any

from studio_kit.core.logging import get_logger

logger = get_logger(__name__)

# 默认走北京区稳定的 cosyvoice-v2 与其预置音色。
DEFAULT_MODEL = "cosyvoice-v2"
DEFAULT_VOICE = "longxiaochun_v2"

_API_KEY_ENV = "DASHSCOPE_API_KEY"


def _require_api_key() -> str:
    """读取 DASHSCOPE_API_KEY，缺失即显式报错（不静默兜底）。"""
    key = os.environ.get(_API_KEY_ENV)
    if not key:
        raise RuntimeError(
            f"未设置 {_API_KEY_ENV} 环境变量，无法调用 DashScope CosyVoice。\n"
            "请先 export DASHSCOPE_API_KEY=<你的百炼 API Key>。"
        )
    return key


def _make_synthesizer(model: str, voice: str, instruction: str | None = None) -> Any:
    """构造 DashScope SpeechSynthesizer（固定 WAV 22050Hz 单声道 16bit 输出）。

    instruction 为 Instruct 情感/风格指令（如"温暖深情、富有磁性，语速放慢"），
    仅部分 v3/v3.5 音色支持；为 None 时不传该参数，保持与不支持音色的兼容。
    """
    import dashscope
    from dashscope.audio.tts_v2 import AudioFormat, SpeechSynthesizer

    dashscope.api_key = _require_api_key()
    kwargs: dict[str, Any] = {
        "model": model,
        "voice": voice,
        "format": AudioFormat.WAV_22050HZ_MONO_16BIT,
    }
    if instruction:
        kwargs["instruction"] = instruction
    return SpeechSynthesizer(**kwargs)


def _make_enrollment_service() -> Any:
    """构造 DashScope 音色复刻服务客户端。"""
    import dashscope
    from dashscope.audio.tts_v2 import VoiceEnrollmentService

    dashscope.api_key = _require_api_key()
    return VoiceEnrollmentService()


def synthesize(
    text: str,
    output_wav: Path,
    *,
    model: str = DEFAULT_MODEL,
    voice: str = DEFAULT_VOICE,
    instruction: str | None = None,
) -> float:
    """合成单段语音写入 output_wav，返回真实时长（秒）。

    voice 既可为预置音色名（如 longxiaochun_v2），也可为克隆得到的 voice_id。
    instruction 为 Instruct 情感/风格指令，仅部分 v3/v3.5 音色支持（如 longanyang）。
    """
    if not text.strip():
        raise ValueError("待合成文本为空。")

    synthesizer = _make_synthesizer(model, voice, instruction)
    audio = synthesizer.call(text)
    if not audio:
        raise RuntimeError(
            "DashScope 返回空音频，合成失败。请检查 API Key、model/voice 是否有效。"
        )

    output_wav.parent.mkdir(parents=True, exist_ok=True)
    output_wav.write_bytes(audio)
    duration = _wav_duration_s(output_wav)
    logger.info("CosyVoice 合成完成：%.2fs → %s", duration, output_wav)
    return duration


_CUSTOMIZATION_URL = "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization"


def _post_customization(payload: dict[str, Any]) -> dict[str, Any]:
    """调用 DashScope 音色定制 RESTful 接口（音色设计走 REST，Python SDK 不支持）。"""
    import httpx

    key = _require_api_key()
    resp = httpx.post(
        _CUSTOMIZATION_URL,
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json=payload,
        timeout=60.0,
    )
    # 显式带出服务端响应体，避免 raise_for_status 吞掉真正的错误原因。
    if resp.status_code // 100 != 2:
        raise RuntimeError(f"音色定制接口返回 {resp.status_code}：{resp.text}")
    return resp.json()


def design_voice(
    voice_prompt: str,
    prefix: str,
    *,
    model: str = "cosyvoice-v3.5-plus",
    preview_text: str = "大家好，欢迎收听今天为你准备的精彩内容。",
) -> str:
    """用文字描述设计音色（Voice Design），返回 voice_id。

    voice_prompt 描述音色特征（性别/年龄/音质/语速/用途，≤500 字），例如
    "沉稳的中年男性，音色低沉浑厚、富有磁性，语速平稳"。
    仅 v3/v3.5 模型支持；target_model 必须与后续合成 model 一致。
    """
    if not voice_prompt.strip():
        raise ValueError("音色描述 voice_prompt 为空。")

    payload: dict[str, Any] = {
        "model": "voice-enrollment",
        "input": {
            "action": "create_voice",
            "target_model": model,
            "voice_prompt": voice_prompt,
            "preview_text": preview_text,
            "prefix": prefix,
        },
        "parameters": {"sample_rate": 24000, "response_format": "wav"},
    }
    data = _post_customization(payload)
    output = data.get("output") or {}
    voice_id = output.get("voice_id")
    if not voice_id:
        raise RuntimeError(f"音色设计失败，响应无 voice_id：{data}")
    logger.info("CosyVoice 音色设计成功：voice_id=%s（model=%s）", voice_id, model)
    return str(voice_id)


def create_clone_voice(ref_url: str, prefix: str, *, model: str = DEFAULT_MODEL) -> str:
    """用公网参考音频 URL 创建克隆音色，返回 voice_id。

    参考音频要求（DashScope 约束）：公网可访问 URL、10-20s、≥16kHz、单声道、
    优先 WAV、无噪声/回声、有效语音占比 >60%。
    target_model 必须与后续合成使用的 model 一致。
    """
    service = _make_enrollment_service()
    voice_id = service.create_voice(target_model=model, prefix=prefix, url=ref_url)
    logger.info("CosyVoice 克隆音色创建成功：voice_id=%s（model=%s）", voice_id, model)
    return voice_id


def _wav_duration_s(path: Path) -> float:
    """计算 WAV 时长（秒）。

    不能用 wave.getnframes()：DashScope 流式合成返回的 WAV 头里 data chunk 长度是
    占位最大值（流式开始时长度未知、事后不回填），会算出天文数字。fmt 头里的采样
    参数可靠，故按 fmt 参数 + data chunk 的实际字节数计算。
    """
    raw = path.read_bytes()
    if raw[:4] != b"RIFF" or raw[8:12] != b"WAVE":
        raise RuntimeError(f"非法 WAV 文件：{path}")

    total = len(raw)
    pos = 12  # 跳过 'RIFF' size 'WAVE'
    framerate = channels = sampwidth = 0
    data_bytes = 0
    while pos + 8 <= total:
        chunk_id = raw[pos : pos + 4]
        chunk_size = struct.unpack("<I", raw[pos + 4 : pos + 8])[0]
        body = pos + 8
        if chunk_id == b"fmt ":
            channels = struct.unpack("<H", raw[body + 2 : body + 4])[0]
            framerate = struct.unpack("<I", raw[body + 4 : body + 8])[0]
            bits = struct.unpack("<H", raw[body + 14 : body + 16])[0]
            sampwidth = bits // 8
        elif chunk_id == b"data":
            # 流式占位 size 不可信，取声明值与实际剩余字节的较小者。
            data_bytes = min(chunk_size, total - body)
            break
        # chunk 体按偶数字节对齐。
        pos = body + chunk_size + (chunk_size & 1)

    if framerate == 0 or channels == 0 or sampwidth == 0:
        raise RuntimeError(f"WAV 头缺少有效 fmt 信息：{path}")
    if data_bytes == 0:
        raise RuntimeError(f"WAV 无音频数据：{path}")
    return data_bytes / float(framerate * channels * sampwidth)
