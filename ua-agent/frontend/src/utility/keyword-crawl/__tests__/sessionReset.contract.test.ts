import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessionResetResultSchema } from "@/shared/contracts/keyword/session-reset";

import type { BrowserDriver, LiveBrowserContext } from "../domain/browser";
import * as pathsModule from "../infra/paths";
import { _resetServiceForTests, getService } from "../service";
import { sessionResetHandler } from "../handlers/sessionReset";

class FakeDriver implements BrowserDriver {
  async install() { return { installed_path: "", version: "", was_already_installed: false, took_ms: 0 }; }
  isInstalled() { return true; }
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

let tmpDir: string;
let profileDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-reset-"));
  profileDir = path.join(tmpDir, "profile");
  vi.spyOn(pathsModule, "patchrightProfileDir").mockReturnValue(profileDir);
  _resetServiceForTests(new FakeDriver());
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("sessionReset contract", () => {
  it("reports was_running=false profile_existed=false when nothing to clean", async () => {
    const out = await sessionResetHandler({});
    const parsed = sessionResetResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.was_running).toBe(false);
    expect(parsed.profile_existed).toBe(false);
  });

  it("deletes the profile dir when present and reports profile_existed=true", async () => {
    fs.mkdirSync(profileDir, { recursive: true });
    fs.writeFileSync(path.join(profileDir, "Cookies"), "fake");
    const out = await sessionResetHandler({});
    const parsed = sessionResetResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.profile_existed).toBe(true);
    expect(fs.existsSync(profileDir)).toBe(false);
  });

  it("reports was_running=true after a sessionStart and tears it down", async () => {
    fs.mkdirSync(profileDir, { recursive: true });
    await getService().startBrowser({ userDataDir: profileDir });
    const out = await sessionResetHandler({});
    const parsed = sessionResetResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.was_running).toBe(true);
  });
});
