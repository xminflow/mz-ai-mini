import { PatchrightDriver, type BrowserDriver, type LiveBrowserContext, type BrowserPage } from "./domain/browser";

/**
 * Singleton owner of the patchright BrowserContext + active Page across the
 * utility process's lifetime (Decision 2). Lazily initialised on first
 * `startBrowser()`; explicitly torn down by `terminateBrowser()`.
 *
 * Module-level memory only; nothing is serialised to disk (Decision 10).
 */
export class WebCollectionService {
  private context: LiveBrowserContext | null = null;
  private startedAt: string | null = null;
  private readonly driver: BrowserDriver;

  constructor(driver?: BrowserDriver) {
    this.driver = driver ?? new PatchrightDriver();
  }

  getDriver(): BrowserDriver {
    return this.driver;
  }

  isRunning(): boolean {
    return this.context !== null;
  }

  startedAtIso(): string | null {
    return this.startedAt;
  }

  async startBrowser(opts: { userDataDir: string }): Promise<{ startedAt: string; wasAlreadyRunning: boolean }> {
    if (this.context !== null && this.startedAt !== null) {
      return { startedAt: this.startedAt, wasAlreadyRunning: true };
    }
    const ctx = await this.driver.launchPersistent({
      userDataDir: opts.userDataDir,
      headless: false,
    });
    this.context = ctx;
    this.startedAt = nowIso();
    return { startedAt: this.startedAt, wasAlreadyRunning: false };
  }

  async terminateBrowser(): Promise<{ wasRunning: boolean }> {
    const wasRunning = this.context !== null;
    if (this.context !== null) {
      try {
        await this.context.close();
      } catch {
        // graceful close failed — try harder. The OS-level kill fallback is
        // delegated to the patchright runtime; if even that fails the user
        // surfaces an INTERNAL error envelope from the reset handler.
      }
      this.context = null;
      this.startedAt = null;
    }
    return { wasRunning };
  }

  getBrowserContext(): LiveBrowserContext | null {
    return this.context;
  }

  getCurrentPage(): BrowserPage | null {
    return this.context?.page() ?? null;
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

let singleton: WebCollectionService | null = null;

export function getService(driver?: BrowserDriver): WebCollectionService {
  if (singleton === null) {
    singleton = new WebCollectionService(driver);
  }
  return singleton;
}

/** test-only — replace the singleton with a fresh instance. */
export function _resetServiceForTests(driver?: BrowserDriver): WebCollectionService {
  singleton = new WebCollectionService(driver);
  return singleton;
}
