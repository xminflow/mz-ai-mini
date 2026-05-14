from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path
from re import Pattern, compile as compile_regex

import psycopg
from sqlalchemy.engine import make_url


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


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments for cloud PostgreSQL setup."""

    parser = argparse.ArgumentParser(
        description=(
            "Create cloud PostgreSQL development and production databases "
            "and apply schema migrations."
        )
    )
    parser.add_argument(
        "--admin-url",
        required=True,
        help=(
            "PostgreSQL administrator connection URL for the cloud instance. "
            "It should target the maintenance database (typically 'postgres')."
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
    return parser.parse_args(argv)


def validate_database_name(database_name: str) -> str:
    """Validate that the database name is safe for identifier interpolation."""

    if not DATABASE_NAME_PATTERN.fullmatch(database_name):
        raise ValueError(
            "Database names may only contain letters, digits, and underscores."
        )
    return database_name


def normalize_postgres_sync_url(
    database_url: str,
    *,
    database_name: str | None = None,
) -> str:
    """Normalize a PostgreSQL URL so the sync psycopg driver can be used."""

    parsed_url = make_url(database_url)
    if parsed_url.get_backend_name() != "postgresql":
        raise ValueError("Only PostgreSQL database URLs are supported.")

    normalized_url = parsed_url.set(drivername="postgresql+psycopg")
    if database_name is not None:
        normalized_url = normalized_url.set(database=database_name)
    return normalized_url.render_as_string(hide_password=False)


def normalize_postgres_async_url(
    database_url: str,
    *,
    database_name: str | None = None,
) -> str:
    """Normalize a PostgreSQL URL so asyncpg can be used for async migrations."""

    parsed_url = make_url(database_url)
    if parsed_url.get_backend_name() != "postgresql":
        raise ValueError("Only PostgreSQL database URLs are supported.")

    normalized_url = parsed_url.set(drivername="postgresql+asyncpg")
    if database_name is not None:
        normalized_url = normalized_url.set(database=database_name)
    return normalized_url.render_as_string(hide_password=False)


def create_databases(
    *,
    admin_database_url: str,
    database_names: tuple[str, ...],
) -> None:
    """Create target databases on the cloud PostgreSQL instance.

    `CREATE DATABASE` cannot run inside a transaction block, so the
    connection is opened in autocommit mode.
    """

    parsed_url = make_url(admin_database_url)
    with psycopg.connect(
        host=parsed_url.host,
        port=parsed_url.port or 5432,
        user=parsed_url.username,
        password=parsed_url.password,
        dbname=parsed_url.database,
        autocommit=True,
    ) as connection:
        with connection.cursor() as cursor:
            for database_name in database_names:
                validated_name = validate_database_name(database_name)
                cursor.execute(
                    "SELECT 1 FROM pg_database WHERE datname = %s",
                    (validated_name,),
                )
                if cursor.fetchone() is not None:
                    continue
                cursor.execute(
                    f'CREATE DATABASE "{validated_name}" '
                    f"ENCODING 'UTF8' TEMPLATE template0"
                )


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    development_database = validate_database_name(args.development_database)
    production_database = validate_database_name(args.production_database)
    if development_database == production_database:
        raise ValueError("Development and production databases must be different.")

    admin_database_url = normalize_postgres_sync_url(args.admin_url)
    development_database_url = normalize_postgres_async_url(
        args.admin_url,
        database_name=development_database,
    )
    production_database_url = normalize_postgres_async_url(
        args.admin_url,
        database_name=production_database,
    )

    create_databases(
        admin_database_url=admin_database_url,
        database_names=(development_database, production_database),
    )
    asyncio.run(apply_migrations(database_url=development_database_url))
    asyncio.run(apply_migrations(database_url=production_database_url))

    print(
        "Cloud PostgreSQL setup completed for "
        f"{development_database} and {production_database}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
