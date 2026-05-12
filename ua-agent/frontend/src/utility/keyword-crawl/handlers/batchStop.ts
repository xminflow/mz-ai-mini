import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  batchStopSuccessSchema,
  type BatchStopResult,
} from "@/shared/contracts/keyword/batch-stop";

import { getBatchExecutorFromContext } from "../runtime/executorContext";
import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";

export async function batchStopHandler(_args: unknown): Promise<BatchStopResult | ErrorEnvelope> {
  const log = getLogger();
  try {
    const out = await getBatchExecutorFromContext().stop();
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      batch_id: out.batchId,
      was_running: out.wasRunning,
    };
    log.info("batch.stop.ok", { batch_id: out.batchId, was_running: out.wasRunning });
    return validateEnvelope(batchStopSuccessSchema, payload, { method: "batchStop" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("batch.stop.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
