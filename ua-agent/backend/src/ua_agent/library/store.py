from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from ua_agent.contracts.capture import MaterialEntry, PostIdSource
from ua_agent.contracts.library import LibraryListFilters

from .paths import library_db_path

_SCHEMA_FILE = Path(__file__).with_name("schema.sql")


@dataclass(frozen=True)
class WizardCompletion:
    device_id: str
    completed_at: str
    schema_version: str


def open_store(db_path: Path | None = None) -> sqlite3.Connection:
    """Open (or create) the library SQLite store and apply the schema.

    Enables WAL journaling and foreign keys, and runs schema.sql idempotently.
    """
    target = db_path if db_path is not None else library_db_path()
    target.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(target))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    conn.executescript(_SCHEMA_FILE.read_text(encoding="utf-8"))
    # Idempotent migration for installations created before collect_count
    # existed. ALTER TABLE ADD COLUMN raises OperationalError("duplicate
    # column name") on rerun; swallow that specific case but propagate
    # anything else so genuine schema drift surfaces.
    try:
        conn.execute(
            "ALTER TABLE material_entries ADD COLUMN collect_count INTEGER NOT NULL DEFAULT -1"
        )
    except sqlite3.OperationalError as exc:
        if "duplicate column name" not in str(exc).lower():
            raise
    try:
        conn.execute(
            "ALTER TABLE material_entries ADD COLUMN note_type TEXT NOT NULL DEFAULT 'video'"
        )
    except sqlite3.OperationalError as exc:
        if "duplicate column name" not in str(exc).lower():
            raise
    conn.commit()
    return conn


def get_wizard_completion(
    conn: sqlite3.Connection, device_id: str
) -> WizardCompletion | None:
    row = conn.execute(
        "SELECT device_id, completed_at, schema_version FROM wizard_state WHERE device_id = ?",
        (device_id,),
    ).fetchone()
    if row is None:
        return None
    return WizardCompletion(
        device_id=str(row["device_id"]),
        completed_at=str(row["completed_at"]),
        schema_version=str(row["schema_version"]),
    )


def upsert_wizard_completion(
    conn: sqlite3.Connection, device_id: str, completed_at_iso: str
) -> None:
    conn.execute(
        """
        INSERT INTO wizard_state (device_id, completed_at, schema_version)
        VALUES (?, ?, '1')
        ON CONFLICT(device_id) DO UPDATE SET completed_at = excluded.completed_at
        """,
        (device_id, completed_at_iso),
    )
    conn.commit()


def insert_material_entry(
    conn: sqlite3.Connection, entry: MaterialEntry
) -> Literal["inserted", "duplicate"]:
    cur = conn.execute(
        """
        INSERT INTO material_entries (
            post_id, post_id_source, share_url, share_text, caption,
            author_handle, author_display_name, hashtags, music_id, music_title,
            like_count, comment_count, share_count, collect_count,
            captured_at, captured_by_device, note_type
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(post_id) DO NOTHING
        """,
        (
            entry.post_id,
            entry.post_id_source,
            entry.share_url,
            entry.share_text,
            entry.caption,
            entry.author_handle,
            entry.author_display_name,
            json.dumps(entry.hashtags, ensure_ascii=False),
            entry.music_id,
            entry.music_title,
            entry.like_count,
            entry.comment_count,
            entry.share_count,
            entry.collect_count,
            entry.captured_at,
            entry.captured_by_device,
            entry.note_type,
        ),
    )
    conn.commit()
    return "inserted" if cur.rowcount == 1 else "duplicate"


def _row_to_material_entry(row: sqlite3.Row) -> MaterialEntry:
    raw_hashtags = row["hashtags"]
    hashtags: list[str] = []
    try:
        loaded: object = json.loads(raw_hashtags) if raw_hashtags else []
    except json.JSONDecodeError:
        loaded = []
    if isinstance(loaded, list):
        loaded_typed: list[object] = loaded  # type: ignore[assignment]
        hashtags = [str(h) for h in loaded_typed]
    return MaterialEntry(
        post_id=str(row["post_id"]),
        post_id_source=str(row["post_id_source"]),  # type: ignore[arg-type]
        share_url=str(row["share_url"]),
        share_text=str(row["share_text"]),
        caption=str(row["caption"]),
        author_handle=str(row["author_handle"]),
        author_display_name=(
            str(row["author_display_name"]) if row["author_display_name"] is not None else None
        ),
        hashtags=hashtags,
        music_id=str(row["music_id"]) if row["music_id"] is not None else None,
        music_title=str(row["music_title"]) if row["music_title"] is not None else None,
        like_count=int(row["like_count"]),
        comment_count=int(row["comment_count"]),
        share_count=int(row["share_count"]),
        collect_count=int(row["collect_count"]) if "collect_count" in row.keys() else -1,
        captured_at=str(row["captured_at"]),
        captured_by_device=str(row["captured_by_device"]),
        note_type=(
            str(row["note_type"]) if "note_type" in row.keys() and row["note_type"] is not None else "video"  # type: ignore[arg-type]
        ),
    )


def get_material_entry(
    conn: sqlite3.Connection, post_id: str
) -> MaterialEntry | None:
    row = conn.execute(
        "SELECT * FROM material_entries WHERE post_id = ?", (post_id,)
    ).fetchone()
    if row is None:
        return None
    return _row_to_material_entry(row)


def list_material_entries(
    conn: sqlite3.Connection, filters: LibraryListFilters
) -> tuple[list[MaterialEntry], int, int]:
    """Return `(page, total_for_filter, library_total)`."""
    where_parts: list[str] = []
    params: list[object] = []
    if filters.from_ is not None:
        where_parts.append("captured_at >= ?")
        params.append(filters.from_)
    if filters.to is not None:
        where_parts.append("captured_at <= ?")
        params.append(filters.to)
    if filters.author is not None:
        where_parts.append("author_handle = ?")
        params.append(filters.author)

    where_clause = (" WHERE " + " AND ".join(where_parts)) if where_parts else ""

    library_total_row = conn.execute(
        "SELECT COUNT(*) AS n FROM material_entries"
    ).fetchone()
    library_total = int(library_total_row["n"])

    total_row = conn.execute(
        f"SELECT COUNT(*) AS n FROM material_entries{where_clause}", tuple(params)
    ).fetchone()
    total = int(total_row["n"])

    page_rows = conn.execute(
        f"""
        SELECT * FROM material_entries
        {where_clause}
        ORDER BY captured_at DESC
        LIMIT ? OFFSET ?
        """,
        (*params, filters.limit, filters.offset),
    ).fetchall()
    page: list[MaterialEntry] = [_row_to_material_entry(r) for r in page_rows]
    return page, total, library_total


def delete_material_entry(conn: sqlite3.Connection, post_id: str) -> bool:
    cur = conn.execute(
        "DELETE FROM material_entries WHERE post_id = ?", (post_id,)
    )
    conn.commit()
    return cur.rowcount > 0


__all__ = [
    "WizardCompletion",
    "open_store",
    "get_wizard_completion",
    "upsert_wizard_completion",
    "insert_material_entry",
    "get_material_entry",
    "list_material_entries",
    "delete_material_entry",
    "PostIdSource",
]
