/**
 * Typed wrapper around `process.parentPort.postMessage({type:"event", topic, payload})`.
 *
 * Per Decision 8, every event payload is Zod-validated against `batchEventSchema`
 * before posting (belt-and-suspenders); if validation fails the event is logged
 * and silently dropped (the live UI will catch up via the next snapshot).
 */

import {
  bloggerEventSchema,
  BLOGGER_EVENT_TOPIC,
  type BloggerEvent,
} from "@/shared/contracts/blogger";
import {
  manualCaptureEventSchema,
  MANUAL_CAPTURE_EVENT_TOPIC,
  type ManualCaptureEvent,
} from "@/shared/contracts/manual-capture";
import {
  batchEventSchema,
  BATCH_EVENT_TOPIC,
  type BatchEvent,
} from "@/shared/contracts/keyword/batch-event";

import { getLogger } from "./logger";

interface ParentPort {
  postMessage: (message: unknown) => void;
}

function getParentPort(): ParentPort | null {
  const proc = process as unknown as { parentPort?: ParentPort };
  return proc.parentPort ?? null;
}

export function emitBatchEvent(event: BatchEvent): void {
  const parsed = batchEventSchema.safeParse(event);
  if (!parsed.success) {
    getLogger().error("events.contract_violation", {
      phase: event.phase,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      })),
    });
    return;
  }
  const port = getParentPort();
  if (port === null) {
    // Not running inside a utility process (unit tests). Drop silently.
    return;
  }
  port.postMessage({ type: "event", topic: BATCH_EVENT_TOPIC, payload: parsed.data });
}

export function emitBloggerEvent(event: BloggerEvent): void {
  const parsed = bloggerEventSchema.safeParse(event);
  if (!parsed.success) {
    getLogger().error("blogger_events.contract_violation", {
      phase: event.phase,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      })),
    });
    return;
  }
  const port = getParentPort();
  if (port === null) return;
  port.postMessage({ type: "event", topic: BLOGGER_EVENT_TOPIC, payload: parsed.data });
}

export function emitManualCaptureEvent(event: ManualCaptureEvent): void {
  const parsed = manualCaptureEventSchema.safeParse(event);
  if (!parsed.success) {
    getLogger().error("manual_capture_events.contract_violation", {
      phase: event.phase,
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
      })),
    });
    return;
  }
  const port = getParentPort();
  if (port === null) return;
  port.postMessage({ type: "event", topic: MANUAL_CAPTURE_EVENT_TOPIC, payload: parsed.data });
}
