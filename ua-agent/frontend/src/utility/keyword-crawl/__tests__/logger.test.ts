import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createLogger } from "../infra/logger";

let tmpDir: string;
let logFile: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kw-logger-"));
  logFile = path.join(tmpDir, "keyword-crawl.log");
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("logger", () => {
  it("writes a JSON line per call", () => {
    const log = createLogger({ filePath: logFile, rotateBytes: 1024 * 1024 });
    log.info("hello", { keyword: "前端" });
    log.close();

    const content = fs.readFileSync(logFile, "utf-8").trim().split("\n");
    expect(content).toHaveLength(1);
    const parsed = JSON.parse(content[0] ?? "{}") as Record<string, unknown>;
    expect(parsed["level"]).toBe("INFO");
    expect(parsed["event"]).toBe("hello");
    expect(parsed["keyword"]).toBe("前端");
    expect(typeof parsed["ts"]).toBe("string");
  });

  it("redacts cookie / profile_dir_contents / own_handle keys", () => {
    const log = createLogger({ filePath: logFile });
    log.info("audit", {
      cookie: "secret=1",
      cookies: "secret=2",
      profile_dir_contents: "secret",
      own_handle: "@me",
      own_user_id: "u123",
      own_nickname: "alice",
      keyword: "ok-not-redacted",
    });
    log.close();

    const line = fs.readFileSync(logFile, "utf-8").trim();
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed["cookie"]).toBe("[redacted]");
    expect(parsed["cookies"]).toBe("[redacted]");
    expect(parsed["profile_dir_contents"]).toBe("[redacted]");
    expect(parsed["own_handle"]).toBe("[redacted]");
    expect(parsed["own_user_id"]).toBe("[redacted]");
    expect(parsed["own_nickname"]).toBe("[redacted]");
    expect(parsed["keyword"]).toBe("ok-not-redacted");
  });

  it("redacts dynamic substring values via setRedactValues", () => {
    const log = createLogger({ filePath: logFile, redactValues: ["sec123"] });
    log.info("hit", { url: "https://x.com/?token=sec123abc" });
    log.close();

    const line = fs.readFileSync(logFile, "utf-8").trim();
    expect(line).not.toContain("sec123");
    expect(line).toContain("[redacted]");
  });

  it("rotates when bytes_written exceeds rotateBytes (5 MB default)", () => {
    const log = createLogger({ filePath: logFile, rotateBytes: 1024 });
    // Write enough bytes to cross the 1 KB rotation threshold.
    const bigField = "x".repeat(200);
    for (let i = 0; i < 20; i++) {
      log.info("big", { payload: bigField });
    }
    // One more write after rotation re-creates the active logfile.
    log.info("post-rotation");
    log.close();

    expect(fs.existsSync(`${logFile}.1`)).toBe(true);
    expect(fs.existsSync(logFile)).toBe(true);
    // No second backup retained.
    expect(fs.existsSync(`${logFile}.2`)).toBe(false);
  });

  it("never throws even when filesystem is read-only", () => {
    const log = createLogger({ filePath: path.join(tmpDir, "nonexistent", "deep", "log.log") });
    expect(() => log.info("ok")).not.toThrow();
    log.close();
  });
});
