import fs from "node:fs";
import { ipcMain, shell } from "electron";
import log from "electron-log/main";

import { logsDir } from "../../utility/keyword-crawl/infra/paths";

const CHANNEL = "keyword:open-logs-dir";

export function registerShellOpenLogsHandler(): void {
  ipcMain.handle(CHANNEL, async () => {
    const dir = logsDir();
    try {
      fs.mkdirSync(dir, { recursive: true });
      await shell.openPath(dir);
      log.info(`opened logs dir: ${dir}`);
      return { schema_version: "1", ok: true } as const;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.warn(`failed to open logs dir: ${message}`);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message },
      } as const;
    }
  });
}

export function unregisterShellOpenLogsHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
