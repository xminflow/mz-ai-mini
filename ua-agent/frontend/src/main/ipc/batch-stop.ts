import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  batchStopResultSchema,
  type BatchStopResult,
} from "../../shared/contracts/keyword/batch-stop";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:batch-stop";

export function registerBatchStopHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<BatchStopResult> => {
    const raw = await getUtilityHost().rpc("batchStop", {});
    const parsed = batchStopResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "batchStop payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterBatchStopHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
