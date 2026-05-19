"""CLI 命令冒烟测试。用 Typer 自带的 CliRunner。"""

from __future__ import annotations

from typer.testing import CliRunner

from research_kit.cli import app
from research_kit.core.registry import default_registry

runner = CliRunner()


def setup_function() -> None:
    default_registry().reset()
    # 复位模块级单例，让 _get_runtime 重新装载
    import research_kit.cli as cli_module

    cli_module._loaded_registry = None
    cli_module._loaded_settings = None


def test_version() -> None:
    result = runner.invoke(app, ["--version"])
    assert result.exit_code == 0
    assert "research-kit" in result.stdout


def test_plugins_list_shows_three_kinds() -> None:
    result = runner.invoke(app, ["plugins", "list"])
    assert result.exit_code == 0
    assert "douyin-browser" in result.stdout
    assert "douyin-blogger" in result.stdout
    assert "html-multi" in result.stdout


def test_plugins_inspect_known() -> None:
    result = runner.invoke(app, ["plugins", "inspect", "douyin-browser"])
    assert result.exit_code == 0
    assert "douyin-browser" in result.stdout


def test_plugins_inspect_unknown() -> None:
    result = runner.invoke(app, ["plugins", "inspect", "no-such-plugin"])
    assert result.exit_code == 1


def test_skill_list_shows_placeholder() -> None:
    result = runner.invoke(app, ["skill", "list"])
    assert result.exit_code == 0
    assert "douyin-blogger-report-v2" in result.stdout


def test_skill_validate_ok() -> None:
    result = runner.invoke(app, ["skill", "validate", "douyin-blogger-report-v2"])
    assert result.exit_code == 0
    assert "OK" in result.stdout


def test_skill_validate_missing() -> None:
    result = runner.invoke(app, ["skill", "validate", "no-such-skill"])
    assert result.exit_code == 1
