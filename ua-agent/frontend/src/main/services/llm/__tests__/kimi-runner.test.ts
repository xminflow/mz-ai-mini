import { describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  BrowserWindow: class BrowserWindow {},
}));

vi.mock("electron-log/main", () => ({
  default: { warn: () => {}, info: () => {}, error: () => {} },
}));

vi.mock("../../settings/store", () => ({
  getSettingsSync: () => ({
    llm: { kimi: {}, codex: {}, claudeCode: {} },
    network: {},
  }),
}));

describe("kimi-runner", () => {
  it("builds fresh exec args with user-provided cwd", async () => {
    const { buildKimiExecArgs } = await import("../kimi-runner");
    expect(buildKimiExecArgs({ cwd: "D:\\workspace" })).toEqual([
      "--work-dir",
      "D:\\workspace",
      "--print",
      "--output-format",
      "stream-json",
      "--yolo",
    ]);
  });

  it("builds resume exec args with the stored provider session id", async () => {
    const { buildKimiExecArgs } = await import("../kimi-runner");
    expect(
      buildKimiExecArgs({
        cwd: "D:\\workspace",
        resumeSessionId: "session-123",
      }),
    ).toEqual([
      "--work-dir",
      "D:\\workspace",
      "--resume",
      "session-123",
      "--print",
      "--output-format",
      "stream-json",
      "--yolo",
    ]);
  });

  it("extracts session id from the printed resume hint", async () => {
    const { extractKimiResumeSessionId } = await import("../kimi-runner");
    expect(extractKimiResumeSessionId("To resume this session: kimi -r abc123")).toBe("abc123");
    expect(extractKimiResumeSessionId("plain stderr")).toBeNull();
  });
});
