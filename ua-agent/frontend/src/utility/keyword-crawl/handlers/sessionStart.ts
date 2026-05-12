import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  sessionStartResultSchema,
  type SessionStartResult,
} from "@/shared/contracts/keyword/session-start";

import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";
import { patchrightProfileDir } from "../infra/paths";
import { getService } from "../service";

export async function sessionStartHandler(_args: unknown): Promise<SessionStartResult | ErrorEnvelope> {
  const log = getLogger();
  const service = getService();
  const driver = service.getDriver();
  if (!driver.isInstalled()) {
    log.warn("session_start.binary_missing");
    return {
      schema_version: "1",
      ok: false,
      error: {
        code: "BROWSER_NOT_INSTALLED",
        message: "patchright Chromium binary not present — run installBrowser first",
      },
    };
  }
  try {
    const { startedAt, wasAlreadyRunning } = await service.startBrowser({
      userDataDir: patchrightProfileDir(),
    });
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      started_at: startedAt,
      was_already_running: wasAlreadyRunning,
    };
    log.info("session_start.ok", { was_already_running: wasAlreadyRunning });
    return validateEnvelope(sessionStartResultSchema, payload, {
      method: "sessionStart",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("session_start.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
