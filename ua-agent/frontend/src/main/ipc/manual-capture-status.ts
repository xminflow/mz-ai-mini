import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  manualCaptureStatusResultSchema,
  type ManualCaptureStatusResult,
} from "../../shared/contracts/manual-capture";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "manual-capture:status";

export function registerManualCaptureStatusHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<ManualCaptureStatusResult> => {
    const raw = await getUtilityHost().rpc("manualCaptureStatus", {});
    const parsed = manualCaptureStatusResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "manualCaptureStatus payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterManualCaptureStatusHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
