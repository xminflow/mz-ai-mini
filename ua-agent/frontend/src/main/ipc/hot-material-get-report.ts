import fs from "node:fs/promises";
import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  hotMaterialGetReportSuccessSchema,
  hotMaterialIdInputSchema,
  type HotMaterialGetReportResult,
} from "../../shared/contracts/hot-material-analysis";
import {
  getHotMaterial,
  hotMaterialAnalysisPath,
} from "../services/hot-material/store-fs";

const CHANNEL = "hot-material:get-report";

export function registerHotMaterialGetReportHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown): Promise<HotMaterialGetReportResult> => {
    const parsed = hotMaterialIdInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "无效输入" },
      };
    }

    try {
      const item = await getHotMaterial(parsed.data.id);
      if (item === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "未找到该爆款素材" },
        };
      }

      const reportPath = hotMaterialAnalysisPath(item.id);
      try {
        const [markdown, stat] = await Promise.all([
          fs.readFile(reportPath, "utf8"),
          fs.stat(reportPath),
        ]);
        return hotMaterialGetReportSuccessSchema.parse({
          schema_version: "1",
          ok: true,
          item,
          markdown,
          path: reportPath,
          generated_at: item.analysis_generated_at ?? stat.mtime.toISOString(),
        });
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          return {
            schema_version: "1",
            ok: false,
            error: {
              code: "HOT_MATERIAL_REPORT_NOT_FOUND",
              message: "该素材尚未生成爆款分析报告",
            },
          };
        }
        throw err;
      }
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

export function unregisterHotMaterialGetReportHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
