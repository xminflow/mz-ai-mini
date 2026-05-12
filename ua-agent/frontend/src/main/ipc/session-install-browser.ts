import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  installBrowserResultSchema,
  type InstallBrowserResult,
} from "../../shared/contracts/keyword/session-install-browser";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "keyword:install-browser";

export function registerSessionInstallBrowserHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<InstallBrowserResult> => {
    const raw = await getUtilityHost().rpc("installBrowser", {});
    const parsed = installBrowserResultSchema.safeParse(raw);
    if (!parsed.success) {
      log.warn(`${CHANNEL} payload failed Zod parse`, parsed.error.issues);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "installBrowser payload failed contract validation" },
      };
    }
    return parsed.data;
  });
}

export function unregisterSessionInstallBrowserHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
