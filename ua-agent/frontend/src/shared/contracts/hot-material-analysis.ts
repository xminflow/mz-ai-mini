import { z } from "zod";

import { MaterialEntry, Platform } from "./capture";
import { errorEnvelopeSchema, SCHEMA_VERSION } from "./error";

const isoMs = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const HOT_MATERIAL_EVENT_TOPIC = "hot-material:event" as const;

export const hotMaterialStatusSchema = z.enum([
  "pending",
  "captured",
  "media_ready",
  "report_ready",
  "error",
]);
export type HotMaterialStatus = z.infer<typeof hotMaterialStatusSchema>;

export const hotMaterialFrameSchema = z
  .object({
    kind: z.enum(["cover", "sample"]),
    path: z.string().min(1).max(1024),
    index: z.number().int().min(0).max(9),
    timestamp_secs: z.number().nonnegative(),
  })
  .strict();
export type HotMaterialFrame = z.infer<typeof hotMaterialFrameSchema>;

export const hotMaterialAnalysisSchema = z
  .object({
    id: z.string().uuid(),
    platform: Platform,
    share_url: z.string().min(1).max(2048),
    canonical_url: z.string().min(1).max(2048),
    post_id: z.string().min(1).max(128),
    title: z.union([z.string().max(2048), z.null()]),
    caption: z.string().max(4096),
    author_handle: z.string().min(1).max(256),
    author_display_name: z.union([z.string().max(256), z.null()]),
    like_count: z.number().int().gte(-1),
    comment_count: z.number().int().gte(-1),
    share_count: z.number().int().gte(-1),
    collect_count: z.number().int().gte(-1),
    author_follower_count: z.union([z.number().int().positive(), z.null()]).default(null),
    status: hotMaterialStatusSchema,
    frames: z.array(hotMaterialFrameSchema).max(10),
    transcript: z.union([z.string().max(65536), z.null()]),
    transcript_lang: z.union([z.string().max(16), z.null()]),
    captured_at: z.union([isoMs, z.null()]),
    media_analyzed_at: z.union([isoMs, z.null()]),
    analysis_generated_at: z.union([isoMs, z.null()]),
    last_error: z.union([z.string().max(1024), z.null()]),
    created_at: isoMs,
    updated_at: isoMs,
  })
  .strict();
export type HotMaterialAnalysis = z.infer<typeof hotMaterialAnalysisSchema>;

export const hotMaterialListSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    items: z.array(hotMaterialAnalysisSchema),
  })
  .strict();
export type HotMaterialListResult = z.infer<
  typeof hotMaterialListSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const hotMaterialListResultSchema = z.discriminatedUnion("ok", [
  hotMaterialListSuccessSchema,
  errorEnvelopeSchema,
]);

export const hotMaterialCreateInputSchema = z
  .object({
    share_url: z.string().min(1).max(4096),
  })
  .strict();
export type HotMaterialCreateInput = z.infer<typeof hotMaterialCreateInputSchema>;

export const hotMaterialCreateSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: hotMaterialAnalysisSchema,
  })
  .strict();
export type HotMaterialCreateResult = z.infer<
  typeof hotMaterialCreateSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const hotMaterialCreateResultSchema = z.discriminatedUnion("ok", [
  hotMaterialCreateSuccessSchema,
  errorEnvelopeSchema,
]);

export const hotMaterialIdInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type HotMaterialIdInput = z.infer<typeof hotMaterialIdInputSchema>;

export const hotMaterialAnalyzeSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: hotMaterialAnalysisSchema,
  })
  .strict();
export type HotMaterialAnalyzeResult = z.infer<
  typeof hotMaterialAnalyzeSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const hotMaterialAnalyzeResultSchema = z.discriminatedUnion("ok", [
  hotMaterialAnalyzeSuccessSchema,
  errorEnvelopeSchema,
]);

export const hotMaterialGetReportSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: hotMaterialAnalysisSchema,
    markdown: z.string(),
    path: z.string().min(1).max(4096),
    generated_at: isoMs,
  })
  .strict();
export type HotMaterialGetReportResult = z.infer<
  typeof hotMaterialGetReportSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const hotMaterialGetReportResultSchema = z.discriminatedUnion("ok", [
  hotMaterialGetReportSuccessSchema,
  errorEnvelopeSchema,
]);

export const hotMaterialDeleteSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    deleted: z.boolean(),
  })
  .strict();
export type HotMaterialDeleteResult = z.infer<
  typeof hotMaterialDeleteSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const hotMaterialDeleteResultSchema = z.discriminatedUnion("ok", [
  hotMaterialDeleteSuccessSchema,
  errorEnvelopeSchema,
]);

export const hotMaterialCaptureSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: hotMaterialAnalysisSchema,
    material: MaterialEntry,
  })
  .strict();
export type HotMaterialCaptureResult = z.infer<
  typeof hotMaterialCaptureSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;

const baseEventFields = {
  schema_version: z.literal(SCHEMA_VERSION),
  analysis_id: z.string().uuid(),
} as const;

export const hotMaterialEventSchema = z.discriminatedUnion("phase", [
  z.object({ ...baseEventFields, phase: z.literal("capture-started"), started_at: isoMs }).strict(),
  z
    .object({
      ...baseEventFields,
      phase: z.literal("capture-ended"),
      status: z.enum(["ok", "error"]),
      error: z.union([z.string().max(1024), z.null()]),
      ended_at: isoMs,
    })
    .strict(),
  z.object({ ...baseEventFields, phase: z.literal("media-started"), started_at: isoMs }).strict(),
  z
    .object({
      ...baseEventFields,
      phase: z.literal("media-ended"),
      status: z.enum(["ok", "error"]),
      frame_count: z.number().int().nonnegative(),
      error: z.union([z.string().max(1024), z.null()]),
      ended_at: isoMs,
    })
    .strict(),
  z
    .object({
      ...baseEventFields,
      phase: z.literal("report-started"),
      started_at: isoMs,
      run_id: z.string().uuid(),
    })
    .strict(),
  z
    .object({
      ...baseEventFields,
      phase: z.literal("report-ended"),
      status: z.enum(["ok", "error"]),
      error: z.union([z.string().max(1024), z.null()]),
      run_id: z.string().uuid(),
      ended_at: isoMs,
    })
    .strict(),
]);
export type HotMaterialEvent = z.infer<typeof hotMaterialEventSchema>;
