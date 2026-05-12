/**
 * better-sqlite3 wrapper for the shared `material_entries` table (002 schema)
 * plus 004's three Node-owned tables (`keywords`, `keyword_batches`,
 * `keyword_runs`). The DDL is idempotent (`CREATE TABLE IF NOT EXISTS`); both
 * the Python (002) and Node (004) sides may open the file first.
 *
 * See specs/004-douyin-keyword-crawl/data-model.md for full schema rationale.
 */

import fs from "node:fs";
import path from "node:path";

import type {
  Blogger,
  BloggerStatus,
  BloggerVideoSample,
} from "@/shared/contracts/blogger";
import { bloggerSchema, bloggerVideoSampleSchema } from "@/shared/contracts/blogger";
import type { CommentItem, MaterialEntry, Platform } from "@/shared/contracts/capture";
import { commentItemSchema, materialEntrySchema } from "@/shared/contracts/capture";

import { libraryDbPath } from "../infra/paths";

export type InsertOutcome =
  | { kind: "inserted"; entry: MaterialEntry }
  | { kind: "duplicate" };

export interface ListFilters {
  from: string | null;
  to: string | null;
  author: string | null;
  platform: Platform | null;
  limit: number;
  offset: number;
}

export interface ListPage {
  entries: MaterialEntry[];
  total: number;
  libraryTotal: number;
}

export interface KeywordBatchRow {
  id: string;
  /** 006 — Platform of this batch ("douyin" | "xiaohongshu"). */
  platform: Platform;
  status: "running" | "done" | "stopped" | "error";
  stop_reason: string | null;
  started_at: string;
  ended_at: string | null;
  selected_keyword_ids: string[];
  executed_keyword_ids: string[];
  cancelled_keyword_ids: string[];
  /** 1-decimal-precision likes/follower threshold the batch was started with. 0 = filter disabled. */
  min_like_follower_ratio: number;
}

export interface KeywordRunRow {
  id: string;
  /** 006 — Platform of this run; equals parent batch's platform. */
  platform: Platform;
  batch_id: string;
  keyword_id: string;
  keyword_text_snapshot: string;
  metric_filter_mode: "none" | "ratio" | "author_metrics";
  min_like_follower_ratio_snapshot: number;
  publish_time_range: "all" | "day" | "week" | "half_year";
  author_follower_count_op: "gte" | "lte" | null;
  author_follower_count_value: number | null;
  like_count_op: "gte" | "lte" | null;
  like_count_value: number | null;
  status: "running" | "done" | "stopped" | "error";
  stop_reason: string | null;
  started_at: string;
  ended_at: string | null;
  scanned_count: number;
  captured_count: number;
  duplicate_count: number;
  error_count: number;
  filtered_count: number;
  representative_errors: string[];
}

export type KeywordBatchPatch = Partial<Omit<KeywordBatchRow, "id">>;
export type KeywordRunPatch = Partial<Omit<KeywordRunRow, "id">>;

interface RawRow {
  post_id: string;
  post_id_source: string;
  share_url: string;
  share_text: string;
  caption: string;
  author_handle: string;
  author_display_name: string | null;
  hashtags: string;
  music_id: string | null;
  music_title: string | null;
  like_count: number;
  comment_count: number;
  share_count: number;
  collect_count: number;
  author_follower_count: number | null;
  captured_at: string;
  captured_by_device: string;
  note_type: string | null;
  platform: string | null;
  media_kind: string | null;
  image_urls: string | null;
  comments_json: string | null;
  transcript: string | null;
  transcribed_at: string | null;
}

function rowToMaterialEntry(row: RawRow): MaterialEntry {
  let hashtags: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.hashtags);
    if (Array.isArray(parsed)) {
      hashtags = parsed.filter((s): s is string => typeof s === "string");
    }
  } catch {
    /* legacy rows may store a non-JSON value; treat as empty */
  }
  let imageUrls: string[] | null = null;
  if (row.image_urls !== null && row.image_urls !== undefined && row.image_urls.length > 0) {
    try {
      const parsed: unknown = JSON.parse(row.image_urls);
      if (Array.isArray(parsed)) {
        imageUrls = parsed.filter((s): s is string => typeof s === "string");
      }
    } catch {
      /* malformed JSON — drop to null per FR-034 */
    }
  }
  let comments: CommentItem[] = [];
  if (row.comments_json !== null && row.comments_json !== undefined && row.comments_json.length > 0) {
    try {
      const parsed: unknown = JSON.parse(row.comments_json);
      if (Array.isArray(parsed)) {
        for (const raw of parsed) {
          const ok = commentItemSchema.safeParse(raw);
          if (ok.success) comments.push(ok.data);
          if (comments.length >= 10) break;
        }
      }
    } catch {
      /* malformed JSON — treat as no comments */
      comments = [];
    }
  }
  const platform: Platform =
    row.platform === "xiaohongshu" ? "xiaohongshu" : "douyin";
  const mediaKind: "video" | "images" | "mixed" =
    row.media_kind === "images" || row.media_kind === "mixed"
      ? row.media_kind
      : "video";
  const candidate = {
    post_id: row.post_id,
    post_id_source: row.post_id_source,
    share_url: row.share_url,
    share_text: row.share_text,
    caption: row.caption,
    author_handle: row.author_handle,
    author_display_name: row.author_display_name,
    hashtags,
    music_id: row.music_id,
    music_title: row.music_title,
    like_count: Number(row.like_count),
    comment_count: Number(row.comment_count),
    share_count: Number(row.share_count),
    collect_count: Number(row.collect_count ?? -1),
    author_follower_count:
      row.author_follower_count === null || row.author_follower_count === undefined
        ? null
        : Number(row.author_follower_count),
    captured_at: row.captured_at,
    captured_by_device: row.captured_by_device,
    note_type:
      row.note_type === "image_text" ? "image_text" : "video",
    platform,
    media_kind: mediaKind,
    image_urls: imageUrls,
    comments,
    transcript: row.transcript ?? null,
    transcribed_at: row.transcribed_at ?? null,
  };
  return materialEntrySchema.parse(candidate);
}

interface BetterSqliteStatement {
  run: (...params: unknown[]) => { changes: number };
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
}

interface BetterSqliteDatabase {
  prepare: (sql: string) => BetterSqliteStatement;
  exec: (sql: string) => void;
  pragma: (s: string) => unknown;
  close: () => void;
}

const LEGACY_DDL = `
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
    author_follower_count INTEGER,
    captured_at        TEXT NOT NULL,
    captured_by_device TEXT NOT NULL,
    platform           TEXT NOT NULL DEFAULT 'douyin',
    media_kind         TEXT NOT NULL DEFAULT 'video',
    image_urls         TEXT
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
`;

const KEYWORD_DDL = `
CREATE TABLE IF NOT EXISTS keywords (
    id                       TEXT PRIMARY KEY,
    platform                 TEXT NOT NULL DEFAULT 'douyin',
    text                     TEXT NOT NULL,
    position                 INTEGER NOT NULL DEFAULT 0,
    enabled                  INTEGER NOT NULL DEFAULT 1,
    target_cap               INTEGER NOT NULL DEFAULT 10,
    health_cap               INTEGER NOT NULL DEFAULT 500,
    metric_filter_mode       TEXT NOT NULL DEFAULT 'ratio',
    min_like_follower_ratio  REAL NOT NULL DEFAULT 1,
    publish_time_range       TEXT NOT NULL DEFAULT 'all',
    author_follower_count_op TEXT,
    author_follower_count_value INTEGER,
    like_count_op            TEXT,
    like_count_value         INTEGER,
    created_at               TEXT NOT NULL,
    updated_at               TEXT NOT NULL
);

-- 006 — per-platform unique index (FR-005: same text in different
-- platforms = two distinct rows) is NOT created here, because on a
-- pre-006 DB the platform column does not exist yet at this point in
-- bootstrap (the ALTER TABLE that adds it runs in the migrations block
-- below). The DROP-old + CREATE-new swap happens after the migrations.

CREATE INDEX IF NOT EXISTS idx_keywords_position
    ON keywords(position);

CREATE TABLE IF NOT EXISTS keyword_batches (
    id                       TEXT PRIMARY KEY,
    platform                 TEXT NOT NULL DEFAULT 'douyin',
    status                   TEXT NOT NULL CHECK (status IN ('running','done','stopped','error')),
    stop_reason              TEXT,
    started_at               TEXT NOT NULL,
    ended_at                 TEXT,
    selected_keyword_ids     TEXT NOT NULL,
    executed_keyword_ids     TEXT NOT NULL,
    cancelled_keyword_ids    TEXT NOT NULL,
    min_like_follower_ratio  REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_keyword_batches_started_at
    ON keyword_batches(started_at);

CREATE TABLE IF NOT EXISTS keyword_runs (
    id                       TEXT PRIMARY KEY,
    platform                 TEXT NOT NULL DEFAULT 'douyin',
    batch_id                 TEXT NOT NULL,
    keyword_id               TEXT NOT NULL,
    keyword_text_snapshot    TEXT NOT NULL,
    metric_filter_mode       TEXT NOT NULL DEFAULT 'none',
    min_like_follower_ratio_snapshot REAL NOT NULL DEFAULT 0,
    publish_time_range       TEXT NOT NULL DEFAULT 'all',
    author_follower_count_op TEXT,
    author_follower_count_value INTEGER,
    like_count_op            TEXT,
    like_count_value         INTEGER,
    status                   TEXT NOT NULL CHECK (status IN ('running','done','stopped','error')),
    stop_reason              TEXT,
    started_at               TEXT NOT NULL,
    ended_at                 TEXT,
    scanned_count            INTEGER NOT NULL DEFAULT 0,
    captured_count           INTEGER NOT NULL DEFAULT 0,
    duplicate_count          INTEGER NOT NULL DEFAULT 0,
    error_count              INTEGER NOT NULL DEFAULT 0,
    filtered_count           INTEGER NOT NULL DEFAULT 0,
    representative_errors    TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_keyword_runs_batch_id
    ON keyword_runs(batch_id);

CREATE INDEX IF NOT EXISTS idx_keyword_runs_keyword_id
    ON keyword_runs(keyword_id);

CREATE INDEX IF NOT EXISTS idx_keyword_runs_started_at
    ON keyword_runs(started_at);
`;

// 博主分析 — Douyin blogger profile capture + works sampling. Two new tables
// owned by the Node-side utility (library.db). Uses the same idempotent
// `IF NOT EXISTS` pattern as KEYWORD_DDL above.
const BLOGGER_DDL = `
CREATE TABLE IF NOT EXISTS bloggers (
    id                     TEXT PRIMARY KEY,
    platform               TEXT NOT NULL DEFAULT 'douyin',
    profile_url            TEXT NOT NULL,
    sec_uid                TEXT,
    douyin_id              TEXT,
    display_name           TEXT,
    avatar_url             TEXT,
    follow_count           INTEGER,
    fans_count             INTEGER,
    liked_count            INTEGER,
    signature              TEXT,
    raw_profile_json       TEXT,
    status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','profile_ready','sampled','error')),
    last_error             TEXT,
    profile_captured_at    TEXT,
    sampled_at             TEXT,
    total_works_at_sample  INTEGER,
    created_at             TEXT NOT NULL,
    updated_at             TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bloggers_platform_url
    ON bloggers(platform, profile_url);

CREATE INDEX IF NOT EXISTS idx_bloggers_created_at
    ON bloggers(created_at);

CREATE TABLE IF NOT EXISTS blogger_video_samples (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    blogger_id    TEXT NOT NULL,
    position      INTEGER NOT NULL,
    video_url     TEXT NOT NULL,
    title         TEXT,
    source_index  INTEGER,
    sampled_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blogger_video_samples_blogger
    ON blogger_video_samples(blogger_id, position);
`;

function jsonArrayToStrings(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

function castStatus(s: unknown): "running" | "done" | "stopped" | "error" {
  if (s === "running" || s === "done" || s === "stopped" || s === "error") return s;
  return "error";
}

export class LibraryStore {
  private db: BetterSqliteDatabase;

  constructor(db: BetterSqliteDatabase) {
    this.db = db;
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 2000");
    db.exec(LEGACY_DDL);
    db.exec(KEYWORD_DDL);
    db.exec(BLOGGER_DDL);
    // Idempotent ALTER TABLE migrations for installations created before
    // each column existed. ALTER TABLE ADD COLUMN throws "duplicate column"
    // on rerun; swallow that specific case but propagate anything else.
    const migrations: { table: string; column: string; sql: string }[] = [
      {
        table: "material_entries",
        column: "collect_count",
        sql: "ALTER TABLE material_entries ADD COLUMN collect_count INTEGER NOT NULL DEFAULT -1",
      },
      {
        table: "material_entries",
        column: "author_follower_count",
        sql: "ALTER TABLE material_entries ADD COLUMN author_follower_count INTEGER",
      },
      {
        table: "keyword_batches",
        column: "min_like_follower_ratio",
        sql: "ALTER TABLE keyword_batches ADD COLUMN min_like_follower_ratio REAL NOT NULL DEFAULT 0",
      },
      {
        table: "keyword_runs",
        column: "filtered_count",
        sql: "ALTER TABLE keyword_runs ADD COLUMN filtered_count INTEGER NOT NULL DEFAULT 0",
      },
      {
        table: "keywords",
        column: "enabled",
        sql: "ALTER TABLE keywords ADD COLUMN enabled INTEGER NOT NULL DEFAULT 1",
      },
      {
        table: "keywords",
        column: "target_cap",
        sql: "ALTER TABLE keywords ADD COLUMN target_cap INTEGER NOT NULL DEFAULT 10",
      },
      {
        table: "keywords",
        column: "health_cap",
        sql: "ALTER TABLE keywords ADD COLUMN health_cap INTEGER NOT NULL DEFAULT 500",
      },
      {
        table: "keywords",
        column: "min_like_follower_ratio",
        sql: "ALTER TABLE keywords ADD COLUMN min_like_follower_ratio REAL NOT NULL DEFAULT 1",
      },
      {
        table: "keywords",
        column: "metric_filter_mode",
        sql: "ALTER TABLE keywords ADD COLUMN metric_filter_mode TEXT NOT NULL DEFAULT 'ratio'",
      },
      {
        table: "keywords",
        column: "publish_time_range",
        sql: "ALTER TABLE keywords ADD COLUMN publish_time_range TEXT NOT NULL DEFAULT 'all'",
      },
      {
        table: "keywords",
        column: "author_follower_count_op",
        sql: "ALTER TABLE keywords ADD COLUMN author_follower_count_op TEXT",
      },
      {
        table: "keywords",
        column: "author_follower_count_value",
        sql: "ALTER TABLE keywords ADD COLUMN author_follower_count_value INTEGER",
      },
      {
        table: "keywords",
        column: "like_count_op",
        sql: "ALTER TABLE keywords ADD COLUMN like_count_op TEXT",
      },
      {
        table: "keywords",
        column: "like_count_value",
        sql: "ALTER TABLE keywords ADD COLUMN like_count_value INTEGER",
      },
      {
        table: "material_entries",
        column: "note_type",
        sql: "ALTER TABLE material_entries ADD COLUMN note_type TEXT NOT NULL DEFAULT 'video'",
      },
      // 006 — multi-platform: keywords / keyword_batches / keyword_runs +
      // material_entries gain `platform`; material_entries also gains
      // media_kind / image_urls. All non-destructive ALTER + DEFAULT 'douyin'
      // backfills 002 / 004 historical rows.
      {
        table: "keywords",
        column: "platform",
        sql: "ALTER TABLE keywords ADD COLUMN platform TEXT NOT NULL DEFAULT 'douyin'",
      },
      {
        table: "keyword_batches",
        column: "platform",
        sql: "ALTER TABLE keyword_batches ADD COLUMN platform TEXT NOT NULL DEFAULT 'douyin'",
      },
      {
        table: "keyword_runs",
        column: "platform",
        sql: "ALTER TABLE keyword_runs ADD COLUMN platform TEXT NOT NULL DEFAULT 'douyin'",
      },
      {
        table: "keyword_runs",
        column: "metric_filter_mode",
        sql: "ALTER TABLE keyword_runs ADD COLUMN metric_filter_mode TEXT NOT NULL DEFAULT 'none'",
      },
      {
        table: "keyword_runs",
        column: "min_like_follower_ratio_snapshot",
        sql: "ALTER TABLE keyword_runs ADD COLUMN min_like_follower_ratio_snapshot REAL NOT NULL DEFAULT 0",
      },
      {
        table: "keyword_runs",
        column: "publish_time_range",
        sql: "ALTER TABLE keyword_runs ADD COLUMN publish_time_range TEXT NOT NULL DEFAULT 'all'",
      },
      {
        table: "keyword_runs",
        column: "author_follower_count_op",
        sql: "ALTER TABLE keyword_runs ADD COLUMN author_follower_count_op TEXT",
      },
      {
        table: "keyword_runs",
        column: "author_follower_count_value",
        sql: "ALTER TABLE keyword_runs ADD COLUMN author_follower_count_value INTEGER",
      },
      {
        table: "keyword_runs",
        column: "like_count_op",
        sql: "ALTER TABLE keyword_runs ADD COLUMN like_count_op TEXT",
      },
      {
        table: "keyword_runs",
        column: "like_count_value",
        sql: "ALTER TABLE keyword_runs ADD COLUMN like_count_value INTEGER",
      },
      {
        table: "material_entries",
        column: "platform",
        sql: "ALTER TABLE material_entries ADD COLUMN platform TEXT NOT NULL DEFAULT 'douyin'",
      },
      {
        table: "material_entries",
        column: "media_kind",
        sql: "ALTER TABLE material_entries ADD COLUMN media_kind TEXT NOT NULL DEFAULT 'video'",
      },
      {
        table: "material_entries",
        column: "image_urls",
        sql: "ALTER TABLE material_entries ADD COLUMN image_urls TEXT",
      },
      // 006-2 — XHS top-10 comment capture. Nullable JSON blob; legacy rows
      // remain NULL and the read path treats them as `comments: []`.
      {
        table: "material_entries",
        column: "comments_json",
        sql: "ALTER TABLE material_entries ADD COLUMN comments_json TEXT",
      },
      // 006-3 — Whisper turbo 视频文案提取. Both columns NULL until the user
      // clicks 「提取文案」 on a row; populated by transcript-extract IPC.
      {
        table: "material_entries",
        column: "transcript",
        sql: "ALTER TABLE material_entries ADD COLUMN transcript TEXT",
      },
      {
        table: "material_entries",
        column: "transcribed_at",
        sql: "ALTER TABLE material_entries ADD COLUMN transcribed_at TEXT",
      },
      // 博主分析 analyze pipeline — per-sample transcript + 4-frame screenshots.
      // All nullable; older rows (sampled before this feature) read as null/[].
      {
        table: "blogger_video_samples",
        column: "transcript",
        sql: "ALTER TABLE blogger_video_samples ADD COLUMN transcript TEXT",
      },
      {
        table: "blogger_video_samples",
        column: "transcript_lang",
        sql: "ALTER TABLE blogger_video_samples ADD COLUMN transcript_lang TEXT",
      },
      {
        table: "blogger_video_samples",
        column: "frames_json",
        sql: "ALTER TABLE blogger_video_samples ADD COLUMN frames_json TEXT",
      },
      {
        table: "blogger_video_samples",
        column: "analyzed_at",
        sql: "ALTER TABLE blogger_video_samples ADD COLUMN analyzed_at TEXT",
      },
      {
        table: "blogger_video_samples",
        column: "analyze_error",
        sql: "ALTER TABLE blogger_video_samples ADD COLUMN analyze_error TEXT",
      },
    ];
    for (const mig of migrations) {
      try {
        db.exec(mig.sql);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!/duplicate column name/i.test(msg)) throw err;
      }
    }
    // 006 — swap the keywords uniqueness index from (LOWER(text)) to
    // (platform, LOWER(text)). Old DBs may still have the legacy index.
    // Both DROP + CREATE are guarded with IF EXISTS / IF NOT EXISTS, so
    // the swap is idempotent across re-runs.
    try {
      db.exec("DROP INDEX IF EXISTS idx_keywords_normalized_text");
      db.exec(
        "CREATE UNIQUE INDEX IF NOT EXISTS idx_keywords_platform_normalized_text ON keywords(platform, LOWER(text))",
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // The CREATE UNIQUE INDEX can fail if a legacy DB has cross-platform
      // duplicates of the same text under platform='douyin' (it shouldn't,
      // since the legacy index already enforced global uniqueness). Surface
      // anything unexpected; swallow only the benign "already exists".
      if (!/already exists/i.test(msg)) throw err;
    }
  }

  static open(dbPath?: string): LibraryStore {
    const target = dbPath ?? libraryDbPath();
    fs.mkdirSync(path.dirname(target), { recursive: true });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3") as new (
      filename: string,
    ) => BetterSqliteDatabase;
    return new LibraryStore(new Database(target));
  }

  /** lower-level handle, used by `keywordsStore.ts`. */
  raw(): BetterSqliteDatabase {
    return this.db;
  }

  // ─── material_entries (lifted from 003) ───────────────────────────────

  materialEntryExists(postId: string): boolean {
    const row = this.db
      .prepare("SELECT 1 AS one FROM material_entries WHERE post_id = ? LIMIT 1")
      .get(postId) as { one?: number } | undefined;
    return row !== undefined && row.one === 1;
  }

  getMaterialByPostId(postId: string): MaterialEntry | null {
    const row = this.db
      .prepare("SELECT * FROM material_entries WHERE post_id = ? LIMIT 1")
      .get(postId) as RawRow | undefined;
    return row === undefined ? null : rowToMaterialEntry(row);
  }

  insertOrIgnoreMaterialEntry(draft: MaterialEntry): InsertOutcome {
    const parsed = materialEntrySchema.safeParse(draft);
    if (!parsed.success) {
      throw new Error(
        `MaterialEntry failed schema validation: ${parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }
    const e = parsed.data;
    const stmt = this.db.prepare(
      `INSERT INTO material_entries (
        post_id, post_id_source, share_url, share_text, caption,
        author_handle, author_display_name, hashtags, music_id, music_title,
        like_count, comment_count, share_count, collect_count,
        author_follower_count, captured_at, captured_by_device, note_type,
        platform, media_kind, image_urls, comments_json
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(post_id) DO NOTHING`,
    );
    const res = stmt.run(
      e.post_id,
      e.post_id_source,
      e.share_url,
      e.share_text,
      e.caption,
      e.author_handle,
      e.author_display_name,
      JSON.stringify(e.hashtags),
      e.music_id,
      e.music_title,
      e.like_count,
      e.comment_count,
      e.share_count,
      e.collect_count,
      e.author_follower_count,
      e.captured_at,
      e.captured_by_device,
      e.note_type,
      e.platform,
      e.media_kind,
      e.image_urls === null ? null : JSON.stringify(e.image_urls),
      e.comments.length === 0 ? null : JSON.stringify(e.comments),
    );
    if (res.changes === 0) {
      return { kind: "duplicate" };
    }
    return { kind: "inserted", entry: e };
  }

  listMaterials(filters: ListFilters): ListPage {
    const where: string[] = [];
    const params: unknown[] = [];
    if (filters.from !== null) {
      where.push("captured_at >= ?");
      params.push(filters.from);
    }
    if (filters.to !== null) {
      where.push("captured_at <= ?");
      params.push(filters.to);
    }
    if (filters.author !== null) {
      where.push("author_handle = ?");
      params.push(filters.author);
    }
    if (filters.platform !== null) {
      where.push("platform = ?");
      params.push(filters.platform);
    }
    const whereClause = where.length > 0 ? ` WHERE ${where.join(" AND ")}` : "";

    const libraryTotalRow = this.db
      .prepare("SELECT COUNT(*) AS n FROM material_entries")
      .get() as { n: number };
    const totalRow = this.db
      .prepare(`SELECT COUNT(*) AS n FROM material_entries${whereClause}`)
      .get(...params) as { n: number };

    const rows = this.db
      .prepare(
        `SELECT * FROM material_entries${whereClause}
         ORDER BY captured_at DESC
         LIMIT ? OFFSET ?`,
      )
      .all(...params, filters.limit, filters.offset) as RawRow[];

    return {
      entries: rows.map(rowToMaterialEntry),
      total: Number(totalRow.n),
      libraryTotal: Number(libraryTotalRow.n),
    };
  }

  deleteMaterial(postId: string): boolean {
    const stmt = this.db.prepare("DELETE FROM material_entries WHERE post_id = ?");
    const res = stmt.run(postId);
    return res.changes > 0;
  }

  updateMaterialTranscript(
    postId: string,
    transcript: string,
    transcribedAtIso: string,
  ): boolean {
    const stmt = this.db.prepare(
      "UPDATE material_entries SET transcript = ?, transcribed_at = ? WHERE post_id = ?",
    );
    const res = stmt.run(transcript, transcribedAtIso, postId);
    return res.changes > 0;
  }

  // ─── keyword_batches ───────────────────────────────────────────────────

  insertKeywordBatch(batch: KeywordBatchRow): void {
    this.db
      .prepare(
        `INSERT INTO keyword_batches
          (id, platform, status, stop_reason, started_at, ended_at,
           selected_keyword_ids, executed_keyword_ids, cancelled_keyword_ids,
           min_like_follower_ratio)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        batch.id,
        batch.platform,
        batch.status,
        batch.stop_reason,
        batch.started_at,
        batch.ended_at,
        JSON.stringify(batch.selected_keyword_ids),
        JSON.stringify(batch.executed_keyword_ids),
        JSON.stringify(batch.cancelled_keyword_ids),
        batch.min_like_follower_ratio,
      );
  }

  updateKeywordBatch(id: string, patch: KeywordBatchPatch): void {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (patch.status !== undefined) {
      sets.push("status = ?");
      params.push(patch.status);
    }
    if (patch.stop_reason !== undefined) {
      sets.push("stop_reason = ?");
      params.push(patch.stop_reason);
    }
    if (patch.ended_at !== undefined) {
      sets.push("ended_at = ?");
      params.push(patch.ended_at);
    }
    if (patch.executed_keyword_ids !== undefined) {
      sets.push("executed_keyword_ids = ?");
      params.push(JSON.stringify(patch.executed_keyword_ids));
    }
    if (patch.cancelled_keyword_ids !== undefined) {
      sets.push("cancelled_keyword_ids = ?");
      params.push(JSON.stringify(patch.cancelled_keyword_ids));
    }
    if (sets.length === 0) return;
    params.push(id);
    this.db.prepare(`UPDATE keyword_batches SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  }

  // ─── keyword_runs ──────────────────────────────────────────────────────

  insertKeywordRun(run: KeywordRunRow): void {
    this.db
      .prepare(
        `INSERT INTO keyword_runs
          (id, platform, batch_id, keyword_id, keyword_text_snapshot, metric_filter_mode,
           min_like_follower_ratio_snapshot, publish_time_range, author_follower_count_op,
           author_follower_count_value, like_count_op, like_count_value, status, stop_reason,
           started_at, ended_at, scanned_count, captured_count, duplicate_count, error_count,
           filtered_count, representative_errors)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        run.id,
        run.platform,
        run.batch_id,
        run.keyword_id,
        run.keyword_text_snapshot,
        run.metric_filter_mode,
        run.min_like_follower_ratio_snapshot,
        run.publish_time_range,
        run.author_follower_count_op,
        run.author_follower_count_value,
        run.like_count_op,
        run.like_count_value,
        run.status,
        run.stop_reason,
        run.started_at,
        run.ended_at,
        run.scanned_count,
        run.captured_count,
        run.duplicate_count,
        run.error_count,
        run.filtered_count,
        JSON.stringify(run.representative_errors),
      );
  }

  updateKeywordRun(id: string, patch: KeywordRunPatch): void {
    const sets: string[] = [];
    const params: unknown[] = [];
    if (patch.status !== undefined) {
      sets.push("status = ?");
      params.push(patch.status);
    }
    if (patch.stop_reason !== undefined) {
      sets.push("stop_reason = ?");
      params.push(patch.stop_reason);
    }
    if (patch.ended_at !== undefined) {
      sets.push("ended_at = ?");
      params.push(patch.ended_at);
    }
    if (patch.scanned_count !== undefined) {
      sets.push("scanned_count = ?");
      params.push(patch.scanned_count);
    }
    if (patch.captured_count !== undefined) {
      sets.push("captured_count = ?");
      params.push(patch.captured_count);
    }
    if (patch.duplicate_count !== undefined) {
      sets.push("duplicate_count = ?");
      params.push(patch.duplicate_count);
    }
    if (patch.error_count !== undefined) {
      sets.push("error_count = ?");
      params.push(patch.error_count);
    }
    if (patch.filtered_count !== undefined) {
      sets.push("filtered_count = ?");
      params.push(patch.filtered_count);
    }
    if (patch.representative_errors !== undefined) {
      sets.push("representative_errors = ?");
      params.push(JSON.stringify(patch.representative_errors));
    }
    if (sets.length === 0) return;
    params.push(id);
    this.db.prepare(`UPDATE keyword_runs SET ${sets.join(", ")} WHERE id = ?`).run(...params);
  }

  selectKeywordBatch(id: string): KeywordBatchRow | null {
    const row = this.db
      .prepare("SELECT * FROM keyword_batches WHERE id = ?")
      .get(id) as
      | {
          id: string;
          platform: string | null;
          status: unknown;
          stop_reason: string | null;
          started_at: string;
          ended_at: string | null;
          selected_keyword_ids: string;
          executed_keyword_ids: string;
          cancelled_keyword_ids: string;
          min_like_follower_ratio: number | null;
        }
      | undefined;
    if (row === undefined) return null;
    return {
      id: row.id,
      platform: row.platform === "xiaohongshu" ? "xiaohongshu" : "douyin",
      status: castStatus(row.status),
      stop_reason: row.stop_reason,
      started_at: row.started_at,
      ended_at: row.ended_at,
      selected_keyword_ids: jsonArrayToStrings(row.selected_keyword_ids),
      executed_keyword_ids: jsonArrayToStrings(row.executed_keyword_ids),
      cancelled_keyword_ids: jsonArrayToStrings(row.cancelled_keyword_ids),
      min_like_follower_ratio:
        row.min_like_follower_ratio === null || row.min_like_follower_ratio === undefined
          ? 0
          : Number(row.min_like_follower_ratio),
    };
  }

  // ─── bloggers (博主分析) ───────────────────────────────────────────────

  listBloggers(): Blogger[] {
    const rows = this.db
      .prepare(
        `SELECT id, platform, profile_url, sec_uid, douyin_id, display_name,
                avatar_url, follow_count, fans_count, liked_count, signature,
                status, last_error, profile_captured_at, sampled_at,
                total_works_at_sample, created_at, updated_at
         FROM bloggers
         ORDER BY created_at DESC`,
      )
      .all() as RawBloggerRow[];
    return rows.map(rowToBlogger);
  }

  getBlogger(id: string): Blogger | null {
    const row = this.db
      .prepare(
        `SELECT id, platform, profile_url, sec_uid, douyin_id, display_name,
                avatar_url, follow_count, fans_count, liked_count, signature,
                status, last_error, profile_captured_at, sampled_at,
                total_works_at_sample, created_at, updated_at
         FROM bloggers WHERE id = ?`,
      )
      .get(id) as RawBloggerRow | undefined;
    return row === undefined ? null : rowToBlogger(row);
  }

  /**
   * Insert-or-return-existing on (platform, profile_url). The caller is
   * responsible for canonicalising the URL before this call so the unique
   * index does its job. `nowIso` is injected for testability.
   */
  upsertBlogger(input: {
    id: string;
    platform: Platform;
    profile_url: string;
    sec_uid: string | null;
    nowIso: string;
  }): Blogger {
    const existing = this.db
      .prepare(`SELECT id FROM bloggers WHERE platform = ? AND profile_url = ?`)
      .get(input.platform, input.profile_url) as { id: string } | undefined;
    if (existing !== undefined) {
      const row = this.getBlogger(existing.id);
      if (row !== null) return row;
    }
    this.db
      .prepare(
        `INSERT INTO bloggers
          (id, platform, profile_url, sec_uid, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      )
      .run(
        input.id,
        input.platform,
        input.profile_url,
        input.sec_uid,
        input.nowIso,
        input.nowIso,
      );
    const created = this.getBlogger(input.id);
    if (created === null) {
      throw new Error("upsertBlogger: row vanished immediately after insert");
    }
    return created;
  }

  /**
   * Apply the result of a successful profile capture: writes all profile
   * fields, sets status='profile_ready', clears last_error, stamps
   * profile_captured_at + updated_at.
   */
  updateBloggerProfile(
    id: string,
    fields: {
      douyin_id: string | null;
      display_name: string | null;
      avatar_url: string | null;
      follow_count: number | null;
      fans_count: number | null;
      liked_count: number | null;
      signature: string | null;
      raw_profile_json: string | null;
      sec_uid: string | null;
    },
    nowIso: string,
  ): void {
    this.db
      .prepare(
        `UPDATE bloggers
            SET douyin_id = ?,
                display_name = ?,
                avatar_url = ?,
                follow_count = ?,
                fans_count = ?,
                liked_count = ?,
                signature = ?,
                raw_profile_json = ?,
                sec_uid = COALESCE(?, sec_uid),
                status = 'profile_ready',
                last_error = NULL,
                profile_captured_at = ?,
                updated_at = ?
          WHERE id = ?`,
      )
      .run(
        fields.douyin_id,
        fields.display_name,
        fields.avatar_url,
        fields.follow_count,
        fields.fans_count,
        fields.liked_count,
        fields.signature,
        fields.raw_profile_json,
        fields.sec_uid,
        nowIso,
        nowIso,
        id,
      );
  }

  /** Set the blogger's status (typically 'error') and an error message. */
  updateBloggerStatus(
    id: string,
    status: BloggerStatus,
    last_error: string | null,
    nowIso: string,
  ): void {
    this.db
      .prepare(
        `UPDATE bloggers SET status = ?, last_error = ?, updated_at = ? WHERE id = ?`,
      )
      .run(status, last_error, nowIso, id);
  }

  /**
   * Replace all video samples for a blogger in a single transaction. Also
   * updates the bloggers row to status='sampled', sampled_at=now,
   * total_works_at_sample=totalWorks, last_error=NULL.
   *
   * Analysis fields (transcript, frames, analyzed_at, …) are preserved across
   * a resample for any video_url that survives — i.e. clicking 「重新采样」
   * does NOT throw away transcripts/frames already produced for the same
   * videos. Snapshot before delete; merge back after insert by video_url.
   */
  replaceBloggerSamples(
    blogger_id: string,
    samples: BloggerVideoSample[],
    totalWorks: number,
    nowIso: string,
  ): void {
    const snapshot = this.db
      .prepare(
        `SELECT video_url, transcript, transcript_lang, frames_json, analyzed_at, analyze_error
         FROM blogger_video_samples WHERE blogger_id = ?`,
      )
      .all(blogger_id) as Array<{
        video_url: string;
        transcript: string | null;
        transcript_lang: string | null;
        frames_json: string | null;
        analyzed_at: string | null;
        analyze_error: string | null;
      }>;
    const prior = new Map(snapshot.map((r) => [r.video_url, r] as const));

    const del = this.db.prepare(
      `DELETE FROM blogger_video_samples WHERE blogger_id = ?`,
    );
    const ins = this.db.prepare(
      `INSERT INTO blogger_video_samples
        (blogger_id, position, video_url, title, source_index, sampled_at,
         transcript, transcript_lang, frames_json, analyzed_at, analyze_error)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const updateBlogger = this.db.prepare(
      `UPDATE bloggers
          SET status = 'sampled',
              last_error = NULL,
              sampled_at = ?,
              total_works_at_sample = ?,
              updated_at = ?
        WHERE id = ?`,
    );
    const txn = (
      this.db as unknown as {
        transaction: <Args extends unknown[], R>(
          fn: (...args: Args) => R,
        ) => (...args: Args) => R;
      }
    ).transaction(() => {
      del.run(blogger_id);
      for (const s of samples) {
        const carry = prior.get(s.video_url);
        ins.run(
          blogger_id,
          s.position,
          s.video_url,
          s.title,
          s.source_index,
          s.sampled_at,
          carry?.transcript ?? null,
          carry?.transcript_lang ?? null,
          carry?.frames_json ?? null,
          carry?.analyzed_at ?? null,
          carry?.analyze_error ?? null,
        );
      }
      updateBlogger.run(nowIso, totalWorks, nowIso, blogger_id);
    });
    txn();
  }

  listBloggerSamples(blogger_id: string): BloggerVideoSample[] {
    const rows = this.db
      .prepare(
        `SELECT position, video_url, title, source_index, sampled_at,
                transcript, transcript_lang, frames_json, analyzed_at, analyze_error
         FROM blogger_video_samples
         WHERE blogger_id = ?
         ORDER BY position ASC`,
      )
      .all(blogger_id) as Array<{
        position: number;
        video_url: string;
        title: string | null;
        source_index: number | null;
        sampled_at: string;
        transcript: string | null;
        transcript_lang: string | null;
        frames_json: string | null;
        analyzed_at: string | null;
        analyze_error: string | null;
      }>;
    return rows.map((r) =>
      bloggerVideoSampleSchema.parse({
        position: r.position,
        video_url: r.video_url,
        title: r.title,
        source_index: r.source_index,
        sampled_at: r.sampled_at,
        transcript: r.transcript,
        transcript_lang: r.transcript_lang,
        frames: jsonArrayToStrings(r.frames_json),
        analyzed_at: r.analyzed_at,
        analyze_error: r.analyze_error,
      }),
    );
  }

  /**
   * Patch the analysis-related columns on a single sample row, identified by
   * (blogger_id, video_url). Other fields (position, title, sampled_at) are
   * untouched. Used by `blogger:analyze` after each video completes.
   *
   * `frames` of length 0 maps to NULL frames_json so we don't store empty
   * arrays. Pass `analyze_error: null` on success to clear a prior failure.
   */
  updateBloggerSampleAnalysis(
    blogger_id: string,
    video_url: string,
    fields: {
      transcript?: string | null;
      transcript_lang?: string | null;
      frames?: string[];
      analyzed_at?: string | null;
      analyze_error?: string | null;
    },
  ): void {
    const sets: string[] = [];
    const vals: unknown[] = [];
    if ("transcript" in fields) {
      sets.push("transcript = ?");
      vals.push(fields.transcript ?? null);
    }
    if ("transcript_lang" in fields) {
      sets.push("transcript_lang = ?");
      vals.push(fields.transcript_lang ?? null);
    }
    if ("frames" in fields) {
      sets.push("frames_json = ?");
      vals.push(fields.frames && fields.frames.length > 0
        ? JSON.stringify(fields.frames)
        : null);
    }
    if ("analyzed_at" in fields) {
      sets.push("analyzed_at = ?");
      vals.push(fields.analyzed_at ?? null);
    }
    if ("analyze_error" in fields) {
      sets.push("analyze_error = ?");
      vals.push(fields.analyze_error ?? null);
    }
    if (sets.length === 0) return;
    vals.push(blogger_id, video_url);
    this.db
      .prepare(
        `UPDATE blogger_video_samples
            SET ${sets.join(", ")}
          WHERE blogger_id = ? AND video_url = ?`,
      )
      .run(...vals);
  }

  deleteBlogger(id: string): boolean {
    // No FK constraint on blogger_video_samples — cascade manually.
    this.db.prepare(`DELETE FROM blogger_video_samples WHERE blogger_id = ?`).run(id);
    const res = this.db.prepare(`DELETE FROM bloggers WHERE id = ?`).run(id);
    return res.changes > 0;
  }

  close(): void {
    try {
      this.db.close();
    } catch {
      /* ignore */
    }
  }
}

interface RawBloggerRow {
  id: string;
  platform: string;
  profile_url: string;
  sec_uid: string | null;
  douyin_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
  follow_count: number | null;
  fans_count: number | null;
  liked_count: number | null;
  signature: string | null;
  status: string;
  last_error: string | null;
  profile_captured_at: string | null;
  sampled_at: string | null;
  total_works_at_sample: number | null;
  created_at: string;
  updated_at: string;
}

function rowToBlogger(row: RawBloggerRow): Blogger {
  const platform: Platform = row.platform === "xiaohongshu" ? "xiaohongshu" : "douyin";
  const status: BloggerStatus =
    row.status === "profile_ready" ||
    row.status === "sampled" ||
    row.status === "error"
      ? row.status
      : "pending";
  return bloggerSchema.parse({
    id: row.id,
    platform,
    profile_url: row.profile_url,
    sec_uid: row.sec_uid,
    douyin_id: row.douyin_id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    follow_count: row.follow_count === null ? null : Number(row.follow_count),
    fans_count: row.fans_count === null ? null : Number(row.fans_count),
    liked_count: row.liked_count === null ? null : Number(row.liked_count),
    signature: row.signature,
    status,
    last_error: row.last_error,
    profile_captured_at: row.profile_captured_at,
    sampled_at: row.sampled_at,
    total_works_at_sample:
      row.total_works_at_sample === null ? null : Number(row.total_works_at_sample),
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
}

let sharedStore: LibraryStore | null = null;

export function getSharedStore(): LibraryStore {
  if (sharedStore === null) {
    sharedStore = LibraryStore.open();
    process.once("exit", () => sharedStore?.close());
  }
  return sharedStore;
}

export function _resetSharedStoreForTests(): void {
  if (sharedStore !== null) sharedStore.close();
  sharedStore = null;
}

/** Convenience for handlers + executor that just want the open library. */
export function openLibrary(): LibraryStore {
  return getSharedStore();
}

export function closeLibrary(): void {
  _resetSharedStoreForTests();
}
