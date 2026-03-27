from __future__ import annotations

import asyncio
import sys
from pathlib import Path

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


PROJECT_ROOT = Path(__file__).resolve().parents[2]
API_SRC = PROJECT_ROOT / "api" / "src"

if str(API_SRC) not in sys.path:
    sys.path.insert(0, str(API_SRC))

from mz_ai_backend.core.config import get_settings


MIGRATIONS_DIR = Path(__file__).resolve().parent
SCHEMA_MIGRATIONS_SQL = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    UNIQUE KEY uk_schema_migrations_filename (filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
"""


async def apply_migrations(database_url: str | None = None) -> None:
    if database_url is None:
        settings = get_settings()
        database_url = settings.database_url

    if database_url is None:
        raise RuntimeError("Database is not configured.")

    engine = create_async_engine(database_url, pool_pre_ping=True, future=True)
    try:
        async with engine.begin() as connection:
            await connection.exec_driver_sql(SCHEMA_MIGRATIONS_SQL)
            result = await connection.execute(
                text("SELECT filename FROM schema_migrations")
            )
            applied_filenames = {row[0] for row in result}

            for migration_path in sorted(MIGRATIONS_DIR.glob("*.sql")):
                if migration_path.name in applied_filenames:
                    continue

                sql_script = migration_path.read_text(encoding="utf-8").strip()
                if not sql_script:
                    continue

                await connection.exec_driver_sql(sql_script)
                await connection.execute(
                    text(
                        "INSERT INTO schema_migrations (filename) VALUES (:filename)"
                    ),
                    {"filename": migration_path.name},
                )
    finally:
        await engine.dispose()


def main() -> None:
    asyncio.run(apply_migrations())


if __name__ == "__main__":
    main()
