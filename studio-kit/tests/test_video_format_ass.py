from pathlib import Path
from studio_kit.render.video_format import VERTICAL, HORIZONTAL
from studio_kit.render.ffmpeg_compose import _generate_ass


def test_horizontal_ass_header(tmp_path: Path):
    out = tmp_path / "h.ass"
    _generate_ass([(0, "你好。世界。")], tmp_path, out, HORIZONTAL)
    txt = out.read_text(encoding="utf-8")
    assert "PlayResX: 1920" in txt
    assert "PlayResY: 1080" in txt
    assert ",52," in txt           # 字号 52
    assert "Dialogue:" in txt


def test_vertical_ass_unchanged(tmp_path: Path):
    out = tmp_path / "v.ass"
    _generate_ass([(0, "你好。世界。")], tmp_path, out, VERTICAL)
    txt = out.read_text(encoding="utf-8")
    assert "PlayResX: 1080" in txt
    assert "PlayResY: 1920" in txt
    assert ",80," in txt           # 竖屏字号仍 80（回归）
    assert ",480," in txt          # 竖屏 MarginV 仍 480（回归）
