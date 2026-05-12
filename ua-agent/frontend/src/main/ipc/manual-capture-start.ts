import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  manualCaptureStartResultSchema,
  type ManualCaptureStartResult,
} from "../../shared/contracts/manual-capture";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "manual-capture:start";

let inFlight = false;

export function registerManualCaptureStartHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<ManualCaptureStartResult> => {
    if (inFlight) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "MANUAL_CAPTURE_BUSY", message: "已有手动采集任务启动中" },
      };
    }
    inFlight = true;
    try {
      const raw = await getUtilityHost().rpc("manualCaptureStart", args ?? {});
      const parsed = manualCaptureStartResultSchema.safeParse(raw);
      if (!parsed.success) {
        log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "manualCaptureStart payload failed contract validation" },
        };
      }
      return parsed.data;
    } finally {
      inFlight = false;
    }
  });
}

export function unregisterManualCaptureStartHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
