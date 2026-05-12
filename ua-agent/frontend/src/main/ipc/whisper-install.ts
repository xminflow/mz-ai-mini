import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION } from "../../shared/contracts/error";
import {
  ASR_INSTALL_PROGRESS_TOPIC,
  type AsrInstallProgressEvent,
  type AsrInstallResult,
  type AsrStatusResult,
} from "../../shared/contracts/transcript";
import {
  asrModelDirPath,
  downloadAsrModel,
  getAsrStatus,
  isInstalling,
} from "../services/whisper/model-store";

const STATUS_CHANNEL = "asr:status";
const INSTALL_CHANNEL = "asr:install";

function pushProgress(event: AsrInstallProgressEvent): void {
  for (const bw of BrowserWindow.getAllWindows()) {
    try {
      bw.webContents.send(ASR_INSTALL_PROGRESS_TOPIC, event);
    } catch (err) {
      log.warn(
        `webContents.send threw for ${ASR_INSTALL_PROGRESS_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

function failure(
  code: "ASR_INSTALL_BUSY" | "ASR_MODEL_DOWNLOAD_FAILED",
  message: string,
): AsrInstallResult {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false,
    error: {
      code,
      message: message.length > 1024 ? `${message.slice(0, 1021)}...` : message,
    },
  };
}

export function registerAsrHandlers(): void {
  ipcMain.handle(STATUS_CHANNEL, async (): Promise<AsrStatusResult> => {
    const status = await getAsrStatus();
    return {
      schema_version: SCHEMA_VERSION,
      installed: status.installed,
      model_dir: status.model_dir,
      size_bytes: status.size_bytes,
      downloading: status.downloading,
    };
  });

  ipcMain.handle(INSTALL_CHANNEL, async (): Promise<AsrInstallResult> => {
    if (isInstalling()) {
      return failure("ASR_INSTALL_BUSY", "another install is already running");
    }
    const start = Date.now();
    try {
      await downloadAsrModel((event) => {
        pushProgress(event);
      });
      const status = await getAsrStatus();
      log.info(
        `${INSTALL_CHANNEL} ok=true size=${status.size_bytes} (${Date.now() - start} ms)`,
      );
      return {
        schema_version: SCHEMA_VERSION,
        ok: true,
        model_dir: asrModelDirPath(),
        size_bytes: status.size_bytes ?? 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`${INSTALL_CHANNEL} failed (${Date.now() - start} ms): ${message}`);
      return failure("ASR_MODEL_DOWNLOAD_FAILED", message);
    }
  });
}

export function unregisterAsrHandlers(): void {
  ipcMain.removeHandler(STATUS_CHANNEL);
  ipcMain.removeHandler(INSTALL_CHANNEL);
}
