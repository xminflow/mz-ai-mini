import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  sessionStatusResultSchema,
  type DouyinReachable,
  type SessionStatusResult,
} from "@/shared/contracts/keyword/session-status";

import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";
import { getService } from "../service";

let lastReachableCache: DouyinReachable = "unknown";

/**
 * Updated by `batchExecutor` whenever a navigation completes / fails.
 * Phase 5 wires this; for now the default is "unknown".
 */
export function setDouyinReachable(value: DouyinReachable): void {
  lastReachableCache = value;
}

export async function sessionStatusHandler(_args: unknown): Promise<SessionStatusResult | ErrorEnvelope> {
  const log = getLogger();
  const service = getService();
  const driver = service.getDriver();

  const browserInstalled = driver.isInstalled();
  const sessionRunning = service.isRunning();

  // 004's sessionStatus has no scope check; reachability is heuristic from
  // the most recent navigation outcome cached by the executor (Phase 5).
  // While no batch has run yet, we report "unknown".
  const douyinReachable: DouyinReachable = sessionRunning ? lastReachableCache : "unknown";

  const payload = {
    schema_version: "1" as const,
    ok: true as const,
    prereqs: {
      browser_installed: browserInstalled,
      session_running: sessionRunning,
      douyin_reachable: douyinReachable,
      signed_in: "unknown" as const,
    },
  };

  log.info("session_status.snapshot", {
    browser_installed: browserInstalled,
    session_running: sessionRunning,
    douyin_reachable: douyinReachable,
  });

  return validateEnvelope(sessionStatusResultSchema, payload, {
    method: "sessionStatus",
  });
}
