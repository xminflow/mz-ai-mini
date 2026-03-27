from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path
from re import Pattern, compile as compile_regex

from sqlalchemy import MetaData, Table, create_engine, insert, select, text
from sqlalchemy.engine import Connection, Engine, make_url


PROJECT_ROOT = Path(__file__).resolve().parents[1]
API_SRC = PROJECT_ROOT / "api" / "src"
MIGRATIONS_SRC = PROJECT_ROOT / "api" / "migrations"

if str(API_SRC) not in sys.path:
    sys.path.insert(0, str(API_SRC))

if str(MIGRATIONS_SRC) not in sys.path:
    sys.path.insert(0, str(MIGRATIONS_SRC))

from run_sql_migrations import apply_migrations


DEFAULT_CLOUD_DEVELOPMENT_DATABASE = "mz_ai_backend_dev"
DEFAULT_CLOUD_PRODUCTION_DATABASE = "mz_ai_backend_prod"
DATABASE_NAME_PATTERN: Pattern[str] = compile_regex(r"^[A-Za-z0-9_]+$")
SCHEMA_MIGRATIONS_TABLE = "schema_migrations"


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments for cloud MySQL setup."""

    parser = argparse.ArgumentParser(
        description=(
            "Create cloud MySQL development and production databases, "
            "apply schema migrations, and optionally copy development data."
        )
    )
    parser.add_argument(
        "--admin-url",
        required=True,
        help=(
            "MySQL administrator connection URL for the cloud instance. "
            "It may include any database name on the same instance."
        ),
    )
    parser.add_argument(
        "--source-url",
        help=(
            "Source development database URL used only when development data copy "
            "is explicitly enabled."
        ),
    )
    parser.add_argument(
        "--development-database",
        default=DEFAULT_CLOUD_DEVELOPMENT_DATABASE,
        help="Cloud development database name.",
    )
    parser.add_argument(
        "--production-database",
        default=DEFAULT_CLOUD_PRODUCTION_DATABASE,
        help="Cloud production database name.",
    )
    parser.add_argument(
        "--copy-dev-data",
        action="store_true",
        help="Copy source development data into the cloud development database.",
    )
    return parser.parse_args(argv)


def validate_database_name(database_name: str) -> str:
    """Validate that the database name is safe for identifier interpolation."""

    if not DATABASE_NAME_PATTERN.fullmatch(database_name):
        raise ValueError(
            "Database names may only contain letters, digits, and underscores."
        )
    return database_name


def normalize_mysql_sync_url(
    database_url: str,
    *,
    database_name: str | None = None,
) -> str:
    """Normalize a MySQL URL so the sync driver can be used safely in scripts."""

    parsed_url = make_url(database_url)
    if parsed_url.get_backend_name() != "mysql":
        raise ValueError("Only MySQL database URLs are supported.")

    normalized_url = parsed_url.set(drivername="mysql+pymysql")
    if database_name is not None:
        normalized_url = normalized_url.set(database=database_name)
    return normalized_url.render_as_string(hide_password=False)


def normalize_mysql_async_url(
    database_url: str,
    *,
    database_name: str | None = None,
) -> str:
    """Normalize a MySQL URL so aiomysql can be used for async migrations."""

    parsed_url = make_url(database_url)
    if parsed_url.get_backend_name() != "mysql":
        raise ValueError("Only MySQL database URLs are supported.")

    normalized_url = parsed_url.set(drivername="mysql+aiomysql")
    if database_name is not None:
        normalized_url = normalized_url.set(database=database_name)
    return normalized_url.render_as_string(hide_password=False)


def assert_target_database_is_distinct(
    *,
    source_database_url: str,
    target_database_url: str,
) -> None:
    """Ensure the source database is not the same as the target database."""

    source_url = make_url(normalize_mysql_sync_url(source_database_url))
    target_url = make_url(normalize_mysql_sync_url(target_database_url))

    if (
        source_url.host == target_url.host
        and (source_url.port or 3306) == (target_url.port or 3306)
        and source_url.username == target_url.username
        and source_url.database == target_url.database
    ):
        raise ValueError("Source database and target database must be different.")


def create_sync_engine(database_url: str, *, autocommit: bool = False) -> Engine:
    """Create a synchronous SQLAlchemy engine for maintenance operations."""

    engine_kwargs: dict[str, object] = {
        "pool_pre_ping": True,
        "future": True,
    }
    if autocommit:
        engine_kwargs["isolation_level"] = "AUTOCOMMIT"
    return create_engine(database_url, **engine_kwargs)


def _list_business_tables(connection: Connection) -> tuple[str, ...]:
    result = connection.execute(text("SHOW TABLES"))
    return tuple(
        sorted(row[0] for row in result.fetchall() if row[0] != SCHEMA_MIGRATIONS_TABLE)
    )


def _reflect_table(connection: Connection, table_name: str) -> Table:
    return Table(table_name, MetaData(), autoload_with=connection)


def create_databases(*, admin_database_url: str, database_names: tuple[str, ...]) -> None:
    """Create target databases on the cloud MySQL instance."""

    engine = create_sync_engine(admin_database_url, autocommit=True)
    try:
        with engine.connect() as connection:
            for database_name in database_names:
                connection.execute(
                    text(
                        f"""
                        CREATE DATABASE IF NOT EXISTS `{database_name}`
                            DEFAULT CHARACTER SET utf8mb4
                            DEFAULT COLLATE utf8mb4_unicode_ci
                        """
                    )
                )
    finally:
        engine.dispose()


def copy_database_data(
    *,
    source_database_url: str,
    target_database_url: str,
) -> dict[str, int]:
    """Replace target business-table data with the current source data."""

    source_engine = create_sync_engine(source_database_url)
    target_engine = create_sync_engine(target_database_url)
    copied_row_counts: dict[str, int] = {}

    try:
        with source_engine.connect() as source_connection:
            source_tables = _list_business_tables(source_connection)
            with target_engine.begin() as target_connection:
                target_tables = _list_business_tables(target_connection)

                for table_name in target_tables:
                    target_table = _reflect_table(target_connection, table_name)
                    target_connection.execute(target_table.delete())

                for table_name in source_tables:
                    source_table = _reflect_table(source_connection, table_name)
                    target_table = _reflect_table(target_connection, table_name)
                    source_rows = [
                        dict(row)
                        for row in source_connection.execute(
                            select(source_table)
                        ).mappings()
                    ]

                    if source_rows:
                        target_connection.execute(insert(target_table), source_rows)

                    copied_row_counts[table_name] = len(source_rows)
    finally:
        source_engine.dispose()
        target_engine.dispose()

    return copied_row_counts


def _format_row_counts(row_counts: dict[str, int]) -> str:
    return ", ".join(
        f"{table_name}={row_count}"
        for table_name, row_count in sorted(row_counts.items())
    )


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    development_database = validate_database_name(args.development_database)
    production_database = validate_database_name(args.production_database)
    if development_database == production_database:
        raise ValueError("Development and production databases must be different.")

    admin_database_url = normalize_mysql_sync_url(args.admin_url)
    development_database_url = normalize_mysql_async_url(
        args.admin_url,
        database_name=development_database,
    )
    production_database_url = normalize_mysql_async_url(
        args.admin_url,
        database_name=production_database,
    )

    create_databases(
        admin_database_url=admin_database_url,
        database_names=(development_database, production_database),
    )
    asyncio.run(apply_migrations(database_url=development_database_url))
    asyncio.run(apply_migrations(database_url=production_database_url))

    if args.copy_dev_data:
        if args.source_url is None:
            raise ValueError("--source-url is required when --copy-dev-data is enabled.")
        source_database_url = normalize_mysql_sync_url(args.source_url)
        assert_target_database_is_distinct(
            source_database_url=source_database_url,
            target_database_url=development_database_url,
        )
        copied_row_counts = copy_database_data(
            source_database_url=source_database_url,
            target_database_url=normalize_mysql_sync_url(development_database_url),
        )
        print(f"Copied development data: {_format_row_counts(copied_row_counts)}")
    else:
        print("Skipped development data copy.")

    print(
        "Cloud MySQL setup completed for "
        f"{development_database} and {production_database}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
