import { ipcMain } from "electron";
import log from "electron-log/main";

import { invokePing } from "../backend/invoke";

const CHANNEL = "ping";

export function registerPingHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, message: string | null) => {
    const start = Date.now();
    const result = await invokePing(message ?? null);
    const elapsed = Date.now() - start;
    const exitFlag = result.ok ? 0 : 1;
    log.info(`ping invoked → exit ${exitFlag} (${elapsed} ms)`);
    return result;
  });
}

export function unregisterPingHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
