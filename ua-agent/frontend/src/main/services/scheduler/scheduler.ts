import log from "electron-log/main";

import { BATCH_EVENT_TOPIC } from "../../../shared/contracts/keyword/batch-event";
import {
  type FireOutcome,
  type LastFireRecord,
  type SchedulerEvent,
  type SchedulerStatus,
  type SchedulingSettings,
  SCHEDULER_EVENT_TOPIC,
} from "../../../shared/contracts/scheduling";
import { getUtilityHost } from "../../utility-host";

type Platform = "douyin" | "xiaohongshu";
const PLATFORMS: readonly Platform[] = ["douyin", "xiaohongshu"];

const TICK_MS = 30_000;

export type SchedulerEventListener = (event: SchedulerEvent) => void;

interface PerPlatformState {
  lastFiredYmd: string | null;
  lastFire: LastFireRecord | null;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymdOf(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function hhmmOf(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function classifyOutcome(rpcResult: unknown): { outcome: FireOutcome; detail: string | null } {
  if (rpcResult && typeof rpcResult === "object") {
    const r = rpcResult as Record<string, unknown>;
    if (r["ok"] === true) return { outcome: "ok", detail: null };
    const err = r["error"];
    if (err && typeof err === "object") {
      const code = (err as Record<string, unknown>)["code"];
      const message = (err as Record<string, unknown>)["message"];
      const detail = typeof message === "string" ? message : null;
      if (code === "BATCH_BUSY") return { outcome: "skip:busy", detail };
      if (code === "BROWSER_NOT_INSTALLED" || code === "BROWSER_SESSION_DEAD") {
        return { outcome: "skip:session_not_ready", detail };
      }
      // Empty / readiness-style codes that the executor surfaces when there
      // are no enabled keywords to run.
      if (code === "INVALID_INPUT" || code === "KEYWORD_INVALID") {
        return { outcome: "skip:empty", detail };
      }
      return { outcome: "error", detail };
    }
  }
  return { outcome: "error", detail: "unrecognized rpc response" };
}

/**
 * Compute the next ISO timestamp (with ms) at which the given HH:MM will hit
 * in local time, given the current `now`. If the time is already past today,
 * returns tomorrow at HH:MM.
 */
function computeNextRun(now: Date, hhmm: string, alreadyFiredToday: boolean): string {
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  const candidate = new Date(now);
  candidate.setHours(h, m, 0, 0);
  if (alreadyFiredToday || candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.toISOString();
}

export class SchedulerService {
  private schedules: SchedulingSettings;
  private state: Record<Platform, PerPlatformState> = {
    douyin: { lastFiredYmd: null, lastFire: null },
    xiaohongshu: { lastFiredYmd: null, lastFire: null },
  };
  private pendingQueue: Platform[] = [];
  private currentYmd: string | null = null;
  private timer: NodeJS.Timeout | null = null;
  private unsubBatchEvents: (() => void) | null = null;
  private isBatchRunningFlag = false;
  private listeners = new Set<SchedulerEventListener>();

  constructor(initial: SchedulingSettings) {
    this.schedules = cloneScheduling(initial);
  }

  start(): void {
    if (this.timer !== null) return;
    log.info(
      `[scheduler] start (douyin=${describe(this.schedules.douyin)}, xiaohongshu=${describe(this.schedules.xiaohongshu)})`,
    );
    this.unsubBatchEvents = getUtilityHost().subscribe(BATCH_EVENT_TOPIC, (payload: unknown) => {
      this.onBatchEvent(payload);
    });
    this.timer = setInterval(() => {
      void this.tick();
    }, TICK_MS);
    void this.tick();
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.unsubBatchEvents !== null) {
      this.unsubBatchEvents();
      this.unsubBatchEvents = null;
    }
    this.listeners.clear();
    log.info("[scheduler] stop");
  }

  /**
   * Hot-reload schedules. If a platform's `time` changed, we clear that
   * platform's same-day fire guard so the new time can fire today.
   */
  reload(next: SchedulingSettings): void {
    const prev = this.schedules;
    for (const p of PLATFORMS) {
      if (prev[p].time !== next[p].time) {
        this.state[p].lastFiredYmd = null;
      }
    }
    this.schedules = cloneScheduling(next);
    log.info(
      `[scheduler] reload (douyin=${describe(this.schedules.douyin)}, xiaohongshu=${describe(this.schedules.xiaohongshu)})`,
    );
  }

  getStatus(): SchedulerStatus {
    const now = new Date();
    const todayYmd = ymdOf(now);
    return {
      schedules: cloneScheduling(this.schedules),
      nextRuns: {
        douyin: this.schedules.douyin.enabled
          ? computeNextRun(now, this.schedules.douyin.time, this.state.douyin.lastFiredYmd === todayYmd)
          : null,
        xiaohongshu: this.schedules.xiaohongshu.enabled
          ? computeNextRun(now, this.schedules.xiaohongshu.time, this.state.xiaohongshu.lastFiredYmd === todayYmd)
          : null,
      },
      lastFires: {
        douyin: this.state.douyin.lastFire,
        xiaohongshu: this.state.xiaohongshu.lastFire,
      },
      queue: [...this.pendingQueue],
      isBatchRunning: this.isBatchRunningFlag,
    };
  }

  onEvent(listener: SchedulerEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // For tests.
  setBatchRunningForTests(running: boolean): void {
    this.isBatchRunningFlag = running;
  }

  private async tick(): Promise<void> {
    const now = new Date();
    const ymd = ymdOf(now);
    const hhmm = hhmmOf(now);

    if (this.currentYmd !== ymd) {
      // Day rollover — drop any queued runs from yesterday.
      if (this.pendingQueue.length > 0) {
        log.info(`[scheduler] day rollover, dropping queue: ${this.pendingQueue.join(",")}`);
      }
      this.pendingQueue = [];
      this.currentYmd = ymd;
    }

    for (const platform of PLATFORMS) {
      const sched = this.schedules[platform];
      if (!sched.enabled) continue;
      if (sched.time !== hhmm) continue;
      if (this.state[platform].lastFiredYmd === ymd) continue;
      if (this.pendingQueue.includes(platform)) continue;

      // Claim today's slot before any await — guards the same-minute drift case.
      this.state[platform].lastFiredYmd = ymd;

      if (this.isBatchRunningFlag || this.pendingQueue.length > 0) {
        this.pendingQueue.push(platform);
        log.info(`[scheduler] queued ${platform} (busy or queue non-empty)`);
        this.broadcast({
          schema_version: "1",
          kind: "queued",
          platform,
          outcome: null,
          detail: null,
          at: new Date().toISOString(),
        });
      } else {
        await this.fire(platform);
      }
    }
  }

  private async fire(platform: Platform): Promise<void> {
    log.info(`[scheduler] firing ${platform}`);
    let rpcResult: unknown;
    try {
      rpcResult = await getUtilityHost().rpc("batchStart", { platform });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn(`[scheduler] firing ${platform} threw: ${message}`);
      rpcResult = { ok: false, error: { code: "INTERNAL", message } };
    }
    const { outcome, detail } = classifyOutcome(rpcResult);
    const at = new Date().toISOString();
    this.state[platform].lastFire = { outcome, at, detail };
    if (outcome === "ok") {
      // Pre-empt the batch-started event so a same-tick second-platform iteration
      // (or an immediate drain) sees the new batch as running and queues instead
      // of firing a parallel start.
      this.isBatchRunningFlag = true;
    }
    log.info(`[scheduler] ${platform} → ${outcome}${detail !== null ? ` (${detail})` : ""}`);
    this.broadcast({
      schema_version: "1",
      kind: "fired",
      platform,
      outcome,
      detail,
      at,
    });
  }

  private onBatchEvent(payload: unknown): void {
    if (payload === null || typeof payload !== "object") return;
    const phase = (payload as Record<string, unknown>)["phase"];
    if (phase === "batch-started") {
      this.isBatchRunningFlag = true;
      return;
    }
    if (phase === "batch-ended") {
      this.isBatchRunningFlag = false;
      void this.drain();
    }
  }

  private async drain(): Promise<void> {
    const next = this.pendingQueue.shift();
    if (next === undefined) return;
    await this.fire(next);
    this.broadcast({
      schema_version: "1",
      kind: "drained",
      platform: next,
      outcome: this.state[next].lastFire?.outcome ?? null,
      detail: this.state[next].lastFire?.detail ?? null,
      at: new Date().toISOString(),
    });
  }

  private broadcast(event: SchedulerEvent): void {
    for (const cb of this.listeners) {
      try {
        cb(event);
      } catch (err) {
        log.warn(
          `[scheduler] listener threw: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }
}

function cloneScheduling(s: SchedulingSettings): SchedulingSettings {
  return {
    douyin: { enabled: s.douyin.enabled, time: s.douyin.time },
    xiaohongshu: { enabled: s.xiaohongshu.enabled, time: s.xiaohongshu.time },
  };
}

function describe(s: { enabled: boolean; time: string }): string {
  return s.enabled ? `on@${s.time}` : "off";
}

let singleton: SchedulerService | null = null;

export function getScheduler(): SchedulerService {
  if (singleton === null) {
    throw new Error("SchedulerService not initialised — call initScheduler() first");
  }
  return singleton;
}

export function initScheduler(initial: SchedulingSettings): SchedulerService {
  if (singleton !== null) return singleton;
  singleton = new SchedulerService(initial);
  return singleton;
}

export function shutdownScheduler(): void {
  if (singleton !== null) {
    singleton.stop();
    singleton = null;
  }
}

export { SCHEDULER_EVENT_TOPIC };
export const TOPIC = SCHEDULER_EVENT_TOPIC;
