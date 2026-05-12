import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  bloggerDeleteSampleInputSchema,
  bloggerDeleteSampleSuccessSchema,
  type BloggerDeleteSampleResult,
} from "../../shared/contracts/blogger";
import { deleteBloggerSample } from "../services/blogger/store-fs";

const CHANNEL = "blogger:delete-sample";

export function registerBloggerDeleteSampleHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<BloggerDeleteSampleResult> => {
    const parsed = bloggerDeleteSampleInputSchema.safeParse(args);
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
      const result = await deleteBloggerSample(
        parsed.data.blogger_id,
        parsed.data.video_url,
        new Date().toISOString(),
      );
      if (result.blogger === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "未找到该博主" },
        };
      }
      log.info(
        `${CHANNEL} blogger_id=${parsed.data.blogger_id} deleted=${result.deleted} remaining=${result.remaining_samples}`,
      );
      return bloggerDeleteSampleSuccessSchema.parse({
        schema_version: "1",
        ok: true,
        deleted: result.deleted,
        blogger: result.blogger,
        remaining_samples: result.remaining_samples,
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

export function unregisterBloggerDeleteSampleHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
