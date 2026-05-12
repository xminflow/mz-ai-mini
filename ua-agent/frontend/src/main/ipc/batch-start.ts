import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  batchStartResultSchema,
  type BatchStartResult,
} from "../../shared/contracts/keyword/batch-start";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:batch-start";

let inFlight = false;

export function registerBatchStartHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<BatchStartResult> => {
    if (inFlight) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "BATCH_BUSY", message: "已有批次进行中" },
      };
    }
    inFlight = true;
    try {
      const raw = await getUtilityHost().rpc("batchStart", args ?? {});
      const parsed = batchStartResultSchema.safeParse(raw);
      if (!parsed.success) {
        log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "batchStart payload failed contract validation" },
        };
      }
      return parsed.data;
    } finally {
      inFlight = false;
    }
  });
}

export function unregisterBatchStartHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
