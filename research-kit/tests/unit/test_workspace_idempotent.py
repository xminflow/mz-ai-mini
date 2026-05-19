"""Workspace.is_sample_complete 幂等判定。"""

from __future__ import annotations

from pathlib import Path

from research_kit.core.contracts import VideoSample
from research_kit.core.workspace import Workspace


def _make_sample(aweme_id: str) -> VideoSample:
    return VideoSample(
        aweme_id=aweme_id,
        title="测试作品",
        url=f"https://www.douyin.com/video/{aweme_id}",
        position=0,
        captured_at="2026-05-19T10:00:00+00:00",
    )


def _fake_sample_complete(tmp_path: Path, aweme_id: str) -> Workspace:
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_make_sample(aweme_id))
    sd = ws.sample_dir(aweme_id)
    (sd / "transcript.txt").write_text("hello world transcript", encoding="utf-8")
    for i in range(1, 5):
        (sd / f"{i}.jpg").write_bytes(b"\xff\xd8\xff\xe0fake jpeg head")
    return ws


def test_complete_sample_detected(tmp_path: Path) -> None:
    ws = _fake_sample_complete(tmp_path, "aw1")
    assert ws.is_sample_complete("aw1") is True


def test_missing_meta_returns_false(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    sd = ws.sample_dir("aw2")
    sd.mkdir(parents=True)
    (sd / "transcript.txt").write_text("x", encoding="utf-8")
    assert ws.is_sample_complete("aw2") is False


def test_missing_transcript_returns_false_by_default(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_make_sample("aw3"))
    for i in range(1, 5):
        (ws.sample_dir("aw3") / f"{i}.jpg").write_bytes(b"x")
    assert ws.is_sample_complete("aw3") is False


def test_missing_transcript_ok_when_not_required(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_make_sample("aw4"))
    for i in range(1, 5):
        (ws.sample_dir("aw4") / f"{i}.jpg").write_bytes(b"x")
    assert ws.is_sample_complete("aw4", require_transcript=False) is True


def test_missing_frames_returns_false_by_default(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_make_sample("aw5"))
    (ws.sample_dir("aw5") / "transcript.txt").write_text("x", encoding="utf-8")
    assert ws.is_sample_complete("aw5") is False


def test_partial_frames_returns_false(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_make_sample("aw6"))
    (ws.sample_dir("aw6") / "transcript.txt").write_text("x", encoding="utf-8")
    for i in range(1, 3):  # 仅 2 张
        (ws.sample_dir("aw6") / f"{i}.jpg").write_bytes(b"x")
    assert ws.is_sample_complete("aw6") is False


def test_empty_files_returns_false(tmp_path: Path) -> None:
    ws = _fake_sample_complete(tmp_path, "aw7")
    # 把 transcript 清空
    (ws.sample_dir("aw7") / "transcript.txt").write_text("", encoding="utf-8")
    assert ws.is_sample_complete("aw7") is False


def test_corrupt_meta_returns_false(tmp_path: Path) -> None:
    ws = _fake_sample_complete(tmp_path, "aw8")
    (ws.sample_dir("aw8") / "meta.json").write_text("not json {", encoding="utf-8")
    assert ws.is_sample_complete("aw8") is False


def test_frame_count_zero_disables_frame_check(tmp_path: Path) -> None:
    """frame_count=0 时不检查帧（用户跑了 --skip-frames 的场景）。"""
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_make_sample("aw9"))
    (ws.sample_dir("aw9") / "transcript.txt").write_text("x", encoding="utf-8")
    assert ws.is_sample_complete("aw9", frame_count=0) is True
