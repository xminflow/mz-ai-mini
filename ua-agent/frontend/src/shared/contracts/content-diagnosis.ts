import { z } from "zod";

import { MaterialEntry, Platform } from "./capture";
import { errorEnvelopeSchema, SCHEMA_VERSION } from "./error";

const isoMs = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const CONTENT_DIAGNOSIS_EVENT_TOPIC = "content-diagnosis:event" as const;

export const contentDiagnosisStatusSchema = z.enum([
  "pending",
  "captured",
  "media_ready",
  "report_ready",
  "error",
]);
export type ContentDiagnosisStatus = z.infer<typeof contentDiagnosisStatusSchema>;

export const contentDiagnosisFrameSchema = z
  .object({
    kind: z.enum(["cover", "sample"]),
    path: z.string().min(1).max(1024),
    index: z.number().int().min(0).max(9),
    timestamp_secs: z.number().nonnegative(),
  })
  .strict();
export type ContentDiagnosisFrame = z.infer<typeof contentDiagnosisFrameSchema>;

export const contentDiagnosisSchema = z
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
    status: contentDiagnosisStatusSchema,
    frames: z.array(contentDiagnosisFrameSchema).max(10),
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
export type ContentDiagnosis = z.infer<typeof contentDiagnosisSchema>;

export const contentDiagnosisListSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    items: z.array(contentDiagnosisSchema),
  })
  .strict();
export type ContentDiagnosisListResult = z.infer<
  typeof contentDiagnosisListSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const contentDiagnosisListResultSchema = z.discriminatedUnion("ok", [
  contentDiagnosisListSuccessSchema,
  errorEnvelopeSchema,
]);

export const contentDiagnosisCreateInputSchema = z
  .object({
    share_url: z.string().min(1).max(4096),
  })
  .strict();
export type ContentDiagnosisCreateInput = z.infer<typeof contentDiagnosisCreateInputSchema>;

export const contentDiagnosisCreateSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: contentDiagnosisSchema,
  })
  .strict();
export type ContentDiagnosisCreateResult = z.infer<
  typeof contentDiagnosisCreateSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const contentDiagnosisCreateResultSchema = z.discriminatedUnion("ok", [
  contentDiagnosisCreateSuccessSchema,
  errorEnvelopeSchema,
]);

export const contentDiagnosisIdInputSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict();
export type ContentDiagnosisIdInput = z.infer<typeof contentDiagnosisIdInputSchema>;

export const contentDiagnosisAnalyzeSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: contentDiagnosisSchema,
  })
  .strict();
export type ContentDiagnosisAnalyzeResult = z.infer<
  typeof contentDiagnosisAnalyzeSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const contentDiagnosisAnalyzeResultSchema = z.discriminatedUnion("ok", [
  contentDiagnosisAnalyzeSuccessSchema,
  errorEnvelopeSchema,
]);

export const contentDiagnosisGetReportSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: contentDiagnosisSchema,
    markdown: z.string(),
    path: z.string().min(1).max(4096),
    generated_at: isoMs,
  })
  .strict();
export type ContentDiagnosisGetReportResult = z.infer<
  typeof contentDiagnosisGetReportSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const contentDiagnosisGetReportResultSchema = z.discriminatedUnion("ok", [
  contentDiagnosisGetReportSuccessSchema,
  errorEnvelopeSchema,
]);

export const contentDiagnosisDeleteSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    deleted: z.boolean(),
  })
  .strict();
export type ContentDiagnosisDeleteResult = z.infer<
  typeof contentDiagnosisDeleteSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;
export const contentDiagnosisDeleteResultSchema = z.discriminatedUnion("ok", [
  contentDiagnosisDeleteSuccessSchema,
  errorEnvelopeSchema,
]);

export const contentDiagnosisCaptureSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    item: contentDiagnosisSchema,
    material: MaterialEntry,
  })
  .strict();
export type ContentDiagnosisCaptureResult = z.infer<
  typeof contentDiagnosisCaptureSuccessSchema
> | z.infer<typeof errorEnvelopeSchema>;

const baseEventFields = {
  schema_version: z.literal(SCHEMA_VERSION),
  analysis_id: z.string().uuid(),
} as const;

export const contentDiagnosisEventSchema = z.discriminatedUnion("phase", [
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
export type ContentDiagnosisEvent = z.infer<typeof contentDiagnosisEventSchema>;
