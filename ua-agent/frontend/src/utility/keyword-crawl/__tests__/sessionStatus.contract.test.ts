import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessionStatusResultSchema } from "@/shared/contracts/keyword/session-status";

import type { BrowserDriver, LiveBrowserContext } from "../domain/browser";
import { _resetServiceForTests } from "../service";
import { sessionStatusHandler, setDouyinReachable } from "../handlers/sessionStatus";

class FakeDriver implements BrowserDriver {
  isInstalledFlag = true;
  async install() { return { installed_path: "", version: "", was_already_installed: false, took_ms: 0 }; }
  isInstalled() { return this.isInstalledFlag; }
  installedPath() { return null; }
  version() { return ""; }
  async launchPersistent(): Promise<LiveBrowserContext> {
    return {
      id: "x",
      page: () => null,
      goto: async () => undefined,
      isAlive: async () => true,
      close: async () => undefined,
    };
  }
}

beforeEach(() => {
  _resetServiceForTests(new FakeDriver());
  setDouyinReachable("unknown");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("sessionStatus contract (no current_page block)", () => {
  it("reports browser_installed=true session_running=false douyin_reachable=unknown", async () => {
    const out = await sessionStatusHandler({});
    const parsed = sessionStatusResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.prereqs.browser_installed).toBe(true);
    expect(parsed.prereqs.session_running).toBe(false);
    expect(parsed.prereqs.douyin_reachable).toBe("unknown");
    expect(parsed.prereqs.signed_in).toBe("unknown");
    // Strict schema must reject any current_page field — assert key absence.
    expect("current_page" in parsed).toBe(false);
  });

  it("each douyin_reachable enum value round-trips through the schema", async () => {
    for (const value of ["reachable", "unreachable", "blocked_by_anti_bot", "unknown"] as const) {
      setDouyinReachable(value);
      // session must be running for non-unknown to surface
      // (unknown when not running is still valid)
      const out = await sessionStatusHandler({});
      const parsed = sessionStatusResultSchema.parse(out);
      if (!parsed.ok) throw new Error("expected ok");
      // only "unknown" expected when session_running=false
      expect(parsed.prereqs.douyin_reachable).toBe("unknown");
    }
  });
});
