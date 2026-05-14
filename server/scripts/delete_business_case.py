"""Delete one business case from the configured backend database and COS.

Usage checklist:
1. Ensure the backend `.env` points to the target database:
   - `MZ_AI_BACKEND_ENV=development`
   - `MZ_AI_BACKEND_DEVELOPMENT_DATABASE_URL=...`
2. Ensure Tencent Cloud COS credentials are available in `.env`:
   - `MZ_AI_CASE_IMPORT_COS_APP_ID=...`
   - `MZ_AI_CASE_IMPORT_COS_REGION=...`
   - `MZ_AI_CASE_IMPORT_COS_SECRET_ID=...`
   - `MZ_AI_CASE_IMPORT_COS_SECRET_KEY=...`
   - optional `MZ_AI_CASE_IMPORT_COS_BUCKET_NAME=weelume-pro`
3. Run the deleter:
   - `uv run python scripts/delete_business_case.py --case-id "case-05"`

Notes:
- The script deletes the whole `business-cases/{case_id}` COS directory.
- The script physically deletes the matching database rows.
- The script raises an error when the target `case_id` does not exist.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


PROJECT_ROOT = Path(__file__).resolve().parents[1]
API_SRC = PROJECT_ROOT / "api" / "src"

if str(API_SRC) not in sys.path:
    sys.path.insert(0, str(API_SRC))

from mz_ai_backend.core import get_settings
from mz_ai_backend.modules.business_cases.infrastructure import (
    SqlAlchemyBusinessCaseRepository,
)
from mz_ai_backend.modules.business_cases.infrastructure.importing import (
    CosStorageClient,
    CosStorageSettings,
)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments for deleting one business case."""

    parser = argparse.ArgumentParser(
        description="Delete one business case from the backend and COS."
    )
    parser.add_argument(
        "--case-id",
        required=True,
        help="The business case id to delete.",
    )
    return parser.parse_args(argv)


async def run_delete(*, case_id: str) -> int:
    normalized_case_id = _normalize_case_id(case_id)
    settings = get_settings()
    if settings.database_url is None:
        raise RuntimeError("Database is not configured.")

    cos_settings = CosStorageSettings.from_env()
    engine = create_async_engine(settings.database_url, pool_pre_ping=True, future=True)
    session_maker = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)

    try:
        async with session_maker() as session:
            repository = SqlAlchemyBusinessCaseRepository(session=session)
            existing_case = await repository.get_by_case_id(normalized_case_id)
            if existing_case is None:
                raise RuntimeError(
                    f"Business case '{normalized_case_id}' does not exist."
                )

            CosStorageClient(settings=cos_settings).delete_directory(
                cloud_directory=_build_case_cloud_directory(normalized_case_id)
            )
            deleted = await repository.hard_delete_by_case_id(normalized_case_id)
            if not deleted:
                raise RuntimeError(
                    f"Business case '{normalized_case_id}' disappeared before deletion."
                )
    finally:
        await engine.dispose()

    print(f"Deleted business case {normalized_case_id}.")
    return 0


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    return asyncio.run(run_delete(case_id=args.case_id))


def _normalize_case_id(case_id: str) -> str:
    normalized_case_id = case_id.strip()
    if normalized_case_id == "":
        raise RuntimeError("case_id must not be blank.")
    return normalized_case_id


def _build_case_cloud_directory(case_id: str) -> str:
    return f"business-cases/{case_id}"


if __name__ == "__main__":
    raise SystemExit(main())
