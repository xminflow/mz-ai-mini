import { z } from "zod";

import { Platform } from "./capture";
import { ErrorEnvelope, SCHEMA_VERSION } from "./error";

export const TRANSCRIPT_PROGRESS_TOPIC = "transcript:progress" as const;
export const ASR_INSTALL_PROGRESS_TOPIC = "asr:install-progress" as const;

export const TranscriptStage = z.enum([
  "queued",
  "resolving_url",
  "downloading_mp4",
  "loading_model",
  "transcribing",
]);
export type TranscriptStage = z.infer<typeof TranscriptStage>;

export const TranscriptExtractRequest = z.object({
  post_id: z.string().min(1).max(128),
  share_url: z.string().min(1).max(2048),
  platform: Platform.default("douyin"),
});
export type TranscriptExtractRequest = z.infer<typeof TranscriptExtractRequest>;

export const TranscriptExtractSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  post_id: z.string().min(1).max(128),
  transcript: z.string().max(65536),
  transcribed_at: z.string().datetime({ offset: false }),
  language: z.string().max(16),
  duration_s: z.number().nonnegative(),
});
export type TranscriptExtractSuccess = z.infer<typeof TranscriptExtractSuccess>;

export const TranscriptExtractResult = z.discriminatedUnion("ok", [
  TranscriptExtractSuccess,
  ErrorEnvelope,
]);
export type TranscriptExtractResult = z.infer<typeof TranscriptExtractResult>;

export const TranscriptProgressEvent = z.object({
  post_id: z.string().min(1).max(128),
  stage: TranscriptStage,
  percent: z.number().min(0).max(100),
  message: z.string().max(256).optional(),
});
export type TranscriptProgressEvent = z.infer<typeof TranscriptProgressEvent>;

// ─── Fun-ASR model install ────────────────────────────────────────────────

export const AsrStatusResult = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  installed: z.boolean(),
  model_dir: z.string(),
  size_bytes: z.union([z.number().int().nonnegative(), z.null()]),
  downloading: z.boolean(),
});
export type AsrStatusResult = z.infer<typeof AsrStatusResult>;

export const AsrInstallSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  model_dir: z.string(),
  size_bytes: z.number().int().nonnegative(),
});
export type AsrInstallSuccess = z.infer<typeof AsrInstallSuccess>;

export const AsrInstallResult = z.discriminatedUnion("ok", [
  AsrInstallSuccess,
  ErrorEnvelope,
]);
export type AsrInstallResult = z.infer<typeof AsrInstallResult>;

export const AsrInstallStage = z.enum([
  "queued",
  "listing",
  "downloading",
  "verifying",
  "done",
  "error",
]);
export type AsrInstallStage = z.infer<typeof AsrInstallStage>;

export const AsrInstallProgressEvent = z.object({
  stage: AsrInstallStage,
  file: z.string().max(256).optional(),
  bytes: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional(),
  percent: z.number().min(0).max(100).optional(),
  message: z.string().max(512).optional(),
});
export type AsrInstallProgressEvent = z.infer<typeof AsrInstallProgressEvent>;
