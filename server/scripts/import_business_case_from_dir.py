"""Import one business-case directory into the configured backend database.

Usage checklist:
1. Ensure the backend `.env` points to the target database:
   - `MZ_AI_BACKEND_ENV=development`
   - `MZ_AI_BACKEND_DEVELOPMENT_DATABASE_URL=...`
2. Ensure CloudBase credentials are available in `.env`:
   - `MZ_AI_CASE_IMPORT_CLOUDBASE_ENV_ID=...`
   - `MZ_AI_CASE_IMPORT_CLOUDBASE_API_KEY=...`
   - Duplicate `case_id` recreation additionally requires either:
     - an existing `tcb login` session, or
     - `MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_API_KEY_ID=...`
     - `MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_API_KEY=...`
     - optional `MZ_AI_CASE_IMPORT_CLOUDBASE_CLI_TOKEN=...`
3. Ensure database schema migrations are already applied:
   - `uv run python api/migrations/run_sql_migrations.py`
4. Run the importer:
   - `uv run python scripts/import_business_case_from_dir.py --case-dir "<CASE_DIR>"`

Required `<CASE_DIR>` structure:
<CASE_DIR>/
  config.yml  (or config.yaml, exactly one of them)
  *.md        (markdown files referenced by config)
  assets/...  (optional local images referenced from markdown/config)

`config.yml` minimum shape:
case_id: case-05
title: 喜茶（HEYTEA）新茶饮高端品牌创业案例
desc: 从广东街头小店到估值600亿的新茶饮标杆，喜茶以产品创新驱动品类革命，在高端定位与规模扩张的张力中寻找属于自己的第三条路
cover: images\\cover\\image_01.png
industry: 消费
tags:
  - 新茶饮
  - 品牌溢价
  - 出海
  - 加盟模式
  - 健康消费
rework:
  file: rework.md
ai_driven_analysis:
  file: ai_driven_analysis.md
market:
  file: market_analysis_report.md

Notes:
- Every markdown file should contain one level-1 heading (`# Title`).
- Local image references in markdown are uploaded to CloudBase and rewritten.
- Duplicate `case_id` imports recreate the case: old database rows and
  referenced CloudBase assets are deleted before the new case is created.
"""

from __future__ import annotations

import argparse
import asyncio
import sys
from pathlib import Path

from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


PROJECT_ROOT = Path(__file__).resolve().parents[1]
API_SRC = PROJECT_ROOT / "api" / "src"

# Keep script imports independent from the package installation mode.
if str(API_SRC) not in sys.path:
    sys.path.insert(0, str(API_SRC))

from mz_ai_backend.core import get_settings
from mz_ai_backend.modules.business_cases.application import (
    CreateBusinessCaseUseCase,
)
from mz_ai_backend.modules.business_cases.infrastructure import (
    SqlAlchemyBusinessCaseRepository,
    SystemCurrentTimeProvider,
)
from mz_ai_backend.modules.business_cases.infrastructure.importing import (
    BusinessCaseDirectoryImporter,
    CaseImportCloudBaseSettings,
    CloudBaseStorageClient,
)
from mz_ai_backend.shared import get_snowflake_generator


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments for the case directory importer."""

    parser = argparse.ArgumentParser(
        description="Import one local business case directory into the backend."
    )
    parser.add_argument(
        "--case-dir",
        required=True,
        help="Absolute or relative path to one case directory.",
    )
    return parser.parse_args(argv)


async def run_import(*, case_dir: Path) -> int:
    # Use runtime settings so the script follows the same database target as the API.
    settings = get_settings()
    if settings.database_url is None:
        raise RuntimeError("Database is not configured.")

    # Build one async SQLAlchemy session and wire the importer dependencies explicitly.
    cloudbase_settings = CaseImportCloudBaseSettings.from_env()
    engine = create_async_engine(settings.database_url, pool_pre_ping=True, future=True)
    session_maker = async_sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)

    try:
        async with session_maker() as session:
            repository = SqlAlchemyBusinessCaseRepository(session=session)
            current_time_provider = SystemCurrentTimeProvider()
            snowflake_id_generator = get_snowflake_generator(
                worker_id=settings.snowflake_worker_id,
                datacenter_id=settings.snowflake_datacenter_id,
            )
            create_use_case = CreateBusinessCaseUseCase(
                business_case_repository=repository,
                snowflake_id_generator=snowflake_id_generator,
                current_time_provider=current_time_provider,
            )
            importer = BusinessCaseDirectoryImporter(
                business_case_repository=repository,
                create_use_case=create_use_case,
                asset_manager=CloudBaseStorageClient(settings=cloudbase_settings),
            )
            # Import one case directory by recreating any existing case_id first.
            result = await importer.import_case(case_dir=case_dir.resolve())
    finally:
        await engine.dispose()

    print(
        "Imported business case "
        f"{result.case_id} ({result.title}) with {result.uploaded_asset_count} uploaded assets."
    )
    return 0


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    case_dir = Path(args.case_dir)
    if not case_dir.is_dir():
        raise RuntimeError(f"Case directory '{case_dir}' does not exist.")
    return asyncio.run(run_import(case_dir=case_dir))


if __name__ == "__main__":
    raise SystemExit(main())
