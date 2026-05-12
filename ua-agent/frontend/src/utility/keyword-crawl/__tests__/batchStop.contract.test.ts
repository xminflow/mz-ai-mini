import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { batchStopResultSchema } from "@/shared/contracts/keyword/batch-stop";

import { BatchExecutor } from "../domain/batchExecutor";
import {
  _resetForTests as resetExecutorContext,
  setBatchExecutorOverride,
} from "../runtime/executorContext";
import { batchStopHandler } from "../handlers/batchStop";

class FakeExec extends BatchExecutor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private fakeStop: () => Promise<{ batchId: string | null; wasRunning: boolean }>) {
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
      // dummy
      {} as never,
    );
  }
  override async stop(): Promise<{ batchId: string | null; wasRunning: boolean }> {
    return this.fakeStop();
  }
}

beforeEach(() => {
  resetExecutorContext();
});

afterEach(() => {
  resetExecutorContext();
  vi.restoreAllMocks();
});

describe("batchStop contract", () => {
  it("returns ok with batch_id=null + was_running=false when nothing is in flight", async () => {
    setBatchExecutorOverride(new FakeExec(async () => ({ batchId: null, wasRunning: false })));
    const out = await batchStopHandler({});
    const parsed = batchStopResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.batch_id).toBeNull();
    expect(parsed.was_running).toBe(false);
  });

  it("returns ok with the running batch id", async () => {
    const id = "11111111-1111-1111-1111-111111111111";
    setBatchExecutorOverride(new FakeExec(async () => ({ batchId: id, wasRunning: true })));
    const out = await batchStopHandler({});
    const parsed = batchStopResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.batch_id).toBe(id);
    expect(parsed.was_running).toBe(true);
  });
});
