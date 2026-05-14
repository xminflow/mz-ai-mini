import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let tmpDir: string;

vi.mock("electron", () => ({
  app: {
    getPath: (key: string) => {
      if (key !== "userData") throw new Error(`unexpected getPath(${key})`);
      return tmpDir;
    },
  },
}));

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "persona-workspace-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("persona workspace store", () => {
  it("creates default persona context files when missing", async () => {
    const { ensurePersonaWorkspaceFiles } = await import("../workspace-store");

    const state = await ensurePersonaWorkspaceFiles();

    expect(state.profile.targetAudience).toBe("");
    expect(fs.existsSync(path.join(tmpDir, "persona-context.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, "persona-context.md"))).toBe(true);
    expect(fs.readFileSync(path.join(tmpDir, "persona-context.md"), "utf8")).toContain(
      "## 人设设置",
    );
  });

  it("persists profile and strategy into workspace files", async () => {
    const { savePersonaWorkspaceState } = await import("../workspace-store");

    await savePersonaWorkspaceState({
      profile: {
        targetAudience: "咨询型从业者",
        coreProblem: "不会稳定表达专业价值",
        trustReason: "长期一线操盘",
        expectedResult: "建立清晰定位",
      },
      strategy: {
        motivation: "沉淀信任资产",
        annualGoal: "完成高质量获客",
        trackWhy: "赛道仍有结构性机会",
        platformChoice: "先做抖音",
        businessModel: "咨询与训练营",
        opportunityBoundary: "不接偏离定位的合作",
        nextHypothesis: "验证短视频切片内容",
      },
    });

    const json = JSON.parse(fs.readFileSync(path.join(tmpDir, "persona-context.json"), "utf8"));
    const markdown = fs.readFileSync(path.join(tmpDir, "persona-context.md"), "utf8");

    expect(json.profile.targetAudience).toBe("咨询型从业者");
    expect(json.strategy.platformChoice).toBe("先做抖音");
    expect(markdown).toContain("咨询型从业者");
    expect(markdown).toContain("验证短视频切片内容");
  });
});
