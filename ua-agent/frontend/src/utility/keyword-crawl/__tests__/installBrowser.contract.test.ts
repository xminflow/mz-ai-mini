import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installBrowserResultSchema } from "@/shared/contracts/keyword/session-install-browser";

import type { BrowserDriver, InstallOutcome } from "../domain/browser";
import { _resetServiceForTests } from "../service";
import { installBrowserHandler } from "../handlers/installBrowser";

class FakeDriver implements BrowserDriver {
  installCalls = 0;
  isInstalledFlag = false;
  installResult: InstallOutcome = {
    installed_path: "/fake/chromium",
    version: "1.59.4",
    was_already_installed: false,
    took_ms: 42,
  };
  shouldThrow = false;

  async install(): Promise<InstallOutcome> {
    this.installCalls++;
    if (this.shouldThrow) throw new Error("install boom");
    return this.installResult;
  }
  isInstalled(): boolean { return this.isInstalledFlag; }
  installedPath(): string | null { return null; }
  version(): string { return "1.59.4"; }
  async launchPersistent(): Promise<never> { throw new Error("not used"); }
}

let driver: FakeDriver;

beforeEach(() => {
  driver = new FakeDriver();
  _resetServiceForTests(driver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("installBrowser contract", () => {
  it("happy path returns ok=true with installation outcome", async () => {
    const out = await installBrowserHandler({});
    const parsed = installBrowserResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.installed_path).toBe("/fake/chromium");
    expect(parsed.took_ms).toBe(42);
    expect(driver.installCalls).toBe(1);
  });

  it("returns BROWSER_INSTALL_FAILED on driver throw", async () => {
    driver.shouldThrow = true;
    const out = await installBrowserHandler({});
    const parsed = installBrowserResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("BROWSER_INSTALL_FAILED");
  });
});
