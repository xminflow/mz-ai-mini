"""全局配置。来源优先级：构造参数 > 环境变量 > 默认值。"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from platformdirs import user_data_path

# 与 ua-agent 共享 Whisper 模型缓存的默认路径（用户可覆盖）。
_DEFAULT_WHISPER_CACHE = Path.home() / ".cache" / "whisper"


@dataclass(frozen=True, slots=True)
class Settings:
    """运行时设置。所有路径在构造时已解析为绝对路径。"""

    anthropic_api_key: str | None
    anthropic_model: str
    anthropic_base_url: str | None
    https_proxy: str | None
    workspace_root: Path
    skill_search_paths: tuple[Path, ...]
    whisper_cache_dir: Path
    log_level: str
    log_dir: Path | None

    @classmethod
    def load(
        cls,
        *,
        workspace_root: Path | None = None,
        skill_search_paths: list[Path] | None = None,
        anthropic_api_key: str | None = None,
        anthropic_model: str | None = None,
        log_level: str | None = None,
        log_dir: Path | None = None,
    ) -> "Settings":
        """从环境变量和入参加载配置。入参优先级最高。"""
        default_skill_paths: list[Path] = []
        for candidate in (_claude_skills_dir(), _legacy_repo_skills_dir()):
            if candidate is not None and candidate.exists():
                default_skill_paths.append(candidate)
        user_skill_path = _user_skill_dir()
        if user_skill_path is not None:
            default_skill_paths.append(user_skill_path)

        return cls(
            anthropic_api_key=anthropic_api_key or os.environ.get("ANTHROPIC_API_KEY"),
            anthropic_model=anthropic_model or os.environ.get("RESEARCH_KIT_MODEL", "claude-opus-4-7"),
            anthropic_base_url=os.environ.get("ANTHROPIC_BASE_URL"),
            https_proxy=os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"),
            workspace_root=(workspace_root or Path("output")).resolve(),
            skill_search_paths=tuple(skill_search_paths or default_skill_paths),
            whisper_cache_dir=Path(os.environ.get("WHISPER_CACHE_DIR") or _DEFAULT_WHISPER_CACHE).resolve(),
            log_level=(log_level or os.environ.get("RESEARCH_KIT_LOG_LEVEL", "INFO")).upper(),
            log_dir=log_dir.resolve() if log_dir is not None else None,
        )


def _claude_skills_dir() -> Path | None:
    """定位 Claude Code 项目级 skill 目录：<repo-root>/.claude/skills/。

    Claude Code 启动时会自动装载该目录里的 SKILL.md。我们的 Python CLI 也走同一份。
    """
    here = Path(__file__).resolve()
    # __file__ = research-kit/src/research_kit/core/settings.py
    # parents[3] = research-kit/
    if len(here.parents) >= 4:
        return here.parents[3] / ".claude" / "skills"
    return None


def _legacy_repo_skills_dir() -> Path | None:
    """旧版 <repo-root>/skills/ 路径，仅作兼容回退。"""
    here = Path(__file__).resolve()
    if len(here.parents) >= 4:
        return here.parents[3] / "skills"
    return None


def _user_skill_dir() -> Path | None:
    """用户级 skill 目录（platformdirs，跨平台）。

    安装后可由其他工具往这里放扩展 skill。
    """
    try:
        path = user_data_path("research-kit", appauthor=False) / "skills"
    except Exception:
        return None
    return path


@dataclass(slots=True)
class WorkspaceConfig:
    """与 Settings 区分：workspace 是单次任务的局部路径，settings 是全局。"""

    root: Path
    run_id: str
    focus_count: int = 5

    def reports_dir(self) -> Path:
        return self.root / "reports" / self.run_id

    def runs_dir(self) -> Path:
        return self.root / "runs" / self.run_id

    def __post_init__(self) -> None:
        if not (3 <= self.focus_count <= 8):
            raise ValueError(f"focus_count 必须在 [3, 8]，收到 {self.focus_count}")


__all__ = ["Settings", "WorkspaceConfig"]
