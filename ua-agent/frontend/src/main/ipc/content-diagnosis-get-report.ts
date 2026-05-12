import fs from "node:fs/promises";
import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  contentDiagnosisGetReportSuccessSchema,
  contentDiagnosisIdInputSchema,
  type ContentDiagnosisGetReportResult,
} from "../../shared/contracts/content-diagnosis";
import {
  contentDiagnosisReportPath,
  getContentDiagnosis,
} from "../services/content-diagnosis/store-fs";

const CHANNEL = "content-diagnosis:get-report";

export function registerContentDiagnosisGetReportHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown): Promise<ContentDiagnosisGetReportResult> => {
    const parsed = contentDiagnosisIdInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "无效输入" },
      };
    }

    try {
      const item = await getContentDiagnosis(parsed.data.id);
      if (item === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "未找到该内容诊断记录" },
        };
      }

      const reportPath = contentDiagnosisReportPath(item.id);
      try {
        const [markdown, stat] = await Promise.all([
          fs.readFile(reportPath, "utf8"),
          fs.stat(reportPath),
        ]);
        return contentDiagnosisGetReportSuccessSchema.parse({
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
              code: "INTERNAL",
              message: "该素材尚未生成内容诊断报告",
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

export function unregisterContentDiagnosisGetReportHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
