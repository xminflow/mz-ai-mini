import { describe, expect, it } from "vitest";

import { normalizeAppSettings } from "./settings";

describe("normalizeAppSettings", () => {
  it("fills missing kimi settings from older config payloads", () => {
    const normalized = normalizeAppSettings({
      schema_version: "1",
      llm: {
        provider: "codex",
        claudeCode: {},
        codex: {},
      },
      network: {
        httpsProxy: "http://localhost:7078",
      },
      theme: "light",
      scheduling: {
        douyin: {
          enabled: false,
          time: "09:00",
        },
        xiaohongshu: {
          enabled: false,
          time: "09:00",
        },
      },
    });

    expect(normalized.llm.kimi).toEqual({});
    expect(normalized.network.httpsProxy).toBe("http://localhost:7078");
  });

  it("does not expose workspacePath in normalized settings", () => {
    const normalized = normalizeAppSettings({
      schema_version: "1",
      llm: {
        provider: "claude-code",
        claudeCode: {
          defaultCwd: "D:\\legacy-workspace",
        },
        codex: {},
        kimi: {},
      },
      network: {},
      theme: "system",
      scheduling: {
        douyin: {
          enabled: false,
          time: "09:00",
        },
        xiaohongshu: {
          enabled: false,
          time: "09:00",
        },
      },
    });

    expect("workspacePath" in normalized.llm).toBe(false);
  });
});
