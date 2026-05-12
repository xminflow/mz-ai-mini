import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  contentDiagnosisListSuccessSchema,
  type ContentDiagnosisListResult,
} from "../../shared/contracts/content-diagnosis";
import { listContentDiagnoses } from "../services/content-diagnosis/store-fs";

const CHANNEL = "content-diagnosis:list";

export function registerContentDiagnosisListHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<ContentDiagnosisListResult> => {
    try {
      const items = await listContentDiagnoses();
      return contentDiagnosisListSuccessSchema.parse({
        schema_version: "1",
        ok: true,
        items,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`${CHANNEL} failed: ${message}`);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message },
      };
    }
  });
}

export function unregisterContentDiagnosisListHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
