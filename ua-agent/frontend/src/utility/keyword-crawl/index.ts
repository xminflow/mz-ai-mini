/**
 * Utility-process entry. Sets up the parent MessagePort listener, dispatches
 * incoming { id, method, args } messages by method name, and serialises calls
 * per-method via tiny pLimit(1) mutexes.
 */

import type { ErrorEnvelope } from "@/shared/contracts/error";

import { internalEnvelope } from "./infra/envelope";
import { getLogger } from "./infra/logger";
import { handlers, type RpcDispatcher } from "./handlers";

interface RpcRequest {
  id: string | number;
  method: string;
  args?: unknown;
}

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

type Mutex = <T>(task: () => Promise<T>) => Promise<T>;

function makeMutex(): Mutex {
  let chain: Promise<unknown> = Promise.resolve();
  return <T>(task: () => Promise<T>): Promise<T> => {
    const next = chain.then(() => task());
    chain = next.catch(() => undefined);
    return next;
  };
}

const perMethodMutex = new Map<string, Mutex>();

function getMutex(method: string): Mutex {
  let m = perMethodMutex.get(method);
  if (m === undefined) {
    m = makeMutex();
    perMethodMutex.set(method, m);
  }
  return m;
}

async function dispatch(method: string, args: unknown, dispatcher: RpcDispatcher): Promise<unknown> {
  const handler = dispatcher[method];
  if (handler === undefined) {
    return internalEnvelope(`method not implemented: ${method}`);
  }
  const mutex = getMutex(method);
  return mutex(() => handler(args));
}

function isRpcRequest(value: unknown): value is RpcRequest {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (typeof v["id"] === "string" || typeof v["id"] === "number") &&
    typeof v["method"] === "string"
  );
}

interface ParentPortMessageEvent {
  data: unknown;
}

interface ParentPort {
  on: (event: "message", listener: (event: ParentPortMessageEvent) => void) => void;
  postMessage: (message: unknown) => void;
}

function getParentPort(): ParentPort | null {
  const proc = process as unknown as { parentPort?: ParentPort };
  return proc.parentPort ?? null;
}

export function startUtilityServer(dispatcher: RpcDispatcher = handlers): void {
  const parentPort = getParentPort();
  if (parentPort === null) {
    // Running outside a utilityProcess.fork (e.g. unit tests) — no-op.
    return;
  }
  const log = getLogger();
  parentPort.on("message", (event) => {
    // Electron's UtilityProcess delivers messages to `process.parentPort` as a
    // MessageEvent (`{ data, ports }`), unlike the parent side which receives
    // the raw payload. Unwrap before dispatching.
    const raw = event !== null && typeof event === "object" && "data" in event ? event.data : event;
    if (!isRpcRequest(raw)) {
      log.warn("rpc.invalid_request", { raw_type: typeof raw });
      return;
    }
    const req = raw;
    void dispatch(req.method, req.args, dispatcher).then(
      (result) => {
        const response: RpcResponseOk = { id: req.id, ok: true, result };
        parentPort.postMessage(response);
      },
      (err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        log.error("rpc.handler_threw", { method: req.method, message });
        const response: RpcResponseErr = {
          id: req.id,
          ok: false,
          error: internalEnvelope(message),
        };
        parentPort.postMessage(response);
      },
    );
  });
  log.info("utility.boot", { pid: process.pid });
}

// Auto-start when this file is the entry of a utility process.
if (getParentPort() !== null) {
  startUtilityServer();
}
