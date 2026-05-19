"""共享 pytest fixtures。"""

from __future__ import annotations

from pathlib import Path

import pytest

from research_kit.core.settings import Settings


@pytest.fixture()
def repo_root() -> Path:
    """research-kit 仓库根目录。"""
    return Path(__file__).resolve().parents[1]


@pytest.fixture()
def isolated_settings(tmp_path: Path, repo_root: Path) -> Settings:
    """构造一个使用 tmp_path 作为 workspace 的 Settings，skill 仍走仓库内置目录。"""
    return Settings.load(
        workspace_root=tmp_path,
        skill_search_paths=[repo_root / ".claude" / "skills"],
        anthropic_api_key="test-key-not-used",
        anthropic_model="claude-opus-4-7",
        log_level="DEBUG",
    )
