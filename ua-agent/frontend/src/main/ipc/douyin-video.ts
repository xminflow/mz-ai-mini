import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  DouyinVideoResolveRequest,
  DouyinVideoResolveResult,
} from "../../shared/contracts/douyin-video";
import { SCHEMA_VERSION } from "../../shared/contracts/error";
import { resolveDouyinVideoDownloadUrl } from "../services/douyin/resolve-video-url";

const CHANNEL = "douyin-video:resolve";

function failure(message: string): DouyinVideoResolveResult {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false,
    error: {
      code: "DOUYIN_VIDEO_RESOLVE_FAILED",
      message: message.length > 1024 ? `${message.slice(0, 1021)}...` : message,
    },
  };
}

export function registerDouyinVideoHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown) => {
    const start = Date.now();
    const parsed = DouyinVideoResolveRequest.safeParse(rawArgs);
    if (!parsed.success) {
      log.warn(`${CHANNEL} invoked → exit 1 (0 ms) reason=invalid_input`);
      return failure(`invalid request: ${parsed.error.message}`);
    }

    let downloadUrl: string | null;
    try {
      downloadUrl = await resolveDouyinVideoDownloadUrl(parsed.data.share_url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.warn(
        `${CHANNEL} invoked → exit 1 (${Date.now() - start} ms) reason=exception msg=${msg}`,
      );
      return failure(`resolver threw: ${msg}`);
    }

    if (!downloadUrl) {
      log.info(`${CHANNEL} invoked → exit 1 (${Date.now() - start} ms) reason=no_url`);
      return failure("could not extract a downloadable video URL from the share page");
    }

    const success: DouyinVideoResolveResult = {
      schema_version: SCHEMA_VERSION,
      ok: true,
      download_url: downloadUrl,
      resolved_at: new Date().toISOString(),
    };
    const validated = DouyinVideoResolveResult.safeParse(success);
    if (!validated.success) {
      log.warn(
        `${CHANNEL} invoked → exit 1 (${Date.now() - start} ms) reason=contract_drift msg=${validated.error.message}`,
      );
      return failure(`internal contract validation failed: ${validated.error.message}`);
    }
    log.info(`${CHANNEL} invoked → exit 0 (${Date.now() - start} ms)`);
    return validated.data;
  });
}

export function unregisterDouyinVideoHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
