import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  manualCaptureStartInputSchema,
  manualCaptureStartSuccessSchema,
  type ManualCaptureStartResult,
  manualCaptureStatusSuccessSchema,
  type ManualCaptureStatusResult,
  manualCaptureStopSuccessSchema,
  type ManualCaptureStopResult,
} from "@/shared/contracts/manual-capture";

import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";
import { getBatchExecutorFromContext } from "../runtime/executorContext";
import {
  getManualCaptureExecutorFromContext,
  getManualCaptureExecutorReady,
} from "../runtime/manualCaptureContext";

function keywordBatchRunning(): boolean {
  try {
    return getBatchExecutorFromContext().isRunning();
  } catch {
    return false;
  }
}

export async function manualCaptureStartHandler(
  args: unknown,
): Promise<ManualCaptureStartResult | ErrorEnvelope> {
  const log = getLogger();
  const parsed = manualCaptureStartInputSchema.safeParse(args);
  if (!parsed.success) {
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "无效输入" },
    };
  }
  if (keywordBatchRunning()) {
    return {
      schema_version: "1",
      ok: false,
      error: { code: "BROWSER_BUSY", message: "已有关键词采集任务进行中" },
    };
  }

  try {
    const executor = await getManualCaptureExecutorReady();
    const out = await executor.start(parsed.data);
    if (!("taskId" in out)) return out;
    return validateEnvelope(
      manualCaptureStartSuccessSchema,
      {
        schema_version: "1" as const,
        ok: true as const,
        task_id: out.taskId,
        platform: out.platform,
        canonical_url: out.canonicalUrl,
        started_at: out.startedAt,
      },
      { method: "manualCaptureStart" },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("manualCapture.start.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}

export async function manualCaptureStatusHandler(
  _args: unknown,
): Promise<ManualCaptureStatusResult | ErrorEnvelope> {
  try {
    const task = getManualCaptureExecutorFromContext().snapshot();
    return validateEnvelope(
      manualCaptureStatusSuccessSchema,
      { schema_version: "1" as const, ok: true as const, task },
      { method: "manualCaptureStatus" },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}

export async function manualCaptureStopHandler(
  _args: unknown,
): Promise<ManualCaptureStopResult | ErrorEnvelope> {
  const log = getLogger();
  try {
    const out = await getManualCaptureExecutorFromContext().stop();
    return validateEnvelope(
      manualCaptureStopSuccessSchema,
      {
        schema_version: "1" as const,
        ok: true as const,
        task_id: out.taskId,
        was_running: out.wasRunning,
      },
      { method: "manualCaptureStop" },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("manualCapture.stop.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
