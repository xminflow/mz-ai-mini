# tests/test_html_render.py
"""html_render 单元测试：用 monkeypatch 替换 subprocess.run，
不真正起 Chrome（CI 无 Chrome），仅校验命令组装与产物校验逻辑。"""
from pathlib import Path

import pytest

from studio_kit.render import html_render


def _fake_run_factory(captured_cmds: list[list[str]], *, create_output: bool):
    """构造假的 subprocess.run：记录命令；create_output=True 时按 --screenshot 路径建假 PNG。"""

    class _Result:
        returncode = 0
        stderr = "fake chrome stderr"

    def _fake_run(cmd, *args, **kwargs):
        captured_cmds.append(cmd)
        if create_output:
            for token in cmd:
                if token.startswith("--screenshot="):
                    out = Path(token[len("--screenshot="):])
                    out.parent.mkdir(parents=True, exist_ok=True)
                    out.write_bytes(b"\x89PNG\r\n")  # 假 PNG 字节
        return _Result()

    return _fake_run


def test_render_html_builds_cmd_and_returns_path(tmp_path, monkeypatch):
    html = tmp_path / "cover.html"
    html.write_text("<html><body>hi</body></html>", encoding="utf-8")
    out = tmp_path / "out" / "cover.png"

    captured: list[list[str]] = []
    monkeypatch.setattr(
        html_render.subprocess, "run", _fake_run_factory(captured, create_output=True)
    )

    result = html_render.render_html(html, out, chrome_path="C:/fake/chrome.exe")

    assert result == out.resolve()
    assert result.exists()

    cmd = captured[0]
    assert cmd[0] == "C:/fake/chrome.exe"
    assert "--headless=new" in cmd
    assert "--window-size=1920,1080" in cmd
    # screenshot 路径必须为绝对路径
    shot = next(c for c in cmd if c.startswith("--screenshot="))
    shot_path = Path(shot[len("--screenshot="):])
    assert shot_path.is_absolute()
    assert shot_path == out.resolve()


def test_render_html_raises_when_no_output(tmp_path, monkeypatch):
    html = tmp_path / "page.html"
    html.write_text("<html></html>", encoding="utf-8")
    out = tmp_path / "page.png"

    captured: list[list[str]] = []
    monkeypatch.setattr(
        html_render.subprocess, "run", _fake_run_factory(captured, create_output=False)
    )

    with pytest.raises(RuntimeError) as exc:
        html_render.render_html(html, out, chrome_path="C:/fake/chrome.exe")
    # 错误信息应含 chrome stderr
    assert "fake chrome stderr" in str(exc.value)


def test_render_dir_skips_underscore_files(tmp_path, monkeypatch):
    html_dir = tmp_path / "html"
    html_dir.mkdir()
    (html_dir / "cover.html").write_text("<html></html>", encoding="utf-8")
    (html_dir / "map.html").write_text("<html></html>", encoding="utf-8")
    (html_dir / "_helper.html").write_text("<html></html>", encoding="utf-8")  # 应跳过
    out_dir = tmp_path / "images"

    captured: list[list[str]] = []
    monkeypatch.setattr(
        html_render.subprocess, "run", _fake_run_factory(captured, create_output=True)
    )

    results = html_render.render_dir(
        html_dir, out_dir, chrome_path="C:/fake/chrome.exe"
    )

    assert len(results) == 2
    stems = {p.stem for p in results}
    assert stems == {"cover", "map"}
    assert not (out_dir / "_helper.png").exists()


def test_render_dir_only_filter(tmp_path, monkeypatch):
    html_dir = tmp_path / "html"
    html_dir.mkdir()
    (html_dir / "cover.html").write_text("<html></html>", encoding="utf-8")
    (html_dir / "map.html").write_text("<html></html>", encoding="utf-8")
    out_dir = tmp_path / "images"

    captured: list[list[str]] = []
    monkeypatch.setattr(
        html_render.subprocess, "run", _fake_run_factory(captured, create_output=True)
    )

    results = html_render.render_dir(
        html_dir, out_dir, chrome_path="C:/fake/chrome.exe", only=["cover"]
    )

    assert len(results) == 1
    assert results[0].stem == "cover"


def test_resolve_chrome_path_env_override(monkeypatch):
    monkeypatch.setenv("CHROME_PATH", "Z:/custom/chrome.exe")
    assert html_render.resolve_chrome_path() == "Z:/custom/chrome.exe"
