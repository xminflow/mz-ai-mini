from __future__ import annotations

import pytest

from scripts.setup_cloud_mysql import (
    DEFAULT_CLOUD_DEVELOPMENT_DATABASE,
    DEFAULT_CLOUD_PRODUCTION_DATABASE,
    assert_target_database_is_distinct,
    normalize_mysql_async_url,
    normalize_mysql_sync_url,
    parse_args,
    validate_database_name,
)


def test_parse_args_reads_required_and_optional_arguments() -> None:
    args = parse_args(
        [
            "--admin-url",
            "mysql+aiomysql://root:mysql@10.0.0.8:3306/mysql",
            "--source-url",
            "mysql+aiomysql://root:mysql@127.0.0.1:3306/mz_ai_backend_dev",
            "--development-database",
            "cloud_dev",
            "--production-database",
            "cloud_prod",
            "--copy-dev-data",
        ]
    )

    assert args.admin_url == "mysql+aiomysql://root:mysql@10.0.0.8:3306/mysql"
    assert args.source_url == (
        "mysql+aiomysql://root:mysql@127.0.0.1:3306/mz_ai_backend_dev"
    )
    assert args.development_database == "cloud_dev"
    assert args.production_database == "cloud_prod"
    assert args.copy_dev_data is True


def test_parse_args_applies_database_name_defaults() -> None:
    args = parse_args(["--admin-url", "mysql+aiomysql://root:mysql@10.0.0.8:3306"])

    assert args.development_database == DEFAULT_CLOUD_DEVELOPMENT_DATABASE
    assert args.production_database == DEFAULT_CLOUD_PRODUCTION_DATABASE
    assert args.copy_dev_data is False
    assert args.source_url is None


def test_validate_database_name_accepts_letters_digits_and_underscores() -> None:
    assert validate_database_name("mz_ai_backend_2026") == "mz_ai_backend_2026"


def test_validate_database_name_rejects_unsafe_names() -> None:
    with pytest.raises(ValueError):
        validate_database_name("mz-ai-backend-dev")


def test_normalize_mysql_sync_url_switches_to_pymysql_and_can_override_database() -> None:
    normalized_url = normalize_mysql_sync_url(
        "mysql+aiomysql://root:mysql@10.0.0.8:3306/mysql",
        database_name="mz_ai_backend_prod",
    )

    assert normalized_url == (
        "mysql+pymysql://root:mysql@10.0.0.8:3306/mz_ai_backend_prod"
    )


def test_normalize_mysql_sync_url_rejects_non_mysql_urls() -> None:
    with pytest.raises(ValueError):
        normalize_mysql_sync_url("postgresql+asyncpg://user:pass@10.0.0.8:5432/app")


def test_normalize_mysql_async_url_switches_to_aiomysql_and_can_override_database() -> None:
    database_url = normalize_mysql_async_url(
        "mysql://root:mysql@10.0.0.8:3306/mysql",
        database_name="mz_ai_backend_dev",
    )

    assert database_url == (
        "mysql+aiomysql://root:mysql@10.0.0.8:3306/mz_ai_backend_dev"
    )


def test_parse_args_requires_source_url_when_copy_dev_data_is_enabled() -> None:
    args = parse_args(
        [
            "--admin-url",
            "mysql://root:mysql@10.0.0.8:3306/mysql",
            "--copy-dev-data",
        ]
    )

    assert args.copy_dev_data is True
    assert args.source_url is None


def test_assert_target_database_is_distinct_rejects_same_database() -> None:
    with pytest.raises(ValueError):
        assert_target_database_is_distinct(
            source_database_url="mysql+aiomysql://root:mysql@10.0.0.8:3306/mz_ai_backend_dev",
            target_database_url="mysql+pymysql://root:mysql@10.0.0.8:3306/mz_ai_backend_dev",
        )
