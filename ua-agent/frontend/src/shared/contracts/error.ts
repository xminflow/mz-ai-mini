import { z } from "zod";

export const SCHEMA_VERSION = "1" as const;

export const errorCodeSchema = z.enum([
  // Inherited from 001
  "INVALID_INPUT",
  "INVALID_ARGUMENT",
  "INTERNAL",
  // Inherited from 002 (素材收集)
  "DEVICE_NOT_READY",
  "DOUYIN_NOT_FOREGROUND",
  "SHARE_PANEL_UNRECOGNIZED",
  "CLIPBOARD_DENIED",
  "LIBRARY_DUPLICATE",
  "LIBRARY_NOT_FOUND",
  // Introduced by 003 (网页素材采集 — 003 surface deleted in 004; codes
  // remaining in this enum are still emitted by 004 utility code).
  "BROWSER_NOT_INSTALLED",
  "BROWSER_INSTALL_FAILED",
  "BROWSER_SESSION_DEAD",
  "DOUYIN_DOM_UNRECOGNIZED",
  "DOUYIN_BLOCKED_BY_ANTI_BOT",
  // Introduced by 004 (网页素材采集 — 关键词驱动批量采集)
  "KEYWORD_INVALID",
  "KEYWORD_DUPLICATE",
  "KEYWORD_NOT_FOUND",
  "BATCH_BUSY",
  "LAYOUT_SWITCH_FAILED",
  // Introduced by Settings + LLM provider integration
  "LLM_NOT_CONFIGURED",
  "LLM_BINARY_NOT_FOUND",
  "LLM_AUTH_FAILED",
  "LLM_STREAM_FAILED",
  // Introduced by 005 (小红书素材采集 — 关键词驱动批量采集)
  "XHS_UNREACHABLE",
  "XHS_SCHEMA_DRIFT",
  "XHS_LOGIN_REQUIRED",
  "LAYOUT_PROBE_TIMEOUT",
  "DETAIL_OPEN_TIMEOUT",
  "DETAIL_CLOSE_TIMEOUT",
  "LOAD_MORE_TIMEOUT",
  // Introduced by 实时热点 (Douyin open hot-list page)
  "DOUYIN_HOT_FETCH_FAILED",
  // Introduced by AI 分析报告 (weelume-base remote reports)
  "TRACK_ANALYSIS_FETCH_FAILED",
  // Introduced by 抖音视频下载链接 (on-demand share-page → mp4 resolver)
  "DOUYIN_VIDEO_RESOLVE_FAILED",
  "VIDEO_RESOLVE_FAILED",
  // Introduced by Fun-ASR-Nano-2512 视频文案提取
  "ASR_MODEL_MISSING",
  "ASR_MODEL_DOWNLOAD_FAILED",
  "ASR_INSTALL_BUSY",
  "TRANSCRIPT_DOWNLOAD_FAILED",
  "TRANSCRIPT_DECODE_FAILED",
  "TRANSCRIPT_NO_AUDIO",
  "TRANSCRIPT_FAILED",
  "TRANSCRIPT_BUSY",
  // Introduced by 博主分析 (Douyin blogger profile capture + works sampling)
  "BROWSER_BUSY",
  "INVALID_PROFILE_URL",
  "PROFILE_PARSE_FAILED",
  "BLOGGER_REPORT_NOT_FOUND",
  // Introduced by 爆款素材分析
  "HOT_MATERIAL_REPORT_NOT_FOUND",
  // Introduced by 手动链接采集 (素材库)
  "UNSUPPORTED_URL",
  "MANUAL_CAPTURE_BUSY",
  // Introduced by 博主分析 — analyze pipeline (sample → frames → transcript)
  "ANALYZE_BUSY",
  "FRAME_EXTRACT_FAILED",
  "FFMPEG_NOT_FOUND",
]);

export const errorDetailSchema = z.object({
  code: errorCodeSchema,
  message: z.string().min(1).max(1024),
});

export const errorEnvelopeSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(false),
  error: errorDetailSchema,
});

// Backward-compat PascalCase aliases used by 001/002 contracts.
export const ErrorCode = errorCodeSchema;
export type ErrorCode = z.infer<typeof errorCodeSchema>;

export const ErrorDetail = errorDetailSchema;
export type ErrorDetail = z.infer<typeof errorDetailSchema>;

export const ErrorEnvelope = errorEnvelopeSchema;
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;
