import { z } from "zod";

import { Platform } from "./capture";
import { errorEnvelopeSchema } from "./error";

export const SCHEMA_VERSION = "1" as const;
const isoMs = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const MANUAL_CAPTURE_EVENT_TOPIC = "manual-capture:event" as const;

export interface ManualCaptureCanonical {
  platform: z.infer<typeof Platform>;
  canonical_url: string;
  post_id: string | null;
}

export type ManualCaptureUrlParseResult =
  | { ok: true; value: ManualCaptureCanonical }
  | { ok: false; code: "invalid-url" | "unsupported-url"; message: string };

const DOUYIN_DIRECT_RE = /^\/(video|note)\/([0-9A-Za-z_-]{6,32})\/?$/;
const DOUYIN_MODAL_ID_RE = /^[0-9A-Za-z_-]{6,32}$/;
const XHS_EXPLORE_RE = /^\/explore\/([0-9A-Za-z]{8,32})\/?$/;
const XHS_DISCOVERY_RE = /^\/discovery\/item\/([0-9A-Za-z]{8,32})\/?$/;
const URL_IN_TEXT_RE = /https?:\/\/[^\s]+/i;

function extractFirstUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  const direct = trimmed.match(/^https?:\/\/\S+$/i);
  if (direct !== null) {
    return trimmed.replace(/[）)\]】>,，。！!？?；;：:"'“”‘’]+$/u, "");
  }
  const embedded = trimmed.match(URL_IN_TEXT_RE);
  if (embedded === null || embedded[0] === undefined) return null;
  return embedded[0].replace(/[）)\]】>,，。！!？?；;：:"'“”‘’]+$/u, "");
}

export function parseManualCaptureUrl(rawUrl: string): ManualCaptureUrlParseResult {
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    return { ok: false, code: "invalid-url", message: "请输入链接" };
  }

  const extractedUrl = extractFirstUrl(rawUrl);
  if (extractedUrl === null) {
    return { ok: false, code: "invalid-url", message: "请粘贴分享链接或包含链接的分享文案" };
  }

  let parsed: URL;
  try {
    parsed = new URL(extractedUrl);
  } catch {
    return { ok: false, code: "invalid-url", message: "请输入合法链接" };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, code: "invalid-url", message: "请输入合法链接" };
  }

  const host = parsed.hostname.toLowerCase();
  if (host === "v.douyin.com") {
    return {
      ok: true,
      value: {
        platform: "douyin",
        canonical_url: parsed.toString(),
        post_id: null,
      },
    };
  }

  if (host === "www.douyin.com" || host === "douyin.com") {
    const videoMatch = parsed.pathname.match(DOUYIN_DIRECT_RE);
    if (videoMatch !== null && videoMatch[2] !== undefined) {
      const postId = videoMatch[2];
      const kind = videoMatch[1] === "note" ? "note" : "video";
      return {
        ok: true,
        value: {
          platform: "douyin",
          canonical_url: `https://www.douyin.com/${kind}/${postId}`,
          post_id: postId,
        },
      };
    }
    const modalId = parsed.searchParams.get("modal_id");
    if (modalId !== null && DOUYIN_MODAL_ID_RE.test(modalId)) {
      return {
        ok: true,
        value: {
          platform: "douyin",
          canonical_url: `https://www.douyin.com/video/${modalId}`,
          post_id: modalId,
        },
      };
    }
    return {
      ok: false,
      code: "unsupported-url",
      message: "仅支持抖音作品直链、带 modal_id 的抖音作品链接，或抖音分享短链",
    };
  }

  if (host === "www.xiaohongshu.com" || host === "xiaohongshu.com") {
    const exploreMatch = parsed.pathname.match(XHS_EXPLORE_RE);
    const discoveryMatch = parsed.pathname.match(XHS_DISCOVERY_RE);
    const noteId = exploreMatch?.[1] ?? discoveryMatch?.[1] ?? null;
    if (noteId === null) {
      return { ok: false, code: "unsupported-url", message: "仅支持小红书作品直链" };
    }
    const out = new URL(`https://www.xiaohongshu.com/explore/${noteId}`);
    const xsecToken = parsed.searchParams.get("xsec_token");
    if (xsecToken !== null && xsecToken.length > 0) {
      out.searchParams.set("xsec_token", xsecToken);
      out.searchParams.set("xsec_source", "pc_search");
    }
    return {
      ok: true,
      value: {
        platform: "xiaohongshu",
        canonical_url: out.toString(),
        post_id: noteId,
      },
    };
  }

  return { ok: false, code: "unsupported-url", message: "仅支持抖音或小红书作品直链" };
}

export const manualCaptureStartInputSchema = z
  .object({
    url: z.string().min(1).max(4096),
  })
  .strict();
export type ManualCaptureStartInput = z.infer<typeof manualCaptureStartInputSchema>;

export const manualCaptureStopReasonSchema = z.enum([
  "captured",
  "duplicate",
  "user",
  "invalid-url",
  "unsupported-url",
  "login-required",
  "capture-failed",
]);
export type ManualCaptureStopReason = z.infer<typeof manualCaptureStopReasonSchema>;

export const manualCapturePhaseSchema = z.enum([
  "validate",
  "navigate",
  "open-detail",
  "dwell",
  "read",
  "record",
  "close-detail",
  "done",
]);
export type ManualCapturePhase = z.infer<typeof manualCapturePhaseSchema>;

export const manualCaptureStatusSchema = z.enum(["running", "done", "stopped", "error"]);
export type ManualCaptureStatus = z.infer<typeof manualCaptureStatusSchema>;

export const manualCaptureSnapshotSchema = z
  .object({
    task_id: z.string().uuid(),
    platform: Platform,
    source_type: z.literal("manual_url"),
    canonical_url: z.string().url().max(2048),
    status: manualCaptureStatusSchema,
    stop_reason: z.union([manualCaptureStopReasonSchema, z.null()]),
    started_at: isoMs,
    ended_at: z.union([isoMs, z.null()]),
    scanned_count: z.number().int().nonnegative(),
    captured_count: z.number().int().nonnegative(),
    duplicate_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
    filtered_count: z.number().int().nonnegative(),
    current_phase: manualCapturePhaseSchema,
    result_post_id: z.union([z.string().min(1).max(128), z.null()]).default(null),
  })
  .strict();
export type ManualCaptureSnapshot = z.infer<typeof manualCaptureSnapshotSchema>;

export const manualCaptureStartSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    task_id: z.string().uuid(),
    platform: Platform,
    canonical_url: z.string().url().max(2048),
    started_at: isoMs,
  })
  .strict();
export type ManualCaptureStartSuccess = z.infer<typeof manualCaptureStartSuccessSchema>;

export const manualCaptureStartResultSchema = z.discriminatedUnion("ok", [
  manualCaptureStartSuccessSchema,
  errorEnvelopeSchema,
]);
export type ManualCaptureStartResult = z.infer<typeof manualCaptureStartResultSchema>;

export const manualCaptureStatusInputSchema = z.object({}).strict();
export type ManualCaptureStatusInput = z.infer<typeof manualCaptureStatusInputSchema>;

export const manualCaptureStatusSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    task: z.union([manualCaptureSnapshotSchema, z.null()]),
  })
  .strict();
export type ManualCaptureStatusSuccess = z.infer<typeof manualCaptureStatusSuccessSchema>;

export const manualCaptureStatusResultSchema = z.discriminatedUnion("ok", [
  manualCaptureStatusSuccessSchema,
  errorEnvelopeSchema,
]);
export type ManualCaptureStatusResult = z.infer<typeof manualCaptureStatusResultSchema>;

export const manualCaptureStopInputSchema = z.object({}).strict();
export type ManualCaptureStopInput = z.infer<typeof manualCaptureStopInputSchema>;

export const manualCaptureStopSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    task_id: z.union([z.string().uuid(), z.null()]),
    was_running: z.boolean(),
  })
  .strict();
export type ManualCaptureStopSuccess = z.infer<typeof manualCaptureStopSuccessSchema>;

export const manualCaptureStopResultSchema = z.discriminatedUnion("ok", [
  manualCaptureStopSuccessSchema,
  errorEnvelopeSchema,
]);
export type ManualCaptureStopResult = z.infer<typeof manualCaptureStopResultSchema>;

export const manualCaptureTaskStartedEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("task-started"),
    task_id: z.string().uuid(),
    platform: Platform,
    canonical_url: z.string().url().max(2048),
    started_at: isoMs,
  })
  .strict();

export const manualCaptureProgressEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("progress"),
    task_id: z.string().uuid(),
    platform: Platform,
    scanned_count: z.number().int().nonnegative(),
    captured_count: z.number().int().nonnegative(),
    duplicate_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
    filtered_count: z.number().int().nonnegative(),
    current_phase: manualCapturePhaseSchema,
  })
  .strict();

export const manualCaptureTaskEndedEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    phase: z.literal("task-ended"),
    task_id: z.string().uuid(),
    platform: Platform,
    status: manualCaptureStatusSchema,
    stop_reason: manualCaptureStopReasonSchema,
    started_at: isoMs,
    ended_at: isoMs,
    scanned_count: z.number().int().nonnegative(),
    captured_count: z.number().int().nonnegative(),
    duplicate_count: z.number().int().nonnegative(),
    error_count: z.number().int().nonnegative(),
    filtered_count: z.number().int().nonnegative(),
    result_post_id: z.union([z.string().min(1).max(128), z.null()]).default(null),
  })
  .strict();

export const manualCaptureEventSchema = z.discriminatedUnion("phase", [
  manualCaptureTaskStartedEventSchema,
  manualCaptureProgressEventSchema,
  manualCaptureTaskEndedEventSchema,
]);
export type ManualCaptureEvent = z.infer<typeof manualCaptureEventSchema>;
