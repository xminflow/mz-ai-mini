from pathlib import Path
from studio_kit.render.image_clip import build_ffmpeg_clip_cmd

def test_clip_cmd_has_loop_scale_pad_and_codec():
    cmd = build_ffmpeg_clip_cmd(Path("a.png"), Path("00.mp4"), 3.5)
    s = " ".join(cmd)
    assert "-loop" in cmd and "1" in cmd
    assert "-t" in cmd and "3.5" in cmd
    assert "libx264" in s and "yuv420p" in s
    assert "1920" in s and "1080" in s          # 目标分辨率
    assert "force_original_aspect_ratio=decrease" in s  # 按比例缩放
    assert "pad=" in s and "12141C" in s.replace("#", "")  # 补边色
    assert cmd[0] == "ffmpeg"
