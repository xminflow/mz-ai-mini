import { getLogger } from "../infra/logger";
import { patchrightProfileDir } from "../infra/paths";
import { getService } from "../service";
import {
  ManualCaptureExecutor,
  type DomEvaluatorOnly,
  type ManualCapturePort,
} from "../domain/manualCaptureExecutor";

let runtimeSingleton: ManualCaptureExecutor | null = null;

async function ensureBootstrap(): Promise<void> {
  const log = getLogger();
  const service = getService();
  const driver = service.getDriver();
  if (!driver.isInstalled()) {
    log.info("manual_capture.auto_bootstrap.install_browser");
    await driver.install();
  }
  if (service.isRunning()) {
    const ctx = service.getBrowserContext();
    if (ctx !== null) {
      const alive = await ctx.isAlive();
      if (!alive) {
        log.warn("manual_capture.auto_bootstrap.context_dead — restarting");
        await service.terminateBrowser();
      }
    }
  }
  if (!service.isRunning()) {
    log.info("manual_capture.auto_bootstrap.start_session");
    await service.startBrowser({ userDataDir: patchrightProfileDir() });
  }
}

function buildRuntimePort(): ManualCapturePort {
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
    sleep: (ms: number) => new Promise((r) => setTimeout(r, ms)),
  };
}

export function getManualCaptureExecutorFromContext(): ManualCaptureExecutor {
  if (runtimeSingleton === null) {
    runtimeSingleton = new ManualCaptureExecutor(buildRuntimePort());
  }
  return runtimeSingleton;
}

export async function getManualCaptureExecutorReady(): Promise<ManualCaptureExecutor> {
  await ensureBootstrap();
  return getManualCaptureExecutorFromContext();
}

export function _resetManualCaptureContextForTests(): void {
  runtimeSingleton = null;
}
