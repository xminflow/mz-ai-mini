import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  hotMaterialDeleteSuccessSchema,
  hotMaterialIdInputSchema,
  type HotMaterialDeleteResult,
} from "../../shared/contracts/hot-material-analysis";
import { deleteHotMaterial } from "../services/hot-material/store-fs";

const CHANNEL = "hot-material:delete";

export function registerHotMaterialDeleteHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown): Promise<HotMaterialDeleteResult> => {
    const parsed = hotMaterialIdInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "无效输入" },
      };
    }

    try {
      const deleted = await deleteHotMaterial(parsed.data.id);
      return hotMaterialDeleteSuccessSchema.parse({
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

export function unregisterHotMaterialDeleteHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
