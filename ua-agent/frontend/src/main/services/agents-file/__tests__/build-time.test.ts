import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agents-build-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../../scripts/generate-build-agents.cjs",
);

describe("generateBuildTimeAgentsFile", () => {
  it("renders bundled blogger summaries and static data sections", async () => {
    const bloggerRoot = path.join(tmpDir, "blogger-frames");
    writeFile(path.join(bloggerRoot, "alpha", "profile.json"), "{}");
    writeFile(path.join(bloggerRoot, "alpha", "analysis.md"), "# report\n");
    writeFile(path.join(bloggerRoot, "alpha", "video-1", "meta.json"), "{}");
    writeFile(path.join(bloggerRoot, "beta", "profile.json"), "{}");
    writeFile(path.join(bloggerRoot, "beta", "video-1", "meta.json"), "{}");
    writeFile(path.join(bloggerRoot, "beta", "video-2", "meta.json"), "{}");

    const { execFileSync } = await import("node:child_process");
    const targetPath = path.join(tmpDir, "AGENTS.md");
    execFileSync(
      process.execPath,
      [
        scriptPath,
        targetPath,
        bloggerRoot,
        "D:\\code\\creator-notes\\notes\\book",
      ],
      {
        stdio: "pipe",
      },
    );

    const markdown = fs.readFileSync(targetPath, "utf8");
    expect(markdown).toContain("# AI运营获客 Workspace AGENTS");
    expect(markdown).not.toContain("{{productName}}");
    expect(markdown).toContain("### library.db");
    expect(markdown).toContain("### blogger-frames/");
    expect(markdown).toContain("- alpha: profile.json=present, analysis.md=present, sample_dirs=1");
    expect(markdown).toContain("- beta: profile.json=present, analysis.md=missing, sample_dirs=2");
    expect(markdown).toContain("### content-diagnosis/");
    expect(markdown).toContain("### hot-material-analysis/");
  });

  it("still renders when no bundled blogger data exists", async () => {
    const targetPath = path.join(tmpDir, "AGENTS.md");
    const { execFileSync } = await import("node:child_process");
    execFileSync(
      process.execPath,
      [
        scriptPath,
        targetPath,
        path.join(tmpDir, "missing-blogger-frames"),
        "D:\\code\\creator-notes\\notes\\book",
      ],
      {
        stdio: "pipe",
      },
    );

    const markdown = fs.readFileSync(targetPath, "utf8");
    expect(markdown).toContain("构建时未发现可预置的博主拆解实例数据");
  });
});
