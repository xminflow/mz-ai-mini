import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  contentDiagnosisDeleteSuccessSchema,
  contentDiagnosisIdInputSchema,
  type ContentDiagnosisDeleteResult,
} from "../../shared/contracts/content-diagnosis";
import { deleteContentDiagnosis } from "../services/content-diagnosis/store-fs";

const CHANNEL = "content-diagnosis:delete";

export function registerContentDiagnosisDeleteHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown): Promise<ContentDiagnosisDeleteResult> => {
    const parsed = contentDiagnosisIdInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "无效输入" },
      };
    }

    try {
      const deleted = await deleteContentDiagnosis(parsed.data.id);
      return contentDiagnosisDeleteSuccessSchema.parse({
        schema_version: "1",
        ok: true,
        deleted,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`${CHANNEL} failed: ${message}`);
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: message.slice(0, 1024) },
      };
    }
  });
}

export function unregisterContentDiagnosisDeleteHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
