/**
 * BrowserDriver — abstraction over patchright so handlers can be unit-tested
 * with a mock driver instead of spinning up a real Chromium.
 *
 * The runtime implementation (`PatchrightDriver`) wraps the npm `patchright`
 * package; the interface here is intentionally narrow.
 */

export interface InstallOutcome {
  installed_path: string;
  version: string;
  was_already_installed: boolean;
  took_ms: number;
}

export interface LaunchOptions {
  userDataDir: string;
  headless?: boolean;
}

export interface LiveBrowserContext {
  /** opaque handle owned by the driver. */
  readonly id: string;
  /** the active patchright Page (or `null` if no tab is open). */
  page(): BrowserPage | null;
  /** navigate the active page to `url`; opens a new page if none exists. */
  goto(url: string): Promise<void>;
  /** cheap probe — true iff the underlying context is still usable. */
  isAlive(): Promise<boolean>;
  close(): Promise<void>;
}

export interface BrowserPage {
  url(): string;
  /** evaluate a function in the page context. */
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
  /** Send a single key press to the focused element. */
  pressKey(key: string): Promise<void>;
  /**
   * 006 — Real `isTrusted: true` mouse click via patchright. Required when
   * the target page (e.g. XHS) gates click handlers behind `event.isTrusted`,
   * so a synthesized DOM `dispatchEvent(MouseEvent)` from `evaluate(...)`
   * fails to open the in-page modal. patchright auto-scrolls the element
   * into view and dispatches a real OS-level click sequence.
   */
  click(selector: string, options?: { timeout?: number }): Promise<void>;
  /**
   * 006-2 — Real `isTrusted: true` mouse hover via patchright. Required for
   * the XHS like/follower ratio filter: the user-info popup that surfaces
   * the follower count is bound to a Vue listener gated behind
   * `event.isTrusted`, so synthetic mouseenter/pointerenter from
   * `evaluate(...)` doesn't trigger it. patchright auto-scrolls the element
   * into view and dispatches a real OS-level pointer-move sequence.
   */
  hover(selector: string, options?: { timeout?: number }): Promise<void>;
  /**
   * 006-2 — Drive raw mouse.move via patchright's CDP-backed mouse handle.
   * Unlike `hover()` (single 1-step jump to element center), this exposes
   * the `steps` option so the page sees a continuous mousemove sequence.
   * Required for sites whose hover listeners are debounced/throttled and
   * silently drop a single `mouseenter` jump — observed on XHS's user-info
   * popup, which only mounts after multi-frame mousemove activity.
   */
  mouseMove(x: number, y: number, options?: { steps?: number }): Promise<void>;
  /**
   * 006-2 — Bring the page's underlying tab to the foreground. Required
   * for XHS's user-info hover popup, which checks `document.hasFocus()`
   * inside its hover listener and silently drops the popup mount when the
   * tab is in the background (i.e. when the user is focused on terminal /
   * IDE while the bot drives the browser).
   */
  bringToFront(): Promise<void>;
}

export interface BrowserDriver {
  /** installs the patched Chromium binary if not already present. */
  install(): Promise<InstallOutcome>;
  /** returns true iff the Chromium binary exists on disk. */
  isInstalled(): boolean;
  /** absolute path to the binary, if installed. */
  installedPath(): string | null;
  /** patchright-reported version string. */
  version(): string;
  /** launches a persistent-context browser. */
  launchPersistent(options: LaunchOptions): Promise<LiveBrowserContext>;
}

/**
 * The runtime PatchrightDriver. Lazy-imported so unit tests that mock
 * BrowserDriver never have to load patchright (which pulls in ~150 MB of
 * native deps).
 */
export class PatchrightDriver implements BrowserDriver {
  private cachedPath: string | null = null;
  private cachedVersion = "unknown";

  async install(): Promise<InstallOutcome> {
    const start = Date.now();
    const already = this.isInstalled();
    if (already) {
      return {
        installed_path: this.installedPath() ?? "",
        version: this.version(),
        was_already_installed: true,
        took_ms: Date.now() - start,
      };
    }
    const { chromium } = await this.loadPatchright();
    const ctx = await chromium.launch({ headless: true });
    await ctx.close();
    const took = Date.now() - start;
    return {
      installed_path: this.installedPath() ?? "",
      version: this.version(),
      was_already_installed: false,
      took_ms: took,
    };
  }

  isInstalled(): boolean {
    const p = this.installedPath();
    if (p === null) return false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("node:fs") as typeof import("node:fs");
      return fs.existsSync(p);
    } catch {
      return false;
    }
  }

  installedPath(): string | null {
    if (this.cachedPath !== null) return this.cachedPath;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const patchright = require("patchright") as {
        chromium?: { executablePath?: () => string };
      };
      const p = patchright.chromium?.executablePath?.();
      if (typeof p === "string" && p.length > 0) {
        this.cachedPath = p;
        return p;
      }
    } catch {
      /* not installed */
    }
    return null;
  }

  version(): string {
    if (this.cachedVersion !== "unknown") return this.cachedVersion;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pkg = require("patchright/package.json") as { version?: string };
      if (typeof pkg.version === "string") {
        this.cachedVersion = pkg.version;
      }
    } catch {
      /* unknown */
    }
    return this.cachedVersion;
  }

  async launchPersistent(options: LaunchOptions): Promise<LiveBrowserContext> {
    type PatchrightLikePage = {
      url: () => string;
      evaluate: (fn: unknown) => Promise<unknown>;
      goto: (url: string, opts?: { timeout?: number; waitUntil?: string }) => Promise<unknown>;
      keyboard?: { press: (key: string) => Promise<void> };
      click?: (selector: string, opts?: { timeout?: number }) => Promise<void>;
      hover?: (selector: string, opts?: { timeout?: number }) => Promise<void>;
      mouse?: {
        move: (x: number, y: number, opts?: { steps?: number }) => Promise<void>;
      };
      bringToFront?: () => Promise<void>;
    };
    const { chromium } = await this.loadPatchright();
    const browserContext = await chromium.launchPersistentContext(options.userDataDir, {
      headless: options.headless ?? false,
      channel: "chromium",
    });
    const id = `pc-${Date.now()}`;
    return {
      id,
      page() {
        const pages = browserContext.pages();
        const candidate = pages.length > 0 ? pages[pages.length - 1] : null;
        if (candidate === null || candidate === undefined) return null;
        return {
          url: () => candidate.url(),
          evaluate: <T>(fn: () => T | Promise<T>) => candidate.evaluate(fn) as Promise<T>,
          pressKey: async (key: string) => {
            const k = candidate.keyboard;
            if (k === undefined) {
              throw new Error("BrowserPage has no keyboard handle");
            }
            await k.press(key);
          },
          click: async (selector: string, options?: { timeout?: number }) => {
            const c = candidate as PatchrightLikePage;
            if (typeof c.click !== "function") {
              throw new Error("BrowserPage has no click handle");
            }
            await c.click(selector, { timeout: options?.timeout ?? 5000 });
          },
          hover: async (selector: string, options?: { timeout?: number }) => {
            const c = candidate as PatchrightLikePage;
            if (typeof c.hover !== "function") {
              throw new Error("BrowserPage has no hover handle");
            }
            await c.hover(selector, { timeout: options?.timeout ?? 3000 });
          },
          mouseMove: async (x: number, y: number, options?: { steps?: number }) => {
            const c = candidate as PatchrightLikePage;
            if (c.mouse === undefined || typeof c.mouse.move !== "function") {
              throw new Error("BrowserPage has no mouse.move handle");
            }
            await c.mouse.move(x, y, { steps: options?.steps ?? 10 });
          },
          bringToFront: async () => {
            const c = candidate as PatchrightLikePage;
            if (typeof c.bringToFront !== "function") {
              // Older patchright versions may not expose this — degrade
              // silently rather than fail the read.
              return;
            }
            await c.bringToFront();
          },
        };
      },
      goto: async (url: string): Promise<void> => {
        let existing: PatchrightLikePage | null | undefined;
        try {
          const pages = browserContext.pages();
          existing = pages.length > 0 ? pages[pages.length - 1] : null;
        } catch (e) {
          // pages() throws when the underlying patchright context is closed.
          throw new Error(
            `BrowserContext is closed: ${e instanceof Error ? e.message : String(e)}`,
          );
        }
        if (existing !== null && existing !== undefined) {
          await existing.goto(url, { timeout: 30_000, waitUntil: "domcontentloaded" });
          return;
        }
        const fresh = await browserContext.newPage();
        await fresh.goto(url, { timeout: 30_000, waitUntil: "domcontentloaded" });
      },
      isAlive: async () => {
        try {
          const pages = browserContext.pages();
          // No tabs ⇒ user closed the last window. Patchright's context can
          // still answer .pages() but newPage()/goto() will throw. Treat this
          // as dead so ensureBootstrap restarts the session cleanly.
          if (pages.length === 0) return false;
          pages[0]!.url();
          return true;
        } catch {
          return false;
        }
      },
      close: async () => {
        await browserContext.close();
      },
    };
  }

  private async loadPatchright(): Promise<{
    chromium: {
      launch: (opts: { headless: boolean }) => Promise<{ close: () => Promise<void> }>;
      launchPersistentContext: (
        userDataDir: string,
        opts: { headless: boolean; channel: string },
      ) => Promise<{
        pages: () => Array<{
          url: () => string;
          evaluate: (fn: unknown) => Promise<unknown>;
          goto: (url: string, opts?: { timeout?: number; waitUntil?: string }) => Promise<unknown>;
          keyboard?: { press: (key: string) => Promise<void> };
          click?: (selector: string, opts?: { timeout?: number }) => Promise<void>;
        }>;
        newPage: () => Promise<{
          url: () => string;
          evaluate: (fn: unknown) => Promise<unknown>;
          goto: (url: string, opts?: { timeout?: number; waitUntil?: string }) => Promise<unknown>;
          keyboard?: { press: (key: string) => Promise<void> };
          click?: (selector: string, opts?: { timeout?: number }) => Promise<void>;
        }>;
        close: () => Promise<void>;
      }>;
    };
  }> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const patchright = require("patchright") as {
      chromium: {
        launch: (opts: { headless: boolean }) => Promise<{ close: () => Promise<void> }>;
        launchPersistentContext: (
          userDataDir: string,
          opts: { headless: boolean; channel: string },
        ) => Promise<{
          pages: () => Array<{
            url: () => string;
            evaluate: (fn: unknown) => Promise<unknown>;
            goto: (url: string, opts?: { timeout?: number; waitUntil?: string }) => Promise<unknown>;
          }>;
          newPage: () => Promise<{
            url: () => string;
            evaluate: (fn: unknown) => Promise<unknown>;
            goto: (url: string, opts?: { timeout?: number; waitUntil?: string }) => Promise<unknown>;
          }>;
          close: () => Promise<void>;
        }>;
      };
    };
    return { chromium: patchright.chromium };
  }
}
