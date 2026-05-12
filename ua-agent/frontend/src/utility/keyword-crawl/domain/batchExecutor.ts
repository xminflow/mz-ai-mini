/**
 * BatchExecutor — the core async runloop for the keyword-driven crawl.
 *
 * Per-keyword loop: navigate → switchToSingleColumn → loop(card → dwell →
 * read → record → next), per Decision 12. Persists `keyword_batches` and
 * `keyword_runs` rows per Decision 14. Emits batch-started / keyword-started /
 * progress / keyword-ended / batch-ended events via `infra/events.ts`.
 *
 * Stop-reason cases per Decision 13:
 *   user / cap / end-of-results / error-threshold / session-failure /
 *   health-cap / layout-switch-failure / search-empty
 *
 * Batch end via `batch-session-dead` after 2 consecutive `session-failure`
 * runs.
 */

import { randomUUID } from "node:crypto";

import type { Platform } from "@/shared/contracts/capture";
import type { ErrorEnvelope } from "@/shared/contracts/error";
import type { BatchEvent } from "@/shared/contracts/keyword/batch-event";
import type { BatchSnapshot, KeywordRunSnapshot } from "@/shared/contracts/keyword/batch-status";

import { setDouyinReachable } from "../handlers/sessionStatus";
import { emitBatchEvent } from "../infra/events";
import { getLogger } from "../infra/logger";
import { getKeywordsStore } from "./keywordsStore";
import { openLibrary, type LibraryStore } from "./library";
import {
  applyPublishTimeFilter,
  blurActiveElement,
  clickSingleColumnToggle,
  dispatchAuthorCardHotkey,
  dispatchBrowseModeHotkey,
  dispatchCommentPanelHotkey,
  isAuthorCardOpen,
  isBrowseModeActive,
  isCommentPanelOpen,
  readAuthorCardFollowerCount,
  readBrowseModeComments,
  readCurrentBrowseVideo,
  waitForAuthorCard,
  waitForAuthorCardClosed,
  waitForCommentPanel,
} from "./douyinSearchDom";
import {
  AUTHOR_CARD_CLOSE_TIMEOUT_MS,
  AUTHOR_CARD_OPEN_TIMEOUT_MS,
  AUTHOR_CARD_READ_TIMEOUT_MS,
  AUTHOR_CARD_SETTLE_MS,
  BATCH_SESSION_DEAD_THRESHOLD,
  CONSECUTIVE_ERROR_THRESHOLD,
  DETAIL_CLOSE_TIMEOUT_MS,
  DETAIL_OPEN_TIMEOUT_MS,
  INTER_CARD_MIN_INTERVAL_MS,
  LAYOUT_PROBE_TIMEOUT_MS,
  LOAD_MORE_TIMEOUT_MS,
  NO_GROWTH_SCROLL_THRESHOLD,
  POLL_INTERVAL_MS,
  USER_HOVER_CARD_OPEN_TIMEOUT_MS,
  USER_HOVER_CARD_SETTLE_MS,
} from "./runtime";
import { canonicalizeDouyinUrl, canonicalizeXhsNoteUrl, searchUrlFor } from "./url";
import {
  type CardSummary,
  applyPublishTimeFilter as applyXhsPublishTimeFilter,
  clickNote,
  extractDetailMetadata,
  listVisibleCards,
  readUserHoverCardFollowerCount,
  scrollMasonryBottom,
  waitForCardCountGrowth,
  waitForDetailContent,
  waitForDetailContentClosed,
  waitForMasonryReady,
  waitForUserHoverCard,
  XHS_DETAIL_AUTHOR_AVATAR_SELECTOR as _XHS_DETAIL_AUTHOR_AVATAR_SELECTOR,
} from "./xhsSearchDom";

type RunStopReason =
  | "user"
  | "cap"
  | "end-of-results"
  | "error-threshold"
  | "session-failure"
  | "health-cap"
  | "layout-switch-failure"
  | "search-empty"
  // 006 — XHS-specific
  | "schema-drift"
  | "login-required";

type BatchStopReason = "user" | "batch-session-dead" | "all-completed";
type RunStatus = "pending" | "running" | "done" | "stopped" | "error";
type BatchStatus = "running" | "done" | "stopped" | "error";
type MetricFilterMode = "none" | "ratio" | "author_metrics";
type PublishTimeRange = "all" | "day" | "week" | "half_year";
type ComparisonOp = "gte" | "lte";

interface PerRun {
  runRowId: string;
  keywordId: string;
  keywordText: string;
  position: number;
  status: RunStatus;
  stopReason: RunStopReason | null;
  startedAt: string | null;
  endedAt: string | null;
  scanned: number;
  captured: number;
  duplicate: number;
  errors: number;
  filtered: number;
  representative: string[];
  /** Per-keyword cap on captured material (default 10). */
  targetCap: number;
  /** Per-keyword cap on scanned videos (default 500). */
  healthCap: number;
  metricFilterMode: MetricFilterMode;
  /** Per-keyword 1-decimal-precision min like/follower ratio. 0 disables filter. */
  minLikeFollowerRatio: number;
  publishTimeRange: PublishTimeRange;
  authorFollowerCountOp: ComparisonOp | null;
  authorFollowerCountValue: number | null;
  likeCountOp: ComparisonOp | null;
  likeCountValue: number | null;
}

interface BatchState {
  id: string;
  /** 006 — Platform of this batch; all runs share it. */
  platform: Platform;
  status: BatchStatus;
  stopReason: BatchStopReason | null;
  startedAt: string;
  endedAt: string | null;
  selectedIds: string[];
  runs: PerRun[];
  currentIndex: number | null;
}

export interface NavigatePort {
  goto(url: string): Promise<void>;
  page: () => DomEvaluatorOnly | null;
  waitFor: (ms: number) => Promise<void>;
}

export interface DomEvaluatorOnly {
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
}

/**
 * The browser-control port the executor talks to. The runtime adapter
 * (Phase 5 utility entry) wraps `service.getDriver()` + the live Page.
 */
export interface ExecutorPort {
  isInstalled: () => boolean;
  isSessionAlive: () => boolean;
  /** Ensure a browser session exists before starting the next keyword. */
  ensureSession?: () => Promise<void>;
  /** Close the browser session after a keyword run finishes. */
  closeSession?: () => Promise<void>;
  navigateTo: (url: string) => Promise<void>;
  evaluator: () => DomEvaluatorOnly | null;
  /**
   * 006 — Real isTrusted=true mouse click via patchright. XHS gates its
   * Vue @click handlers behind isTrusted, so synthesized DOM dispatchEvent
   * never opens the in-page detail. Optional because the existing 004
   * douyin loop never needed real clicks; XHS does.
   */
  click?: (selector: string, options?: { timeout?: number }) => Promise<void>;
  /**
   * 006-2 — Real isTrusted=true mouse hover via patchright. Used by the
   * XHS like/follower ratio filter to surface the user-info popup whose
   * 粉丝 count is the filter input. Optional for the same reason as click.
   */
  hover?: (selector: string, options?: { timeout?: number }) => Promise<void>;
  /**
   * 006-2 — Raw stepped mouse.move via patchright. patchright's `hover()`
   * is a single-step jump that XHS's debounced hover listener silently
   * drops; this exposes the underlying `mouse.move(x, y, {steps})` so the
   * page sees a continuous mousemove sequence (looks like a real human
   * dragging the cursor).
   */
  mouseMove?: (x: number, y: number, options?: { steps?: number }) => Promise<void>;
  /**
   * 006-2 — Pull the underlying tab into the OS foreground. XHS's hover
   * popup checks `document.hasFocus()` before mounting; running the bot
   * while the user is focused on terminal/IDE leaves the tab unfocused
   * and the popup never appears.
   */
  bringToFront?: () => Promise<void>;
  pressKey: (key: string) => Promise<void>;
  sleep: (ms: number) => Promise<void>;
}

function nowIso(): string {
  return new Date().toISOString();
}

function snapshotRun(run: PerRun, platform: Platform): KeywordRunSnapshot {
  return {
    keyword_id: run.keywordId,
    platform,
    keyword_text: run.keywordText,
    position: run.position,
    status: run.status,
    stop_reason: run.stopReason,
    started_at: run.startedAt,
    ended_at: run.endedAt,
    scanned_count: run.scanned,
    captured_count: run.captured,
    duplicate_count: run.duplicate,
    error_count: run.errors,
    filtered_count: run.filtered,
    representative_errors: run.representative,
  };
}

function snapshotBatch(state: BatchState): BatchSnapshot {
  return {
    batch_id: state.id,
    platform: state.platform,
    status: state.status,
    stop_reason: state.stopReason,
    started_at: state.startedAt,
    ended_at: state.endedAt,
    selected_keyword_ids: state.selectedIds,
    runs: state.runs.map((r) => snapshotRun(r, state.platform)),
    current_index: state.currentIndex,
  };
}

function ensureBatchEvent(event: BatchEvent): void {
  emitBatchEvent(event);
}

function pushRepresentative(run: PerRun, code: string): void {
  if (run.representative.includes(code)) return;
  if (run.representative.length >= 5) return;
  run.representative.push(code);
}

function compareMetric(actual: number, op: ComparisonOp, expected: number): boolean {
  return op === "gte" ? actual >= expected : actual <= expected;
}

/**
 * `start()` reads the currently-enabled keywords for the requested platform
 * from `KeywordsStore` and uses each keyword row's own
 * `target_cap` / `health_cap` / `min_like_follower_ratio`.
 *
 * 006 — `platform` selects which platform's enabled-keyword set to run.
 * Cross-platform batches are not allowed (FR-009); the caller must pick
 * one platform per batch.
 */
interface StartArgs {
  platform: Platform;
}

export interface PreReadinessGate {
  /** Returns null if ready, otherwise an ErrorEnvelope explaining why. */
  check: (args: StartArgs) => ErrorEnvelope | null;
}

export class BatchExecutor {
  private state: BatchState | null = null;
  private cancelToken: { cancelled: boolean } = { cancelled: false };
  private port: ExecutorPort;
  private library: LibraryStore;
  private gate: PreReadinessGate;
  private loopPromise: Promise<void> | null = null;

  constructor(port: ExecutorPort, gate: PreReadinessGate, library?: LibraryStore) {
    this.port = port;
    this.gate = gate;
    this.library = library ?? openLibrary();
  }

  isRunning(): boolean {
    return this.state !== null && this.state.status === "running";
  }

  /**
   * Expose the underlying ExecutorPort so other utility-process handlers
   * (e.g. 博主分析) can drive the same patchright session without
   * re-implementing the bootstrap. Caller is responsible for checking
   * `isRunning()` first to avoid clobbering an active batch.
   */
  getPort(): ExecutorPort {
    return this.port;
  }

  isRunningForKeyword(keywordId: string): boolean {
    if (this.state === null) return false;
    if (this.state.status !== "running") return false;
    if (this.state.currentIndex === null) return false;
    const current = this.state.runs[this.state.currentIndex];
    return current?.keywordId === keywordId && current.status === "running";
  }

  snapshot(): BatchSnapshot | null {
    return this.state === null ? null : snapshotBatch(this.state);
  }

  async start(args: StartArgs): Promise<{ batchId: string; startedAt: string } | ErrorEnvelope> {
    if (this.isRunning()) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "BATCH_BUSY", message: "已有批次进行中" },
      };
    }
    // 006 — Platforms supported: "douyin" (browse-mode) and "xiaohongshu"
    // (click-into-card). The runOneKeyword dispatch below picks the loop.
    const gateOut = this.gate.check(args);
    if (gateOut !== null) return gateOut;

    const enabled = getKeywordsStore().listEnabled(args.platform);
    if (enabled.length === 0) {
      return {
        schema_version: "1",
        ok: false,
        error: {
          code: "KEYWORD_NOT_FOUND",
          message: "未启用任何关键词，请至少打开一条开关",
        },
      };
    }

    const id = randomUUID();
    const startedAt = nowIso();
    const runs: PerRun[] = enabled.map((k, idx) => ({
      runRowId: randomUUID(),
      keywordId: k.id,
      keywordText: k.text,
      position: idx + 1,
      status: "pending",
      stopReason: null,
      startedAt: null,
      endedAt: null,
      scanned: 0,
      captured: 0,
      duplicate: 0,
      errors: 0,
      filtered: 0,
      representative: [],
      targetCap: k.target_cap,
      healthCap: k.health_cap,
      metricFilterMode: k.metric_filter_mode,
      minLikeFollowerRatio: k.min_like_follower_ratio,
      publishTimeRange: k.publish_time_range,
      authorFollowerCountOp: k.author_follower_count_op,
      authorFollowerCountValue: k.author_follower_count_value,
      likeCountOp: k.like_count_op,
      likeCountValue: k.like_count_value,
    }));
    const selectedIds = enabled.map((k) => k.id);
    const state: BatchState = {
      id,
      platform: args.platform,
      status: "running",
      stopReason: null,
      startedAt,
      endedAt: null,
      selectedIds,
      runs,
      currentIndex: null,
    };
    this.state = state;
    this.cancelToken = { cancelled: false };

    this.library.insertKeywordBatch({
      id,
      platform: args.platform,
      status: "running",
      stop_reason: null,
      started_at: startedAt,
      ended_at: null,
      selected_keyword_ids: state.selectedIds,
      executed_keyword_ids: [],
      cancelled_keyword_ids: [],
      // Legacy column kept to preserve schema compat. With per-keyword
      // ratios it no longer represents one global threshold; we record 0.
      min_like_follower_ratio: 0,
    });

    ensureBatchEvent({
      schema_version: "1",
      phase: "batch-started",
      batch_id: id,
      platform: args.platform,
      selected_keyword_ids: state.selectedIds,
      started_at: startedAt,
    });

    this.loopPromise = this.runLoop(state).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      getLogger().error("batch.loop_threw", { message });
    });

    return { batchId: id, startedAt };
  }

  async stop(): Promise<{ batchId: string | null; wasRunning: boolean }> {
    if (this.state === null || this.state.status !== "running") {
      return { batchId: null, wasRunning: false };
    }
    const id = this.state.id;
    this.cancelToken.cancelled = true;
    if (this.loopPromise !== null) {
      try {
        await this.loopPromise;
      } catch {
        /* swallow */
      }
    }
    return { batchId: id, wasRunning: true };
  }

  /** Test-only — wait for the in-flight loop to finish. */
  async _awaitForTests(): Promise<void> {
    if (this.loopPromise !== null) {
      try {
        await this.loopPromise;
      } catch {
        /* swallow */
      }
    }
  }

  /**
   * Page-transition transients: patchright's `pages()` returns 0 for a few
   * hundred ms while the active tab swaps in/out, and `evaluate()` rejects
   * for the same reason. These error messages are matched here so the
   * executor knows to retry instead of counting them against the 5-error
   * threshold. Anything not on this list is considered a real failure.
   */
  private static isTransientPageError(message: string): boolean {
    return (
      message.includes("BrowserPage is not available") ||
      message.includes("BrowserPage has no keyboard handle") ||
      message.includes("Target page, context or browser has been closed") ||
      message.includes("Execution context was destroyed") ||
      message.includes("Page closed")
    );
  }

  private async ensureSessionForKeyword(
    run: PerRun,
    log: ReturnType<typeof getLogger>,
  ): Promise<boolean> {
    if (this.port.isSessionAlive()) return true;
    if (typeof this.port.ensureSession !== "function") return false;

    try {
      await this.port.ensureSession();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error("keyword.session_start_failed", { keyword: run.keywordText, message });
      return false;
    }
    return this.port.isSessionAlive();
  }

  private async closeSessionAfterKeyword(
    run: PerRun,
    log: ReturnType<typeof getLogger>,
  ): Promise<void> {
    if (typeof this.port.closeSession !== "function") return;

    try {
      await this.port.closeSession();
      log.info("keyword.session_closed", { keyword: run.keywordText });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn("keyword.session_close_failed", { keyword: run.keywordText, message });
    }
  }

  private async pressKeyWithRetry(
    key: string,
    run: PerRun,
    log: ReturnType<typeof getLogger>,
  ): Promise<"ok" | "exhausted"> {
    const TRANSIENT_RETRY_LIMIT = 3;
    const TRANSIENT_BACKOFF_MS = 800;
    for (let attempt = 0; attempt <= TRANSIENT_RETRY_LIMIT; attempt++) {
      try {
        await this.port.pressKey(key);
        return "ok";
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const transient = BatchExecutor.isTransientPageError(message);
        if (transient && attempt < TRANSIENT_RETRY_LIMIT) {
          log.warn("keyword.key_press_transient_retry", {
            keyword: run.keywordText,
            attempt: attempt + 1,
            message,
          });
          await this.port.sleep(TRANSIENT_BACKOFF_MS);
          continue;
        }
        // Out of retries — record one hard error and bail.
        pushRepresentative(run, `KEY_PRESS_FAILED: ${message}`.slice(0, 256));
        run.errors += 1;
        log.error("keyword.key_press_failed", { keyword: run.keywordText, message });
        return "exhausted";
      }
    }
    return "exhausted";
  }

  private async readVideoWithRetry(
    evaluator: DomEvaluatorOnly,
    run: PerRun,
    log: ReturnType<typeof getLogger>,
  ): Promise<{ kind: "ok"; video: Awaited<ReturnType<typeof readCurrentBrowseVideo>> } | { kind: "exhausted" }> {
    const TRANSIENT_RETRY_LIMIT = 3;
    const TRANSIENT_BACKOFF_MS = 800;
    for (let attempt = 0; attempt <= TRANSIENT_RETRY_LIMIT; attempt++) {
      try {
        const video = await readCurrentBrowseVideo(evaluator);
        return { kind: "ok", video };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        const transient = BatchExecutor.isTransientPageError(message);
        if (transient && attempt < TRANSIENT_RETRY_LIMIT) {
          log.warn("dom.read_transient_retry", {
            keyword: run.keywordText,
            attempt: attempt + 1,
            message,
          });
          await this.port.sleep(TRANSIENT_BACKOFF_MS);
          continue;
        }
        pushRepresentative(run, "DOM_READ_FAILED");
        run.errors += 1;
        log.error("dom.read_failed", { keyword: run.keywordText, message });
        return { kind: "exhausted" };
      }
    }
    return { kind: "exhausted" };
  }

  /**
   * Open the author card via the F hotkey, read the follower count, then
   * close the card with ESC. Returns the follower count on success or
   * `null` on any failure (timeout, parse, name mismatch).
   *
   * Two important details:
   *
   *   • A previously-focused element can swallow the F keystroke (the
   *     layout toggle, an inline input, or even the focused video frame on
   *     some Douyin layouts). We blur first, settle briefly, then send the
   *     real keypress. If that doesn't open the card, we fall back to a
   *     synthetic `KeyF` event dispatched at window/document/body — same
   *     fallback strategy the "h" hotkey uses to enter browse mode.
   *   • We only send ESC if the card actually opened. Pressing ESC while
   *     the card is closed can dismiss browse mode itself on some Douyin
   *     builds, which would silently break every subsequent iteration.
   */
  private async readAuthorFollowerWithRetry(
    evaluator: DomEvaluatorOnly,
    expectedAuthorHandle: string | null,
    expectedDisplayName: string | null,
    run: PerRun,
    log: ReturnType<typeof getLogger>,
  ): Promise<number | null> {
    let followerCount: number | null = null;

    // 1. Open the card. Blur first so a previously-focused element doesn't
    //    swallow the F keystroke (mirrors the "h" hotkey path).
    try {
      await blurActiveElement(evaluator);
      await this.port.sleep(150);
      await this.port.pressKey("f");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn("author_card.open_press_failed", {
        keyword: run.keywordText,
        message,
      });
      return null;
    }
    await this.port.sleep(AUTHOR_CARD_SETTLE_MS);
    let opened = await waitForAuthorCard(evaluator, AUTHOR_CARD_OPEN_TIMEOUT_MS);

    // 1a. Synthetic-event fallback if the patchright press did not surface
    //     the card. Some builds bind hotkeys at document/window level and
    //     don't see synthesized clicks via the focused element.
    if (!opened) {
      log.warn("author_card.open_timeout_falling_back_to_dispatch", {
        keyword: run.keywordText,
      });
      try {
        await dispatchAuthorCardHotkey(evaluator);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warn("author_card.dispatch_failed", {
          keyword: run.keywordText,
          message,
        });
      }
      await this.port.sleep(AUTHOR_CARD_SETTLE_MS);
      opened = await waitForAuthorCard(evaluator, AUTHOR_CARD_OPEN_TIMEOUT_MS);
    }

    // 2. Read the stats element (only if it actually opened).
    if (opened) {
      try {
        const READ_RETRY_INTERVAL_MS = 100;
        const readDeadline = Date.now() + AUTHOR_CARD_READ_TIMEOUT_MS;
        let read = await readAuthorCardFollowerCount(evaluator);
        while (
          Date.now() < readDeadline &&
          (!read.found || read.followerCount === null || read.followerCount <= 0)
        ) {
          await this.port.sleep(READ_RETRY_INTERVAL_MS);
          read = await readAuthorCardFollowerCount(evaluator);
        }
        if (read.found && read.followerCount !== null && read.followerCount > 0) {
          // Prefer the stable /user/<sec_uid> comparison when both sides
          // have it; only fall back to display-name comparison otherwise.
          // Mismatch is logged for diagnosis but no longer treated as a hard
          // failure: live Douyin DOM often truncates / decorates the visible
          // name while the stats block itself is still the correct author card.
          const cardHandle = (read.authorHandle ?? "").trim();
          const videoHandle = (expectedAuthorHandle ?? "").trim();
          const a = (read.displayName ?? "").replace(/\s+/g, "").trim();
          const b = (expectedDisplayName ?? "").replace(/\s+/g, "").trim();
          if (cardHandle.length > 0 && videoHandle.length > 0 && cardHandle !== videoHandle) {
            log.warn("author_card.handle_mismatch", {
              keyword: run.keywordText,
              card_handle: cardHandle,
              video_handle: videoHandle,
            });
          } else if (cardHandle.length === 0 && a.length > 0 && b.length > 0 && a !== b) {
            log.warn("author_card.name_mismatch", {
              keyword: run.keywordText,
              card: a,
              video: b,
            });
          }
          followerCount = read.followerCount;
          log.info("author_card.read_ok", {
            keyword: run.keywordText,
            follower_count: followerCount,
            display_name: a,
            author_handle: cardHandle,
            stats_text: read.statsText,
            follower_raw: read.followerRaw,
            stats_candidates: read.statsCandidateCount,
            visible_stats_candidates: read.visibleStatsCandidateCount,
            selected_anchor_href: read.selectedAnchorHref,
          });
        } else {
          log.warn("author_card.parse_failed", {
            keyword: run.keywordText,
            found: read.found,
            raw: read.followerCount,
            stats_text: read.statsText,
            follower_raw: read.followerRaw,
            stats_candidates: read.statsCandidateCount,
            visible_stats_candidates: read.visibleStatsCandidateCount,
            selected_anchor_href: read.selectedAnchorHref,
            selected_stats_html: read.selectedStatsHtml,
            display_name: read.displayName,
            author_handle: read.authorHandle,
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warn("author_card.read_failed", {
          keyword: run.keywordText,
          message,
        });
      }
    } else {
      log.warn("author_card.open_timeout", { keyword: run.keywordText });
    }

    // 3. Close the card. Only press ESC if it actually opened — pressing
    //    ESC against a closed card can dismiss browse mode itself on some
    //    Douyin builds. If it's still open after the first ESC, send one
    //    more before giving up.
    if (opened) {
      try {
        await this.port.pressKey("Escape");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warn("author_card.close_press_failed", {
          keyword: run.keywordText,
          message,
        });
      }
      const closed = await waitForAuthorCardClosed(evaluator, AUTHOR_CARD_CLOSE_TIMEOUT_MS);
      if (!closed) {
        try {
          await this.port.pressKey("Escape");
          await waitForAuthorCardClosed(evaluator, AUTHOR_CARD_CLOSE_TIMEOUT_MS);
        } catch {
          /* swallow — next iteration's transient retry covers persistent state */
        }
        const stillOpen = await isAuthorCardOpen(evaluator).catch(() => false);
        if (stillOpen) {
          log.warn("author_card.close_timeout", { keyword: run.keywordText });
        }
      }
    }

    return followerCount;
  }

  /**
   * 006-2 — XHS counterpart to readAuthorFollowerWithRetry. The XHS UI
   * surfaces follower count via a hover-mounted user-info popup attached
   * to body > .tooltip-container, NOT a hotkey-driven panel.
   *
   * patchright's `page.hover()` is a single-step pointer jump to the
   * element's center; XHS's debounced Vue hover listener silently drops
   * that as "not a human". So we drive the motion via raw `mouse.move`
   * with `steps` — first scroll the avatar into view via hover() (free
   * scrollIntoViewIfNeeded), then move the cursor away and back over
   * multiple frames so the page sees a continuous mousemove sequence.
   *
   * On the first poll miss we jiggle ±2px once before giving up — some
   * XHS skin variants only fire the popup on a subsequent `mousemove`
   * over the avatar (not on the initial mouseenter).
   *
   * Returns null on any failure (no port handles, hover threw, bbox
   * unresolvable, popup never mounted with 粉丝 filled, parse failed).
   * Caller treats null as "filtered: read-failed" — no error bump.
   */
  private async readXhsAuthorFollower(
    evaluator: DomEvaluatorOnly,
    run: PerRun,
    log: ReturnType<typeof getLogger>,
  ): Promise<number | null> {
    if (typeof this.port.hover !== "function" || typeof this.port.mouseMove !== "function") {
      log.warn("xhs.author_follower.no_hover_port", { keyword: run.keywordText });
      return null;
    }

    // 0a. Pull the tab into OS foreground. Cheap and helps when nothing else
    //     is competing for focus.
    if (typeof this.port.bringToFront === "function") {
      try {
        await this.port.bringToFront();
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warn("xhs.author_follower.bring_to_front_failed", {
          keyword: run.keywordText,
          message,
        });
      }
    }

    // 0b. Lie about focus / visibility so XHS's hover listener doesn't bail.
    //     XHS's Vue handler short-circuits popup mount when
    //     `document.hasFocus()===false` or `document.visibilityState!=='visible'`.
    //     `bringToFront()` alone is unreliable on Windows when the user's
    //     IDE/terminal owns OS focus — Chrome's renderer keeps reporting the
    //     tab as un-focused even though it's the foreground tab. Manual
    //     hover works because the user moving the mouse triggers Chrome to
    //     refresh focus state. We patch both properties on the page so the
    //     listener's gate always passes regardless of OS focus.
    try {
      await evaluator.evaluate<void>(() => {
        try {
          Object.defineProperty(document, "hasFocus", {
            configurable: true,
            value: () => true,
          });
        } catch {
          /* already patched or non-configurable; ignore */
        }
        try {
          Object.defineProperty(document, "visibilityState", {
            configurable: true,
            get: () => "visible",
          });
          Object.defineProperty(document, "hidden", {
            configurable: true,
            get: () => false,
          });
        } catch {
          /* already patched or non-configurable; ignore */
        }
        try {
          window.dispatchEvent(new Event("focus"));
          document.dispatchEvent(new Event("visibilitychange"));
        } catch {
          /* swallow */
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn("xhs.author_follower.focus_patch_failed", {
        keyword: run.keywordText,
        message,
      });
    }

    // 1. Resolve the avatar's viewport bbox via evaluate, picking the FIRST
    //    truly-visible candidate ourselves. We can't rely on patchright's
    //    `hover(selector)` here: XHS renders multiple `.avatar-item` IMGs
    //    (note author + per-comment avatars + sometimes a hidden SEO
    //    template), and patchright's locator picks document-order first
    //    which is often a `display:none` template — the ensuing
    //    "element is not visible" timeout used to bail us out before any
    //    mouseMove ever fired.
    //
    //    We scrollIntoView our chosen IMG first (replaces patchright
    //    hover's free scroll) and require a positive non-zero rect that
    //    matches avatar dimensions (~40×40, capped at 120 to reject any
    //    wider author-row wrapper).
    type DiagBag = {
      hasFocus: boolean;
      hidden: boolean;
      candidateCount: number;
      pickedRect: { cx: number; cy: number; w: number; h: number } | null;
      tooltipPresent: boolean;
      visibleCount: number;
    };
    const diag = await evaluator.evaluate<DiagBag>(() => {
      const sel =
        "#noteContainer img.avatar-item, " +
        ".note-container img.avatar-item, " +
        "[class*='note-container'] img.avatar-item";
      const nodes = document.querySelectorAll(sel);
      let picked: { cx: number; cy: number; w: number; h: number } | null = null;
      let visibleCount = 0;
      let pickedEl: HTMLElement | null = null;
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i] as HTMLElement;
        const cs = window.getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
        const r = el.getBoundingClientRect();
        if (r.width < 8 || r.height < 8) continue;
        if (r.width > 120 || r.height > 120) continue;
        visibleCount += 1;
        if (picked !== null) continue;
        pickedEl = el;
        picked = {
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
          w: r.width,
          h: r.height,
        };
      }
      // Scroll the chosen avatar into view, then re-measure (the rect after
      // scroll may differ if the page reflowed).
      if (pickedEl !== null) {
        try {
          pickedEl.scrollIntoView({ behavior: "instant", block: "center" });
        } catch {
          /* swallow */
        }
        const r2 = pickedEl.getBoundingClientRect();
        if (r2.width >= 8 && r2.height >= 8) {
          picked = {
            cx: r2.left + r2.width / 2,
            cy: r2.top + r2.height / 2,
            w: r2.width,
            h: r2.height,
          };
        }
      }
      return {
        hasFocus: document.hasFocus(),
        hidden: document.hidden,
        candidateCount: nodes.length,
        visibleCount,
        pickedRect: picked,
        tooltipPresent: document.querySelector(".tooltip-container") !== null,
      };
    });
    log.info("xhs.author_follower.diag", {
      keyword: run.keywordText,
      has_focus: diag.hasFocus,
      hidden: diag.hidden,
      candidate_count: diag.candidateCount,
      visible_count: diag.visibleCount,
      picked_rect: diag.pickedRect,
      tooltip_already_present: diag.tooltipPresent,
    });
    if (diag.pickedRect === null) {
      log.warn("xhs.author_follower.bbox_missing", { keyword: run.keywordText });
      return null;
    }
    const bbox = { cx: diag.pickedRect.cx, cy: diag.pickedRect.cy };

    // 3. Move out then back into the avatar over multiple steps. The
    //    out-and-back ensures fresh pointerenter events even if the
    //    cursor was already parked there from a previous iteration's
    //    hover; the steps make XHS's debounce listener see it as a
    //    human-paced motion.
    try {
      const offX = Math.max(0, bbox.cx - 80);
      const offY = Math.max(0, bbox.cy - 80);
      await this.port.mouseMove(offX, offY, { steps: 4 });
      await this.port.mouseMove(bbox.cx, bbox.cy, { steps: 14 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn("xhs.author_follower.move_failed", {
        keyword: run.keywordText,
        message,
      });
      return null;
    }
    await this.port.sleep(USER_HOVER_CARD_SETTLE_MS);

    let appeared = await waitForUserHoverCard(
      evaluator,
      USER_HOVER_CARD_OPEN_TIMEOUT_MS,
      POLL_INTERVAL_MS,
    );

    // 4. One jiggle retry: shake ±2px and back. Some XHS skin variants
    //    only fire the popup on subsequent mousemove over the avatar,
    //    not on the first mouseenter.
    if (!appeared) {
      try {
        await this.port.mouseMove(bbox.cx + 2, bbox.cy + 2, { steps: 2 });
        await this.port.mouseMove(bbox.cx, bbox.cy, { steps: 2 });
      } catch {
        /* swallow — the next poll either succeeds or we give up */
      }
      appeared = await waitForUserHoverCard(
        evaluator,
        Math.max(1000, Math.floor(USER_HOVER_CARD_OPEN_TIMEOUT_MS / 2)),
        POLL_INTERVAL_MS,
      );
    }

    if (!appeared) {
      // Capture post-mortem state so we can tell the difference between
      // "tooltip never mounted at all" vs "tooltip mounted but 粉丝 not
      // filled yet" vs "tooltip mounted with empty interaction-info".
      const post = await evaluator
        .evaluate<{
          tooltipPresent: boolean;
          headerArea: boolean;
          interactionLinks: number;
          rawHeader: string;
        }>(() => {
          const tt = document.querySelector(".tooltip-container");
          const hdr = document.querySelector(".tooltip-container .header-area");
          const links = document.querySelectorAll(
            ".tooltip-container .interaction-info a.interaction",
          );
          return {
            tooltipPresent: tt !== null,
            headerArea: hdr !== null,
            interactionLinks: links.length,
            rawHeader: hdr === null ? "" : (hdr as HTMLElement).innerText.slice(0, 200),
          };
        })
        .catch(() => ({
          tooltipPresent: false,
          headerArea: false,
          interactionLinks: 0,
          rawHeader: "",
        }));
      log.warn("xhs.author_follower.card_did_not_appear", {
        keyword: run.keywordText,
        post_tooltip_present: post.tooltipPresent,
        post_header_area: post.headerArea,
        post_interaction_links: post.interactionLinks,
        post_raw_header: post.rawHeader,
      });
      return null;
    }
    try {
      const n = await readUserHoverCardFollowerCount(evaluator);
      if (n === null) {
        log.warn("xhs.author_follower.parse_failed", { keyword: run.keywordText });
        return null;
      }
      log.info("xhs.author_follower.read_ok", {
        keyword: run.keywordText,
        follower_count: n,
      });
      return n;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn("xhs.author_follower.read_failed", {
        keyword: run.keywordText,
        message,
      });
      return null;
    }
  }

  private bumpProgress(
    state: BatchState,
    run: PerRun,
    lastPhase:
      | "navigate"
      | "layout-switch"
      | "layout-probe"
      | "dwell"
      | "read"
      | "record"
      | "next"
      | "filtered"
      | "card-classify"
      | "open-detail"
      | "close-detail"
      | "scroll-load",
  ): void {
    ensureBatchEvent({
      schema_version: "1",
      phase: "progress",
      batch_id: state.id,
      platform: state.platform,
      keyword_id: run.keywordId,
      scanned_count: run.scanned,
      captured_count: run.captured,
      duplicate_count: run.duplicate,
      error_count: run.errors,
      filtered_count: run.filtered,
      last_phase: lastPhase,
    });
  }

  private async runLoop(state: BatchState): Promise<void> {
    const log = getLogger();
    let consecutiveSessionFailures = 0;
    let earlyEndReason: BatchStopReason | null = null;

    for (let i = 0; i < state.runs.length; i++) {
      const run = state.runs[i]!;
      if (this.cancelToken.cancelled) {
        earlyEndReason = "user";
        break;
      }
      if (consecutiveSessionFailures >= BATCH_SESSION_DEAD_THRESHOLD) {
        earlyEndReason = "batch-session-dead";
        break;
      }
      if (!this.port.isInstalled()) {
        earlyEndReason = "batch-session-dead";
        break;
      }
      if (!(await this.ensureSessionForKeyword(run, log))) {
        earlyEndReason = "batch-session-dead";
        break;
      }

      state.currentIndex = i;
      run.status = "running";
      run.startedAt = nowIso();
      this.library.insertKeywordRun({
        id: run.runRowId,
        platform: state.platform,
        batch_id: state.id,
        keyword_id: run.keywordId,
        keyword_text_snapshot: run.keywordText,
        metric_filter_mode: run.metricFilterMode,
        min_like_follower_ratio_snapshot: run.minLikeFollowerRatio,
        publish_time_range: run.publishTimeRange,
        author_follower_count_op: run.authorFollowerCountOp,
        author_follower_count_value: run.authorFollowerCountValue,
        like_count_op: run.likeCountOp,
        like_count_value: run.likeCountValue,
        status: "running",
        stop_reason: null,
        started_at: run.startedAt,
        ended_at: null,
        scanned_count: 0,
        captured_count: 0,
        duplicate_count: 0,
        error_count: 0,
        filtered_count: 0,
        representative_errors: [],
      });

      ensureBatchEvent({
        schema_version: "1",
        phase: "keyword-started",
        batch_id: state.id,
        platform: state.platform,
        keyword_id: run.keywordId,
        keyword_text: run.keywordText,
        position: run.position,
        total: state.runs.length,
        started_at: run.startedAt,
      });

      try {
        const reason = await this.runOneKeyword(state, run);
        run.stopReason = reason;
        run.status =
          reason === "user"
            ? "stopped"
            : reason === "session-failure" ||
                reason === "error-threshold" ||
                reason === "layout-switch-failure" ||
                reason === "schema-drift" ||
                reason === "login-required"
              ? "error"
              : "done";
        if (reason === "session-failure" || reason === "login-required")
          consecutiveSessionFailures++;
        else consecutiveSessionFailures = 0;
        if (reason === "user") {
          earlyEndReason = "user";
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error("batch.run_threw", { keyword: run.keywordText, message });
        pushRepresentative(run, "INTERNAL");
        run.errors += 1;
        run.status = "error";
        run.stopReason = "session-failure";
        consecutiveSessionFailures++;
      }

      run.endedAt = nowIso();
      this.library.updateKeywordRun(run.runRowId, {
        status: run.status,
        stop_reason: run.stopReason,
        ended_at: run.endedAt,
        scanned_count: run.scanned,
        captured_count: run.captured,
        duplicate_count: run.duplicate,
        error_count: run.errors,
        filtered_count: run.filtered,
        representative_errors: run.representative,
      });

      ensureBatchEvent({
        schema_version: "1",
        phase: "keyword-ended",
        batch_id: state.id,
        platform: state.platform,
        keyword_id: run.keywordId,
        stop_reason: run.stopReason ?? "user",
        started_at: run.startedAt,
        ended_at: run.endedAt,
        scanned_count: run.scanned,
        captured_count: run.captured,
        duplicate_count: run.duplicate,
        error_count: run.errors,
        filtered_count: run.filtered,
        representative_errors: run.representative,
      });

      await this.closeSessionAfterKeyword(run, log);

      if (earlyEndReason !== null) break;
    }

    // mark any remaining runs as cancelled
    const executed: string[] = [];
    const cancelled: string[] = [];
    for (const r of state.runs) {
      if (r.status === "pending") cancelled.push(r.keywordId);
      else executed.push(r.keywordId);
    }

    state.endedAt = nowIso();
    state.stopReason = earlyEndReason ?? "all-completed";
    state.status =
      earlyEndReason === "user"
        ? "stopped"
        : earlyEndReason === "batch-session-dead"
          ? "error"
          : "done";
    state.currentIndex = null;

    this.library.updateKeywordBatch(state.id, {
      status: state.status,
      stop_reason: state.stopReason,
      ended_at: state.endedAt,
      executed_keyword_ids: executed,
      cancelled_keyword_ids: cancelled,
    });

    ensureBatchEvent({
      schema_version: "1",
      phase: "batch-ended",
      batch_id: state.id,
      platform: state.platform,
      stop_reason: state.stopReason,
      started_at: state.startedAt,
      ended_at: state.endedAt,
      executed_keyword_ids: executed,
      cancelled_keyword_ids: cancelled,
    });
  }

  /**
   * 006 — Dispatches by platform: Douyin keeps the existing browse-mode
   * loop; XHS uses click-into-card model (port from 005).
   */
  private async runOneKeyword(state: BatchState, run: PerRun): Promise<RunStopReason> {
    if (state.platform === "xiaohongshu") {
      return this.runOneKeywordXhs(state, run);
    }
    return this.runOneKeywordDouyin(state, run);
  }

  private async runOneKeywordDouyin(state: BatchState, run: PerRun): Promise<RunStopReason> {
    const log = getLogger();
    const searchUrl = searchUrlFor(state.platform, run.keywordText);
    // 1. navigate
    log.info("keyword.navigate.begin", {
      keyword: run.keywordText,
      url: searchUrl,
    });
    try {
      await this.port.navigateTo(searchUrl);
      setDouyinReachable("reachable");
      log.info("keyword.navigate.ok", { keyword: run.keywordText });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      pushRepresentative(run, `NAVIGATE_FAILED: ${message}`.slice(0, 256));
      run.errors += 1;
      log.error("keyword.navigate_failed", { keyword: run.keywordText, message });
      setDouyinReachable("unreachable");
      return "session-failure";
    }
    if (this.cancelToken.cancelled) return "user";
    this.bumpProgress(state, run, "navigate");

    // 2. layout switch — always attempt to click the "单列" toggle once per
    // navigation. The toggle is a radio-style affordance: clicking the
    // already-selected option is a no-op. The card extractor's selectors
    // are broad enough to handle both single-column and grid layouts in
    // case the click is a no-op or the toggle isn't present at all.
    const evaluator = this.port.evaluator();
    if (evaluator === null) {
      pushRepresentative(run, "PAGE_UNAVAILABLE");
      run.errors += 1;
      return "session-failure";
    }
    // Brief settle delay so the search results have time to mount.
    await this.port.sleep(2000);
    if (run.publishTimeRange !== "all") {
      const timeFilterApplied = await applyPublishTimeFilter(evaluator, run.publishTimeRange);
      if (!timeFilterApplied) {
        let filterDiag: unknown = null;
        try {
          filterDiag = await evaluator.evaluate<unknown>(() => {
            return (
              (window as unknown as { __uaDouyinPublishTimeFilterDiag?: unknown })
                .__uaDouyinPublishTimeFilterDiag ?? null
            );
          });
        } catch {
          filterDiag = null;
        }
        const filterStep =
          filterDiag !== null &&
          typeof filterDiag === "object" &&
          "step" in filterDiag &&
          typeof (filterDiag as { step?: unknown }).step === "string"
            ? (filterDiag as { step: string }).step
            : null;
        pushRepresentative(
          run,
          (filterStep === null ? "TIME_FILTER_FAILED" : `TIME_FILTER_FAILED:${filterStep}`).slice(0, 256),
        );
        run.errors += 1;
        log.warn("keyword.time_filter_failed", {
          keyword: run.keywordText,
          publish_time_range: run.publishTimeRange,
          diag: filterDiag,
        });
        return "layout-switch-failure";
      }
      await this.port.sleep(1000);
    }
    const clicked = await clickSingleColumnToggle(evaluator);
    if (clicked) {
      log.info("keyword.layout_toggle_clicked", { keyword: run.keywordText });
      await this.port.sleep(1500);
    } else {
      log.info("keyword.layout_toggle_missing — proceeding with current layout", {
        keyword: run.keywordText,
      });
    }
    if (this.cancelToken.cancelled) return "user";
    this.bumpProgress(state, run, "layout-switch");

    // 3. enter browse mode by pressing "h", then walk the feed by repeatedly
    // pressing ArrowDown. Each press advances the focused video; the page
    // URL updates to /video/<aweme_id> and the active container exposes
    // caption / author / counts that we read via readCurrentBrowseVideo.
    //
    // The "单列" toggle click leaves the toggle button focused, so a
    // subsequent keyboard.press("h") is delivered to the button instead of
    // bubbling up to Douyin's global hotkey listener. Blur the active
    // element first; verify browse mode actually entered; fall back to a
    // synthetic KeyboardEvent dispatched on window/document/body if not.
    try {
      await blurActiveElement(evaluator);
      await this.port.sleep(150);
      await this.port.pressKey("h");
      log.info("keyword.browse_mode_hotkey_sent", { keyword: run.keywordText });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      pushRepresentative(run, `BROWSE_MODE_ENTER_FAILED: ${message}`.slice(0, 256));
      run.errors += 1;
      return "session-failure";
    }
    // Settle so the browse-mode viewer mounts and the first video focuses.
    await this.port.sleep(2000);
    if (!(await isBrowseModeActive(evaluator))) {
      log.warn("keyword.browse_mode_not_entered_after_keypress", {
        keyword: run.keywordText,
      });
      try {
        await dispatchBrowseModeHotkey(evaluator);
        await this.port.sleep(2000);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error("keyword.browse_mode_dispatch_failed", {
          keyword: run.keywordText,
          message,
        });
      }
      if (!(await isBrowseModeActive(evaluator))) {
        pushRepresentative(run, "BROWSE_MODE_NOT_ENTERED");
        run.errors += 1;
        log.error("keyword.browse_mode_not_entered", { keyword: run.keywordText });
        return "session-failure";
      }
    }
    log.info("keyword.browse_mode_entered", { keyword: run.keywordText });
    log.info("keyword.run_caps", {
      keyword: run.keywordText,
      target_cap: run.targetCap,
      health_cap: run.healthCap,
      metric_filter_mode: run.metricFilterMode,
      min_like_follower_ratio: run.minLikeFollowerRatio,
      publish_time_range: run.publishTimeRange,
      author_follower_count_op: run.authorFollowerCountOp,
      author_follower_count_value: run.authorFollowerCountValue,
      like_count_op: run.likeCountOp,
      like_count_value: run.likeCountValue,
      ratio_filter_enabled: run.metricFilterMode === "ratio" && run.minLikeFollowerRatio > 0,
    });

    let consecutiveErrors = 0;
    let consecutiveSamePost = 0;
    let lastPostId: string | null = null;
    let lastTickAt = 0;
    let isFirstIteration = true;

    while (true) {
      if (this.cancelToken.cancelled) return "user";
      if (run.scanned >= run.healthCap) return "health-cap";
      if (run.captured >= run.targetCap) return "cap";
      if (consecutiveErrors >= CONSECUTIVE_ERROR_THRESHOLD) return "error-threshold";

      // Throttle between iterations.
      const sinceLast = Date.now() - lastTickAt;
      if (lastTickAt > 0 && sinceLast < INTER_CARD_MIN_INTERVAL_MS) {
        await this.port.sleep(INTER_CARD_MIN_INTERVAL_MS - sinceLast);
      }
      lastTickAt = Date.now();

      // Advance to next video (skip on the very first iteration — the
      // current focused video is already the first result).
      //
      // Page-transition transients ("BrowserPage is not available", evaluate
      // racing with navigation, etc.) used to count straight against the
      // 5-error threshold and burned the run as soon as we hit the end of
      // the feed. Retry both pressKey and the subsequent DOM read up to
      // TRANSIENT_RETRY_LIMIT times with a brief settle in between — this
      // is the same back-off the page itself takes to re-attach. Only count
      // a hard error if every retry fails; in that case, if we already
      // captured anything, treat it as the natural end of the feed instead
      // of an error-threshold bailout.
      if (!isFirstIteration) {
        const pressResult = await this.pressKeyWithRetry("ArrowDown", run, log);
        if (pressResult === "exhausted") {
          if (run.captured > 0) {
            log.info("keyword.feed_end_via_press_exhaustion", {
              keyword: run.keywordText,
              captured: run.captured,
            });
            return "end-of-results";
          }
          return "session-failure";
        }
        // Wait for the next video to load + focus.
        await this.port.sleep(1500);
      }
      isFirstIteration = false;
      this.bumpProgress(state, run, "next");

      // Read the active video, retrying page-transition transients.
      const readResult = await this.readVideoWithRetry(evaluator, run, log);
      if (readResult.kind === "exhausted") {
        if (run.captured > 0) {
          log.info("keyword.feed_end_via_read_exhaustion", {
            keyword: run.keywordText,
            captured: run.captured,
          });
          return "end-of-results";
        }
        return "session-failure";
      }
      const video = readResult.video;
      this.bumpProgress(state, run, "read");

      // Resolve the canonical post URL — prefer a video link inside the
      // active container, fall back to the current page URL.
      const canon =
        (video.href !== null ? canonicalizeDouyinUrl(video.href) : null) ??
        canonicalizeDouyinUrl(video.pageUrl);

      if (canon === null) {
        // No video URL found yet — the viewer may still be transitioning.
        consecutiveErrors++;
        run.errors += 1;
        pushRepresentative(run, "URL_UNPARSEABLE");
        log.warn("keyword.url_unparseable", {
          keyword: run.keywordText,
          href: video.href,
          page_url: video.pageUrl,
        });
        continue;
      }

      // Duplicate-against-previous-step guard: if pressing ArrowDown didn't
      // advance the focus (we hit the end of feed), give up after several
      // attempts.
      if (canon.postId === lastPostId) {
        consecutiveSamePost++;
        log.info("keyword.same_post_id_repeat", {
          keyword: run.keywordText,
          post_id: canon.postId,
          repeat: consecutiveSamePost,
        });
        if (consecutiveSamePost >= 3) return "end-of-results";
        continue;
      }
      consecutiveSamePost = 0;
      lastPostId = canon.postId;

      run.scanned += 1;
      this.bumpProgress(state, run, "dwell");

      if (this.library.materialEntryExists(canon.postId)) {
        run.duplicate += 1;
        consecutiveErrors = 0;
        this.bumpProgress(state, run, "record");
        continue;
      }

      // Author-card lookup (F-key): only when this keyword's ratio filter
      // is enabled. We open the author card after the duplicate guard so
      // already-saved videos cost no extra keypresses. On any failure
      // (timeout, parse, name mismatch) we skip the video — counted as
      // filtered, not error.
      let authorFollowerCount: number | null = null;
      const followerCountRequired =
        run.metricFilterMode === "ratio" ||
        (run.metricFilterMode === "author_metrics" && run.authorFollowerCountOp !== null);
      {
        const followerOutcome = await this.readAuthorFollowerWithRetry(
          evaluator,
          video.authorHandle,
          video.authorDisplayName,
          run,
          log,
        );
        if (followerOutcome === null) {
          pushRepresentative(run, "AUTHOR_READ_FAILED");
          if (followerCountRequired) {
            run.filtered += 1;
            consecutiveErrors = 0;
            this.bumpProgress(state, run, "filtered");
            continue;
          }
          log.warn("author_card.optional_read_failed", {
            keyword: run.keywordText,
            post_id: canon.postId,
          });
        } else if (followerOutcome <= 0) {
          if (followerCountRequired) {
            run.filtered += 1;
            consecutiveErrors = 0;
            this.bumpProgress(state, run, "filtered");
            continue;
          }
          log.warn("author_card.optional_read_invalid", {
            keyword: run.keywordText,
            post_id: canon.postId,
            follower_count: followerOutcome,
          });
        } else {
          authorFollowerCount = followerOutcome;
        }
      }

      if (followerCountRequired && authorFollowerCount === null) {
        run.filtered += 1;
        consecutiveErrors = 0;
        this.bumpProgress(state, run, "filtered");
        continue;
      }

      if (run.metricFilterMode === "ratio") {
        if (video.likeCount < 0 || authorFollowerCount === null) {
          run.filtered += 1;
          consecutiveErrors = 0;
          this.bumpProgress(state, run, "filtered");
          continue;
        }
        const ratioTimes10 = Math.round((video.likeCount * 10) / authorFollowerCount);
        const minTimes10 = Math.round(run.minLikeFollowerRatio * 10);
        if (ratioTimes10 < minTimes10) {
          run.filtered += 1;
          consecutiveErrors = 0;
          this.bumpProgress(state, run, "filtered");
          continue;
        }
      }

      if (run.metricFilterMode === "author_metrics") {
        if (
          run.likeCountOp !== null &&
          run.likeCountValue !== null &&
          (video.likeCount < 0 ||
            !compareMetric(video.likeCount, run.likeCountOp, run.likeCountValue))
        ) {
          run.filtered += 1;
          consecutiveErrors = 0;
          this.bumpProgress(state, run, "filtered");
          continue;
        }
        if (
          run.authorFollowerCountOp !== null &&
          run.authorFollowerCountValue !== null &&
          (authorFollowerCount === null ||
            !compareMetric(
              authorFollowerCount,
              run.authorFollowerCountOp,
              run.authorFollowerCountValue,
            ))
        ) {
          run.filtered += 1;
          consecutiveErrors = 0;
          this.bumpProgress(state, run, "filtered");
          continue;
        }
      }

      // Open the right-side comment panel via the "x" hotkey, read up to 10
      // top-level comments, then press "x" again to close. Best-effort: we
      // don't fail the capture if the panel doesn't open within the timeout
      // (some videos load comments lazily, others may have none). Comments
      // default to [] in that case.
      //
      // Mirroring the F-key author-card path: blur first so a focused widget
      // doesn't swallow the keystroke; if patchright's keypress doesn't open
      // the panel within the first window, dispatch a synthetic KeyX event at
      // window/document/body as a fallback (Douyin's hotkey listeners often
      // bind there, not on the focused element).
      let douyinComments: Awaited<ReturnType<typeof readBrowseModeComments>> = [];
      const COMMENT_PANEL_OPEN_TIMEOUT_MS = 2500;
      const COMMENT_PANEL_SETTLE_MS = 400;
      try {
        const wasOpen = await isCommentPanelOpen(evaluator);
        if (!wasOpen) {
          await blurActiveElement(evaluator).catch(() => undefined);
          await this.port.sleep(150);
          await this.port.pressKey("x");
        }
        let settle = await waitForCommentPanel(
          evaluator,
          COMMENT_PANEL_OPEN_TIMEOUT_MS,
          POLL_INTERVAL_MS,
        );
        if (!wasOpen && !settle.open) {
          log.info("douyin.comment_panel.fallback_dispatch", {
            keyword: run.keywordText,
            post_id: canon.postId,
          });
          await dispatchCommentPanelHotkey(evaluator).catch(() => false);
          settle = await waitForCommentPanel(
            evaluator,
            COMMENT_PANEL_OPEN_TIMEOUT_MS,
            POLL_INTERVAL_MS,
          );
        }
        log.info("douyin.comment_panel.state", {
          keyword: run.keywordText,
          post_id: canon.postId,
          was_open: wasOpen,
          open: settle.open,
          items: settle.items,
          root_class: settle.rootClass,
          root_data_e2e: settle.rootDataE2e,
        });
        if (settle.open) {
          await this.port.sleep(COMMENT_PANEL_SETTLE_MS);
          douyinComments = await readBrowseModeComments(evaluator);
          log.info("douyin.comment_panel.read", {
            keyword: run.keywordText,
            post_id: canon.postId,
            captured: douyinComments.length,
          });
        }
        // Always close if we opened it ourselves, so the next iteration starts
        // with the same default layout. Try keypress first, fall back to
        // synthetic dispatch.
        if (!wasOpen) {
          const stillOpen = await isCommentPanelOpen(evaluator);
          if (stillOpen) {
            await this.port.pressKey("x").catch(() => undefined);
            await this.port.sleep(150);
            const stillStillOpen = await isCommentPanelOpen(evaluator).catch(() => false);
            if (stillStillOpen) {
              await dispatchCommentPanelHotkey(evaluator).catch(() => false);
            }
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warn("douyin.comment_panel.read_failed", {
          keyword: run.keywordText,
          post_id: canon.postId,
          message,
        });
      }

      try {
        const captured = this.library.insertOrIgnoreMaterialEntry({
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
          author_follower_count: authorFollowerCount,
          captured_at: nowIso(),
          captured_by_device: `web:keyword:${run.keywordText}`,
          note_type: "video",
          platform: state.platform,
          media_kind: "video",
          image_urls: null,
          comments: douyinComments.map((c) => ({
            author: c.author,
            content: c.content,
            like_count: c.likeCount,
            time_text: c.timeText,
          })),
          transcript: null,
          transcribed_at: null,
        });
        if (captured.kind === "inserted") {
          run.captured += 1;
          consecutiveErrors = 0;
        } else {
          run.duplicate += 1;
        }
        this.bumpProgress(state, run, "record");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        pushRepresentative(run, "INSERT_FAILED");
        consecutiveErrors++;
        run.errors += 1;
        log.error("material.insert_failed", { keyword: run.keywordText, message });
      }
    }
  }

  /**
   * 006 — XHS click-into-card per-keyword loop.
   *
   * Per-keyword loop:
   *   1. navigate to xiaohongshu.com/search_result?keyword=<kw>
   *   2. waitForMasonryReady (LAYOUT_PROBE_TIMEOUT_MS)
   *   3. while not capped/cancelled/error-threshold/health-cap:
   *      a. listVisibleCards
   *      b. pick first un-visited note card (scroll for more if exhausted)
   *      c. cross-feature dedup against material_entries.post_id
   *      d. clickNote(noteId) — dispatches click on the visible cover IMG
   *         with capture-phase preventDefault to suppress hard navigation
   *      e. waitForDetailContent — accepts either an in-page modal or an
   *         in-place detail layout (just needs #noteContainer visible)
   *      f. dwell + extractDetailMetadata
   *      g. insertOrIgnoreMaterialEntry (platform=xiaohongshu)
   *      h. dispatchOverlayClose (Esc/close-button); if that doesn't bring
   *         masonry back, re-navigate to searchUrl as a recovery path
   */
  private async runOneKeywordXhs(state: BatchState, run: PerRun): Promise<RunStopReason> {
    const log = getLogger();
    const searchUrl = searchUrlFor(state.platform, run.keywordText);

    // 1. initial navigation to the search page.
    log.info("xhs.keyword.navigate.begin", { keyword: run.keywordText, url: searchUrl });
    try {
      await this.port.navigateTo(searchUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      pushRepresentative(run, `NAVIGATE_FAILED: ${message}`.slice(0, 256));
      run.errors += 1;
      log.error("xhs.keyword.navigate_failed", { keyword: run.keywordText, message });
      return "session-failure";
    }
    if (this.cancelToken.cancelled) return "user";
    this.bumpProgress(state, run, "navigate");

    // 2. masonry probe so we know the search results actually rendered.
    {
      const evaluator = this.port.evaluator();
      if (evaluator === null) {
        pushRepresentative(run, "PAGE_UNAVAILABLE");
        run.errors += 1;
        return "session-failure";
      }
      const ready = await waitForMasonryReady(
        evaluator,
        LAYOUT_PROBE_TIMEOUT_MS,
        POLL_INTERVAL_MS,
      );
      if (!ready) {
        pushRepresentative(run, "LAYOUT_PROBE_TIMEOUT");
        run.errors += 1;
        // Diagnostic dump: when the masonry never appeared, capture what
        // IS on the page so we can tell login-wall from slow-load from
        // empty-search from anti-bot challenge.
        try {
          const diag = await evaluator.evaluate<{
            url: string;
            title: string;
            hasFeedsContainer: boolean;
            hasFeedsPage: boolean;
            noteItemCount: number;
            loginIndicator: boolean;
            antiBotIndicator: boolean;
            bodyTextSample: string;
          }>(() => {
            const text = (document.body.textContent ?? "").slice(0, 400);
            return {
              url: location.href,
              title: document.title,
              hasFeedsContainer: !!document.querySelector(".feeds-container"),
              hasFeedsPage: !!document.querySelector(".feeds-page"),
              noteItemCount: document.querySelectorAll(".note-item, [class*='note-item']").length,
              loginIndicator: /扫码登录|手机号登录|登录小红书|reds-image-popup/i.test(
                document.body.innerHTML,
              ),
              antiBotIndicator: /验证|验证码|滑动验证|安全验证/i.test(text),
              bodyTextSample: text,
            };
          });
          log.error("xhs.keyword.layout_probe_timeout", {
            keyword: run.keywordText,
            diag_url: diag.url,
            diag_title: diag.title,
            diag_has_feeds_container: diag.hasFeedsContainer,
            diag_has_feeds_page: diag.hasFeedsPage,
            diag_note_item_count: diag.noteItemCount,
            diag_login_indicator: diag.loginIndicator,
            diag_anti_bot_indicator: diag.antiBotIndicator,
            diag_body_sample: diag.bodyTextSample,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          log.error("xhs.keyword.layout_probe_timeout", {
            keyword: run.keywordText,
            diag_failed: message,
          });
        }
        return "layout-switch-failure";
      }
    }
    if (this.cancelToken.cancelled) return "user";
    this.bumpProgress(state, run, "layout-probe");

    if (run.publishTimeRange !== "all") {
      const evaluator = this.port.evaluator();
      if (evaluator === null) {
        pushRepresentative(run, "PAGE_UNAVAILABLE");
        run.errors += 1;
        return "session-failure";
      }
      const timeFilterApplied = await applyXhsPublishTimeFilter(evaluator, run.publishTimeRange);
      if (!timeFilterApplied) {
        let filterDiag: unknown = null;
        try {
          filterDiag = await evaluator.evaluate<unknown>(() => {
            return (
              (window as unknown as { __uaXhsPublishTimeFilterDiag?: unknown })
                .__uaXhsPublishTimeFilterDiag ?? null
            );
          });
        } catch {
          filterDiag = null;
        }
        const filterStep =
          filterDiag !== null &&
          typeof filterDiag === "object" &&
          "step" in filterDiag &&
          typeof (filterDiag as { step?: unknown }).step === "string"
            ? (filterDiag as { step: string }).step
            : null;
        pushRepresentative(
          run,
          (filterStep === null
            ? "TIME_FILTER_FAILED"
            : `TIME_FILTER_FAILED:${filterStep}`).slice(0, 256),
        );
        run.errors += 1;
        log.warn("xhs.keyword.time_filter_failed", {
          keyword: run.keywordText,
          publish_time_range: run.publishTimeRange,
          diag: filterDiag,
        });
        return "layout-switch-failure";
      }
      await this.port.sleep(1000);
    }

    // Settle delay — `waitForMasonryReady` returns as soon as the first
    // .note-item exists in the DOM, but XHS's Vue @click handlers can
    // take another ~hundred ms to bind on a freshly-loaded search page.
    // Without this dwell the first click was silently dropped (handler
    // not yet bound) → DETAIL_OPEN_TIMEOUT → card 0 added to visited →
    // next iteration started from card 1. User report:
    // "没有从第一个开始打开".
    await this.port.sleep(1500);

    // 3. main loop — pick next card → navigate to it → read → navigate back.
    const visited = new Set<string>();
    let consecutiveErrors = 0;
    let noGrowthScrolls = 0;
    let lastTickAt = 0;

    while (true) {
      if (this.cancelToken.cancelled) return "user";
      if (run.scanned >= run.healthCap) return "health-cap";
      if (run.captured >= run.targetCap) return "cap";
      if (consecutiveErrors >= CONSECUTIVE_ERROR_THRESHOLD) return "error-threshold";

      const sinceLast = Date.now() - lastTickAt;
      if (lastTickAt > 0 && sinceLast < INTER_CARD_MIN_INTERVAL_MS) {
        await this.port.sleep(INTER_CARD_MIN_INTERVAL_MS - sinceLast);
      }
      lastTickAt = Date.now();

      // We are on the search page (either freshly navigated, or returned
      // from a prior detail visit). Re-resolve the evaluator because it
      // can change across navigations. patchright transiently reports 0
      // tabs in the context during XHS's own redirect / popup / window
      // lifecycle (the `pages()` array briefly empties), so a single null
      // read from `port.evaluator()` is NOT enough to conclude the page
      // is gone — retry up to 6 times with 500 ms backoff (~3 s budget)
      // before counting it as an error. This was the actual failure mode
      // in the user's log: navigate ok, probe ok, then one transient null
      // → pre-empted as PAGE_UNAVAILABLE → run died before the click.
      let evaluator = this.port.evaluator();
      if (evaluator === null) {
        for (let attempt = 0; attempt < 6 && evaluator === null; attempt++) {
          await this.port.sleep(500);
          evaluator = this.port.evaluator();
        }
      }
      if (evaluator === null) {
        consecutiveErrors++;
        run.errors += 1;
        pushRepresentative(run, "PAGE_UNAVAILABLE");
        log.error("xhs.dom.page_unavailable", {
          keyword: run.keywordText,
          retries_exhausted: 6,
        });
        continue;
      }

      // Wrap the listVisibleCards evaluate call with our own timeout —
      // playwright's page.evaluate has no built-in timeout, so a stuck
      // page can hang the whole batch silently (the user reported "single
      // PAGE_UNAVAILABLE then nothing happens" exactly because the next
      // iteration's evaluate() never resolved).
      let bag: { cards: CardSummary[]; total: number };
      try {
        bag = await Promise.race<{ cards: CardSummary[]; total: number }>([
          listVisibleCards(evaluator),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("listVisibleCards timeout (10s)")), 10000),
          ),
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        pushRepresentative(run, "DOM_LIST_FAILED");
        consecutiveErrors++;
        run.errors += 1;
        log.error("xhs.dom.list_failed", { keyword: run.keywordText, message });
        continue;
      }
      if (bag.total === 0) return "search-empty";

      const next = pickNextXhsCard(bag.cards, visited);
      if (next === null) {
        const beforeCount = bag.total;
        try {
          await scrollMasonryBottom(evaluator);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          pushRepresentative(run, "SCROLL_FAILED");
          consecutiveErrors++;
          run.errors += 1;
          log.error("xhs.dom.scroll_failed", { keyword: run.keywordText, message });
          continue;
        }
        this.bumpProgress(state, run, "scroll-load");
        const newCount = await waitForCardCountGrowth(
          evaluator,
          beforeCount,
          LOAD_MORE_TIMEOUT_MS,
          POLL_INTERVAL_MS,
        );
        if (newCount <= beforeCount) {
          noGrowthScrolls += 1;
          if (noGrowthScrolls >= NO_GROWTH_SCROLL_THRESHOLD) {
            log.info("xhs.keyword.end_of_results", {
              keyword: run.keywordText,
              total_cards: beforeCount,
              captured: run.captured,
            });
            return "end-of-results";
          }
        } else {
          noGrowthScrolls = 0;
        }
        continue;
      }

      // Defensive — pickNextXhsCard is now guaranteed to only return cards
      // with a non-null noteId (it skips recommendation tiles and parser
      // failures internally). These guards stay as belt-and-suspenders for
      // unusual layouts where a non-note card slips through with a noteId.
      if (next.kind !== "video" && next.kind !== "image_text") {
        run.filtered += 1;
        if (next.noteId !== null) visited.add(next.noteId);
        consecutiveErrors = 0;
        this.bumpProgress(state, run, "filtered");
        continue;
      }
      if (next.noteId === null || next.href === null) {
        // Should not be reachable after the pickNextXhsCard fix — but
        // if it ever is, mark something so we don't infinite-loop.
        run.filtered += 1;
        consecutiveErrors = 0;
        this.bumpProgress(state, run, "filtered");
        continue;
      }

      run.scanned += 1;
      this.bumpProgress(state, run, "card-classify");

      // Cross-feature dedup against material_entries.post_id (covers 002/004/006).
      if (this.library.materialEntryExists(next.noteId)) {
        run.duplicate += 1;
        visited.add(next.noteId);
        consecutiveErrors = 0;
        this.bumpProgress(state, run, "record");
        continue;
      }

      // Click the cover anchor with a real OS-level mouse event
      // (isTrusted=true). Verified against the live XHS search page via
      // chrome-devtools: a real click on the cover navigates to
      // `/explore/<id>?xsec_token=...&xsec_source=pc_search` and renders
      // BOTH `.note-detail-mask` and `#noteContainer`. Synthesized DOM
      // events (the legacy `clickNote` path) are silently dropped — XHS
      // gates on isTrusted.
      //
      // Selector: try each form one at a time. patchright/playwright
      // operates in strict mode by default and a comma-separated CSS
      // selector list can fail with "resolved to N elements" even when
      // each variant matches only 1 element.
      let clicked = false;
      let lastClickError: string | null = null;
      if (typeof this.port.click === "function") {
        const candidates = [
          `a.cover[href*="${next.noteId}"]`,
          `a[class*="cover"][href*="${next.noteId}"]`,
          `section.note-item a[href*="${next.noteId}"]:not([style*="display: none"])`,
        ];
        for (const sel of candidates) {
          try {
            log.info("xhs.keyword.click.attempt", {
              keyword: run.keywordText,
              note_id: next.noteId,
              selector: sel,
            });
            await this.port.click(sel, { timeout: 3000 });
            clicked = true;
            log.info("xhs.keyword.click.ok", {
              keyword: run.keywordText,
              note_id: next.noteId,
              selector: sel,
            });
            break;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            lastClickError = message;
            log.warn("xhs.keyword.click.miss", {
              keyword: run.keywordText,
              note_id: next.noteId,
              selector: sel,
              message,
            });
          }
        }
      } else {
        // Older runtime port without .click — fall back to synthetic
        // dispatch. Known to fail on current XHS but kept for unit tests
        // and any future skin that doesn't gate on isTrusted.
        clicked = await clickNote(evaluator, next.noteId).catch(() => false);
        if (!clicked) lastClickError = "synthetic-dispatch fallback returned false";
      }
      if (!clicked) {
        consecutiveErrors++;
        run.errors += 1;
        pushRepresentative(run, "OPEN_CLICK_FAILED");
        visited.add(next.noteId);
        log.warn("xhs.keyword.open_click_failed", {
          keyword: run.keywordText,
          note_id: next.noteId,
          last_error: lastClickError,
        });
        continue;
      }

      // Wait for either the modal or in-place detail to render. We use
      // waitForDetailContent (only requires #noteContainer to be visible)
      // because the current XHS search-result layout drops the
      // `.note-detail-mask` wrapper — there is no traditional modal mask,
      // just an in-place detail container that mounts atop the masonry.
      const opened = await waitForDetailContent(
        evaluator,
        DETAIL_OPEN_TIMEOUT_MS,
        POLL_INTERVAL_MS,
      );
      if (!opened) {
        consecutiveErrors++;
        run.errors += 1;
        pushRepresentative(run, "DETAIL_OPEN_TIMEOUT");
        visited.add(next.noteId);
        log.warn("xhs.keyword.detail_open_timeout", {
          keyword: run.keywordText,
          note_id: next.noteId,
        });
        // Recovery: if the click DID hard-navigate (preventDefault failed
        // in some XHS skin variant), re-navigate to the search URL so the
        // next iteration starts from a known-good state.
        await this.port.navigateTo(searchUrl).catch(() => undefined);
        const ev2 = this.port.evaluator();
        if (ev2 !== null) {
          await waitForMasonryReady(ev2, LAYOUT_PROBE_TIMEOUT_MS, POLL_INTERVAL_MS).catch(
            () => false,
          );
        }
        continue;
      }
      this.bumpProgress(state, run, "open-detail");

      // Dwell — anti-bot + lets detail content finish hydrating.
      await this.port.sleep(INTER_CARD_MIN_INTERVAL_MS);
      this.bumpProgress(state, run, "dwell");

      let metadata: Awaited<ReturnType<typeof extractDetailMetadata>>;
      try {
        metadata = await extractDetailMetadata(evaluator);
        // 006-2 diagnostic: surface what the count selectors actually saw.
        // The like-wrapper selector regressed when XHS reskinned the modal
        // and was reading near-zero values for every note. Logging the raw
        // visible text gives ground truth instead of guesses.
        try {
          const countDiag = await evaluator.evaluate<{
            likeMatched?: boolean;
            likeRaw?: string;
            collectMatched?: boolean;
            collectRaw?: string;
            commentMatched?: boolean;
            commentRaw?: string;
            interactBarTag?: string;
            interactBarClass?: string;
            interactBarHtml?: string;
          } | null>(() => {
            const w = window as unknown as {
              __uaXhsCountDiag?: {
                likeMatched?: boolean;
                likeRaw?: string;
                collectMatched?: boolean;
                collectRaw?: string;
                commentMatched?: boolean;
                commentRaw?: string;
                interactBarTag?: string;
                interactBarClass?: string;
                interactBarHtml?: string;
              };
            };
            return w.__uaXhsCountDiag ?? null;
          });
          if (countDiag !== null) {
            log.info("xhs.detail.count_diag", {
              keyword: run.keywordText,
              note_id: next.noteId,
              like_matched: countDiag.likeMatched ?? false,
              like_raw: countDiag.likeRaw ?? "",
              collect_matched: countDiag.collectMatched ?? false,
              collect_raw: countDiag.collectRaw ?? "",
              comment_matched: countDiag.commentMatched ?? false,
              comment_raw: countDiag.commentRaw ?? "",
              parsed_like: metadata.likeCount,
              parsed_collect: metadata.collectCount,
              parsed_comment: metadata.commentCount,
              interact_bar_tag: countDiag.interactBarTag ?? "",
              interact_bar_class: countDiag.interactBarClass ?? "",
              interact_bar_html: countDiag.interactBarHtml ?? "",
            });
          }
        } catch {
          /* diagnostic is best-effort */
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        consecutiveErrors++;
        run.errors += 1;
        pushRepresentative(run, "DETAIL_READ_FAILED");
        visited.add(next.noteId);
        log.error("xhs.dom.detail_read_failed", {
          keyword: run.keywordText,
          note_id: next.noteId,
          message,
        });
        // Try a real Esc keypress, then full re-nav as a fallback.
        await this.port.pressKey("Escape").catch(() => undefined);
        await this.port.navigateTo(searchUrl).catch(() => undefined);
        const ev2 = this.port.evaluator();
        if (ev2 !== null) {
          await waitForMasonryReady(ev2, LAYOUT_PROBE_TIMEOUT_MS, POLL_INTERVAL_MS).catch(
            () => false,
          );
        }
        continue;
      }
      this.bumpProgress(state, run, "read");

      // 006-2 — Like/follower ratio filter. Only run when the keyword has
      // it enabled (>0). Hovering the modal author avatar pops up XHS's
      // user-info card whose 粉丝 line is the filter input; on any failure
      // (hover, popup wait, parse) we treat the video as filtered, NOT as
      // an error — same contract as the douyin F-key path.
      let authorFollowerCount: number | null = null;
      let ratioFiltered = false;
      if (run.minLikeFollowerRatio > 0) {
        const followerOutcome = await this.readXhsAuthorFollower(evaluator, run, log);
        if (followerOutcome === null) {
          pushRepresentative(run, "AUTHOR_READ_FAILED");
          ratioFiltered = true;
        } else if (metadata.likeCount < 0) {
          // likeCount can be -1 when the page hasn't filled the count yet;
          // keep it filtered rather than admit an unknown-stat row.
          ratioFiltered = true;
        } else {
          const ratioTimes10 = Math.round((metadata.likeCount * 10) / followerOutcome);
          const minTimes10 = Math.round(run.minLikeFollowerRatio * 10);
          if (ratioTimes10 < minTimes10) {
            ratioFiltered = true;
            log.info("xhs.keyword.filtered_below_ratio", {
              keyword: run.keywordText,
              note_id: next.noteId,
              like_count: metadata.likeCount,
              follower_count: followerOutcome,
              ratio_times_10: ratioTimes10,
              min_times_10: minTimes10,
            });
          } else {
            authorFollowerCount = followerOutcome;
          }
        }
        if (ratioFiltered) {
          run.filtered += 1;
          consecutiveErrors = 0;
          visited.add(next.noteId);
          this.bumpProgress(state, run, "filtered");
        }
      }

      const canon =
        (metadata.shareUrl !== null ? canonicalizeXhsNoteUrl(metadata.shareUrl) : null) ??
        (next.href !== null ? canonicalizeXhsNoteUrl(next.href) : null);
      if (!ratioFiltered) {
        if (canon === null) {
          consecutiveErrors++;
          run.errors += 1;
          pushRepresentative(run, "URL_UNPARSEABLE");
          visited.add(next.noteId);
          log.warn("xhs.keyword.url_unparseable", {
            keyword: run.keywordText,
            card_href: next.href,
            detail_share_url: metadata.shareUrl,
          });
        } else {
          try {
            const captionFinal =
              metadata.caption.length > 0 ? metadata.caption.slice(0, 4096) : "";
            const shareTextSynth = `${captionFinal} ${canon.url}`.trim().slice(0, 4096);
            const captured = this.library.insertOrIgnoreMaterialEntry({
              post_id: canon.noteId,
              post_id_source: "xhs_note_url",
              share_url: canon.url,
              share_text: shareTextSynth.length > 0 ? shareTextSynth : canon.url,
              caption: captionFinal,
              author_handle:
                metadata.authorHandle.length > 0 ? metadata.authorHandle : "unknown",
              author_display_name: metadata.authorDisplayName,
              hashtags: metadata.hashtags,
              music_id: null,
              music_title: null,
              like_count: metadata.likeCount,
              comment_count: metadata.commentCount,
              share_count: metadata.shareCount,
              collect_count: metadata.collectCount,
              author_follower_count: authorFollowerCount,
              captured_at: nowIso(),
              captured_by_device: `web:keyword:xhs:${run.keywordText}`,
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
            if (captured.kind === "inserted") {
              run.captured += 1;
              consecutiveErrors = 0;
            } else {
              run.duplicate += 1;
            }
            visited.add(next.noteId);
            this.bumpProgress(state, run, "record");
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            pushRepresentative(run, "INSERT_FAILED");
            consecutiveErrors++;
            run.errors += 1;
            log.error("xhs.material.insert_failed", { keyword: run.keywordText, message });
          }
        }
      }

      // Close the detail with a REAL Escape keypress dispatched via
      // patchright (isTrusted=true). User confirmed: "打开后可以按ESC关闭"
      // — manual Esc works. Earlier the close path used dispatchOverlayClose
      // which sends a synthesized JS KeyboardEvent (isTrusted=false); XHS
      // ignores those, so the detail stayed open across captures and
      // every following click read stale metadata as a duplicate.
      //
      // After the keypress we poll for #noteContainer to actually
      // disappear (waitForDetailContentClosed), then for masonry to be
      // interactive again. Only if both fail do we fall back to a full
      // re-navigation to searchUrl — which is what the user noticed as
      // "底部页面被刷新" because we were doing it on every iteration.
      let closed = false;
      try {
        await this.port.pressKey("Escape");
        closed = await waitForDetailContentClosed(
          evaluator,
          DETAIL_CLOSE_TIMEOUT_MS,
          POLL_INTERVAL_MS,
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.warn("xhs.keyword.escape_press_failed", {
          keyword: run.keywordText,
          message,
        });
      }

      let masonryBack = false;
      if (closed) {
        masonryBack = await waitForMasonryReady(
          evaluator,
          LAYOUT_PROBE_TIMEOUT_MS,
          POLL_INTERVAL_MS,
        ).catch(() => false);
      }

      if (!masonryBack) {
        // Esc didn't actually close the detail (or closed it but masonry
        // didn't recover) — full nav fallback. This SHOULD be rare; if
        // user sees frequent page reloads, the Escape path is failing
        // silently and we need a different close mechanism.
        log.warn("xhs.keyword.fallback_renavigate", {
          keyword: run.keywordText,
          esc_closed_detail: closed,
        });
        await this.port.navigateTo(searchUrl).catch(() => undefined);
        const ev3 = this.port.evaluator();
        if (ev3 !== null) {
          await waitForMasonryReady(
            ev3,
            LAYOUT_PROBE_TIMEOUT_MS,
            POLL_INTERVAL_MS,
          ).catch(() => false);
          // Same Vue-handler-binding settle as the initial nav.
          await this.port.sleep(1500);
        }
      }
      this.bumpProgress(state, run, "close-detail");
    }
  }
}

/**
 * Pick the next ACTIONABLE card from the visible XHS list — i.e. a card
 * with a parseable noteId that we haven't visited yet. Cards without a
 * noteId (e.g. "大家都在搜" recommendation tiles, or note cards whose
 * cover anchor parser failed) are silently skipped here, NOT returned to
 * the caller.
 *
 * Earlier this function eagerly returned every null-noteId card to the
 * executor, which then "filtered" them but had no key to add to the
 * visited set — so the next listVisibleCards() returned them again, and
 * the loop spun forever on the same tile. Symptom the user reported:
 *   - Cards in the same row after a recommendation tile never opened
 *   - Scroll never triggered (scroll fires when pickNextXhsCard returns
 *     null, but it never did because the rec tile always matched first)
 *
 * Returning `null` means "no actionable card in this batch" → caller
 * scrolls for more or declares end-of-results.
 */
function pickNextXhsCard(cards: CardSummary[], visited: Set<string>): CardSummary | null {
  for (const c of cards) {
    if (c.noteId === null) continue; // recommendation tile / unparseable card — skip silently
    if (!visited.has(c.noteId)) return c;
  }
  return null;
}

let executorSingleton: BatchExecutor | null = null;

export function getBatchExecutor(port?: ExecutorPort, gate?: PreReadinessGate, library?: LibraryStore): BatchExecutor {
  if (executorSingleton !== null) return executorSingleton;
  if (port === undefined || gate === undefined) {
    throw new Error("BatchExecutor not yet initialised — pass port and gate on first call");
  }
  executorSingleton = new BatchExecutor(port, gate, library);
  return executorSingleton;
}

export function _resetBatchExecutorForTests(): void {
  executorSingleton = null;
}
