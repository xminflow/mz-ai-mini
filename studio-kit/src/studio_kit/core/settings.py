"""全局配置，来源优先级：入参 > 环境变量 > 默认值。"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class Settings:
    workspace_root: Path
    skill_search_paths: tuple[Path, ...]
    log_level: str

    @classmethod
    def load(cls, *, workspace_root: Path | None = None) -> "Settings":
        default_skill_paths: list[Path] = []
        # studio-kit 项目根：src/studio_kit/core/settings.py → 上溯 4 级
        here = Path(__file__).resolve()
        if len(here.parents) >= 4:
            p = here.parents[3] / ".claude" / "skills"
            if p.exists():
                default_skill_paths.append(p)

        return cls(
            workspace_root=(workspace_root or Path("output/shortvideos")).resolve(),
            skill_search_paths=tuple(default_skill_paths),
            log_level=os.environ.get("STUDIO_KIT_LOG_LEVEL", "INFO").upper(),
        )
