import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  sessionResetResultSchema,
  type SessionResetResult,
} from "../../shared/contracts/keyword/session-reset";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:session-reset";

export function registerSessionResetHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<SessionResetResult> => {
    const raw = await getUtilityHost().rpc("sessionReset", {});
    const parsed = sessionResetResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "sessionReset payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterSessionResetHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
