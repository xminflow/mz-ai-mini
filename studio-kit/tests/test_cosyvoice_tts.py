"""CosyVoice（DashScope）TTS 后端单元测试。

只 mock DashScope 网络边界（付费云调用，CI 不可实跑），其余走真实代码：
真实 WAV 文件写入、标准库 wave 时长读取、参数编排与报错分支。
"""
from __future__ import annotations

import io
import wave
from pathlib import Path

import pytest

from studio_kit.tts import cosyvoice


def _make_wav_bytes(duration_s: float, sample_rate: int = 22050) -> bytes:
    """构造一段指定时长的静音 WAV 二进制，供 fake SDK 返回。"""
    buf = io.BytesIO()
    with wave.open(buf, "w") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * int(sample_rate * duration_s))
    return buf.getvalue()


def _with_streaming_placeholder_header(wav: bytes) -> bytes:
    """模拟 DashScope 流式 WAV：把 RIFF/data 长度字段改成占位最大值。

    标准 PCM 头：RIFF size 在偏移 4-8，data size 在偏移 40-44。
    DashScope 流式合成开始时长度未知，写入占位最大值且事后不回填。
    """
    import struct

    b = bytearray(wav)
    struct.pack_into("<I", b, 4, 0x7FFFFFBF)
    struct.pack_into("<I", b, 40, 0x7FFFFF9B)
    return bytes(b)


class _FakeSynthesizer:
    """伪 SpeechSynthesizer：记录构造参数，call() 返回预置音频。"""

    def __init__(self, audio: bytes) -> None:
        self._audio = audio
        self.called_text: str | None = None

    def call(self, text: str) -> bytes:
        self.called_text = text
        return self._audio


def test_synthesize_writes_wav_and_returns_duration(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    audio = _make_wav_bytes(2.0)
    fake = _FakeSynthesizer(audio)
    monkeypatch.setattr(
        cosyvoice, "_make_synthesizer", lambda model, voice, instruction=None: fake
    )

    out = tmp_path / "out.wav"
    duration = cosyvoice.synthesize("你好世界", out, model="cosyvoice-v2", voice="longxiaochun_v2")

    assert out.exists()
    assert out.read_bytes() == audio
    assert fake.called_text == "你好世界"
    assert duration == pytest.approx(2.0, abs=0.05)


def test_synthesize_forwards_instruction(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # instruction（Instruct 情感/风格指令）须透传给 SpeechSynthesizer 工厂。
    captured: dict[str, object] = {}

    def fake_factory(model: str, voice: str, instruction: str | None = None) -> _FakeSynthesizer:
        captured["model"] = model
        captured["voice"] = voice
        captured["instruction"] = instruction
        return _FakeSynthesizer(_make_wav_bytes(1.0))

    monkeypatch.setattr(cosyvoice, "_make_synthesizer", fake_factory)

    cosyvoice.synthesize(
        "晚安",
        tmp_path / "out.wav",
        model="cosyvoice-v3-plus",
        voice="longanyang",
        instruction="温暖深情、富有磁性，语速放慢",
    )

    assert captured == {
        "model": "cosyvoice-v3-plus",
        "voice": "longanyang",
        "instruction": "温暖深情、富有磁性，语速放慢",
    }


def test_synthesize_duration_ignores_streaming_placeholder_header(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    # DashScope 流式 WAV 头的 data 长度是占位最大值，时长须按实际字节算，而非 header 声明帧数。
    audio = _with_streaming_placeholder_header(_make_wav_bytes(2.0))
    fake = _FakeSynthesizer(audio)
    monkeypatch.setattr(cosyvoice, "_make_synthesizer", lambda model, voice, instruction=None: fake)

    out = tmp_path / "out.wav"
    duration = cosyvoice.synthesize("文本", out)

    assert duration == pytest.approx(2.0, abs=0.05)


def test_synthesize_empty_text_raises(tmp_path: Path) -> None:
    with pytest.raises(ValueError):
        cosyvoice.synthesize("   ", tmp_path / "out.wav")


def test_synthesize_empty_audio_raises(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake = _FakeSynthesizer(b"")
    monkeypatch.setattr(cosyvoice, "_make_synthesizer", lambda model, voice, instruction=None: fake)

    with pytest.raises(RuntimeError):
        cosyvoice.synthesize("文本", tmp_path / "out.wav")


def test_require_api_key_missing_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("DASHSCOPE_API_KEY", raising=False)
    with pytest.raises(RuntimeError):
        cosyvoice._require_api_key()


def test_require_api_key_present_returns(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    assert cosyvoice._require_api_key() == "sk-test"


class _FakeEnrollment:
    """伪 VoiceEnrollmentService：记录调用参数，返回固定 voice_id。"""

    def __init__(self) -> None:
        self.kwargs: dict[str, object] = {}

    def create_voice(self, *, target_model: str, prefix: str, url: str) -> str:
        self.kwargs = {"target_model": target_model, "prefix": prefix, "url": url}
        return "cosyvoice-clone-abc123"


def test_create_clone_voice_passes_params_and_returns_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    fake = _FakeEnrollment()
    monkeypatch.setattr(cosyvoice, "_make_enrollment_service", lambda: fake)

    voice_id = cosyvoice.create_clone_voice(
        "https://oss.example.com/ref.wav", "myv", model="cosyvoice-v2"
    )

    assert voice_id == "cosyvoice-clone-abc123"
    assert fake.kwargs == {
        "target_model": "cosyvoice-v2",
        "prefix": "myv",
        "url": "https://oss.example.com/ref.wav",
    }


def test_design_voice_builds_request_and_returns_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    # 音色设计走 RESTful customization 接口；校验 payload 结构与 voice_id 提取。
    captured: dict[str, object] = {}

    def fake_post(payload: dict[str, object]) -> dict[str, object]:
        captured["payload"] = payload
        return {"output": {"voice_id": "cosyvoice-v3.5-plus-vd-magnetic-xyz"}}

    monkeypatch.setattr(cosyvoice, "_post_customization", fake_post)

    voice_id = cosyvoice.design_voice(
        "沉稳磁性深情的男声", "magnetic", model="cosyvoice-v3.5-plus"
    )

    assert voice_id == "cosyvoice-v3.5-plus-vd-magnetic-xyz"
    payload = captured["payload"]
    assert isinstance(payload, dict)
    assert payload["model"] == "voice-enrollment"
    body = payload["input"]
    assert isinstance(body, dict)
    assert body["action"] == "create_voice"
    assert body["target_model"] == "cosyvoice-v3.5-plus"
    assert body["voice_prompt"] == "沉稳磁性深情的男声"
    assert body["prefix"] == "magnetic"


def test_design_voice_missing_id_raises(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(cosyvoice, "_post_customization", lambda payload: {"output": {}})
    with pytest.raises(RuntimeError):
        cosyvoice.design_voice("描述", "p", model="cosyvoice-v3.5-plus")


def test_design_voice_empty_prompt_raises() -> None:
    with pytest.raises(ValueError):
        cosyvoice.design_voice("   ", "p", model="cosyvoice-v3.5-plus")


def test_post_customization_surfaces_error_body(monkeypatch: pytest.MonkeyPatch) -> None:
    # 非 2xx 必须把服务端响应体带进异常，不能吞掉（便于定位如 preview_text 太短）。
    import httpx

    class _FakeResp:
        status_code = 400
        text = '{"code":"InvalidParameter","message":"preview_text should not be shorter than 15 characters"}'

        def json(self) -> dict[str, object]:
            return {}

    monkeypatch.setenv("DASHSCOPE_API_KEY", "sk-test")
    monkeypatch.setattr(httpx, "post", lambda *a, **k: _FakeResp())

    with pytest.raises(RuntimeError) as exc:
        cosyvoice._post_customization({"x": 1})

    assert "preview_text" in str(exc.value)
