PRAGMA user_version = 1;

CREATE TABLE IF NOT EXISTS material_entries (
    post_id            TEXT PRIMARY KEY,
    post_id_source     TEXT NOT NULL,
    share_url          TEXT NOT NULL,
    share_text         TEXT NOT NULL,
    caption            TEXT NOT NULL,
    author_handle      TEXT NOT NULL,
    author_display_name TEXT,
    hashtags           TEXT NOT NULL,
    music_id           TEXT,
    music_title        TEXT,
    like_count         INTEGER NOT NULL,
    comment_count      INTEGER NOT NULL,
    share_count        INTEGER NOT NULL,
    collect_count      INTEGER NOT NULL DEFAULT -1,
    captured_at        TEXT NOT NULL,
    captured_by_device TEXT NOT NULL,
    note_type          TEXT NOT NULL DEFAULT 'video',
    comments_json      TEXT
);

CREATE INDEX IF NOT EXISTS idx_entries_captured_at
    ON material_entries(captured_at);

CREATE INDEX IF NOT EXISTS idx_entries_author
    ON material_entries(author_handle);

CREATE TABLE IF NOT EXISTS wizard_state (
    device_id      TEXT PRIMARY KEY,
    completed_at   TEXT NOT NULL,
    schema_version TEXT NOT NULL DEFAULT '1'
);

-- 004 (网页素材采集 — 关键词驱动批量采集) introduces three additional tables in
-- this same library.db file: `keywords`, `keyword_batches`, `keyword_runs`.
-- Those tables are owned exclusively by the Node-side utility process
-- (frontend/src/utility/keyword-crawl/domain/library.ts) which creates them
-- defensively via idempotent `CREATE TABLE IF NOT EXISTS` on first boot.
-- Python (002 CLI) does NOT read or write those tables; no DDL is added here
-- to avoid coupling the Python side to schema it never touches. See
-- specs/004-douyin-keyword-crawl/data-model.md for full DDL & rationale.
