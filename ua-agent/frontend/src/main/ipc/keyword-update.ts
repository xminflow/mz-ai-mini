import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  keywordUpdateResultSchema,
  type KeywordUpdateResult,
} from "../../shared/contracts/keyword/keyword-update";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:update";

export function registerKeywordUpdateHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<KeywordUpdateResult> => {
    const raw = await getUtilityHost().rpc("keywordUpdate", args ?? {});
    const parsed = keywordUpdateResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "keywordUpdate payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterKeywordUpdateHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
