import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  bloggerListSamplesInputSchema,
  bloggerListSamplesSuccessSchema,
  type BloggerListSamplesResult,
} from "../../shared/contracts/blogger";
import { listBloggerSamples } from "../services/blogger/store-fs";

const CHANNEL = "blogger:list-samples";

export function registerBloggerListSamplesHandler(): void {
  ipcMain.handle(
    CHANNEL,
    async (_event, args: unknown): Promise<BloggerListSamplesResult> => {
      const parsed = bloggerListSamplesInputSchema.safeParse(args);
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
        const samples = await listBloggerSamples(parsed.data.id);
        return bloggerListSamplesSuccessSchema.parse({
          schema_version: "1",
          ok: true,
          samples,
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
    },
  );
}

export function unregisterBloggerListSamplesHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
