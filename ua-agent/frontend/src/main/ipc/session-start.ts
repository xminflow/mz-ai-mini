import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  sessionStartResultSchema,
  type SessionStartResult,
} from "../../shared/contracts/keyword/session-start";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:session-start";

export function registerSessionStartHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<SessionStartResult> => {
    const raw = await getUtilityHost().rpc("sessionStart", {});
    const parsed = sessionStartResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "sessionStart payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterSessionStartHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
