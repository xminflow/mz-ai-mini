import { describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  BrowserWindow: class BrowserWindow {},
}));

vi.mock("electron-log/main", () => ({
  default: { warn: () => {}, info: () => {}, error: () => {} },
}));

vi.mock("../../settings/store", () => ({
  getSettingsSync: () => ({
    llm: { codex: {}, claudeCode: {} },
    network: {},
  }),
}));

describe("codex-runner", () => {
  it("builds fresh exec args with user-provided cwd and unrestricted mode", async () => {
    const { buildCodexExecArgs } = await import("../codex-runner");
    expect(buildCodexExecArgs({ cwd: "D:\\workspace" })).toEqual([
      "--cd",
      "D:\\workspace",
      "--dangerously-bypass-approvals-and-sandbox",
      "exec",
      "--json",
      "--skip-git-repo-check",
      "--color",
      "never",
      "-",
    ]);
  });

  it("builds resume exec args with the stored provider session id", async () => {
    const { buildCodexExecArgs } = await import("../codex-runner");
    expect(
      buildCodexExecArgs({
        cwd: "D:\\workspace",
        resumeSessionId: "session-123",
      }),
    ).toEqual([
      "--cd",
      "D:\\workspace",
      "--dangerously-bypass-approvals-and-sandbox",
      "exec",
      "--json",
      "--skip-git-repo-check",
      "--color",
      "never",
      "resume",
      "session-123",
      "-",
    ]);
  });
});
