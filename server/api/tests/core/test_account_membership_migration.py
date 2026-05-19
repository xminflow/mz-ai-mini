from __future__ import annotations

from pathlib import Path


MIGRATION = Path(__file__).resolve().parents[2] / "migrations" / "0017_add_account_membership.sql"


def test_account_membership_migration_adds_account_snapshot_columns() -> None:
    sql = MIGRATION.read_text(encoding="utf-8")

    assert "ADD COLUMN IF NOT EXISTS membership_tier" in sql
    assert "ADD COLUMN IF NOT EXISTS membership_started_at" in sql
    assert "ADD COLUMN IF NOT EXISTS membership_expires_at" in sql


def test_account_membership_migration_creates_order_table_and_indexes() -> None:
    sql = MIGRATION.read_text(encoding="utf-8")

    assert "CREATE TABLE IF NOT EXISTS account_membership_orders" in sql
    assert "order_no VARCHAR(32) NOT NULL UNIQUE" in sql
    assert "CREATE UNIQUE INDEX IF NOT EXISTS uk_account_membership_orders_transaction_id" in sql
    assert "idx_account_membership_orders_account_id" in sql
