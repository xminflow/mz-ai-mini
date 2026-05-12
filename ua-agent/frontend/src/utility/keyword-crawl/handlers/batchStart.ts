import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  batchStartInputSchema,
  batchStartSuccessSchema,
  type BatchStartResult,
} from "@/shared/contracts/keyword/batch-start";

import { getBatchExecutorReady } from "../runtime/executorContext";
import { getManualCaptureExecutorFromContext } from "../runtime/manualCaptureContext";
import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";

export async function batchStartHandler(args: unknown): Promise<BatchStartResult | ErrorEnvelope> {
  const log = getLogger();
  const parsed = batchStartInputSchema.safeParse(args);
  if (!parsed.success) {
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "无效输入" },
    };
  }
  try {
    if (getManualCaptureExecutorFromContext().isRunning()) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "BROWSER_BUSY", message: "已有手动链接采集任务进行中" },
      };
    }
  } catch {
    /* lazy context unavailable — ignore */
  }
  try {
    const executor = await getBatchExecutorReady();
    const out = await executor.start({ platform: parsed.data.platform });
    if ("ok" in out && out.ok === false) {
      return out;
    }
    if (!("batchId" in out)) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "executor did not return batchId" },
      };
    }
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      batch_id: out.batchId,
      started_at: out.startedAt,
    };
    log.info("batch.start.ok", { batch_id: out.batchId });
    return validateEnvelope(batchStartSuccessSchema, payload, { method: "batchStart" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("batch.start.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
