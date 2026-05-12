import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  hotMaterialCreateInputSchema,
  hotMaterialCreateSuccessSchema,
  type HotMaterialCreateResult,
} from "../../shared/contracts/hot-material-analysis";
import { parseManualCaptureUrl } from "../../shared/contracts/manual-capture";
import { getSharedStore } from "../../utility/keyword-crawl/domain/library";
import { createHotMaterialFromEntry } from "../services/hot-material/store-fs";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "hot-material:create";

function nowIso(): string {
  return new Date().toISOString();
}

async function waitForManualCapturePostId(): Promise<string | null> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const raw = await getUtilityHost().rpc("manualCaptureStatus", {});
    if (
      raw !== null &&
      typeof raw === "object" &&
      (raw as { ok?: unknown }).ok === true
    ) {
      const task = (raw as { task?: unknown }).task;
      if (task !== null && typeof task === "object") {
        const t = task as { status?: unknown; result_post_id?: unknown };
        if (t.status === "done" || t.status === "stopped" || t.status === "error") {
          return typeof t.result_post_id === "string" ? t.result_post_id : null;
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return null;
}

export function registerHotMaterialCreateHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<HotMaterialCreateResult> => {
    const parsed = hotMaterialCreateInputSchema.safeParse(args);
    if (!parsed.success) {
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "无效输入" },
      };
    }

    const urlParsed = parseManualCaptureUrl(parsed.data.share_url);
    if (!urlParsed.ok) {
      return {
        schema_version: "1",
        ok: false,
        error: {
          code: urlParsed.code === "invalid-url" ? "INVALID_INPUT" : "UNSUPPORTED_URL",
          message: urlParsed.message,
        },
      };
    }
    try {
      const startRaw = await getUtilityHost().rpc("manualCaptureStart", {
        url: parsed.data.share_url,
      });
      if (
        startRaw === null ||
        typeof startRaw !== "object" ||
        (startRaw as { ok?: unknown }).ok !== true
      ) {
        return startRaw as HotMaterialCreateResult;
      }

      const postId = await waitForManualCapturePostId();
      if (postId === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "采集完成后未能定位素材记录" },
        };
      }

      const entry = getSharedStore().getMaterialByPostId(postId);
      if (entry === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "LIBRARY_NOT_FOUND", message: "素材库中未找到刚采集的素材" },
        };
      }
      if (
        entry.note_type !== "video" ||
        (entry.platform !== "douyin" && entry.platform !== "xiaohongshu")
      ) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "UNSUPPORTED_URL", message: "爆款分析仅支持抖音或小红书视频素材" },
        };
      }

      const item = await createHotMaterialFromEntry({
        shareUrl: parsed.data.share_url,
        entry,
        nowIso: nowIso(),
      });
      log.info(`${CHANNEL} ok id=${item.id} post_id=${item.post_id}`);
      return hotMaterialCreateSuccessSchema.parse({
        schema_version: "1",
        ok: true,
        item,
      });
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

export function unregisterHotMaterialCreateHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
