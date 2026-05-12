import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  keywordListResultSchema,
  type KeywordListResult,
} from "../../shared/contracts/keyword/keyword-list";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:list";

export function registerKeywordListHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<KeywordListResult> => {
    const raw = await getUtilityHost().rpc("keywordList", {});
    const parsed = keywordListResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "keywordList payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterKeywordListHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
