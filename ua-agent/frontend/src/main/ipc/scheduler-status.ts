import { ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION } from "../../shared/contracts/error";
import type { SchedulerStatus } from "../../shared/contracts/scheduling";
import { getScheduler } from "../services/scheduler/scheduler";

const CHANNEL = "scheduler:status";

interface SchedulerStatusSuccess {
  schema_version: typeof SCHEMA_VERSION;
  ok: true;
  status: SchedulerStatus;
}

interface SchedulerStatusErr {
  schema_version: typeof SCHEMA_VERSION;
  ok: false;
  error: { code: string; message: string };
}

export function registerSchedulerStatusHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<SchedulerStatusSuccess | SchedulerStatusErr> => {
    try {
      const status = getScheduler().getStatus();
      return { schema_version: SCHEMA_VERSION, ok: true, status };
    } catch (err) {
      log.error(
        `[scheduler] status failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return {
        schema_version: SCHEMA_VERSION,
        ok: false,
        error: {
          code: "INTERNAL",
          message: (err instanceof Error ? err.message : String(err)).slice(0, 1024),
        },
      };
    }
  });
}

export function unregisterSchedulerStatusHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
