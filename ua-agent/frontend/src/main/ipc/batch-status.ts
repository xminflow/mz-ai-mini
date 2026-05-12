import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  batchStatusResultSchema,
  type BatchStatusResult,
} from "../../shared/contracts/keyword/batch-status";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:batch-status";

export function registerBatchStatusHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<BatchStatusResult> => {
    const raw = await getUtilityHost().rpc("batchStatus", {});
    const parsed = batchStatusResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "batchStatus payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterBatchStatusHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
