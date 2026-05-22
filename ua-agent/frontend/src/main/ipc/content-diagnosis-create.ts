import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  contentDiagnosisCreateInputSchema,
  contentDiagnosisCreateSuccessSchema,
  type ContentDiagnosisCreateResult,
} from "../../shared/contracts/content-diagnosis";
import {
  manualCaptureSnapshotSchema,
  parseManualCaptureUrl,
  type ManualCaptureSnapshot,
} from "../../shared/contracts/manual-capture";
import { getSharedStore } from "../../utility/keyword-crawl/domain/library";
import { createContentDiagnosisFromEntry } from "../services/content-diagnosis/store-fs";
import { getUtilityHost } from "../utility-host";

const CHANNEL = "content-diagnosis:create";

type WaitOutcome =
  | { kind: "snapshot"; snapshot: ManualCaptureSnapshot }
  | { kind: "timeout" };

function nowIso(): string {
  return new Date().toISOString();
}

async function waitForManualCaptureSnapshot(): Promise<WaitOutcome> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const raw = await getUtilityHost().rpc("manualCaptureStatus", {});
    if (
      raw !== null &&
      typeof raw === "object" &&
      (raw as { ok?: unknown }).ok === true
    ) {
      const task = (raw as { task?: unknown }).task;
      const parsed = manualCaptureSnapshotSchema.safeParse(task);
      if (parsed.success) {
        const snap = parsed.data;
        if (snap.status === "done" || snap.status === "stopped" || snap.status === "error") {
          return { kind: "snapshot", snapshot: snap };
        }
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return { kind: "timeout" };
}

function describeCaptureFailure(snapshot: ManualCaptureSnapshot): string {
  const detail = snapshot.last_error_message;
  if (snapshot.status === "stopped" && snapshot.stop_reason === "user") {
    return "采集已取消";
  }
  if (snapshot.status === "error") {
    switch (snapshot.stop_reason) {
      case "login-required":
        return "需要先登录抖音/小红书后再试";
      case "invalid-url":
        return "链接无效";
      case "unsupported-url":
        return "链接暂不支持";
      case "capture-failed":
        return detail !== null && detail.length > 0
          ? `采集失败：${detail}`
          : "采集失败：请检查浏览器或网络后重试";
      default:
        return detail !== null && detail.length > 0 ? `采集失败：${detail}` : "采集失败";
    }
  }
  return detail !== null && detail.length > 0
    ? `采集完成但未定位到素材：${detail}`
    : "采集完成后未能定位素材记录";
}

export function registerContentDiagnosisCreateHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, args: unknown): Promise<ContentDiagnosisCreateResult> => {
    const parsed = contentDiagnosisCreateInputSchema.safeParse(args);
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
        return startRaw as ContentDiagnosisCreateResult;
      }

      const outcome = await waitForManualCaptureSnapshot();
      if (outcome.kind === "timeout") {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "采集超时（120 秒），请重试" },
        };
      }
      const snapshot = outcome.snapshot;
      const postId = snapshot.result_post_id;
      if (postId === null) {
        const message = describeCaptureFailure(snapshot);
        log.warn(
          `${CHANNEL} no post_id status=${snapshot.status} stop_reason=${snapshot.stop_reason ?? "null"} detail=${snapshot.last_error_message ?? ""}`,
        );
        const code =
          snapshot.stop_reason === "invalid-url" || snapshot.stop_reason === "unsupported-url"
            ? ("UNSUPPORTED_URL" as const)
            : ("INTERNAL" as const);
        return {
          schema_version: "1",
          ok: false,
          error: { code, message },
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
          error: { code: "UNSUPPORTED_URL", message: "内容诊断仅支持抖音或小红书视频素材" },
        };
      }

      const item = await createContentDiagnosisFromEntry({
        shareUrl: parsed.data.share_url,
        entry,
        nowIso: nowIso(),
      });
      log.info(`${CHANNEL} ok id=${item.id} post_id=${item.post_id}`);
      return contentDiagnosisCreateSuccessSchema.parse({
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

export function unregisterContentDiagnosisCreateHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
