"""publish 分环境配置加载与目标解析的单测。"""

from __future__ import annotations

from pathlib import Path

import pytest

from research_kit.publishing import (
    DEFAULT_API_BASE_ENV_VAR,
    DEFAULT_TOKEN_ENV_VAR,
    PUBLISH_ENV_VAR,
    PUBLISH_ENVS_FILE_VAR,
    PublishError,
    find_envs_file,
    load_envs_config,
    resolve_publish_target,
)


SAMPLE_TOML = """\
default = "local"

[envs.local]
api_base = "http://localhost:8000"
token_env = "TOKEN_LOCAL"

[envs.prod]
api_base = "https://api.weelume.com"
token_env = "TOKEN_PROD"
"""


@pytest.fixture()
def clean_publish_env(monkeypatch: pytest.MonkeyPatch) -> None:
    """清掉测试可能感知到的全部 publish 相关环境变量。"""

    for var in (
        PUBLISH_ENV_VAR,
        PUBLISH_ENVS_FILE_VAR,
        DEFAULT_API_BASE_ENV_VAR,
        DEFAULT_TOKEN_ENV_VAR,
        "TOKEN_LOCAL",
        "TOKEN_PROD",
    ):
        monkeypatch.delenv(var, raising=False)


def _write_toml(tmp_path: Path, content: str = SAMPLE_TOML) -> Path:
    path = tmp_path / "publish-envs.toml"
    path.write_text(content, encoding="utf-8")
    return path


def test_load_envs_config_parses_envs_and_default(tmp_path: Path) -> None:
    config = load_envs_config(_write_toml(tmp_path))

    assert set(config.envs) == {"local", "prod"}
    assert config.default == "local"
    local = config.envs["local"]
    assert local.api_base == "http://localhost:8000"
    assert local.token_env == "TOKEN_LOCAL"


def test_load_envs_config_missing_envs_section_raises(tmp_path: Path) -> None:
    path = tmp_path / "publish-envs.toml"
    path.write_text('default = "x"\n', encoding="utf-8")

    with pytest.raises(PublishError, match="缺少 \\[envs\\.\\*\\]"):
        load_envs_config(path)


def test_load_envs_config_default_must_exist(tmp_path: Path) -> None:
    path = _write_toml(
        tmp_path,
        """\
default = "ghost"

[envs.local]
api_base = "http://localhost:8000"
""",
    )

    with pytest.raises(PublishError, match="default='ghost' 未在"):
        load_envs_config(path)


def test_load_envs_config_requires_api_base(tmp_path: Path) -> None:
    path = _write_toml(
        tmp_path,
        """\
[envs.local]
token_env = "TOKEN_LOCAL"
""",
    )

    with pytest.raises(PublishError, match="缺少非空 api_base"):
        load_envs_config(path)


def test_load_envs_config_token_env_defaults(tmp_path: Path) -> None:
    path = _write_toml(
        tmp_path,
        """\
[envs.local]
api_base = "http://localhost:8000"
""",
    )

    config = load_envs_config(path)
    assert config.envs["local"].token_env == DEFAULT_TOKEN_ENV_VAR


def test_find_envs_file_explicit_must_exist(tmp_path: Path) -> None:
    missing = tmp_path / "nope.toml"
    with pytest.raises(PublishError, match="不存在"):
        find_envs_file(missing)


def test_find_envs_file_env_var_must_exist(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    monkeypatch.setenv(PUBLISH_ENVS_FILE_VAR, str(tmp_path / "nope.toml"))
    with pytest.raises(PublishError, match="不存在"):
        find_envs_file(None)


def test_resolve_uses_default_env_and_token_env_var(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    path = _write_toml(tmp_path)
    monkeypatch.setenv("TOKEN_LOCAL", "tk-local")

    target = resolve_publish_target(
        env_name=None,
        api_base_override=None,
        token_override=None,
        envs_file=path,
    )

    assert target.env_name == "local"
    assert target.api_base == "http://localhost:8000"
    assert target.token == "tk-local"


def test_resolve_explicit_env_selects_prod(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    path = _write_toml(tmp_path)
    monkeypatch.setenv("TOKEN_PROD", "tk-prod")

    target = resolve_publish_target(
        env_name="prod",
        api_base_override=None,
        token_override=None,
        envs_file=path,
    )

    assert target.env_name == "prod"
    assert target.api_base == "https://api.weelume.com"
    assert target.token == "tk-prod"


def test_resolve_env_var_overrides_default(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    path = _write_toml(tmp_path)
    monkeypatch.setenv(PUBLISH_ENV_VAR, "prod")
    monkeypatch.setenv("TOKEN_PROD", "tk-prod")

    target = resolve_publish_target(
        env_name=None,
        api_base_override=None,
        token_override=None,
        envs_file=path,
    )

    assert target.env_name == "prod"


def test_resolve_explicit_arg_beats_env_var(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    path = _write_toml(tmp_path)
    monkeypatch.setenv(PUBLISH_ENV_VAR, "prod")
    monkeypatch.setenv("TOKEN_LOCAL", "tk-local")

    target = resolve_publish_target(
        env_name="local",
        api_base_override=None,
        token_override=None,
        envs_file=path,
    )

    assert target.env_name == "local"
    assert target.token == "tk-local"


def test_resolve_cli_override_wins_over_env_config(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    path = _write_toml(tmp_path)
    monkeypatch.setenv("TOKEN_LOCAL", "ignored")

    target = resolve_publish_target(
        env_name=None,
        api_base_override="http://override-host:9000",
        token_override="tk-override",
        envs_file=path,
    )

    assert target.api_base == "http://override-host:9000"
    assert target.token == "tk-override"


def test_resolve_unknown_env_lists_choices(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    path = _write_toml(tmp_path)

    with pytest.raises(PublishError, match="未找到名为 'ghost'"):
        resolve_publish_target(
            env_name="ghost",
            api_base_override=None,
            token_override=None,
            envs_file=path,
        )


def test_resolve_missing_token_reports_env_var_name(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    path = _write_toml(tmp_path)

    with pytest.raises(PublishError, match="TOKEN_LOCAL"):
        resolve_publish_target(
            env_name="local",
            api_base_override=None,
            token_override=None,
            envs_file=path,
        )


def _force_no_envs_file(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """让 _candidate_envs_files 只返回不存在的路径，绕过仓库内置的 publish-envs.toml。"""

    from research_kit.publishing import environments as env_mod

    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(
        env_mod, "_candidate_envs_files", lambda: [tmp_path / "absent.toml"]
    )


def test_resolve_falls_back_to_legacy_env_vars_when_no_config(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    _force_no_envs_file(tmp_path, monkeypatch)
    monkeypatch.setenv(DEFAULT_API_BASE_ENV_VAR, "http://legacy:7000")
    monkeypatch.setenv(DEFAULT_TOKEN_ENV_VAR, "tk-legacy")

    target = resolve_publish_target(
        env_name=None,
        api_base_override=None,
        token_override=None,
        envs_file=None,
    )

    assert target.env_name is None
    assert target.api_base == "http://legacy:7000"
    assert target.token == "tk-legacy"


def test_resolve_requires_envs_file_when_env_specified_without_config(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    clean_publish_env: None,
) -> None:
    _force_no_envs_file(tmp_path, monkeypatch)

    with pytest.raises(PublishError, match="未找到 publish-envs\\.toml"):
        resolve_publish_target(
            env_name="prod",
            api_base_override=None,
            token_override=None,
            envs_file=None,
        )
