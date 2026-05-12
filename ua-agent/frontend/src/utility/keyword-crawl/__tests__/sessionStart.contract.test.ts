import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessionStartResultSchema } from "@/shared/contracts/keyword/session-start";

import type { BrowserDriver, LiveBrowserContext } from "../domain/browser";
import { _resetServiceForTests } from "../service";
import { sessionStartHandler } from "../handlers/sessionStart";

class FakeDriver implements BrowserDriver {
  isInstalledFlag = true;
  async install() { return { installed_path: "", version: "", was_already_installed: false, took_ms: 0 }; }
  isInstalled() { return this.isInstalledFlag; }
  installedPath() { return null; }
  version() { return ""; }
  async launchPersistent(): Promise<LiveBrowserContext> {
    return {
      id: "ctx-1",
      page: () => null,
      goto: async () => undefined,
      isAlive: async () => true,
      close: async () => undefined,
    };
  }
}

let driver: FakeDriver;

beforeEach(() => {
  driver = new FakeDriver();
  _resetServiceForTests(driver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sessionStart contract", () => {
  it("happy path returns ok with started_at + was_already_running=false", async () => {
    const out = await sessionStartHandler({});
    const parsed = sessionStartResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.was_already_running).toBe(false);
    expect(parsed.started_at).toMatch(/T/);
  });

  it("second call returns was_already_running=true", async () => {
    await sessionStartHandler({});
    const out = await sessionStartHandler({});
    const parsed = sessionStartResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.was_already_running).toBe(true);
  });

  it("returns BROWSER_NOT_INSTALLED when driver reports missing binary", async () => {
    driver.isInstalledFlag = false;
    const out = await sessionStartHandler({});
    const parsed = sessionStartResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("BROWSER_NOT_INSTALLED");
  });
});
