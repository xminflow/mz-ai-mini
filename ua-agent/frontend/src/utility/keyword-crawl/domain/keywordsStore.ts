/**
 * better-sqlite3 CRUD against the `keywords` table. Reuses the connection
 * owned by `domain/library.ts` (LibraryStore.raw()) so all 004 SQL goes
 * through one DB handle in the utility process.
 */

import { randomUUID } from "node:crypto";

import type { Platform } from "@/shared/contracts/capture";
import type {
  KeywordComparisonOp,
  KeywordMetricFilterMode,
  KeywordPublishTimeRange,
  KeywordRow,
} from "@/shared/contracts/keyword/keyword-list";

import { openLibrary } from "./library";

export class KeywordValidationError extends Error {
  readonly kind: "INVALID" | "DUPLICATE" | "NOT_FOUND";

  constructor(kind: "INVALID" | "DUPLICATE" | "NOT_FOUND", message: string) {
    super(message);
    this.kind = kind;
    this.name = "KeywordValidationError";
  }
}

const MAX_TEXT_LENGTH = 100;

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeForCompare(text: string): string {
  return text.toLowerCase();
}

interface RawKeywordRow {
  id: string;
  platform: string | null;
  text: string;
  position: number;
  enabled: number | null;
  target_cap: number | null;
  health_cap: number | null;
  metric_filter_mode: string | null;
  min_like_follower_ratio: number | null;
  publish_time_range: string | null;
  author_follower_count_op: string | null;
  author_follower_count_value: number | null;
  like_count_op: string | null;
  like_count_value: number | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  "id, platform, text, position, enabled, target_cap, health_cap, metric_filter_mode, min_like_follower_ratio, publish_time_range, author_follower_count_op, author_follower_count_value, like_count_op, like_count_value, created_at, updated_at";

const DEFAULT_TARGET_CAP = 10;
const DEFAULT_HEALTH_CAP = 500;
const DEFAULT_MIN_RATIO = 1;
const DEFAULT_FILTER_MODE: KeywordMetricFilterMode = "ratio";
const DEFAULT_PUBLISH_TIME_RANGE: KeywordPublishTimeRange = "all";

function castMetricFilterMode(raw: string | null): KeywordMetricFilterMode {
  return raw === "none" || raw === "author_metrics" || raw === "ratio"
    ? raw
    : DEFAULT_FILTER_MODE;
}

function castPublishTimeRange(raw: string | null): KeywordPublishTimeRange {
  return raw === "day" || raw === "week" || raw === "half_year" || raw === "all"
    ? raw
    : DEFAULT_PUBLISH_TIME_RANGE;
}

function castComparisonOp(raw: string | null): KeywordComparisonOp | null {
  return raw === "gte" || raw === "lte" ? raw : null;
}

interface KeywordFilterConfig {
  metric_filter_mode: KeywordMetricFilterMode;
  min_like_follower_ratio: number;
  publish_time_range: KeywordPublishTimeRange;
  author_follower_count_op: KeywordComparisonOp | null;
  author_follower_count_value: number | null;
  like_count_op: KeywordComparisonOp | null;
  like_count_value: number | null;
}

function normalizePositiveInt(raw: number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (!Number.isFinite(raw) || raw < 1) {
    throw new KeywordValidationError("INVALID", "筛选阈值必须是大于 0 的整数");
  }
  return Math.floor(raw);
}

function normalizeRatio(raw: number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  if (!Number.isFinite(raw) || raw < 0 || raw > 100) {
    throw new KeywordValidationError("INVALID", "最小点赞/粉丝比必须在 0 到 100 之间");
  }
  return Math.round(raw * 10) / 10;
}

function normalizeFilterConfig(config: KeywordFilterConfig): KeywordFilterConfig {
  const ratio = normalizeRatio(config.min_like_follower_ratio);
  const followerValue = normalizePositiveInt(config.author_follower_count_value);
  const likeValue = normalizePositiveInt(config.like_count_value);
  const followerEnabled =
    config.author_follower_count_op !== null || followerValue !== null;
  const likeEnabled = config.like_count_op !== null || likeValue !== null;

  if (followerEnabled && (config.author_follower_count_op === null || followerValue === null)) {
    throw new KeywordValidationError("INVALID", "粉丝量筛选需要同时设置比较方式和数值");
  }
  if (likeEnabled && (config.like_count_op === null || likeValue === null)) {
    throw new KeywordValidationError("INVALID", "点赞数筛选需要同时设置比较方式和数值");
  }

  if (config.metric_filter_mode === "ratio") {
    if (ratio <= 0) {
      throw new KeywordValidationError("INVALID", "粉赞比模式下最小点赞/粉丝比必须大于 0");
    }
    return {
      metric_filter_mode: "ratio",
      min_like_follower_ratio: ratio,
      publish_time_range: config.publish_time_range,
      author_follower_count_op: null,
      author_follower_count_value: null,
      like_count_op: null,
      like_count_value: null,
    };
  }

  if (config.metric_filter_mode === "author_metrics") {
    if (!followerEnabled && !likeEnabled) {
      throw new KeywordValidationError("INVALID", "粉丝量/点赞数模式至少需要配置一个阈值");
    }
    return {
      metric_filter_mode: "author_metrics",
      min_like_follower_ratio: 0,
      publish_time_range: config.publish_time_range,
      author_follower_count_op: config.author_follower_count_op,
      author_follower_count_value: followerValue,
      like_count_op: config.like_count_op,
      like_count_value: likeValue,
    };
  }

  return {
    metric_filter_mode: "none",
    min_like_follower_ratio: 0,
    publish_time_range: config.publish_time_range,
    author_follower_count_op: null,
    author_follower_count_value: null,
    like_count_op: null,
    like_count_value: null,
  };
}

function rowToKeyword(row: RawKeywordRow): KeywordRow {
  const metricFilterMode =
    row.metric_filter_mode === null || row.metric_filter_mode === undefined
      ? (row.min_like_follower_ratio === null ||
            row.min_like_follower_ratio === undefined ||
            Number(row.min_like_follower_ratio) <= 0
          ? "none"
          : "ratio")
      : castMetricFilterMode(row.metric_filter_mode);
  const ratio =
    row.min_like_follower_ratio === null || row.min_like_follower_ratio === undefined
      ? metricFilterMode === "ratio"
        ? DEFAULT_MIN_RATIO
        : 0
      : Math.round(Number(row.min_like_follower_ratio) * 10) / 10;
  return {
    id: row.id,
    platform: row.platform === "xiaohongshu" ? "xiaohongshu" : "douyin",
    text: row.text,
    position: Number(row.position),
    enabled: row.enabled === null ? true : Number(row.enabled) !== 0,
    target_cap:
      row.target_cap === null || row.target_cap === undefined
        ? DEFAULT_TARGET_CAP
        : Number(row.target_cap),
    health_cap:
      row.health_cap === null || row.health_cap === undefined
        ? DEFAULT_HEALTH_CAP
        : Number(row.health_cap),
    metric_filter_mode: metricFilterMode,
    min_like_follower_ratio: ratio,
    publish_time_range: castPublishTimeRange(row.publish_time_range),
    author_follower_count_op: castComparisonOp(row.author_follower_count_op),
    author_follower_count_value:
      row.author_follower_count_value === null || row.author_follower_count_value === undefined
        ? null
        : Number(row.author_follower_count_value),
    like_count_op: castComparisonOp(row.like_count_op),
    like_count_value:
      row.like_count_value === null || row.like_count_value === undefined
        ? null
        : Number(row.like_count_value),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export interface KeywordCreateOverrides {
  enabled?: boolean | undefined;
  target_cap?: number | undefined;
  health_cap?: number | undefined;
  metric_filter_mode?: KeywordMetricFilterMode | undefined;
  min_like_follower_ratio?: number | undefined;
  publish_time_range?: KeywordPublishTimeRange | undefined;
  author_follower_count_op?: KeywordComparisonOp | null | undefined;
  author_follower_count_value?: number | null | undefined;
  like_count_op?: KeywordComparisonOp | null | undefined;
  like_count_value?: number | null | undefined;
}

export interface KeywordPatch {
  text?: string | undefined;
  enabled?: boolean | undefined;
  target_cap?: number | undefined;
  health_cap?: number | undefined;
  metric_filter_mode?: KeywordMetricFilterMode | undefined;
  min_like_follower_ratio?: number | undefined;
  publish_time_range?: KeywordPublishTimeRange | undefined;
  author_follower_count_op?: KeywordComparisonOp | null | undefined;
  author_follower_count_value?: number | null | undefined;
  like_count_op?: KeywordComparisonOp | null | undefined;
  like_count_value?: number | null | undefined;
}

export class KeywordsStore {
  private get db() {
    return openLibrary().raw();
  }

  /**
   * Lists keywords. When `platform` is provided, only that platform's
   * keywords are returned (006 — per-platform Tab). When omitted, returns
   * all keywords across both platforms (used by IPC layer; renderer Tabs
   * filter client-side as a belt-and-suspenders).
   */
  list(platform?: Platform): KeywordRow[] {
    let sql = `SELECT ${SELECT_COLUMNS} FROM keywords`;
    const params: unknown[] = [];
    if (platform !== undefined) {
      sql += " WHERE platform = ?";
      params.push(platform);
    }
    sql += " ORDER BY position ASC, created_at ASC";
    const rows = this.db.prepare(sql).all(...params) as RawKeywordRow[];
    return rows.map(rowToKeyword);
  }

  /**
   * All keywords with `enabled = 1`, in display order. Used by the executor.
   * 006 — when `platform` is supplied, only that platform's enabled
   * keywords are returned (batches are platform-scoped, FR-009).
   */
  listEnabled(platform?: Platform): KeywordRow[] {
    return this.list(platform).filter((k) => k.enabled);
  }

  /**
   * 006 — Same-text dedup is per-platform: the same string is allowed in
   * both Douyin and XHS tabs (FR-005). The unique index in library.ts
   * matches: idx_keywords_platform_normalized_text on (platform, LOWER(text)).
   */
  existsByNormalizedText(text: string, platform: Platform, excludeId?: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length === 0) return false;
    const normalized = normalizeForCompare(trimmed);
    const params: unknown[] = [platform, normalized];
    let sql = "SELECT 1 AS one FROM keywords WHERE platform = ? AND LOWER(text) = ?";
    if (excludeId !== undefined) {
      sql += " AND id <> ?";
      params.push(excludeId);
    }
    sql += " LIMIT 1";
    const row = this.db.prepare(sql).get(...params) as { one?: number } | undefined;
    return row !== undefined && row.one === 1;
  }

  create(rawText: string, platform: Platform, overrides: KeywordCreateOverrides = {}): KeywordRow {
    const trimmed = rawText.trim();
    if (trimmed.length === 0) {
      throw new KeywordValidationError("INVALID", "关键词不能为空");
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      throw new KeywordValidationError("INVALID", `关键词长度不能超过 ${MAX_TEXT_LENGTH} 字`);
    }
    if (this.existsByNormalizedText(trimmed, platform)) {
      throw new KeywordValidationError("DUPLICATE", "关键词已存在（不区分大小写 / 空白）");
    }
    const id = randomUUID();
    const ts = nowIso();
    // Position is platform-local: each platform Tab has its own ordering.
    const positionRow = this.db
      .prepare("SELECT COALESCE(MAX(position) + 1, 0) AS next_pos FROM keywords WHERE platform = ?")
      .get(platform) as { next_pos: number };
    const position = Number(positionRow.next_pos);
    const enabled = overrides.enabled ?? true;
    const targetCap = overrides.target_cap ?? DEFAULT_TARGET_CAP;
    const healthCap = overrides.health_cap ?? DEFAULT_HEALTH_CAP;
    const filters = normalizeFilterConfig({
      metric_filter_mode: overrides.metric_filter_mode ?? DEFAULT_FILTER_MODE,
      min_like_follower_ratio:
        overrides.min_like_follower_ratio === undefined
          ? DEFAULT_MIN_RATIO
          : overrides.min_like_follower_ratio,
      publish_time_range: overrides.publish_time_range ?? DEFAULT_PUBLISH_TIME_RANGE,
      author_follower_count_op: overrides.author_follower_count_op ?? null,
      author_follower_count_value: overrides.author_follower_count_value ?? null,
      like_count_op: overrides.like_count_op ?? null,
      like_count_value: overrides.like_count_value ?? null,
    });
    this.db
      .prepare(
        `INSERT INTO keywords
          (id, platform, text, position, enabled, target_cap, health_cap, metric_filter_mode,
           min_like_follower_ratio, publish_time_range, author_follower_count_op,
           author_follower_count_value, like_count_op, like_count_value, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        id,
        platform,
        trimmed,
        position,
        enabled ? 1 : 0,
        targetCap,
        healthCap,
        filters.metric_filter_mode,
        filters.min_like_follower_ratio,
        filters.publish_time_range,
        filters.author_follower_count_op,
        filters.author_follower_count_value,
        filters.like_count_op,
        filters.like_count_value,
        ts,
        ts,
      );
    return {
      id,
      platform,
      text: trimmed,
      position,
      enabled,
      target_cap: targetCap,
      health_cap: healthCap,
      metric_filter_mode: filters.metric_filter_mode,
      min_like_follower_ratio: filters.min_like_follower_ratio,
      publish_time_range: filters.publish_time_range,
      author_follower_count_op: filters.author_follower_count_op,
      author_follower_count_value: filters.author_follower_count_value,
      like_count_op: filters.like_count_op,
      like_count_value: filters.like_count_value,
      created_at: ts,
      updated_at: ts,
    };
  }

  update(id: string, patch: KeywordPatch): KeywordRow | null {
    const existing = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM keywords WHERE id = ?`)
      .get(id) as RawKeywordRow | undefined;
    if (existing === undefined) return null;

    const sets: string[] = [];
    const params: unknown[] = [];

    if (patch.text !== undefined) {
      const trimmed = patch.text.trim();
      if (trimmed.length === 0) {
        throw new KeywordValidationError("INVALID", "关键词不能为空");
      }
      if (trimmed.length > MAX_TEXT_LENGTH) {
        throw new KeywordValidationError(
          "INVALID",
          `关键词长度不能超过 ${MAX_TEXT_LENGTH} 字`,
        );
      }
      const existingPlatform: Platform =
        existing.platform === "xiaohongshu" ? "xiaohongshu" : "douyin";
      if (
        trimmed !== existing.text &&
        this.existsByNormalizedText(trimmed, existingPlatform, id)
      ) {
        throw new KeywordValidationError(
          "DUPLICATE",
          "关键词已存在（不区分大小写 / 空白）",
        );
      }
      sets.push("text = ?");
      params.push(trimmed);
    }

    if (patch.enabled !== undefined) {
      sets.push("enabled = ?");
      params.push(patch.enabled ? 1 : 0);
    }
    if (patch.target_cap !== undefined) {
      sets.push("target_cap = ?");
      params.push(Math.max(1, Math.floor(patch.target_cap)));
    }
    if (patch.health_cap !== undefined) {
      sets.push("health_cap = ?");
      params.push(Math.max(1, Math.floor(patch.health_cap)));
    }
    const existingKeyword = rowToKeyword(existing);
    const mergedFilters = normalizeFilterConfig({
      metric_filter_mode: patch.metric_filter_mode ?? existingKeyword.metric_filter_mode,
      min_like_follower_ratio:
        patch.min_like_follower_ratio ?? existingKeyword.min_like_follower_ratio,
      publish_time_range: patch.publish_time_range ?? existingKeyword.publish_time_range,
      author_follower_count_op:
        patch.author_follower_count_op !== undefined
          ? patch.author_follower_count_op
          : existingKeyword.author_follower_count_op,
      author_follower_count_value:
        patch.author_follower_count_value !== undefined
          ? patch.author_follower_count_value
          : existingKeyword.author_follower_count_value,
      like_count_op:
        patch.like_count_op !== undefined
          ? patch.like_count_op
          : existingKeyword.like_count_op,
      like_count_value:
        patch.like_count_value !== undefined
          ? patch.like_count_value
          : existingKeyword.like_count_value,
    });
    sets.push("metric_filter_mode = ?");
    params.push(mergedFilters.metric_filter_mode);
    sets.push("min_like_follower_ratio = ?");
    params.push(mergedFilters.min_like_follower_ratio);
    sets.push("publish_time_range = ?");
    params.push(mergedFilters.publish_time_range);
    sets.push("author_follower_count_op = ?");
    params.push(mergedFilters.author_follower_count_op);
    sets.push("author_follower_count_value = ?");
    params.push(mergedFilters.author_follower_count_value);
    sets.push("like_count_op = ?");
    params.push(mergedFilters.like_count_op);
    sets.push("like_count_value = ?");
    params.push(mergedFilters.like_count_value);

    const ts = nowIso();
    sets.push("updated_at = ?");
    params.push(ts);
    params.push(id);
    this.db.prepare(`UPDATE keywords SET ${sets.join(", ")} WHERE id = ?`).run(...params);

    const refreshed = this.db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM keywords WHERE id = ?`)
      .get(id) as RawKeywordRow | undefined;
    if (refreshed === undefined) return null;
    return rowToKeyword(refreshed);
  }

  delete(id: string): boolean {
    const res = this.db.prepare("DELETE FROM keywords WHERE id = ?").run(id);
    return res.changes > 0;
  }
}

let singleton: KeywordsStore | null = null;

export function getKeywordsStore(): KeywordsStore {
  if (singleton === null) {
    singleton = new KeywordsStore();
  }
  return singleton;
}

export function _resetKeywordsStoreForTests(): void {
  singleton = null;
}
