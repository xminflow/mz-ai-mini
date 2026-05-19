"""CollectorOptions.from_dict 解析。"""

from __future__ import annotations

from pathlib import Path

from research_kit.collectors.douyin_browser.runner import CollectorOptions


def test_defaults_when_dict_empty() -> None:
    opts = CollectorOptions.from_dict({})
    assert opts.headless is False
    assert opts.proxy is None
    assert opts.skip_transcribe is False
    assert opts.skip_frames is False
    # whisper_model 现在是兼容性占位（ua-agent funasr 自带模型，不依赖此值）
    assert opts.whisper_model == ""
    assert opts.frame_count == 4
    assert opts.sample_seed is None
    assert opts.keep_video is False


def test_bool_parsing() -> None:
    for true_val in ("1", "true", "True", "TRUE", "yes", "ON"):
        assert CollectorOptions.from_dict({"headless": true_val}).headless is True
    for false_val in ("0", "false", "no", "off", "random"):
        assert CollectorOptions.from_dict({"headless": false_val}).headless is False


def test_path_parsing(tmp_path: Path) -> None:
    sub = tmp_path / "sub"
    opts = CollectorOptions.from_dict({"storage_state": str(sub)})
    assert opts.storage_state == sub.resolve()


def test_int_parsing() -> None:
    opts = CollectorOptions.from_dict({"frame_count": "8", "sample_seed": "42"})
    assert opts.frame_count == 8
    assert opts.sample_seed == 42
