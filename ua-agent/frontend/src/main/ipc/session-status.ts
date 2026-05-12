import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  sessionStatusResultSchema,
  type SessionStatusResult,
} from "../../shared/contracts/keyword/session-status";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:session-status";

export function registerSessionStatusHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<SessionStatusResult> => {
    const raw = await getUtilityHost().rpc("sessionStatus", {});
    const parsed = sessionStatusResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "sessionStatus payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterSessionStatusHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
