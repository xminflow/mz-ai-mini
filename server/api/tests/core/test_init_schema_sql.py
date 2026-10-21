from __future__ import annotations

from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[3]
MIGRATIONS_DIR = PROJECT_ROOT / "api" / "migrations"
INIT_SCHEMA_SQL = PROJECT_ROOT / "docker" / "postgres" / "init" / "0002_init_schema.sql"


def test_init_schema_marks_all_existing_migrations_as_applied() -> None:
    init_schema_sql = INIT_SCHEMA_SQL.read_text(encoding="utf-8")
    migration_filenames = sorted(path.name for path in MIGRATIONS_DIR.glob("*.sql"))

    assert migration_filenames
    for migration_filename in migration_filenames:
        assert f"'{migration_filename}'" in init_schema_sql


def test_init_schema_keeps_business_case_documents_at_current_shape() -> None:
    init_schema_sql = INIT_SCHEMA_SQL.read_text(encoding="utf-8")
    documents_table_sql = init_schema_sql.split(
        "CREATE TABLE IF NOT EXISTS business_case_documents",
        maxsplit=1,
    )[1].split(
        "CREATE INDEX IF NOT EXISTS idx_business_case_documents_case_id",
        maxsplit=1,
    )[0]

    assert "cover_image_url" not in documents_table_sql
    assert "case_id VARCHAR(128) NOT NULL" in documents_table_sql


def test_init_schema_contains_current_membership_and_submission_schema() -> None:
    sql = INIT_SCHEMA_SQL.read_text(encoding="utf-8")
    for table in (
        "account_membership_orders", "blogger_insights", "track_analyses",
        "member_submissions", "camp_accounts", "camp_membership_orders",
    ):
        assert f"CREATE TABLE IF NOT EXISTS {table} (" in sql
    assert "CREATE UNIQUE INDEX IF NOT EXISTS uk_member_submissions_active" not in sql
    assert "avatar_url TEXT NULL" in sql
    assert "DELETE FROM blogger_insights" not in sql
    assert "SET membership_tier = 'premium'" not in sql
