"""publish 分环境配置加载与目标解析。

设计思路：
- 公共 URL（api_base）走 TOML 配置文件，可入仓库；
- token 走环境变量，按环境名指定不同变量名；
- CLI 显式参数最高优先级，仍兼容老的 WEELUME_API_BASE / WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN
  两个全局环境变量，避免破坏既有脚本。
"""

from __future__ import annotations

import logging
import os
import tomllib
from dataclasses import dataclass
from pathlib import Path

from .weelume_api import PublishError

_LOGGER = logging.getLogger(__name__)

DEFAULT_TOKEN_ENV_VAR = "WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN"
DEFAULT_API_BASE_ENV_VAR = "WEELUME_API_BASE"
DEFAULT_ENVS_FILENAME = "publish-envs.toml"
PUBLISH_ENV_VAR = "RESEARCH_KIT_PUBLISH_ENV"
PUBLISH_ENVS_FILE_VAR = "RESEARCH_KIT_PUBLISH_ENVS_FILE"


@dataclass(frozen=True)
class PublishEnvironment:
    """单个命名 publish 环境。"""

    name: str
    api_base: str
    token_env: str


@dataclass(frozen=True)
class EnvsConfig:
    """publish-envs.toml 解析结果。"""

    envs: dict[str, PublishEnvironment]
    default: str | None
    source: Path


@dataclass(frozen=True)
class ResolvedTarget:
    """命令最终要使用的 api_base / token，以及解析出的环境名。"""

    api_base: str
    token: str
    env_name: str | None


def _candidate_envs_files() -> list[Path]:
    """按优先级返回默认 envs 文件候选路径。"""

    candidates: list[Path] = [Path.cwd() / DEFAULT_ENVS_FILENAME]
    here = Path(__file__).resolve()
    # environments.py 位于 research-kit/src/research_kit/publishing/
    # parents[3] 即 research-kit/ 项目根。
    if len(here.parents) >= 4:
        candidates.append(here.parents[3] / DEFAULT_ENVS_FILENAME)
    return candidates


def find_envs_file(explicit: Path | None) -> Path | None:
    """根据优先级查找 publish-envs.toml。

    顺序：
    1. 显式传入路径（必须存在，否则报错）；
    2. ``RESEARCH_KIT_PUBLISH_ENVS_FILE`` 环境变量（必须存在，否则报错）；
    3. 当前工作目录 / research-kit 项目根 下的 ``publish-envs.toml``；
    4. 都没有则返回 ``None``。
    """

    if explicit is not None:
        if not explicit.is_file():
            raise PublishError(f"指定的 envs 文件不存在：{explicit}")
        return explicit.resolve()

    env_override = os.environ.get(PUBLISH_ENVS_FILE_VAR)
    if env_override and env_override.strip():
        candidate = Path(env_override).expanduser()
        if not candidate.is_file():
            raise PublishError(
                f"{PUBLISH_ENVS_FILE_VAR} 指向的文件不存在：{candidate}"
            )
        return candidate.resolve()

    seen: set[Path] = set()
    for candidate in _candidate_envs_files():
        resolved = candidate.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        if resolved.is_file():
            return resolved
    return None


def load_envs_config(path: Path) -> EnvsConfig:
    """解析 publish-envs.toml。"""

    try:
        with path.open("rb") as fh:
            data = tomllib.load(fh)
    except tomllib.TOMLDecodeError as exc:
        raise PublishError(f"publish-envs.toml 解析失败：{path}：{exc}") from exc

    raw_envs = data.get("envs")
    if not isinstance(raw_envs, dict) or not raw_envs:
        raise PublishError(f"publish-envs.toml 缺少 [envs.*] 段：{path}")

    envs: dict[str, PublishEnvironment] = {}
    for name, body in raw_envs.items():
        if not isinstance(name, str) or name.strip() == "":
            raise PublishError(f"[envs] 子键必须是非空字符串：{path}")
        if not isinstance(body, dict):
            raise PublishError(f"[envs.{name}] 必须是表：{path}")
        api_base_raw = body.get("api_base")
        if not isinstance(api_base_raw, str) or api_base_raw.strip() == "":
            raise PublishError(f"[envs.{name}] 缺少非空 api_base：{path}")
        token_env_raw = body.get("token_env", DEFAULT_TOKEN_ENV_VAR)
        if not isinstance(token_env_raw, str) or token_env_raw.strip() == "":
            raise PublishError(
                f"[envs.{name}].token_env 必须是非空字符串：{path}"
            )
        envs[name] = PublishEnvironment(
            name=name,
            api_base=api_base_raw.strip(),
            token_env=token_env_raw.strip(),
        )

    default_raw = data.get("default")
    if default_raw is None:
        default_name: str | None = None
    elif isinstance(default_raw, str) and default_raw in envs:
        default_name = default_raw
    else:
        raise PublishError(
            f"publish-envs.toml 中的 default={default_raw!r} 未在 [envs.*] 中定义：{path}"
        )

    return EnvsConfig(envs=envs, default=default_name, source=path)


def _resolve_env_name(
    *, explicit: str | None, config: EnvsConfig | None
) -> str | None:
    """按优先级返回最终生效的环境名（可能为 None）。"""

    if explicit is not None and explicit.strip() != "":
        return explicit.strip()
    env_var = os.environ.get(PUBLISH_ENV_VAR)
    if env_var is not None and env_var.strip() != "":
        return env_var.strip()
    if config is not None:
        return config.default
    return None


def resolve_publish_target(
    *,
    env_name: str | None,
    api_base_override: str | None,
    token_override: str | None,
    envs_file: Path | None,
) -> ResolvedTarget:
    """综合命名环境 + 显式参数 + 兼容性 env var，解析最终 publish 目标。

    优先级（由高到低）：
    1. CLI 显式 ``--api-base`` / ``--token``；
    2. 选中环境（``--env`` / ``RESEARCH_KIT_PUBLISH_ENV`` / 文件中的 ``default``）的
       ``api_base`` 与 ``token_env`` 指定的环境变量；
    3. 老的全局 env var ``WEELUME_API_BASE`` / ``WEELUME_BLOGGER_INSIGHT_IMPORT_TOKEN``。
    """

    api_base_value = api_base_override.strip() if api_base_override else None
    token_value = token_override.strip() if token_override else None

    config: EnvsConfig | None = None
    if not (api_base_value and token_value):
        config_path = find_envs_file(envs_file)
        if config_path is not None:
            config = load_envs_config(config_path)

    effective_env_name = _resolve_env_name(explicit=env_name, config=config)

    selected_env: PublishEnvironment | None = None
    if effective_env_name is not None:
        if config is None:
            raise PublishError(
                f"指定了环境 {effective_env_name!r}，但未找到 publish-envs.toml；"
                f"请提供 --envs-file 或设置 {PUBLISH_ENVS_FILE_VAR}。"
            )
        if effective_env_name not in config.envs:
            available = ", ".join(sorted(config.envs)) or "(空)"
            raise PublishError(
                f"未找到名为 {effective_env_name!r} 的环境，可选：{available}（来自 {config.source}）"
            )
        selected_env = config.envs[effective_env_name]

    if api_base_value is None:
        if selected_env is not None:
            api_base_value = selected_env.api_base
        else:
            fallback = os.environ.get(DEFAULT_API_BASE_ENV_VAR, "").strip()
            if fallback:
                api_base_value = fallback

    if api_base_value is None or api_base_value == "":
        raise PublishError(
            "未能解析 api_base：请显式传 --api-base，或通过 --env 选择 publish-envs.toml 中的环境，"
            f"或设置 {DEFAULT_API_BASE_ENV_VAR}。"
        )

    if token_value is None:
        token_env_var = (
            selected_env.token_env if selected_env is not None else DEFAULT_TOKEN_ENV_VAR
        )
        candidate = os.environ.get(token_env_var, "").strip()
        if candidate:
            token_value = candidate

    if token_value is None or token_value == "":
        token_env_var = (
            selected_env.token_env if selected_env is not None else DEFAULT_TOKEN_ENV_VAR
        )
        raise PublishError(
            f"未能解析 token：请显式传 --token，或确保环境变量 {token_env_var} 已设置。"
        )

    final_env_name = selected_env.name if selected_env is not None else effective_env_name
    _LOGGER.debug(
        "resolved publish target env=%s api_base=%s token_len=%d",
        final_env_name,
        api_base_value,
        len(token_value),
    )
    return ResolvedTarget(
        api_base=api_base_value,
        token=token_value,
        env_name=final_env_name,
    )


__all__ = [
    "DEFAULT_API_BASE_ENV_VAR",
    "DEFAULT_ENVS_FILENAME",
    "DEFAULT_TOKEN_ENV_VAR",
    "EnvsConfig",
    "PUBLISH_ENVS_FILE_VAR",
    "PUBLISH_ENV_VAR",
    "PublishEnvironment",
    "ResolvedTarget",
    "find_envs_file",
    "load_envs_config",
    "resolve_publish_target",
]
