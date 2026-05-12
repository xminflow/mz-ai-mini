/**
 * Utility-process RPC handlers for 博主分析 — browser automation only.
 *
 * Two RPCs:
 *   - bloggerCaptureProfile  — open profile in patchright, scrape header
 *   - bloggerSampleVideos    — open profile, scroll to bottom, stratified-sample
 *
 * Persistence is owned by the main process (filesystem-backed store under
 * `userData/blogger-frames/`). Both handlers receive `profile_url` directly
 * and return raw scraped fields; main writes them to disk.
 *
 * Events (`profile-*` and `sample-*`) still fire from this process — they
 * carry the `blogger_id` supplied by the caller.
 *
 * Browser contention: refuse if the keyword batch executor is running and
 * surface as `BROWSER_BUSY` so the frontend can toast a friendly message.
 */

import { z } from "zod";

import { errorEnvelopeSchema, type ErrorEnvelope } from "@/shared/contracts/error";

import {
  expandBioIfTruncated,
  extractAllWorks,
  readDouyinProfile,
} from "../domain/douyinProfileDom";
import { scrollWorksToBottom } from "../domain/douyinProfileDom";
import { stratifiedSample } from "../domain/sampling";
import { emitBloggerEvent } from "../infra/events";
import { getLogger } from "../infra/logger";
import { getBatchExecutorFromContext, getBatchExecutorReady } from "../runtime/executorContext";
import { getService } from "../service";

function nowIso(): string {
  return new Date().toISOString();
}

async function closeBrowserBestEffort(label: string, id: string): Promise<void> {
  try {
    await getService().terminateBrowser();
  } catch (err) {
    getLogger().warn(`${label}.close_browser_failed`, {
      id,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

function errorEnvelope(
  code: ErrorEnvelope["error"]["code"],
  message: string,
): ErrorEnvelope {
  return {
    schema_version: "1",
    ok: false,
    error: { code, message: message.slice(0, 1024) },
  };
}

function isBrowserBusy(): boolean {
  try {
    return getBatchExecutorFromContext().isRunning();
  } catch {
    return false;
  }
}

// ─── Capture profile ───────────────────────────────────────────────────────

const captureInputSchema = z
  .object({
    blogger_id: z.string().uuid(),
    profile_url: z.string().min(1).max(2048),
  })
  .strict();

const captureFieldsSchema = z
  .object({
    display_name: z.union([z.string().max(256), z.null()]),
    avatar_url: z.union([z.string().url().max(2048), z.null()]),
    follow_count: z.union([z.number().int().nonnegative(), z.null()]),
    fans_count: z.union([z.number().int().nonnegative(), z.null()]),
    liked_count: z.union([z.number().int().nonnegative(), z.null()]),
    signature: z.union([z.string().max(2048), z.null()]),
    sec_uid: z.union([z.string().min(1).max(256), z.null()]),
    douyin_id: z.union([z.string().min(1).max(128), z.null()]),
  })
  .strict();

const captureSuccessSchema = z
  .object({
    schema_version: z.literal("1"),
    ok: z.literal(true),
    fields: captureFieldsSchema,
  })
  .strict();

export type BloggerCaptureProfileRpcResult = z.infer<typeof captureSuccessSchema> | ErrorEnvelope;

export async function bloggerCaptureProfileHandler(
  args: unknown,
): Promise<BloggerCaptureProfileRpcResult> {
  const log = getLogger();
  const parsed = captureInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorEnvelope("INVALID_INPUT", parsed.error.issues[0]?.message ?? "无效输入");
  }
  if (isBrowserBusy()) {
    return errorEnvelope("BROWSER_BUSY", "正在执行关键词采集,请先停止后再分析博主");
  }

  const { blogger_id, profile_url } = parsed.data;

  emitBloggerEvent({
    schema_version: "1",
    phase: "profile-started",
    blogger_id,
    started_at: nowIso(),
  });

  try {
    const exec = await getBatchExecutorReady();
    const port = exec.getPort();
    await port.navigateTo(profile_url);
    await port.sleep(1500);
    const evaluator = port.evaluator();
    if (evaluator === null) throw new Error("BrowserPage is not available");

    const expand = await expandBioIfTruncated({
      evaluate: (fn) => evaluator.evaluate(fn),
      hover: (sel, options) => {
        if (port.hover === undefined) throw new Error("hover is not available");
        return port.hover(sel, options);
      },
      mouseMove: (x, y, options) => {
        if (port.mouseMove === undefined) throw new Error("mouseMove is not available");
        return port.mouseMove(x, y, options);
      },
      bringToFront: () => {
        if (port.bringToFront === undefined) throw new Error("bringToFront is not available");
        return port.bringToFront();
      },
      sleep: (ms) => {
        if (port.sleep === undefined) throw new Error("sleep is not available");
        return port.sleep(ms);
      },
    });
    log.info("blogger.captureProfile.bio_expand", {
      id: blogger_id,
      found: expand.found,
      hovered: expand.hovered,
      matched_text: expand.matchedText,
    });
    const fields = await readDouyinProfile(evaluator);

    const hasAnyField =
      fields.display_name !== null ||
      fields.avatar_url !== null ||
      fields.fans_count !== null ||
      fields.follow_count !== null ||
      fields.liked_count !== null ||
      fields.douyin_id !== null;
    if (!hasAnyField) throw new Error("PROFILE_PARSE_FAILED");

    emitBloggerEvent({
      schema_version: "1",
      phase: "profile-ended",
      blogger_id,
      status: "profile_ready",
      last_error: null,
      ended_at: nowIso(),
    });
    log.info("blogger.captureProfile.ok", { id: blogger_id });

    return captureSuccessSchema.parse({
      schema_version: "1",
      ok: true,
      fields: {
        display_name: fields.display_name,
        avatar_url: fields.avatar_url,
        follow_count: fields.follow_count,
        fans_count: fields.fans_count,
        liked_count: fields.liked_count,
        signature: fields.signature,
        sec_uid: fields.sec_uid,
        douyin_id: fields.douyin_id,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("blogger.captureProfile.failed", { id: blogger_id, message });
    emitBloggerEvent({
      schema_version: "1",
      phase: "profile-ended",
      blogger_id,
      status: "error",
      last_error: message.slice(0, 1024),
      ended_at: nowIso(),
    });
    if (message === "PROFILE_PARSE_FAILED") {
      return errorEnvelope(
        "PROFILE_PARSE_FAILED",
        "未能解析博主资料,主页可能改版或需要登录",
      );
    }
    return errorEnvelope("INTERNAL", message);
  } finally {
    await closeBrowserBestEffort("blogger.captureProfile", blogger_id);
  }
}

// ─── Sample videos ─────────────────────────────────────────────────────────

const sampleInputSchema = z
  .object({
    blogger_id: z.string().uuid(),
    profile_url: z.string().min(1).max(2048),
    k: z.number().int().min(1).max(100).optional(),
    // Compatibility no-op: append/replace is decided in main-process storage.
    append: z.boolean().optional(),
    exclude_video_urls: z.array(z.string().url().max(2048)).max(200).optional(),
  })
  .strict();

const sampleSuccessSchema = z
  .object({
    schema_version: z.literal("1"),
    ok: z.literal(true),
    total_works: z.number().int().nonnegative(),
    samples: z.array(
      z
        .object({
          position: z.number().int().min(0).max(99),
          video_url: z.string().url().max(2048),
          title: z.union([z.string().max(2048), z.null()]),
          source_index: z.union([z.number().int().nonnegative(), z.null()]),
        })
        .strict(),
    ),
  })
  .strict();

export type BloggerSampleVideosRpcResult = z.infer<typeof sampleSuccessSchema> | ErrorEnvelope;

export async function bloggerSampleVideosHandler(
  args: unknown,
): Promise<BloggerSampleVideosRpcResult> {
  const log = getLogger();
  const parsed = sampleInputSchema.safeParse(args);
  if (!parsed.success) {
    return errorEnvelope("INVALID_INPUT", parsed.error.issues[0]?.message ?? "无效输入");
  }
  if (isBrowserBusy()) {
    return errorEnvelope("BROWSER_BUSY", "正在执行关键词采集,请先停止后再采样作品");
  }
  const { blogger_id, profile_url } = parsed.data;
  const excludeUrls = new Set(parsed.data.exclude_video_urls ?? []);

  emitBloggerEvent({
    schema_version: "1",
    phase: "sample-started",
    blogger_id,
    started_at: nowIso(),
  });

  try {
    const exec = await getBatchExecutorReady();
    const port = exec.getPort();
    await port.navigateTo(profile_url);
    await port.sleep(1500);
    const evaluator = port.evaluator();
    if (evaluator === null) throw new Error("BrowserPage is not available");

    let lastEmittedScrolls = 0;
    const scrollResult = await scrollWorksToBottom(evaluator, {
      hardCap: 500,
      scrollDelayMs: 700,
      pressEnd: () => port.pressKey("End"),
      onProgress: ({ scrolls, cards }) => {
        if (scrolls - lastEmittedScrolls < 5) return;
        lastEmittedScrolls = scrolls;
        emitBloggerEvent({
          schema_version: "1",
          phase: "sample-progress",
          blogger_id,
          scroll_count: scrolls,
          loaded_count: cards,
        });
      },
    });
    log.info("blogger.sampleVideos.scrolled", {
      id: blogger_id,
      totalScrolls: scrollResult.totalScrolls,
      finalCardCount: scrollResult.finalCardCount,
      reachedBottom: scrollResult.reachedBottom,
    });

    const works = await extractAllWorks(evaluator);
    const totalWorks = works.length;
    if (totalWorks === 0) throw new Error("PROFILE_PARSE_FAILED");
    const candidateWorks = works.filter((work) => !excludeUrls.has(work.url));

    // 20% of total, clamped to [10, 20]; bloggers with < 10 works get fewer.
    const effectiveK = parsed.data.k ?? Math.max(
      Math.min(10, totalWorks),
      Math.min(20, Math.ceil(totalWorks * 0.2)),
    );
    const picks = stratifiedSample(candidateWorks, effectiveK);
    const samples = picks.map((w, i) => ({
      position: i,
      video_url: w.url,
      title: w.title,
      source_index: w.index,
    }));

    emitBloggerEvent({
      schema_version: "1",
      phase: "sample-ended",
      blogger_id,
      status: "sampled",
      last_error: null,
      sampled_count: samples.length,
      total_works: totalWorks,
      ended_at: nowIso(),
    });
    log.info("blogger.sampleVideos.ok", {
      id: blogger_id,
      sampled: samples.length,
      total: totalWorks,
    });
    return sampleSuccessSchema.parse({
      schema_version: "1",
      ok: true,
      total_works: totalWorks,
      samples,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("blogger.sampleVideos.failed", { id: blogger_id, message });
    emitBloggerEvent({
      schema_version: "1",
      phase: "sample-ended",
      blogger_id,
      status: "error",
      last_error: message.slice(0, 1024),
      sampled_count: 0,
      total_works: 0,
      ended_at: nowIso(),
    });
    if (message === "PROFILE_PARSE_FAILED") {
      return errorEnvelope(
        "PROFILE_PARSE_FAILED",
        "未能从主页解析到任何作品,可能需要登录或博主无作品",
      );
    }
    return errorEnvelope("INTERNAL", message);
  } finally {
    await closeBrowserBestEffort("blogger.sampleVideos", blogger_id);
  }
}

// `errorEnvelopeSchema` is re-exported from contracts/error so callers can
// validate utility responses without re-declaring the shape; we don't call
// it here but keep the import meaningful.
export const _errorEnvelopeSchema = errorEnvelopeSchema;
