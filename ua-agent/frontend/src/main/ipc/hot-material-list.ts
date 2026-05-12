import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  hotMaterialListSuccessSchema,
  type HotMaterialListResult,
} from "../../shared/contracts/hot-material-analysis";
import { listHotMaterials } from "../services/hot-material/store-fs";

const CHANNEL = "hot-material:list";

export function registerHotMaterialListHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<HotMaterialListResult> => {
    try {
      const items = await listHotMaterials();
      return hotMaterialListSuccessSchema.parse({
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

export function unregisterHotMaterialListHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
