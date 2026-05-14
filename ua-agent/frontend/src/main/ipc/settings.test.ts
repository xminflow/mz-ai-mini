import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  handle: vi.fn(),
  removeHandler: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  getSettings: vi.fn(),
  updateSettings: vi.fn(),
  getProvider: vi.fn(),
  resetAiChatSnapshotForProviderSwitch: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: mocks.handle,
    removeHandler: mocks.removeHandler,
  },
}));

vi.mock("electron-log/main", () => ({
  default: {
    info: mocks.info,
    warn: vi.fn(),
    error: mocks.error,
  },
}));

vi.mock("../services/settings/store", () => ({
  getSettings: mocks.getSettings,
  updateSettings: mocks.updateSettings,
}));

vi.mock("../services/llm/provider", () => ({
  getProvider: mocks.getProvider,
}));

vi.mock("./ai-chat", () => ({
  resetAiChatSnapshotForProviderSwitch: mocks.resetAiChatSnapshotForProviderSwitch,
}));

import { registerSettingsHandlers } from "./settings";

describe("settings IPC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("resets ai chat snapshots when llm provider changes", async () => {
    mocks.getSettings.mockResolvedValue({
      schema_version: "1",
      llm: {
        provider: "claude-code",
        claudeCode: {},
        codex: {},
        kimi: {},
      },
      network: {},
      theme: "system",
      scheduling: {
        douyin: { enabled: false, time: "09:00" },
        xiaohongshu: { enabled: false, time: "09:00" },
      },
    });
    mocks.updateSettings.mockResolvedValue({
      schema_version: "1",
      llm: {
        provider: "codex",
        claudeCode: {},
        codex: {},
        kimi: {},
      },
      network: {},
      theme: "system",
      scheduling: {
        douyin: { enabled: false, time: "09:00" },
        xiaohongshu: { enabled: false, time: "09:00" },
      },
    });

    registerSettingsHandlers();

    const updateHandler = mocks.handle.mock.calls.find(
      ([channel]: [string]) => channel === "settings:update",
    )?.[1];

    const result = await updateHandler?.({}, { llm: { provider: "codex" } });

    expect(mocks.resetAiChatSnapshotForProviderSwitch).toHaveBeenCalledTimes(1);
    expect(mocks.resetAiChatSnapshotForProviderSwitch).toHaveBeenCalledWith("codex");
    expect(result).toMatchObject({
      schema_version: "1",
      ok: true,
      settings: {
        llm: {
          provider: "codex",
        },
      },
    });
  });

  it("does not reset ai chat snapshots when provider is unchanged", async () => {
    mocks.getSettings.mockResolvedValue({
      schema_version: "1",
      llm: {
        provider: "codex",
        claudeCode: {},
        codex: {},
        kimi: {},
      },
      network: {},
      theme: "system",
      scheduling: {
        douyin: { enabled: false, time: "09:00" },
        xiaohongshu: { enabled: false, time: "09:00" },
      },
    });
    mocks.updateSettings.mockResolvedValue({
      schema_version: "1",
      llm: {
        provider: "codex",
        claudeCode: {},
        codex: { binPath: "codex" },
        kimi: {},
      },
      network: {},
      theme: "system",
      scheduling: {
        douyin: { enabled: false, time: "09:00" },
        xiaohongshu: { enabled: false, time: "09:00" },
      },
    });

    registerSettingsHandlers();

    const updateHandler = mocks.handle.mock.calls.find(
      ([channel]: [string]) => channel === "settings:update",
    )?.[1];

    await updateHandler?.({}, { llm: { codex: { binPath: "codex" } } });

    expect(mocks.resetAiChatSnapshotForProviderSwitch).not.toHaveBeenCalled();
  });
});
