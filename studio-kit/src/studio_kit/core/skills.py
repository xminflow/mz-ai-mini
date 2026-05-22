"""Skill 加载与校验（复用 research-kit 相同范式）。"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from studio_kit.core.logging import get_logger
from studio_kit.core.settings import Settings

_log = get_logger(__name__)
_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)


@dataclass(frozen=True, slots=True)
class SkillManifest:
    name: str
    description: str
    path: Path
    body: str
    version: str | None = None


def load_skill(name: str, settings: Settings) -> SkillManifest:
    for base in settings.skill_search_paths:
        candidate = base / name / "SKILL.md"
        if candidate.exists():
            return _parse_skill(name, candidate)
    raise FileNotFoundError(f"未找到 skill `{name}`")


def list_skills(settings: Settings) -> list[SkillManifest]:
    seen: dict[str, SkillManifest] = {}
    for base in settings.skill_search_paths:
        if not base.exists():
            continue
        for skill_dir in sorted(base.iterdir()):
            if not skill_dir.is_dir():
                continue
            skill_md = skill_dir / "SKILL.md"
            if not skill_md.exists() or skill_dir.name in seen:
                continue
            try:
                seen[skill_dir.name] = _parse_skill(skill_dir.name, skill_md)
            except Exception as exc:
                _log.warning("解析 skill 失败 %s: %s", skill_md, exc)
    return list(seen.values())


def _parse_skill(name: str, path: Path) -> SkillManifest:
    text = path.read_text(encoding="utf-8")
    match = _FRONTMATTER_RE.match(text)
    if match is None:
        raise ValueError(f"SKILL.md 缺少 YAML frontmatter：{path}")
    front_raw, body = match.group(1), match.group(2)
    front = _parse_minimal_yaml(front_raw)
    description = str(front.get("description", "")).strip()
    version_path = path.parent / "version.txt"
    version = version_path.read_text(encoding="utf-8").strip() if version_path.exists() else None
    return SkillManifest(name=name, description=description, path=path, body=body, version=version)


def _parse_minimal_yaml(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    current_key: str | None = None
    buffer: list[str] = []
    for raw_line in text.splitlines():
        line = raw_line.rstrip()
        if not line:
            continue
        if line.startswith(" ") and current_key is not None:
            buffer.append(line.strip())
            continue
        if current_key is not None and buffer:
            result[current_key] = " ".join([result.get(current_key, "").strip(), *buffer]).strip()
            buffer = []
        if ":" in line:
            key, _, value = line.partition(":")
            current_key = key.strip()
            stripped = value.strip().strip('"')
            result[current_key] = stripped
        else:
            current_key = None
    if current_key is not None and buffer:
        result[current_key] = " ".join([result.get(current_key, "").strip(), *buffer]).strip()
    return result


__all__ = ["SkillManifest", "list_skills", "load_skill"]
