import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  app: {
    isPackaged: true,
    getPath: () => "",
  },
}));

vi.mock("electron-log/main", () => ({
  default: { warn: () => {}, info: () => {}, error: () => {} },
}));

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "blogger-bootstrap-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

describe("blogger bootstrap data", () => {
  it("copies bundled blogger directories and skips existing user data", async () => {
    const sourceRoot = path.join(tmpDir, "resources", "blogger-frames");
    const targetRoot = path.join(tmpDir, "userData", "blogger-frames");

    writeFile(path.join(sourceRoot, "new-blogger", "profile.json"), "{}");
    writeFile(path.join(sourceRoot, "new-blogger", "analysis.md"), "# bundled\n");
    writeFile(path.join(sourceRoot, "new-blogger", "video-1", "meta.json"), "{}");
    writeFile(path.join(sourceRoot, "existing-blogger", "profile.json"), "{}");
    writeFile(path.join(sourceRoot, "ignored-dir", "note.txt"), "no profile");
    writeFile(path.join(targetRoot, "existing-blogger", "profile.json"), '{"local":true}');

    const { copyBundledBloggerData } = await import("../bootstrap-data");
    const result = await copyBundledBloggerData({ sourceRoot, targetRoot });

    expect(result).toEqual({ copied: 1, skipped: 1 });
    expect(fs.existsSync(path.join(targetRoot, "new-blogger", "analysis.md"))).toBe(true);
    expect(fs.existsSync(path.join(targetRoot, "new-blogger", "video-1", "meta.json"))).toBe(true);
    expect(fs.existsSync(path.join(targetRoot, "ignored-dir"))).toBe(false);
    expect(fs.readFileSync(path.join(targetRoot, "existing-blogger", "profile.json"), "utf8")).toBe(
      '{"local":true}',
    );
  });

  it("returns zero counts when bundled data is absent", async () => {
    const { copyBundledBloggerData } = await import("../bootstrap-data");
    await expect(
      copyBundledBloggerData({
        sourceRoot: path.join(tmpDir, "missing"),
        targetRoot: path.join(tmpDir, "userData", "blogger-frames"),
      }),
    ).resolves.toEqual({ copied: 0, skipped: 0 });
  });
});
