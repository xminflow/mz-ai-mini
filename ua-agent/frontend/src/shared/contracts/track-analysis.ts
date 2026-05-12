import { z } from "zod";

import { ErrorEnvelope, SCHEMA_VERSION } from "./error";

export const trackAnalysisStoryTypeSchema = z.enum(["case", "project"]);
export type TrackAnalysisStoryType = z.infer<typeof trackAnalysisStoryTypeSchema>;

export const trackAnalysisStorySchema = z.object({
  id: z.string().min(1).max(128),
  type: trackAnalysisStoryTypeSchema,
  title: z.string().max(256),
  summary: z.string().max(2048),
  industry: z.string().max(64),
  cover_image_url: z.string().max(2048),
  tags: z.array(z.string().max(64)).max(8),
  read_time_text: z.string().max(32),
  published_at_text: z.string().max(64),
});
export type TrackAnalysisStory = z.infer<typeof trackAnalysisStorySchema>;

export const trackAnalysisDocumentSchema = z.object({
  title: z.string().max(256),
  markdown_content: z.string(),
});
export type TrackAnalysisDocument = z.infer<typeof trackAnalysisDocumentSchema>;

export const trackAnalysisDocumentsSchema = z.object({
  business_case: z.union([trackAnalysisDocumentSchema, z.null()]),
  market_research: z.union([trackAnalysisDocumentSchema, z.null()]),
  business_model: z.union([trackAnalysisDocumentSchema, z.null()]),
  ai_business_upgrade: z.union([trackAnalysisDocumentSchema, z.null()]),
  how_to_do: z.union([trackAnalysisDocumentSchema, z.null()]),
});
export type TrackAnalysisDocuments = z.infer<typeof trackAnalysisDocumentsSchema>;

export const trackAnalysisStoryDetailSchema = trackAnalysisStorySchema.extend({
  summary_markdown: z.string(),
  documents: trackAnalysisDocumentsSchema,
});
export type TrackAnalysisStoryDetail = z.infer<typeof trackAnalysisStoryDetailSchema>;

export const trackAnalysisListRequestSchema = z.object({
  cursor: z.string().max(256).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  industry: z.string().max(64).optional(),
  keyword: z.string().max(128).optional(),
});
export type TrackAnalysisListRequest = z.infer<typeof trackAnalysisListRequestSchema>;

export const trackAnalysisGetReportRequestSchema = z.object({
  id: z.string().min(1).max(128),
});
export type TrackAnalysisGetReportRequest = z.infer<typeof trackAnalysisGetReportRequestSchema>;

export const trackAnalysisListSuccessSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  items: z.array(trackAnalysisStorySchema).max(100),
  next_cursor: z.string(),
  available_industries: z.array(z.string().max(64)).max(100),
});
export type TrackAnalysisListSuccess = z.infer<typeof trackAnalysisListSuccessSchema>;

export const trackAnalysisGetReportSuccessSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  item: trackAnalysisStoryDetailSchema,
});
export type TrackAnalysisGetReportSuccess = z.infer<typeof trackAnalysisGetReportSuccessSchema>;

export const trackAnalysisListResultSchema = z.discriminatedUnion("ok", [
  trackAnalysisListSuccessSchema,
  ErrorEnvelope,
]);
export type TrackAnalysisListResult = z.infer<typeof trackAnalysisListResultSchema>;

export const trackAnalysisGetReportResultSchema = z.discriminatedUnion("ok", [
  trackAnalysisGetReportSuccessSchema,
  ErrorEnvelope,
]);
export type TrackAnalysisGetReportResult = z.infer<typeof trackAnalysisGetReportResultSchema>;
