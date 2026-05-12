import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ErrorEnvelope } from "@/shared/contracts/error";
import { batchStartResultSchema } from "@/shared/contracts/keyword/batch-start";

import { BatchExecutor } from "../domain/batchExecutor";
import {
  _resetForTests as resetExecutorContext,
  setBatchExecutorOverride,
} from "../runtime/executorContext";
import { batchStartHandler } from "../handlers/batchStart";

class FakeExec extends BatchExecutor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private fakeStart: () => Promise<{ batchId: string; startedAt: string } | ErrorEnvelope>) {
    super(
      {
        isInstalled: () => true,
        isSessionAlive: () => true,
        navigateTo: async () => undefined,
        evaluator: () => null,
        pressKey: async () => undefined,
        sleep: async () => undefined,
      },
      { check: () => null },
      {} as never,
    );
  }
  override async start(): Promise<{ batchId: string; startedAt: string } | ErrorEnvelope> {
    return this.fakeStart();
  }
}

beforeEach(() => {
  resetExecutorContext();
});

afterEach(() => {
  resetExecutorContext();
  vi.restoreAllMocks();
});

describe("batchStart contract", () => {
  it("returns ok with batch_id + started_at on happy path", async () => {
    setBatchExecutorOverride(
      new FakeExec(async () => ({
        batchId: "22222222-2222-2222-2222-222222222222",
        startedAt: "2026-05-03T12:00:00.000Z",
      })),
    );
    const out = await batchStartHandler({ platform: "douyin" });
    const parsed = batchStartResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.batch_id).toBe("22222222-2222-2222-2222-222222222222");
  });

  it("returns INVALID_INPUT when input fails schema parse", async () => {
    // Strict schema rejects unknown keys.
    const out = await batchStartHandler({ unexpected: "field" });
    const parsed = batchStartResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("INVALID_INPUT");
  });

  it("forwards BATCH_BUSY from the executor", async () => {
    setBatchExecutorOverride(
      new FakeExec(async () => ({
        schema_version: "1",
        ok: false,
        error: { code: "BATCH_BUSY", message: "已有批次进行中" },
      })),
    );
    const out = await batchStartHandler({ platform: "douyin" });
    const parsed = batchStartResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("BATCH_BUSY");
  });

  it("forwards BROWSER_NOT_INSTALLED from the executor's gate", async () => {
    setBatchExecutorOverride(
      new FakeExec(async () => ({
        schema_version: "1",
        ok: false,
        error: { code: "BROWSER_NOT_INSTALLED", message: "请先安装浏览器" },
      })),
    );
    const out = await batchStartHandler({ platform: "douyin" });
    const parsed = batchStartResultSchema.parse(out);
    if (parsed.ok) throw new Error("expected error");
    expect(parsed.error.code).toBe("BROWSER_NOT_INSTALLED");
  });
});
