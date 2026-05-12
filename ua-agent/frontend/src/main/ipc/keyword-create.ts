import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  keywordCreateResultSchema,
  type KeywordCreateResult,
} from "../../shared/contracts/keyword/keyword-create";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:create";

export function registerKeywordCreateHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<KeywordCreateResult> => {
    const raw = await getUtilityHost().rpc("keywordCreate", args ?? {});
    const parsed = keywordCreateResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "keywordCreate payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterKeywordCreateHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
