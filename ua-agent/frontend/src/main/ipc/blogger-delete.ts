import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  bloggerDeleteInputSchema,
  bloggerDeleteSuccessSchema,
  type BloggerDeleteResult,
} from "../../shared/contracts/blogger";
import { deleteBlogger } from "../services/blogger/store-fs";

const CHANNEL = "blogger:delete";

export function registerBloggerDeleteHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<BloggerDeleteResult> => {
    const parsed = bloggerDeleteInputSchema.safeParse(args);
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
      const deleted = await deleteBlogger(parsed.data.id);
      log.info(`${CHANNEL} id=${parsed.data.id} deleted=${deleted}`);
      return bloggerDeleteSuccessSchema.parse({
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
        error: { code: "INTERNAL", message },
      };
    }
  });
}

export function unregisterBloggerDeleteHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
