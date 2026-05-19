"""skill 加载与校验。

skill 目录约定：

    skills/<skill-name>/
    ├── SKILL.md       # 必须，YAML frontmatter + Markdown 正文
    ├── version.txt    # 可选
    └── templates/     # 可选，仅供 LLM 参考的模板骨架
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from research_kit.core.logging import get_logger
from research_kit.core.settings import Settings

_log = get_logger(__name__)
_FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.DOTALL)


@dataclass(frozen=True, slots=True)
class SkillManifest:
    """从 SKILL.md frontmatter 解析出的元信息。"""

    name: str
    description: str
    path: Path
    body: str
    version: str | None = None

    def render_prompt(self, user_payload: dict[str, object]) -> str:
        """把 skill 正文 + 用户参数拼成最终 prompt。

        Claude CLI / SDK 都接受纯文本 prompt；调用方负责把 frontmatter 之外的正文
        放进 system message，把 user_payload 放进 user message。这里只是给一份
        便利的字符串视图，便于日志和调试。
        """
        lines = [f"# Skill: {self.name}", "", "## 输入参数", ""]
        for key, value in user_payload.items():
            lines.append(f"- `{key}`: {value}")
        lines.extend(["", "## Skill 正文", "", self.body])
        return "\n".join(lines)


def load_skill(name: str, settings: Settings) -> SkillManifest:
    """按名称从 settings.skill_search_paths 中查找并解析 skill。"""
    candidates: list[Path] = []
    for base in settings.skill_search_paths:
        candidate = base / name / "SKILL.md"
        candidates.append(candidate)
        if candidate.exists():
            return _parse_skill(name, candidate)
    raise FileNotFoundError(
        f"未找到 skill `{name}`。已尝试：{[str(p) for p in candidates]}"
    )


def list_skills(settings: Settings) -> list[SkillManifest]:
    """枚举 search_paths 中所有可用 skill。同名时，靠前的 search_path 优先。"""
    seen: dict[str, SkillManifest] = {}
    for base in settings.skill_search_paths:
        if not base.exists():
            continue
        for skill_dir in sorted(base.iterdir()):
            if not skill_dir.is_dir():
                continue
            skill_md = skill_dir / "SKILL.md"
            if not skill_md.exists():
                continue
            if skill_dir.name in seen:
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
        raise ValueError(
            f"SKILL.md 缺少 YAML frontmatter（以 `---` 开头结尾）：{path}"
        )
    front_raw, body = match.group(1), match.group(2)
    front = _parse_minimal_yaml(front_raw)
    declared_name = str(front.get("name", "")).strip()
    if declared_name and declared_name != name:
        _log.warning(
            "SKILL.md 中 name=%s 与目录名 %s 不一致，使用目录名", declared_name, name
        )
    description = str(front.get("description", "")).strip()
    version_path = path.parent / "version.txt"
    version = version_path.read_text(encoding="utf-8").strip() if version_path.exists() else None
    return SkillManifest(name=name, description=description, path=path, body=body, version=version)


def _parse_minimal_yaml(text: str) -> dict[str, str]:
    """只解析 `key: value` 一层平铺的 YAML。

    避免引入 PyYAML 依赖。SKILL.md 的 frontmatter 通常只有 name / description，
    用最小解析器足够；如果未来需要嵌套结构，再换 PyYAML。
    """
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
            stripped = value.strip()
            if stripped.startswith('"') and stripped.endswith('"'):
                stripped = stripped[1:-1]
            result[current_key] = stripped
        else:
            current_key = None
    if current_key is not None and buffer:
        result[current_key] = " ".join([result.get(current_key, "").strip(), *buffer]).strip()
    return result


__all__ = ["SkillManifest", "list_skills", "load_skill"]
