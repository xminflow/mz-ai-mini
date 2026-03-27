from __future__ import annotations

import pytest

from mz_ai_backend.core.config import Settings


@pytest.mark.parametrize(
    ("env_name", "expected_database_url"),
    (
        ("development", None),
        ("production", None),
        ("test", None),
    ),
)
def test_settings_apply_database_default_only_for_development(
    monkeypatch: pytest.MonkeyPatch,
    env_name: str,
    expected_database_url: str | None,
) -> None:
    monkeypatch.setenv("MZ_AI_BACKEND_ENV", env_name)
    monkeypatch.delenv("MZ_AI_BACKEND_DATABASE_URL", raising=False)
    monkeypatch.delenv("MZ_AI_BACKEND_DEVELOPMENT_DATABASE_URL", raising=False)
    monkeypatch.delenv("MZ_AI_BACKEND_PRODUCTION_DATABASE_URL", raising=False)

    settings = Settings(_env_file=None)

    assert settings.database_url == expected_database_url


def test_settings_preserve_explicit_database_url(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("MZ_AI_BACKEND_ENV", "development")
    monkeypatch.delenv("MZ_AI_BACKEND_PRODUCTION_DATABASE_URL", raising=False)
    monkeypatch.setenv(
        "MZ_AI_BACKEND_DEVELOPMENT_DATABASE_URL",
        "mysql+aiomysql://root:mysql@127.0.0.1:3306/development_database",
    )
    monkeypatch.setenv(
        "MZ_AI_BACKEND_DATABASE_URL",
        "mysql+aiomysql://root:mysql@127.0.0.1:3306/custom_database",
    )

    settings = Settings(_env_file=None)

    assert settings.database_url == (
        "mysql+aiomysql://root:mysql@127.0.0.1:3306/custom_database"
    )


def test_settings_use_development_database_url_when_explicit_database_url_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("MZ_AI_BACKEND_ENV", "development")
    monkeypatch.delenv("MZ_AI_BACKEND_DATABASE_URL", raising=False)
    monkeypatch.delenv("MZ_AI_BACKEND_PRODUCTION_DATABASE_URL", raising=False)
    monkeypatch.setenv(
        "MZ_AI_BACKEND_DEVELOPMENT_DATABASE_URL",
        "mysql+aiomysql://root:mysql@127.0.0.1:3306/cloud_development_database",
    )

    settings = Settings(_env_file=None)

    assert settings.database_url == (
        "mysql+aiomysql://root:mysql@127.0.0.1:3306/cloud_development_database"
    )


def test_settings_use_production_database_url_when_explicit_database_url_is_missing(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("MZ_AI_BACKEND_ENV", "production")
    monkeypatch.delenv("MZ_AI_BACKEND_DATABASE_URL", raising=False)
    monkeypatch.delenv("MZ_AI_BACKEND_DEVELOPMENT_DATABASE_URL", raising=False)
    monkeypatch.setenv(
        "MZ_AI_BACKEND_PRODUCTION_DATABASE_URL",
        "mysql+aiomysql://root:mysql@10.0.0.8:3306/cloud_production_database",
    )

    settings = Settings(_env_file=None)

    assert settings.database_url == (
        "mysql+aiomysql://root:mysql@10.0.0.8:3306/cloud_production_database"
    )
