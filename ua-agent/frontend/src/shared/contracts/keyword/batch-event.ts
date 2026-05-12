// Runtime copy of specs/004-douyin-keyword-crawl/contracts/batch-event.zod.txt
//
// Streaming events pushed from the utility process (via {type:"event", topic, payload})
// through main (via webContents.send) to all renderer windows. Subscribed via
// `window.api.keyword.onBatchEvent(callback)`. Validated on send AND on receive.

import { z } from "zod";

import { Platform } from "../capture";

export const SCHEMA_VERSION = "1" as const;

const isoMs = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const phaseEnum = z.enum([
  "batch-started",
  "keyword-started",
  "progress",
  "keyword-ended",
  "batch-ended",
]);
export type BatchEventPhase = z.infer<typeof phaseEnum>;

export const batchStartedEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("batch-started"),
    batch_id: z.string().uuid(),
    /** Platform of the batch that just started (006). */
    platform: Platform,
    selected_keyword_ids: z.array(z.string().uuid()).min(1),
    started_at: isoMs,
  })
  .strict();

export const keywordStartedEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("keyword-started"),
    batch_id: z.string().uuid(),
    platform: Platform,
    keyword_id: z.string().uuid(),
    keyword_text: z.string().min(1).max(100),
    position: z.number().int().min(1),
    total: z.number().int().min(1),
    started_at: isoMs,
  })
  .strict();

export const progressEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("progress"),
    batch_id: z.string().uuid(),
    platform: Platform,
    keyword_id: z.string().uuid(),
    scanned_count: z.number().int().nonnegative(),
    captured_count: z.number().int().nonnegative(),
    duplicate_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
    filtered_count: z.number().int().nonnegative(),
    last_phase: z.enum([
      "navigate",
      "layout-switch",
      "layout-probe",
      "dwell",
      "read",
      "record",
      "next",
      "filtered",
      // 006 — XHS click-into-card phases
      "card-classify",
      "open-detail",
      "close-detail",
      "scroll-load",
    ]),
  })
  .strict();

export const keywordEndedEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("keyword-ended"),
    batch_id: z.string().uuid(),
    platform: Platform,
    keyword_id: z.string().uuid(),
    stop_reason: z.enum([
      "user",
      "cap",
      "end-of-results",
      "error-threshold",
      "session-failure",
      "health-cap",
      "layout-switch-failure",
      "search-empty",
      // 006 — XHS-specific
      "schema-drift",
      "login-required",
    ]),
    started_at: isoMs,
    ended_at: isoMs,
    scanned_count: z.number().int().nonnegative(),
    captured_count: z.number().int().nonnegative(),
    duplicate_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
    filtered_count: z.number().int().nonnegative(),
    representative_errors: z.array(z.string()).max(5),
  })
  .strict();

export const batchEndedEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("batch-ended"),
    batch_id: z.string().uuid(),
    platform: Platform,
    stop_reason: z.enum(["user", "batch-session-dead", "all-completed"]),
    started_at: isoMs,
    ended_at: isoMs,
    executed_keyword_ids: z.array(z.string().uuid()),
    cancelled_keyword_ids: z.array(z.string().uuid()),
  })
  .strict();

export const batchEventSchema = z.discriminatedUnion("phase", [
  batchStartedEventSchema,
  keywordStartedEventSchema,
  progressEventSchema,
  keywordEndedEventSchema,
  batchEndedEventSchema,
]);
export type BatchEvent = z.infer<typeof batchEventSchema>;

export const BATCH_EVENT_TOPIC = "keyword:batch:event" as const;
