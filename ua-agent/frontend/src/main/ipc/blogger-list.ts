import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  bloggerListSuccessSchema,
  type BloggerListResult,
} from "../../shared/contracts/blogger";
import { listBloggers } from "../services/blogger/store-fs";

const CHANNEL = "blogger:list";

export function registerBloggerListHandler(): void {
  ipcMain.handle(CHANNEL, async (): Promise<BloggerListResult> => {
    try {
      const bloggers = await listBloggers();
      return bloggerListSuccessSchema.parse({
        schema_version: "1",
        ok: true,
        bloggers,
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

export function unregisterBloggerListHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
