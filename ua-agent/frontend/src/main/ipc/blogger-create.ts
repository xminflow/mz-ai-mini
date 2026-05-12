import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  bloggerCreateInputSchema,
  bloggerCreateSuccessSchema,
  type BloggerCreateResult,
} from "../../shared/contracts/blogger";
import { canonicalizeDouyinUserUrl } from "../../utility/keyword-crawl/domain/url";
import { upsertBlogger } from "../services/blogger/store-fs";

const CHANNEL = "blogger:create";

function nowIso(): string {
  return new Date().toISOString();
}

export function registerBloggerCreateHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<BloggerCreateResult> => {
    const parsed = bloggerCreateInputSchema.safeParse(args);
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
    const canon = canonicalizeDouyinUserUrl(parsed.data.profile_url.trim());
    if (canon === null) {
      return {
        schema_version: "1",
        ok: false,
        error: {
          code: "INVALID_PROFILE_URL",
          message: "请提供形如 https://www.douyin.com/user/<sec_uid> 的抖音博主主页链接",
        },
      };
    }
    try {
      const blogger = await upsertBlogger({
        platform: "douyin",
        profile_url: canon.url,
        sec_uid: canon.secUid,
        nowIso: nowIso(),
      });
      log.info(`${CHANNEL} ok id=${blogger.id} sec_uid=${canon.secUid}`);
      return bloggerCreateSuccessSchema.parse({
        schema_version: "1",
        ok: true,
        blogger,
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

export function unregisterBloggerCreateHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
