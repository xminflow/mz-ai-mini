"""workspace 读写。"""

from __future__ import annotations

from pathlib import Path

from research_kit.core.contracts import BloggerProfile, VideoSample
from research_kit.core.workspace import Workspace


def _profile() -> BloggerProfile:
    return BloggerProfile(
        blogger_id="b1",
        display_name="测试博主",
        home_url="https://www.douyin.com/user/abc",
        captured_at="2026-05-19T10:00:00+00:00",
        follower_count=100000,
    )


def _sample(aweme_id: str, position: int) -> VideoSample:
    return VideoSample(
        aweme_id=aweme_id,
        title=f"作品 {aweme_id}",
        url=f"https://www.douyin.com/video/{aweme_id}",
        position=position,
        captured_at="2026-05-19T10:00:00+00:00",
    )


def test_write_and_read_profile_roundtrip(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    ws.write_profile(_profile())
    loaded = ws.read_profile()
    assert loaded.display_name == "测试博主"
    assert loaded.follower_count == 100000


def test_iter_samples_sorted_by_position(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_sample("a", position=2))
    ws.write_sample_meta(_sample("b", position=0))
    ws.write_sample_meta(_sample("c", position=1))
    samples = ws.iter_samples()
    assert [s.aweme_id for s in samples] == ["b", "c", "a"]


def test_iter_samples_skips_runs_and_reports_dirs(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    ws.write_sample_meta(_sample("a", position=0))
    (tmp_path / "runs" / "r1").mkdir(parents=True)
    (tmp_path / "reports" / "r1").mkdir(parents=True)
    samples = ws.iter_samples()
    assert [s.aweme_id for s in samples] == ["a"]


def test_write_transcript_creates_dir(tmp_path: Path) -> None:
    ws = Workspace(tmp_path)
    path = ws.write_sample_transcript("aw1", "你好世界")
    assert path.exists()
    assert path.read_text(encoding="utf-8") == "你好世界"
