// Runtime copy of specs/004-douyin-keyword-crawl/contracts/batch-status.zod.txt

import { z } from "zod";

import { Platform } from "../capture";
import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const batchStatusInputSchema = z.object({}).strict();
export type BatchStatusInput = z.infer<typeof batchStatusInputSchema>;

export const keywordRunSnapshotSchema = z
  .object({
    keyword_id: z.string().uuid(),
    /** Platform of this run (006). Always equals the parent batch's platform. */
    platform: Platform,
    keyword_text: z.string().min(1).max(100),
    position: z.number().int().min(1),
    status: z.enum(["pending", "running", "done", "stopped", "error"]),
    stop_reason: z.union([
      z.enum([
        "user",
        "cap",
        "end-of-results",
        "error-threshold",
        "session-failure",
        "health-cap",
        "layout-switch-failure",
        "search-empty",
        // 006 — XHS-specific run stop reasons
        "schema-drift",
        "login-required",
      ]),
      z.null(),
    ]),
    started_at: z.union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      z.null(),
    ]),
    ended_at: z.union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      z.null(),
    ]),
    scanned_count: z.number().int().nonnegative(),
    captured_count: z.number().int().nonnegative(),
    duplicate_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
    filtered_count: z.number().int().nonnegative(),
    representative_errors: z.array(z.string()).max(5),
  })
  .strict();
export type KeywordRunSnapshot = z.infer<typeof keywordRunSnapshotSchema>;

export const batchSnapshotSchema = z
  .object({
    batch_id: z.string().uuid(),
    /** Platform of this batch (006). All runs in this batch share this platform. */
    platform: Platform,
    status: z.enum(["running", "done", "stopped", "error"]),
    stop_reason: z.union([
      z.enum(["user", "batch-session-dead", "all-completed"]),
      z.null(),
    ]),
    started_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    ended_at: z.union([
      z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
      z.null(),
    ]),
    selected_keyword_ids: z.array(z.string().uuid()),
    runs: z.array(keywordRunSnapshotSchema),
    current_index: z.union([z.number().int().min(0), z.null()]),
  })
  .strict();
export type BatchSnapshot = z.infer<typeof batchSnapshotSchema>;

export const batchStatusSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    batch: z.union([batchSnapshotSchema, z.null()]),
  })
  .strict();
export type BatchStatusSuccess = z.infer<typeof batchStatusSuccessSchema>;

export const batchStatusResultSchema = z.discriminatedUnion("ok", [
  batchStatusSuccessSchema,
  errorEnvelopeSchema,
]);
export type BatchStatusResult = z.infer<typeof batchStatusResultSchema>;
