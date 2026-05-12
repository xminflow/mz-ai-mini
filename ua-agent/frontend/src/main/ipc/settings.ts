import { ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION } from "../../shared/contracts/error";
import { getProvider } from "../services/llm/provider";
import {
  type AppSettings,
  getSettings,
  updateSettings,
} from "../services/settings/store";

const CHANNEL_GET = "settings:get";
const CHANNEL_UPDATE = "settings:update";
const CHANNEL_TEST_LLM = "settings:test-llm";

interface SettingsSuccess {
  schema_version: typeof SCHEMA_VERSION;
  ok: true;
  settings: AppSettings;
}

interface ErrorEnvelopeOut {
  schema_version: typeof SCHEMA_VERSION;
  ok: false;
  error: { code: string; message: string };
}

interface TestLlmSuccess {
  schema_version: typeof SCHEMA_VERSION;
  ok: true;
  provider: AppSettings["llm"]["provider"];
  availability: { ok: boolean; version?: string; reason?: string };
}

function internalError(err: unknown): ErrorEnvelopeOut {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false,
    error: {
      code: "INTERNAL",
      message: (err instanceof Error ? err.message : String(err)).slice(0, 1024),
    },
  };
}

export function registerSettingsHandlers(): void {
  ipcMain.handle(CHANNEL_GET, async (): Promise<SettingsSuccess | ErrorEnvelopeOut> => {
    try {
      const settings = await getSettings();
      return { schema_version: SCHEMA_VERSION, ok: true, settings };
    } catch (err) {
      log.error(
        `[settings] get failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return internalError(err);
    }
  });

  ipcMain.handle(
    CHANNEL_UPDATE,
    async (_event, patch: unknown): Promise<SettingsSuccess | ErrorEnvelopeOut> => {
      try {
        if (patch === null || typeof patch !== "object") {
          return {
            schema_version: SCHEMA_VERSION,
            ok: false,
            error: { code: "INVALID_INPUT", message: "patch must be an object" },
          };
        }
        const settings = await updateSettings(patch as Parameters<typeof updateSettings>[0]);
        log.info("[settings] updated");
        return { schema_version: SCHEMA_VERSION, ok: true, settings };
      } catch (err) {
        log.error(
          `[settings] update failed: ${err instanceof Error ? err.message : String(err)}`,
        );
        return internalError(err);
      }
    },
  );

  ipcMain.handle(CHANNEL_TEST_LLM, async (): Promise<TestLlmSuccess | ErrorEnvelopeOut> => {
    try {
      const settings = await getSettings();
      const providerId = settings.llm.provider;
      const provider = getProvider(providerId);
      if (!provider) {
        return {
          schema_version: SCHEMA_VERSION,
          ok: true,
          provider: providerId,
          availability: {
            ok: false,
            reason: "Provider runtime is not registered yet.",
          },
        };
      }
      const availability = await provider.available(true);
      return {
        schema_version: SCHEMA_VERSION,
        ok: true,
        provider: providerId,
        availability,
      };
    } catch (err) {
      log.error(
        `[settings] test-llm failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return internalError(err);
    }
  });
}

export function unregisterSettingsHandlers(): void {
  ipcMain.removeHandler(CHANNEL_GET);
  ipcMain.removeHandler(CHANNEL_UPDATE);
  ipcMain.removeHandler(CHANNEL_TEST_LLM);
}
