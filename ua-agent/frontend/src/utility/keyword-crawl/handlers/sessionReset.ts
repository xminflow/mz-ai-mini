import fs from "node:fs/promises";

import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  sessionResetResultSchema,
  type SessionResetResult,
} from "@/shared/contracts/keyword/session-reset";

import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";
import { patchrightProfileDir } from "../infra/paths";
import { getService } from "../service";

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function sessionResetHandler(_args: unknown): Promise<SessionResetResult | ErrorEnvelope> {
  const log = getLogger();
  const service = getService();

  let wasRunning = false;
  try {
    const out = await service.terminateBrowser();
    wasRunning = out.wasRunning;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("session_reset.terminate_failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }

  const profileDir = patchrightProfileDir();
  const profileExisted = await pathExists(profileDir);

  if (profileExisted) {
    try {
      await fs.rm(profileDir, { recursive: true, force: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error("session_reset.rm_failed", { message });
      return {
        schema_version: "1",
        ok: false,
        error: { code: "INTERNAL", message: message.slice(0, 1024) },
      };
    }
  }

  const payload = {
    schema_version: "1" as const,
    ok: true as const,
    was_running: wasRunning,
    profile_existed: profileExisted,
  };

  log.info("web.session.reset", {
    was_running: wasRunning,
    profile_existed: profileExisted,
  });

  return validateEnvelope(sessionResetResultSchema, payload, {
    method: "sessionReset",
  });
}
