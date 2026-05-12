import { ipcMain } from "electron";
import log from "electron-log/main";
import { z } from "zod";

import {
  bloggerSampleVideosInputSchema,
  bloggerSampleVideosSuccessSchema,
  type BloggerSampleVideosResult,
  type BloggerVideoSample,
} from "../../shared/contracts/blogger";
import { errorEnvelopeSchema } from "../../shared/contracts/error";
import {
  getBlogger,
  appendBloggerSamples,
  listBloggerSamples,
  replaceBloggerSamples,
  updateBloggerStatus,
} from "../services/blogger/store-fs";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "blogger:sample-videos";

const utilSuccessSchema = z
  .object({
    schema_version: z.literal("1"),
    ok: z.literal(true),
    total_works: z.number().int().nonnegative(),
    samples: z.array(
      z
        .object({
          position: z.number().int().min(0).max(99),
          video_url: z.string().url().max(2048),
          title: z.union([z.string().max(2048), z.null()]),
          source_index: z.union([z.number().int().nonnegative(), z.null()]),
        })
        .strict(),
    ),
  })
  .strict();

const utilResultSchema = z.union([utilSuccessSchema, errorEnvelopeSchema]);

function nowIso(): string {
  return new Date().toISOString();
}

function pickSampleVideosInput(args: unknown): unknown {
  if (typeof args !== "object" || args === null) return args;
  const raw = args as Record<string, unknown>;
  const picked: Record<string, unknown> = {};
  if ("id" in raw) picked.id = raw.id;
  if ("k" in raw) picked.k = raw.k;
  if ("append" in raw) picked.append = raw.append;
  return picked;
}

/**
 * Run the utility-side sampler then persist the result to the filesystem
 * store. Equivalent to the previous SQLite-backed handler but driven by
 * `store-fs` only.
 *
 * Exported so other code paths (e.g. `blogger:analyze` when status is
 * `profile_ready`) can reuse the orchestration without re-invoking the IPC.
 */
export async function runBloggerSampleVideos(args: {
  id: string;
  k?: number;
  append?: boolean;
  markFailureAsError?: boolean;
}): Promise<BloggerSampleVideosResult> {
  const blogger = await getBlogger(args.id);
  if (blogger === null) {
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INVALID_INPUT", message: "未找到该博主" },
    };
  }
  if (blogger.status !== "profile_ready" && blogger.status !== "sampled") {
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INVALID_INPUT", message: "请先完成「采集资料」再采样作品" },
    };
  }

  const raw = await getUtilityHost().rpc("bloggerSampleVideos", {
    blogger_id: blogger.id,
    profile_url: blogger.profile_url,
    ...(args.k !== undefined ? { k: args.k } : {}),
    ...(args.append === true
      ? { exclude_video_urls: (await listBloggerSamples(blogger.id)).map((s) => s.video_url) }
      : {}),
  });
  const ut = utilResultSchema.safeParse(raw);
  if (!ut.success) {
    log.warn(`${CHANNEL} payload failed Zod parse`, ut.error.issues);
    return {
      schema_version: "1",
      ok: false,
      error: {
        code: "INTERNAL",
        message: "bloggerSampleVideos payload failed contract validation",
      },
    };
  }

  if (!ut.data.ok) {
    if (args.markFailureAsError !== false) {
      await updateBloggerStatus(blogger.id, "error", ut.data.error.message, nowIso());
    }
    return ut.data;
  }

  try {
    const sampledAt = nowIso();
    const samples: BloggerVideoSample[] = ut.data.samples.map((s) => ({
      position: s.position,
      video_url: s.video_url,
      title: s.title,
      source_index: s.source_index,
      sampled_at: sampledAt,
      transcript: null,
      transcript_lang: null,
      frames: [],
      analyzed_at: null,
      analyze_error: null,
    }));
    if (args.append === true) {
      await appendBloggerSamples(blogger.id, samples, ut.data.total_works, sampledAt);
    } else {
      await replaceBloggerSamples(blogger.id, samples, ut.data.total_works, sampledAt);
    }
    const updated = await getBlogger(blogger.id);
    if (updated === null) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: "blogger profile vanished after sample write" },
      };
    }
    const persistedSamples = await listBloggerSamples(blogger.id);
    log.info(
      `${CHANNEL} ok id=${blogger.id} sampled=${persistedSamples.length} total=${ut.data.total_works}`,
    );
    return bloggerSampleVideosSuccessSchema.parse({
      schema_version: "1",
      ok: true,
      blogger: updated,
      samples: persistedSamples,
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
}

export function registerBloggerSampleVideosHandler(): void {
  ipcMain.handle(
    CHANNEL,
    async (_event, args: unknown): Promise<BloggerSampleVideosResult> => {
      const parsed = bloggerSampleVideosInputSchema.safeParse(pickSampleVideosInput(args));
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
      const input: { id: string; k?: number; append?: boolean; markFailureAsError?: boolean } = {
        id: parsed.data.id,
      };
      if (parsed.data.k !== undefined) input.k = parsed.data.k;
      if (parsed.data.append !== undefined) input.append = parsed.data.append;
      return runBloggerSampleVideos(input);
    },
  );
}

export function unregisterBloggerSampleVideosHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
