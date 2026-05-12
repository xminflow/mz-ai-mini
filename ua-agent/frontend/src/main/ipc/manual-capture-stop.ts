import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  manualCaptureStopResultSchema,
  type ManualCaptureStopResult,
} from "../../shared/contracts/manual-capture";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "manual-capture:stop";

export function registerManualCaptureStopHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<ManualCaptureStopResult> => {
    const raw = await getUtilityHost().rpc("manualCaptureStop", {});
    const parsed = manualCaptureStopResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "manualCaptureStop payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterManualCaptureStopHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
