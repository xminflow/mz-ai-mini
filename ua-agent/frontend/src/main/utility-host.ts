import path from "node:path";
import { utilityProcess, type UtilityProcess } from "electron";
import log from "electron-log/main";

import type { ErrorEnvelope } from "../shared/contracts/error";

interface RpcResponseOk {
  id: string | number;
  ok: true;
  result: unknown;
}

interface RpcResponseErr {
  id: string | number;
  ok: false;
  error: ErrorEnvelope;
}

interface UtilityEvent {
  type: "event";
  topic: string;
  payload: unknown;
}

function isRpcResponse(value: unknown): value is RpcResponseOk | RpcResponseErr {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v["id"] !== "string" && typeof v["id"] !== "number") return false;
  return v["ok"] === true || v["ok"] === false;
}

function isUtilityEvent(value: unknown): value is UtilityEvent {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v["type"] === "event" && typeof v["topic"] === "string" && "payload" in v;
}

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  method: string;
}

export type TopicCallback = (payload: unknown) => void;

class UtilityHost {
  private proc: UtilityProcess | null = null;
  private nextId = 1;
  private pending = new Map<string | number, PendingCall>();
  private inFlightByMethod = new Set<string>();
  private topicSubscribers = new Map<string, Set<TopicCallback>>();
  private readonly entryRelPath: string;

  /**
   * @param entryRelPath relative path under the bundled `out/main` dir to
   *   the utility entry .cjs. Defaults to 004's douyin keyword-crawl entry
   *   for backward compatibility with existing call sites.
   */
  constructor(entryRelPath: string = "utility/index.cjs") {
    this.entryRelPath = entryRelPath;
  }

  private utilityEntryPath(): string {
    return path.join(__dirname, this.entryRelPath);
  }

  private spawn(): UtilityProcess {
    const entry = this.utilityEntryPath();
    const proc = utilityProcess.fork(entry);
    proc.on("message", (message: unknown) => {
      if (isUtilityEvent(message)) {
        const subs = this.topicSubscribers.get(message.topic);
        if (subs === undefined) return;
        for (const cb of subs) {
          try {
            cb(message.payload);
          } catch (err) {
            log.warn(
              `topic subscriber threw for ${message.topic}: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
        return;
      }
      if (!isRpcResponse(message)) return;
      const pending = this.pending.get(message.id);
      if (pending === undefined) return;
      this.pending.delete(message.id);
      if (message.ok) {
        pending.resolve(message.result);
      } else {
        pending.resolve(message.error);
      }
    });
    proc.on("exit", (code) => {
      log.warn(`utility process exited (code=${code})`);
      const err: ErrorEnvelope = {
        schema_version: "1",
        ok: false,
        error: {
          code: "BROWSER_SESSION_DEAD",
          message: "utility process terminated",
        },
      };
      for (const [, pending] of this.pending) {
        pending.resolve(err);
      }
      this.pending.clear();
      this.inFlightByMethod.clear();
      this.topicSubscribers.clear();
      this.proc = null;
    });
    return proc;
  }

  private ensureSpawned(): UtilityProcess {
    if (this.proc === null) {
      this.proc = this.spawn();
    }
    return this.proc;
  }

  private static guardedMethods: ReadonlySet<string> = new Set(["batchStart", "manualCaptureStart"]);

  /**
   * Send an RPC to the utility. Returns either the success result OR a Zod
   * `ErrorEnvelope` (never throws, never rejects on protocol-level errors).
   */
  async rpc(method: string, args: unknown): Promise<unknown> {
    if (UtilityHost.guardedMethods.has(method) && this.inFlightByMethod.has(method)) {
      const guard: ErrorEnvelope = {
        schema_version: "1",
        ok: false,
        error: { code: "BATCH_BUSY", message: "操作进行中——请等待当前操作完成" },
      };
      return guard;
    }
    const proc = this.ensureSpawned();
    const id = this.nextId++;
    return new Promise<unknown>((resolve, reject) => {
      this.pending.set(id, {
        method,
        resolve: (value) => {
          this.inFlightByMethod.delete(method);
          resolve(value);
        },
        reject: (reason) => {
          this.inFlightByMethod.delete(method);
          reject(reason instanceof Error ? reason : new Error(String(reason)));
        },
      });
      this.inFlightByMethod.add(method);
      proc.postMessage({ id, method, args });
    });
  }

  /** Subscribe to a streaming event topic. Returns an unsubscribe function. */
  subscribe(topic: string, callback: TopicCallback): () => void {
    let subs = this.topicSubscribers.get(topic);
    if (subs === undefined) {
      subs = new Set();
      this.topicSubscribers.set(topic, subs);
    }
    subs.add(callback);
    return () => {
      const current = this.topicSubscribers.get(topic);
      if (current === undefined) return;
      current.delete(callback);
      if (current.size === 0) this.topicSubscribers.delete(topic);
    };
  }

  unsubscribeAll(topic: string): void {
    this.topicSubscribers.delete(topic);
  }

  shutdown(): void {
    if (this.proc !== null) {
      this.proc.kill();
      this.proc = null;
    }
    this.topicSubscribers.clear();
  }
}

let host: UtilityHost | null = null;

export function getUtilityHost(): UtilityHost {
  if (host === null) {
    host = new UtilityHost("utility/index.cjs");
  }
  return host;
}

export function shutdownUtilityHost(): void {
  if (host !== null) {
    host.shutdown();
    host = null;
  }
}

// Export for tests.
export { UtilityHost };
