import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  batchStatusSuccessSchema,
  type BatchStatusResult,
} from "@/shared/contracts/keyword/batch-status";

import { getBatchExecutorFromContext } from "../runtime/executorContext";
import { validateEnvelope } from "../infra/envelope";

export async function batchStatusHandler(_args: unknown): Promise<BatchStatusResult | ErrorEnvelope> {
  try {
    const snapshot = getBatchExecutorFromContext().snapshot();
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      batch: snapshot,
    };
    return validateEnvelope(batchStatusSuccessSchema, payload, { method: "batchStatus" });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
