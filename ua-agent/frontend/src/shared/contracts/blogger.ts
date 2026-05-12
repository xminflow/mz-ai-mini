/**
 * Contracts for the 博主分析 (Douyin blogger analysis) feature.
 *
 * Three persistent shapes — `Blogger`, `BloggerVideoSample`, `BloggerEvent` —
 * plus IPC-result discriminated unions for each RPC.
 *
 * Lives alongside the keyword-crawl contracts so the renderer can import zod
 * schemas + types from one place. The patchright session is shared with the
 * keyword-crawl utility process, hence reusing `Platform` from `capture.ts`.
 */

import { z } from "zod";

import { Platform } from "./capture";
import { errorEnvelopeSchema } from "./error";

export const SCHEMA_VERSION = "1" as const;

const isoMs = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const BLOGGER_EVENT_TOPIC = "blogger:event" as const;

export const bloggerStatusSchema = z.enum([
  "pending",
  "profile_ready",
  "sampled",
  "error",
]);
export type BloggerStatus = z.infer<typeof bloggerStatusSchema>;

export const bloggerSchema = z
  .object({
    id: z.string().uuid(),
    platform: Platform,
    /** Canonical profile URL — `https://www.douyin.com/user/{sec_uid}` (no query/hash). */
    profile_url: z.string().min(1).max(2048),
    sec_uid: z.union([z.string().min(1).max(256), z.null()]),
    /** Public 抖音号 displayed under the avatar; may be different from sec_uid. */
    douyin_id: z.union([z.string().min(1).max(128), z.null()]),
    display_name: z.union([z.string().max(256), z.null()]),
    avatar_url: z.union([z.string().url().max(2048), z.null()]),
    follow_count: z.union([z.number().int().nonnegative(), z.null()]),
    fans_count: z.union([z.number().int().nonnegative(), z.null()]),
    liked_count: z.union([z.number().int().nonnegative(), z.null()]),
    signature: z.union([z.string().max(2048), z.null()]),
    status: bloggerStatusSchema,
    last_error: z.union([z.string().max(1024), z.null()]),
    profile_captured_at: z.union([isoMs, z.null()]),
    sampled_at: z.union([isoMs, z.null()]),
    total_works_at_sample: z.union([z.number().int().nonnegative(), z.null()]),
    analysis_generated_at: z.union([isoMs, z.null()]),
    analysis_error: z.union([z.string().max(1024), z.null()]),
    created_at: isoMs,
    updated_at: isoMs,
  })
  .strict();
export type Blogger = z.infer<typeof bloggerSchema>;

export const bloggerVideoSampleSchema = z
  .object({
    position: z.number().int().min(0).max(99),
    /** Canonical video URL — `https://www.douyin.com/video/{aweme_id}`. */
    video_url: z.string().url().max(2048),
    title: z.union([z.string().max(2048), z.null()]),
    /** Original index in the full works grid at sample time, for traceability. */
    source_index: z.union([z.number().int().nonnegative(), z.null()]),
    sampled_at: isoMs,
    // ── Per-sample analysis (filled in by `blogger:analyze`) ────────────────
    transcript: z.union([z.string().max(65536), z.null()]),
    transcript_lang: z.union([z.string().max(16), z.null()]),
    /** 0 or 4 absolute filesystem paths under userData/blogger-frames/... */
    frames: z.array(z.string().max(1024)).max(4),
    analyzed_at: z.union([isoMs, z.null()]),
    analyze_error: z.union([z.string().max(1024), z.null()]),
  })
  .strict();
export type BloggerVideoSample = z.infer<typeof bloggerVideoSampleSchema>;

// ─── IPC: bloggerList ──────────────────────────────────────────────────────

export const bloggerListInputSchema = z.object({}).strict();
export type BloggerListInput = z.infer<typeof bloggerListInputSchema>;

export const bloggerListSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    bloggers: z.array(bloggerSchema),
  })
  .strict();
export type BloggerListSuccess = z.infer<typeof bloggerListSuccessSchema>;

export const bloggerListResultSchema = z.discriminatedUnion("ok", [
  bloggerListSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerListResult = z.infer<typeof bloggerListResultSchema>;

// ─── IPC: bloggerCreate ────────────────────────────────────────────────────

export const bloggerCreateInputSchema = z
  .object({
    profile_url: z
      .string()
      .min(1)
      .max(2048)
      .refine((s) => s.trim().length > 0, { message: "URL 不能为空" }),
  })
  .strict();
export type BloggerCreateInput = z.infer<typeof bloggerCreateInputSchema>;

export const bloggerCreateSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    blogger: bloggerSchema,
  })
  .strict();
export type BloggerCreateSuccess = z.infer<typeof bloggerCreateSuccessSchema>;

export const bloggerCreateResultSchema = z.discriminatedUnion("ok", [
  bloggerCreateSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerCreateResult = z.infer<typeof bloggerCreateResultSchema>;

// ─── IPC: bloggerDelete ────────────────────────────────────────────────────

export const bloggerDeleteInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type BloggerDeleteInput = z.infer<typeof bloggerDeleteInputSchema>;

export const bloggerDeleteSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    deleted: z.boolean(),
  })
  .strict();
export type BloggerDeleteSuccess = z.infer<typeof bloggerDeleteSuccessSchema>;

export const bloggerDeleteResultSchema = z.discriminatedUnion("ok", [
  bloggerDeleteSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerDeleteResult = z.infer<typeof bloggerDeleteResultSchema>;

// ─── IPC: bloggerCaptureProfile ────────────────────────────────────────────

export const bloggerCaptureProfileInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type BloggerCaptureProfileInput = z.infer<typeof bloggerCaptureProfileInputSchema>;

export const bloggerCaptureProfileSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    blogger: bloggerSchema,
  })
  .strict();
export type BloggerCaptureProfileSuccess = z.infer<typeof bloggerCaptureProfileSuccessSchema>;

export const bloggerCaptureProfileResultSchema = z.discriminatedUnion("ok", [
  bloggerCaptureProfileSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerCaptureProfileResult = z.infer<typeof bloggerCaptureProfileResultSchema>;

// ─── IPC: bloggerSampleVideos ──────────────────────────────────────────────

export const bloggerSampleVideosInputSchema = z
  .object({
    id: z.string().uuid(),
    /** Sample size; defaults to 15 server-side. Capped to [1, 100]. */
    k: z.number().int().min(1).max(100).optional(),
    append: z.boolean().optional(),
  })
  .strict();
export type BloggerSampleVideosInput = z.infer<typeof bloggerSampleVideosInputSchema>;

export const bloggerSampleVideosSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    blogger: bloggerSchema,
    samples: z.array(bloggerVideoSampleSchema),
  })
  .strict();
export type BloggerSampleVideosSuccess = z.infer<typeof bloggerSampleVideosSuccessSchema>;

export const bloggerSampleVideosResultSchema = z.discriminatedUnion("ok", [
  bloggerSampleVideosSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerSampleVideosResult = z.infer<typeof bloggerSampleVideosResultSchema>;

// ─── IPC: bloggerListSamples ───────────────────────────────────────────────

export const bloggerListSamplesInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type BloggerListSamplesInput = z.infer<typeof bloggerListSamplesInputSchema>;

export const bloggerListSamplesSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    samples: z.array(bloggerVideoSampleSchema),
  })
  .strict();
export type BloggerListSamplesSuccess = z.infer<typeof bloggerListSamplesSuccessSchema>;

export const bloggerListSamplesResultSchema = z.discriminatedUnion("ok", [
  bloggerListSamplesSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerListSamplesResult = z.infer<typeof bloggerListSamplesResultSchema>;

// ─── IPC: bloggerDeleteSample ─────────────────────────────────────────────

export const bloggerDeleteSampleInputSchema = z
  .object({
    blogger_id: z.string().uuid(),
    video_url: z.string().url().max(2048),
  })
  .strict();
export type BloggerDeleteSampleInput = z.infer<typeof bloggerDeleteSampleInputSchema>;

export const bloggerDeleteSampleSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    deleted: z.boolean(),
    blogger: bloggerSchema,
    remaining_samples: z.number().int().nonnegative(),
  })
  .strict();
export type BloggerDeleteSampleSuccess = z.infer<typeof bloggerDeleteSampleSuccessSchema>;

export const bloggerDeleteSampleResultSchema = z.discriminatedUnion("ok", [
  bloggerDeleteSampleSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerDeleteSampleResult = z.infer<typeof bloggerDeleteSampleResultSchema>;

// ─── Streaming events: blogger:event ───────────────────────────────────────

const baseFields = {
  schema_version: z.literal(SCHEMA_VERSION),
  blogger_id: z.string().uuid(),
} as const;

export const bloggerProfileStartedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("profile-started"),
    started_at: isoMs,
  })
  .strict();

export const bloggerProfileEndedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("profile-ended"),
    status: z.enum(["profile_ready", "error"]),
    last_error: z.union([z.string().max(1024), z.null()]),
    ended_at: isoMs,
  })
  .strict();

export const bloggerSampleStartedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("sample-started"),
    started_at: isoMs,
  })
  .strict();

export const bloggerSampleProgressEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("sample-progress"),
    scroll_count: z.number().int().nonnegative(),
    loaded_count: z.number().int().nonnegative(),
  })
  .strict();

export const bloggerSampleEndedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("sample-ended"),
    status: z.enum(["sampled", "error"]),
    last_error: z.union([z.string().max(1024), z.null()]),
    sampled_count: z.number().int().nonnegative(),
    total_works: z.number().int().nonnegative(),
    ended_at: isoMs,
  })
  .strict();

export const bloggerAnalyzeStartedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("analyze-started"),
    started_at: isoMs,
    sample_required: z.boolean(),
  })
  .strict();

export const bloggerAnalyzeVideoStartedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("analyze-video-started"),
    video_url: z.string().url().max(2048),
    position: z.number().int().min(0).max(99),
    processed: z.number().int().nonnegative(),
    total_to_process: z.number().int().nonnegative(),
  })
  .strict();

export const bloggerAnalyzeVideoEndedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("analyze-video-ended"),
    video_url: z.string().url().max(2048),
    position: z.number().int().min(0).max(99),
    status: z.enum(["ok", "error"]),
    error: z.union([z.string().max(1024), z.null()]),
  })
  .strict();

export const bloggerAnalyzeEndedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("analyze-ended"),
    ok_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
    ended_at: isoMs,
  })
  .strict();

export const bloggerAnalyzeReportStartedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("analyze-report-started"),
    started_at: isoMs,
    run_id: z.string().uuid(),
  })
  .strict();

export const bloggerAnalyzeReportEndedEventSchema = z
  .object({
    ...baseFields,
    phase: z.literal("analyze-report-ended"),
    status: z.enum(["ok", "error"]),
    last_error: z.union([z.string().max(1024), z.null()]),
    report_path: z.string().min(1).max(4096),
    run_id: z.string().uuid(),
    ended_at: isoMs,
  })
  .strict();

export const bloggerEventSchema = z.discriminatedUnion("phase", [
  bloggerProfileStartedEventSchema,
  bloggerProfileEndedEventSchema,
  bloggerSampleStartedEventSchema,
  bloggerSampleProgressEventSchema,
  bloggerSampleEndedEventSchema,
  bloggerAnalyzeStartedEventSchema,
  bloggerAnalyzeVideoStartedEventSchema,
  bloggerAnalyzeVideoEndedEventSchema,
  bloggerAnalyzeReportStartedEventSchema,
  bloggerAnalyzeReportEndedEventSchema,
  bloggerAnalyzeEndedEventSchema,
]);
export type BloggerEvent = z.infer<typeof bloggerEventSchema>;

// ─── IPC: bloggerAnalyze ───────────────────────────────────────────────────

export const bloggerAnalyzeInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type BloggerAnalyzeInput = z.infer<typeof bloggerAnalyzeInputSchema>;

export const bloggerAnalyzeSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    blogger: bloggerSchema,
    ok_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
  })
  .strict();
export type BloggerAnalyzeSuccess = z.infer<typeof bloggerAnalyzeSuccessSchema>;

export const bloggerAnalyzeResultSchema = z.discriminatedUnion("ok", [
  bloggerAnalyzeSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerAnalyzeResult = z.infer<typeof bloggerAnalyzeResultSchema>;

// ─── IPC: bloggerGetReport ────────────────────────────────────────────────

export const bloggerGetReportInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type BloggerGetReportInput = z.infer<typeof bloggerGetReportInputSchema>;

export const bloggerGetReportSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    blogger: bloggerSchema,
    markdown: z.string(),
    path: z.string().min(1).max(4096),
    generated_at: isoMs,
  })
  .strict();
export type BloggerGetReportSuccess = z.infer<typeof bloggerGetReportSuccessSchema>;

export const bloggerGetReportResultSchema = z.discriminatedUnion("ok", [
  bloggerGetReportSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerGetReportResult = z.infer<typeof bloggerGetReportResultSchema>;

// ─── IPC: bloggerAnalyzeCancel ─────────────────────────────────────────────

export const bloggerAnalyzeCancelInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type BloggerAnalyzeCancelInput = z.infer<typeof bloggerAnalyzeCancelInputSchema>;

export const bloggerAnalyzeCancelSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    cancelled: z.boolean(),
  })
  .strict();
export type BloggerAnalyzeCancelSuccess = z.infer<typeof bloggerAnalyzeCancelSuccessSchema>;

export const bloggerAnalyzeCancelResultSchema = z.discriminatedUnion("ok", [
  bloggerAnalyzeCancelSuccessSchema,
  errorEnvelopeSchema,
]);
export type BloggerAnalyzeCancelResult = z.infer<typeof bloggerAnalyzeCancelResultSchema>;
