import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  installBrowserResultSchema,
  type InstallBrowserResult,
} from "@/shared/contracts/keyword/session-install-browser";

import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";
import { getService } from "../service";

export async function installBrowserHandler(_args: unknown): Promise<InstallBrowserResult | ErrorEnvelope> {
  const log = getLogger();
  const driver = getService().getDriver();
  log.info("install_browser.start");
  try {
    const outcome = await driver.install();
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      installed_path: outcome.installed_path,
      version: outcome.version,
      was_already_installed: outcome.was_already_installed,
      took_ms: outcome.took_ms,
    };
    log.info("install_browser.ok", {
      version: outcome.version,
      was_already_installed: outcome.was_already_installed,
      took_ms: outcome.took_ms,
    });
    return validateEnvelope(installBrowserResultSchema, payload, {
      method: "installBrowser",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("install_browser.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "BROWSER_INSTALL_FAILED", message: message.slice(0, 1024) },
    };
  }
}
