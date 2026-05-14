import { ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION } from "../../shared/contracts/error";
import { personaSavePayloadSchema, type PersonaSaveResult } from "../../shared/contracts/persona";
import { ensureBundledAgentsFile } from "../services/agents-file/bootstrap-data";
import {
  personaJsonPath,
  personaMarkdownPath,
  savePersonaWorkspaceState,
} from "../services/persona/workspace-store";
import { defaultLlmWorkspace } from "../services/llm/workspace";

const CHANNEL_SAVE = "persona:save";

export function registerPersonaHandlers(): void {
  ipcMain.handle(CHANNEL_SAVE, async (_event, rawArgs: unknown): Promise<PersonaSaveResult> => {
    const parsed = personaSavePayloadSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return {
        schema_version: SCHEMA_VERSION,
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: parsed.error.issues[0]?.message ?? "invalid persona payload",
        },
      };
    }

    try {
      const workspacePath = defaultLlmWorkspace();
      const saved = await savePersonaWorkspaceState(parsed.data, workspacePath);
      await ensureBundledAgentsFile();
      return {
        schema_version: SCHEMA_VERSION,
        ok: true,
        saved_at: saved.updated_at,
        workspace_path: workspacePath,
        markdown_path: personaMarkdownPath(workspacePath),
        json_path: personaJsonPath(workspacePath),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`[persona] save failed: ${message}`);
      return {
        schema_version: SCHEMA_VERSION,
        ok: false,
        error: {
          code: "INTERNAL",
          message: message.slice(0, 1024),
        },
      };
    }
  });
}

export function unregisterPersonaHandlers(): void {
  ipcMain.removeHandler(CHANNEL_SAVE);
}
