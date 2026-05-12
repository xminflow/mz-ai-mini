import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  keywordDeleteResultSchema,
  type KeywordDeleteResult,
} from "../../shared/contracts/keyword/keyword-delete";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:delete";

export function registerKeywordDeleteHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<KeywordDeleteResult> => {
    const raw = await getUtilityHost().rpc("keywordDelete", args ?? {});
    const parsed = keywordDeleteResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "keywordDelete payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterKeywordDeleteHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
