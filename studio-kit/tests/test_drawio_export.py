# tests/test_drawio_export.py
import os
from pathlib import Path
import pytest
from studio_kit.render.drawio_export import build_export_cmd, resolve_drawio_exe


def test_build_export_cmd():
    cmd = build_export_cmd(Path("X:/drawio.exe"), Path("a.drawio"), Path("a.png"), 2)
    assert cmd[0] == "X:/drawio.exe" or cmd[0] == str(Path("X:/drawio.exe"))
    assert "--export" in cmd
    assert "--no-sandbox" in cmd
    assert "png" in cmd
    assert "2" in cmd  # scale
    # 输入输出都在
    assert any("a.drawio" in c for c in cmd)
    assert any("a.png" in c for c in cmd)


def test_resolve_exe_missing_raises(monkeypatch):
    monkeypatch.setenv("DRAWIO_EXE", "Z:/nonexistent/drawio.exe")
    with pytest.raises(FileNotFoundError):
        resolve_drawio_exe()
