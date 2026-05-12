import fs from "node:fs/promises";
import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  bloggerGetReportInputSchema,
  bloggerGetReportSuccessSchema,
  type BloggerGetReportResult,
} from "../../shared/contracts/blogger";
import { bloggerAnalysisPath, getBlogger } from "../services/blogger/store-fs";

const CHANNEL = "blogger:get-report";

export function registerBloggerGetReportHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown): Promise<BloggerGetReportResult> => {
    const parsed = bloggerGetReportInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return {
        schema_version: "1",
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: parsed.error.issues[0]?.message ?? "无效输入",
        },
      };
    }

    try {
      const blogger = await getBlogger(parsed.data.id);
      if (blogger === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "未找到该博主" },
        };
      }

      const reportPath = bloggerAnalysisPath(blogger.id);
      let markdown: string;
      let generatedAt: string;
      try {
        const [raw, stat] = await Promise.all([
          fs.readFile(reportPath, "utf8"),
          fs.stat(reportPath),
        ]);
        markdown = raw;
        generatedAt = blogger.analysis_generated_at ?? stat.mtime.toISOString();
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") {
          return {
            schema_version: "1",
            ok: false,
            error: {
              code: "BLOGGER_REPORT_NOT_FOUND",
              message: "该博主尚未生成拆解报告",
            },
          };
        }
        throw err;
      }

      return bloggerGetReportSuccessSchema.parse({
        schema_version: "1",
        ok: true,
        blogger,
        markdown,
        path: reportPath,
        generated_at: generatedAt,
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

export function unregisterBloggerGetReportHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
