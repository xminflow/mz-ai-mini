from __future__ import annotations

import pytest

from scripts.setup_cloud_postgres import (
    DEFAULT_CLOUD_DEVELOPMENT_DATABASE,
    DEFAULT_CLOUD_PRODUCTION_DATABASE,
    normalize_postgres_async_url,
    normalize_postgres_sync_url,
    parse_args,
    validate_database_name,
)


def test_parse_args_reads_required_and_optional_arguments() -> None:
    args = parse_args(
        [
            "--admin-url",
            "postgresql+asyncpg://root:postgres@10.0.0.8:5432/postgres",
            "--development-database",
            "cloud_dev",
            "--production-database",
            "cloud_prod",
        ]
    )

    assert args.admin_url == "postgresql+asyncpg://root:postgres@10.0.0.8:5432/postgres"
    assert args.development_database == "cloud_dev"
    assert args.production_database == "cloud_prod"


def test_parse_args_applies_database_name_defaults() -> None:
    args = parse_args(
        ["--admin-url", "postgresql+asyncpg://root:postgres@10.0.0.8:5432/postgres"]
    )

    assert args.development_database == DEFAULT_CLOUD_DEVELOPMENT_DATABASE
    assert args.production_database == DEFAULT_CLOUD_PRODUCTION_DATABASE


def test_validate_database_name_accepts_letters_digits_and_underscores() -> None:
    assert validate_database_name("mz_ai_backend_2026") == "mz_ai_backend_2026"


def test_validate_database_name_rejects_unsafe_names() -> None:
    with pytest.raises(ValueError):
        validate_database_name("mz-ai-backend-dev")


def test_normalize_postgres_sync_url_switches_to_psycopg_and_can_override_database() -> None:
    normalized_url = normalize_postgres_sync_url(
        "postgresql+asyncpg://root:postgres@10.0.0.8:5432/postgres",
        database_name="mz_ai_backend_prod",
    )

    assert normalized_url == (
        "postgresql+psycopg://root:postgres@10.0.0.8:5432/mz_ai_backend_prod"
    )


def test_normalize_postgres_sync_url_rejects_non_postgres_urls() -> None:
    with pytest.raises(ValueError):
        normalize_postgres_sync_url("mysql+aiomysql://user:pass@10.0.0.8:3306/app")


def test_normalize_postgres_async_url_switches_to_asyncpg_and_can_override_database() -> None:
    database_url = normalize_postgres_async_url(
        "postgresql://root:postgres@10.0.0.8:5432/postgres",
        database_name="mz_ai_backend_dev",
    )

    assert database_url == (
        "postgresql+asyncpg://root:postgres@10.0.0.8:5432/mz_ai_backend_dev"
    )
