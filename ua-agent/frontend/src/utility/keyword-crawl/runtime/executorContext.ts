/**
 * Wires the runtime BatchExecutor with the live patchright service + Page.
 *
 * Lazy-initialised on first batchStart call. Tests can override the
 * executor with `setBatchExecutorOverride(...)`.
 */

import {
  BatchExecutor,
  type DomEvaluatorOnly,
  type ExecutorPort,
  type PreReadinessGate,
} from "../domain/batchExecutor";
import { getLogger } from "../infra/logger";
import { patchrightProfileDir } from "../infra/paths";
import { getService } from "../service";

let override: BatchExecutor | null = null;

async function ensureBootstrap(): Promise<void> {
  const log = getLogger();
  const service = getService();
  const driver = service.getDriver();
  if (!driver.isInstalled()) {
    log.info("auto_bootstrap.install_browser");
    await driver.install();
  }
  // If the in-memory ref says we're running, verify the underlying patchright
  // context is actually still alive (the user may have closed the window).
  if (service.isRunning()) {
    const ctx = service.getBrowserContext();
    if (ctx !== null) {
      const alive = await ctx.isAlive();
      if (!alive) {
        log.warn("auto_bootstrap.context_dead — restarting");
        await service.terminateBrowser();
      }
    }
  }
  if (!service.isRunning()) {
    log.info("auto_bootstrap.start_session");
    await service.startBrowser({ userDataDir: patchrightProfileDir() });
  }
}

function buildRuntimePort(): ExecutorPort {
  return {
    isInstalled: () => getService().getDriver().isInstalled(),
    isSessionAlive: () => getService().isRunning(),
    ensureSession: async () => {
      await ensureBootstrap();
    },
    closeSession: async () => {
      await getService().terminateBrowser();
    },
    navigateTo: async (url: string) => {
      const ctx = getService().getBrowserContext();
      if (ctx === null) throw new Error("BrowserContext is not running");
      await ctx.goto(url);
    },
    evaluator: (): DomEvaluatorOnly | null => {
      const page = getService().getCurrentPage();
      if (page === null) return null;
      return page;
    },
    pressKey: async (key: string) => {
      const page = getService().getCurrentPage();
      if (page === null) throw new Error("BrowserPage is not available");
      await page.pressKey(key);
    },
    click: async (selector: string, options?: { timeout?: number }) => {
      const page = getService().getCurrentPage();
      if (page === null) throw new Error("BrowserPage is not available");
      await page.click(selector, options);
    },
    hover: async (selector: string, options?: { timeout?: number }) => {
      const page = getService().getCurrentPage();
      if (page === null) throw new Error("BrowserPage is not available");
      await page.hover(selector, options);
    },
    mouseMove: async (x: number, y: number, options?: { steps?: number }) => {
      const page = getService().getCurrentPage();
      if (page === null) throw new Error("BrowserPage is not available");
      await page.mouseMove(x, y, options);
    },
    bringToFront: async () => {
      const page = getService().getCurrentPage();
      if (page === null) throw new Error("BrowserPage is not available");
      await page.bringToFront();
    },
    sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
  };
}

/**
 * Pre-readiness gate.
 *
 * Auto-bootstrap (install browser + start session) runs via
 * `getBatchExecutorReady()` BEFORE the executor's `start()` is invoked, so
 * the gate is a no-op at runtime. The gate object stays so test fakes can
 * still inject synthetic refusals.
 */
const runtimeGate: PreReadinessGate = {
  check: () => null,
};

let runtimeSingleton: BatchExecutor | null = null;

export function getBatchExecutorFromContext(): BatchExecutor {
  if (override !== null) return override;
  if (runtimeSingleton === null) {
    runtimeSingleton = new BatchExecutor(buildRuntimePort(), runtimeGate);
  }
  return runtimeSingleton;
}

/** Auto-installs + starts the browser session, then returns the executor. */
export async function getBatchExecutorReady(): Promise<BatchExecutor> {
  if (override !== null) return override;
  await ensureBootstrap();
  return getBatchExecutorFromContext();
}

export function setBatchExecutorOverride(exec: BatchExecutor | null): void {
  override = exec;
}

export function _resetForTests(): void {
  override = null;
  runtimeSingleton = null;
}
