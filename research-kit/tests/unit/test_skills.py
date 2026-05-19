"""skill 加载与列表。"""

from __future__ import annotations

from pathlib import Path

import pytest

from research_kit.core.settings import Settings
from research_kit.core.skills import list_skills, load_skill


def _make_settings(skill_root: Path) -> Settings:
    return Settings.load(
        skill_search_paths=[skill_root],
        anthropic_api_key="test",
    )


def test_load_existing_skill_in_repo(isolated_settings: Settings) -> None:
    skill = load_skill("douyin-blogger-report-v2", isolated_settings)
    assert skill.name == "douyin-blogger-report-v2"
    # v2 skill 必须包含核心方法论框架名（用作 LLM 的判别锚点）
    body = skill.body
    assert "起承转合" in body
    assert "八大爆款元素" in body
    assert "四型脚本" in body
    assert "变现四原则" in body
    assert skill.version is not None
    assert skill.description  # description 不应为空


def test_list_skills_contains_repo_placeholder(isolated_settings: Settings) -> None:
    skills = list_skills(isolated_settings)
    names = {s.name for s in skills}
    assert "douyin-blogger-report-v2" in names


def test_load_missing_skill_raises(isolated_settings: Settings) -> None:
    with pytest.raises(FileNotFoundError):
        load_skill("nonexistent-skill", isolated_settings)


def test_skill_without_frontmatter_raises(tmp_path: Path) -> None:
    skill_dir = tmp_path / "no-front"
    skill_dir.mkdir()
    (skill_dir / "SKILL.md").write_text("just markdown\n", encoding="utf-8")
    settings = _make_settings(tmp_path)
    with pytest.raises(ValueError):
        load_skill("no-front", settings)


def test_render_prompt_contains_payload(isolated_settings: Settings) -> None:
    skill = load_skill("douyin-blogger-report-v2", isolated_settings)
    prompt = skill.render_prompt({"data_root": "/x", "focus_count": 5})
    assert "data_root" in prompt
    assert "/x" in prompt
    assert "douyin-blogger-report-v2" in prompt


def test_search_paths_priority(tmp_path: Path, isolated_settings: Settings) -> None:
    """前置 search_path 应该覆盖后置 search_path 的同名 skill。"""
    override_root = tmp_path / "override"
    override_dir = override_root / "douyin-blogger-report-v2"
    override_dir.mkdir(parents=True)
    (override_dir / "SKILL.md").write_text(
        "---\nname: douyin-blogger-report-v2\ndescription: overridden\n---\n\n# override body\n",
        encoding="utf-8",
    )
    settings = Settings.load(
        skill_search_paths=[override_root, *isolated_settings.skill_search_paths],
        anthropic_api_key="x",
    )
    skill = load_skill("douyin-blogger-report-v2", settings)
    assert skill.description == "overridden"
