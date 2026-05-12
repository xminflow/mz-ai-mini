import { ipcMain } from "electron";
import log from "electron-log/main";
import { z } from "zod";

import {
  bloggerCaptureProfileInputSchema,
  bloggerCaptureProfileSuccessSchema,
  type BloggerCaptureProfileResult,
} from "../../shared/contracts/blogger";
import { errorEnvelopeSchema } from "../../shared/contracts/error";
import {
  getBlogger,
  updateBloggerProfile,
  updateBloggerStatus,
} from "../services/blogger/store-fs";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "blogger:capture-profile";

const utilSuccessSchema = z
  .object({
    schema_version: z.literal("1"),
    ok: z.literal(true),
    fields: z
      .object({
        display_name: z.union([z.string(), z.null()]),
        avatar_url: z.union([z.string(), z.null()]),
        follow_count: z.union([z.number(), z.null()]),
        fans_count: z.union([z.number(), z.null()]),
        liked_count: z.union([z.number(), z.null()]),
        signature: z.union([z.string(), z.null()]),
        sec_uid: z.union([z.string(), z.null()]),
        douyin_id: z.union([z.string(), z.null()]),
      })
      .strict(),
  })
  .strict();

const utilResultSchema = z.union([utilSuccessSchema, errorEnvelopeSchema]);

function nowIso(): string {
  return new Date().toISOString();
}

export function registerBloggerCaptureProfileHandler(): void {
  ipcMain.handle(
    CHANNEL,
    async (_event, args: unknown): Promise<BloggerCaptureProfileResult> => {
      const parsed = bloggerCaptureProfileInputSchema.safeParse(args);
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
      const blogger = await getBlogger(parsed.data.id);
      if (blogger === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "未找到该博主" },
        };
      }

      const raw = await getUtilityHost().rpc("bloggerCaptureProfile", {
        blogger_id: blogger.id,
        profile_url: blogger.profile_url,
      });
      const ut = utilResultSchema.safeParse(raw);
      if (!ut.success) {
        log.warn(`${CHANNEL} payload failed Zod parse`, ut.error.issues);
        return {
          schema_version: "1",
          ok: false,
          error: {
            code: "INTERNAL",
            message: "bloggerCaptureProfile payload failed contract validation",
          },
        };
      }

      if (!ut.data.ok) {
        await updateBloggerStatus(
          blogger.id,
          "error",
          ut.data.error.message,
          nowIso(),
        );
        return ut.data;
      }

      try {
        await updateBloggerProfile(
          blogger.id,
          {
            douyin_id: ut.data.fields.douyin_id,
            display_name: ut.data.fields.display_name,
            avatar_url: ut.data.fields.avatar_url,
            follow_count: ut.data.fields.follow_count,
            fans_count: ut.data.fields.fans_count,
            liked_count: ut.data.fields.liked_count,
            signature: ut.data.fields.signature,
            sec_uid: ut.data.fields.sec_uid,
          },
          nowIso(),
        );
        const updated = await getBlogger(blogger.id);
        if (updated === null) {
          return {
            schema_version: "1",
            ok: false,
            error: { code: "INTERNAL", message: "blogger profile vanished after write" },
          };
        }
        log.info(`${CHANNEL} ok id=${blogger.id}`);
        return bloggerCaptureProfileSuccessSchema.parse({
          schema_version: "1",
          ok: true,
          blogger: updated,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        log.error(`${CHANNEL} persist failed: ${message}`);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message },
        };
      }
    },
  );
}

export function unregisterBloggerCaptureProfileHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
