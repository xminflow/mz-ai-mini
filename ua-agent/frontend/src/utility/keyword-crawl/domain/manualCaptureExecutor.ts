import { randomUUID } from "node:crypto";

import type { Platform } from "@/shared/contracts/capture";
import type { ErrorEnvelope } from "@/shared/contracts/error";
import type {
  ManualCapturePhase,
  ManualCaptureSnapshot,
  ManualCaptureStatus,
  ManualCaptureStopReason,
} from "@/shared/contracts/manual-capture";
import { parseManualCaptureUrl } from "@/shared/contracts/manual-capture";

import {
  dispatchBrowseModeHotkey,
  isBrowseModeActive,
  readDouyinDetailVideo,
  readCurrentBrowseVideo,
  waitForDouyinDetailPage,
} from "./douyinSearchDom";
import { openLibrary, type LibraryStore } from "./library";
import {
  canonicalizeDouyinUrl,
  canonicalizeXhsNoteUrl,
} from "./url";
import {
  extractDetailMetadata,
  waitForDetailContent,
} from "./xhsSearchDom";
import { emitManualCaptureEvent } from "../infra/events";
import { getLogger } from "../infra/logger";
import { DETAIL_OPEN_TIMEOUT_MS, INTER_CARD_MIN_INTERVAL_MS, POLL_INTERVAL_MS } from "./runtime";

export interface DomEvaluatorOnly {
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
}

export interface ManualCapturePort {
  isInstalled: () => boolean;
  isSessionAlive: () => boolean;
  ensureSession?: () => Promise<void>;
  closeSession?: () => Promise<void>;
  navigateTo: (url: string) => Promise<void>;
  evaluator: () => DomEvaluatorOnly | null;
  pressKey: (key: string) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
}

interface TaskState {
  id: string;
  platform: Platform;
  canonicalUrl: string;
  status: ManualCaptureStatus;
  stopReason: ManualCaptureStopReason | null;
  startedAt: string;
  endedAt: string | null;
  scanned: number;
  captured: number;
  duplicate: number;
  errors: number;
  filtered: number;
  currentPhase: ManualCapturePhase;
  resultPostId: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

function snapshotTask(state: TaskState): ManualCaptureSnapshot {
  return {
    task_id: state.id,
    platform: state.platform,
    source_type: "manual_url",
    canonical_url: state.canonicalUrl,
    status: state.status,
    stop_reason: state.stopReason,
    started_at: state.startedAt,
    ended_at: state.endedAt,
    scanned_count: state.scanned,
    captured_count: state.captured,
    duplicate_count: state.duplicate,
    error_count: state.errors,
    filtered_count: state.filtered,
    current_phase: state.currentPhase,
    result_post_id: state.resultPostId,
  };
}

export class ManualCaptureExecutor {
  private state: TaskState | null = null;
  private cancelToken: { cancelled: boolean } = { cancelled: false };
  private loopPromise: Promise<void> | null = null;
  private port: ManualCapturePort;
  private library: LibraryStore;

  constructor(port: ManualCapturePort, library?: LibraryStore) {
    this.port = port;
    this.library = library ?? openLibrary();
  }

  isRunning(): boolean {
    return this.state !== null && this.state.status === "running";
  }

  snapshot(): ManualCaptureSnapshot | null {
    return this.state === null ? null : snapshotTask(this.state);
  }

  async start(args: { url: string }): Promise<
    | { taskId: string; platform: Platform; canonicalUrl: string; startedAt: string }
    | ErrorEnvelope
  > {
    if (this.isRunning()) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "MANUAL_CAPTURE_BUSY", message: "已有手动采集任务进行中" },
      };
    }

    const parsed = parseManualCaptureUrl(args.url);
    if (!parsed.ok) {
      return {
        schema_version: "1",
        ok: false,
        error: {
          code: parsed.code === "invalid-url" ? "INVALID_INPUT" : "UNSUPPORTED_URL",
          message: parsed.message,
        },
      };
    }

    const startedAt = nowIso();
    const state: TaskState = {
      id: randomUUID(),
      platform: parsed.value.platform,
      canonicalUrl: parsed.value.canonical_url,
      status: "running",
      stopReason: null,
      startedAt,
      endedAt: null,
      scanned: 0,
      captured: 0,
      duplicate: 0,
      errors: 0,
      filtered: 0,
      currentPhase: "validate",
      resultPostId: null,
    };
    this.state = state;
    this.cancelToken = { cancelled: false };

    emitManualCaptureEvent({
      schema_version: "1",
      phase: "task-started",
      task_id: state.id,
      platform: state.platform,
      canonical_url: state.canonicalUrl,
      started_at: state.startedAt,
    });
    this.bumpProgress("validate");

    this.loopPromise = this.runLoop(state).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      getLogger().error("manualCapture.loop_threw", { message });
    });

    return {
      taskId: state.id,
      platform: state.platform,
      canonicalUrl: state.canonicalUrl,
      startedAt,
    };
  }

  async stop(): Promise<{ taskId: string | null; wasRunning: boolean }> {
    if (!this.isRunning()) return { taskId: null, wasRunning: false };
    const taskId = this.state?.id ?? null;
    this.cancelToken.cancelled = true;
    if (this.loopPromise !== null) {
      try {
        await this.loopPromise;
      } catch {
        /* swallow */
      }
    }
    return { taskId, wasRunning: true };
  }

  private bumpProgress(phase: ManualCapturePhase): void {
    if (this.state === null) return;
    this.state.currentPhase = phase;
    emitManualCaptureEvent({
      schema_version: "1",
      phase: "progress",
      task_id: this.state.id,
      platform: this.state.platform,
      scanned_count: this.state.scanned,
      captured_count: this.state.captured,
      duplicate_count: this.state.duplicate,
      error_count: this.state.errors,
      filtered_count: this.state.filtered,
      current_phase: phase,
    });
  }

  private finish(status: ManualCaptureStatus, stopReason: ManualCaptureStopReason): void {
    if (this.state === null) return;
    this.state.status = status;
    this.state.stopReason = stopReason;
    this.state.endedAt = nowIso();
    this.state.currentPhase = "done";
    emitManualCaptureEvent({
      schema_version: "1",
      phase: "task-ended",
      task_id: this.state.id,
      platform: this.state.platform,
      status,
      stop_reason: stopReason,
      started_at: this.state.startedAt,
      ended_at: this.state.endedAt,
      scanned_count: this.state.scanned,
      captured_count: this.state.captured,
      duplicate_count: this.state.duplicate,
      error_count: this.state.errors,
      filtered_count: this.state.filtered,
      result_post_id: this.state.resultPostId,
    });
  }

  private async ensureSession(): Promise<boolean> {
    if (this.port.isSessionAlive()) return true;
    if (typeof this.port.ensureSession !== "function") return false;
    await this.port.ensureSession();
    return this.port.isSessionAlive();
  }

  private async runLoop(state: TaskState): Promise<void> {
    const log = getLogger();
    try {
      const sessionReady = await this.ensureSession();
      if (!sessionReady) {
        state.errors += 1;
        this.finish("error", "capture-failed");
        return;
      }
      if (this.cancelToken.cancelled) {
        this.finish("stopped", "user");
        return;
      }

      if (state.platform === "douyin") {
        await this.captureDouyin(state);
      } else {
        await this.captureXhs(state);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error("manualCapture.failed", { task_id: state.id, platform: state.platform, message });
      state.errors += 1;
      if (this.cancelToken.cancelled) {
        this.finish("stopped", "user");
      } else {
        this.finish("error", message.includes("login") ? "login-required" : "capture-failed");
      }
    } finally {
      try {
        await this.port.closeSession?.();
      } catch (err) {
        log.warn("manualCapture.closeSession.failed", {
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  private async captureDouyin(state: TaskState): Promise<void> {
    await this.port.navigateTo(state.canonicalUrl);
    this.bumpProgress("navigate");
    await this.port.sleep(1500);
    if (this.cancelToken.cancelled) {
      this.finish("stopped", "user");
      return;
    }

    const evaluator = this.port.evaluator();
    if (evaluator === null) throw new Error("BrowserPage is not available");

    const detailReady = await waitForDouyinDetailPage(
      evaluator,
      DETAIL_OPEN_TIMEOUT_MS,
      POLL_INTERVAL_MS,
    );
    if (detailReady) {
      this.bumpProgress("read");
      const detailVideo = await readDouyinDetailVideo(evaluator);
      if (detailVideo !== null) {
        const detailCanon =
          (detailVideo.href !== null ? canonicalizeDouyinUrl(detailVideo.href) : null) ??
          canonicalizeDouyinUrl(detailVideo.pageUrl) ??
          canonicalizeDouyinUrl(state.canonicalUrl);
        if (detailCanon === null) throw new Error("URL_UNPARSEABLE");

        state.scanned = 1;
        if (this.library.materialEntryExists(detailCanon.postId)) {
          state.duplicate = 1;
          state.resultPostId = detailCanon.postId;
          this.bumpProgress("record");
          this.finish("done", "duplicate");
          return;
        }

        this.library.insertOrIgnoreMaterialEntry({
          post_id: detailCanon.postId,
          post_id_source: "share_url_canonical",
          share_url: detailCanon.url,
          share_text: detailCanon.url,
          caption: detailVideo.caption,
          author_handle: detailVideo.authorHandle.length > 0 ? detailVideo.authorHandle : "unknown",
          author_display_name: detailVideo.authorDisplayName,
          hashtags: detailVideo.hashtags,
          music_id: null,
          music_title: null,
          like_count: detailVideo.likeCount,
          comment_count: detailVideo.commentCount,
          share_count: detailVideo.shareCount,
          collect_count: detailVideo.collectCount,
          author_follower_count:
            detailVideo.authorFollowerCount !== null && detailVideo.authorFollowerCount > 0
              ? detailVideo.authorFollowerCount
              : null,
          captured_at: nowIso(),
          captured_by_device: "web:manual:douyin:detail",
          note_type: "video",
          platform: "douyin",
          media_kind: "video",
          image_urls: null,
          comments: [],
          transcript: null,
          transcribed_at: null,
        });
        state.resultPostId = detailCanon.postId;
        state.captured = 1;
        this.bumpProgress("record");
        this.finish("done", "captured");
        return;
      }
    }

    const browseMode = await isBrowseModeActive(evaluator).catch(() => false);
    if (!browseMode) {
      await dispatchBrowseModeHotkey(evaluator).catch(() => false);
      await this.port.sleep(800);
    }

    this.bumpProgress("read");
    const video = await readCurrentBrowseVideo(evaluator);
    const canon =
      (video.href !== null ? canonicalizeDouyinUrl(video.href) : null) ??
      canonicalizeDouyinUrl(video.pageUrl) ??
      canonicalizeDouyinUrl(state.canonicalUrl);
    if (canon === null) throw new Error("URL_UNPARSEABLE");

    state.scanned = 1;
    if (this.library.materialEntryExists(canon.postId)) {
      state.duplicate = 1;
      state.resultPostId = canon.postId;
      this.bumpProgress("record");
      this.finish("done", "duplicate");
      return;
    }

    this.library.insertOrIgnoreMaterialEntry({
      post_id: canon.postId,
      post_id_source: "share_url_canonical",
      share_url: canon.url,
      share_text: canon.url,
      caption: video.caption,
      author_handle: video.authorHandle.length > 0 ? video.authorHandle : "unknown",
      author_display_name: video.authorDisplayName,
      hashtags: video.hashtags,
      music_id: null,
      music_title: null,
      like_count: video.likeCount,
      comment_count: video.commentCount,
      share_count: video.shareCount,
      collect_count: video.collectCount,
      author_follower_count: null,
      captured_at: nowIso(),
      captured_by_device: "web:manual:douyin",
      note_type: "video",
      platform: "douyin",
      media_kind: "video",
      image_urls: null,
      comments: [],
      transcript: null,
      transcribed_at: null,
    });
    state.resultPostId = canon.postId;
    state.captured = 1;
    this.bumpProgress("record");
    this.finish("done", "captured");
  }

  private async captureXhs(state: TaskState): Promise<void> {
    await this.port.navigateTo(state.canonicalUrl);
    this.bumpProgress("navigate");
    await this.port.sleep(1500);
    if (this.cancelToken.cancelled) {
      this.finish("stopped", "user");
      return;
    }

    const evaluator = this.port.evaluator();
    if (evaluator === null) throw new Error("BrowserPage is not available");

    const opened = await waitForDetailContent(
      evaluator,
      DETAIL_OPEN_TIMEOUT_MS,
      POLL_INTERVAL_MS,
    );
    if (!opened) throw new Error("login-required");

    this.bumpProgress("open-detail");
    await this.port.sleep(INTER_CARD_MIN_INTERVAL_MS);
    this.bumpProgress("read");
    const metadata = await extractDetailMetadata(evaluator);
    const canon =
      (metadata.shareUrl !== null ? canonicalizeXhsNoteUrl(metadata.shareUrl) : null) ??
      canonicalizeXhsNoteUrl(state.canonicalUrl);
    if (canon === null) throw new Error("URL_UNPARSEABLE");

    state.scanned = 1;
    if (this.library.materialEntryExists(canon.noteId)) {
      state.duplicate = 1;
      state.resultPostId = canon.noteId;
      this.bumpProgress("record");
      this.finish("done", "duplicate");
      return;
    }

    const captionFinal = metadata.caption.length > 0 ? metadata.caption.slice(0, 4096) : "";
    const shareTextSynth = `${captionFinal} ${canon.url}`.trim().slice(0, 4096);
    this.library.insertOrIgnoreMaterialEntry({
      post_id: canon.noteId,
      post_id_source: "xhs_note_url",
      share_url: canon.url,
      share_text: shareTextSynth.length > 0 ? shareTextSynth : canon.url,
      caption: captionFinal,
      author_handle: metadata.authorHandle.length > 0 ? metadata.authorHandle : "unknown",
      author_display_name: metadata.authorDisplayName,
      hashtags: metadata.hashtags,
      music_id: null,
      music_title: null,
      like_count: metadata.likeCount,
      comment_count: metadata.commentCount,
      share_count: metadata.shareCount,
      collect_count: metadata.collectCount,
      author_follower_count: null,
      captured_at: nowIso(),
      captured_by_device: "web:manual:xiaohongshu",
      note_type: metadata.noteType,
      platform: "xiaohongshu",
      media_kind: metadata.noteType === "video" ? "video" : "images",
      image_urls: null,
      comments: metadata.comments.map((c) => ({
        author: c.author,
        content: c.content,
        like_count: c.likeCount,
        time_text: c.timeText,
      })),
      transcript: null,
      transcribed_at: null,
    });
    state.resultPostId = canon.noteId;
    state.captured = 1;
    this.bumpProgress("record");
    this.finish("done", "captured");
  }
}

let executorSingleton: ManualCaptureExecutor | null = null;

export function getManualCaptureExecutor(
  port?: ManualCapturePort,
  library?: LibraryStore,
): ManualCaptureExecutor {
  if (executorSingleton !== null) return executorSingleton;
  if (port === undefined) {
    throw new Error("ManualCaptureExecutor not yet initialised — pass port on first call");
  }
  executorSingleton = new ManualCaptureExecutor(port, library);
  return executorSingleton;
}

export function _resetManualCaptureExecutorForTests(): void {
  executorSingleton = null;
}
