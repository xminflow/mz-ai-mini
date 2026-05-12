import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { batchStatusResultSchema } from "@/shared/contracts/keyword/batch-status";

import { BatchExecutor } from "../domain/batchExecutor";
import {
  _resetForTests as resetExecutorContext,
  setBatchExecutorOverride,
} from "../runtime/executorContext";
import { batchStatusHandler } from "../handlers/batchStatus";

class FakeExec extends BatchExecutor {
  constructor(private fakeSnap: ReturnType<BatchExecutor["snapshot"]>) {
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
  override snapshot() { return this.fakeSnap; }
}

beforeEach(() => {
  resetExecutorContext();
});

afterEach(() => {
  resetExecutorContext();
  vi.restoreAllMocks();
});

describe("batchStatus contract", () => {
  it("returns batch=null when no batch has run", async () => {
    setBatchExecutorOverride(new FakeExec(null));
    const out = await batchStatusHandler({});
    const parsed = batchStatusResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.batch).toBeNull();
  });

  it("returns the in-memory snapshot when populated", async () => {
    const snap = {
      batch_id: "11111111-1111-1111-1111-111111111111",
      platform: "douyin" as const,
      status: "running" as const,
      stop_reason: null,
      started_at: "2026-05-03T12:00:00.000Z",
      ended_at: null,
      selected_keyword_ids: ["22222222-2222-2222-2222-222222222222"],
      runs: [
        {
          keyword_id: "22222222-2222-2222-2222-222222222222",
          platform: "douyin" as const,
          keyword_text: "前端",
          position: 1,
          status: "running" as const,
          stop_reason: null,
          started_at: "2026-05-03T12:00:00.000Z",
          ended_at: null,
          scanned_count: 5,
          captured_count: 3,
          duplicate_count: 1,
          error_count: 1,
          filtered_count: 0,
          representative_errors: [],
        },
      ],
      current_index: 0,
    };
    setBatchExecutorOverride(new FakeExec(snap));
    const out = await batchStatusHandler({});
    const parsed = batchStatusResultSchema.parse(out);
    if (!parsed.ok) throw new Error("expected ok");
    expect(parsed.batch?.batch_id).toBe(snap.batch_id);
    expect(parsed.batch?.runs[0]?.captured_count).toBe(3);
  });
});
