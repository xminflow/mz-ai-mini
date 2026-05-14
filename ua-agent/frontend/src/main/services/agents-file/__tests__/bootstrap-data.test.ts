import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let tmpDir: string;
let isPackaged = true;

vi.mock("electron", () => ({
  app: {
    get isPackaged() {
      return isPackaged;
    },
    getPath: (key: string) => {
      if (key !== "userData") throw new Error(`unexpected getPath(${key})`);
      return path.join(tmpDir, "userData");
    },
  },
}));

vi.mock("electron-log/main", () => ({
  default: { warn: () => {}, info: () => {}, error: () => {} },
}));

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agents-bootstrap-"));
  isPackaged = true;
  vi.resetModules();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

describe("agents bootstrap data", () => {
  it("copies bundled AGENTS.md into userData when missing", async () => {
    writeFile(path.join(tmpDir, "resources", "AGENTS.md"), "# hello\n");
    Object.defineProperty(process, "resourcesPath", {
      configurable: true,
      value: path.join(tmpDir, "resources"),
    });

    const { ensureBundledAgentsFile } = await import("../bootstrap-data");
    await ensureBundledAgentsFile();

    expect(
      fs.readFileSync(path.join(tmpDir, "userData", "AGENTS.md"), "utf8"),
    ).toContain("## 人设与战略上下文");
  });

  it("does not overwrite an existing AGENTS.md", async () => {
    writeFile(path.join(tmpDir, "resources", "AGENTS.md"), "# bundled\n");
    writeFile(path.join(tmpDir, "userData", "AGENTS.md"), "# local\n");
    Object.defineProperty(process, "resourcesPath", {
      configurable: true,
      value: path.join(tmpDir, "resources"),
    });

    const { ensureBundledAgentsFile } = await import("../bootstrap-data");
    await ensureBundledAgentsFile();

    expect(
      fs.readFileSync(path.join(tmpDir, "userData", "AGENTS.md"), "utf8"),
    ).toContain("# local");
  });

  it("creates a default AGENTS.md in dev when bundled file is absent", async () => {
    isPackaged = false;

    const { ensureBundledAgentsFile } = await import("../bootstrap-data");
    await ensureBundledAgentsFile();

    const markdown = fs.readFileSync(path.join(tmpDir, "userData", "AGENTS.md"), "utf8");
    expect(markdown).toContain("# AI运营获客 Workspace AGENTS");
    expect(markdown).toContain("persona-context.md");
  });
});
