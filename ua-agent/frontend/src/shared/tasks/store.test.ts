import { afterEach, describe, expect, it } from "vitest";

import { useGlobalTaskCenterStore, bloggerAnalyzeTaskKey, bloggerSampleTaskKey } from "./store";

describe("global task center store", () => {
  afterEach(() => {
    useGlobalTaskCenterStore.getState().reset();
  });

  it("tracks a running keyword batch and removes it when the batch ends", () => {
    useGlobalTaskCenterStore.getState().applyBatchEvent({
      schema_version: "1",
      phase: "batch-started",
      batch_id: "11111111-1111-1111-1111-111111111111",
      platform: "douyin",
      selected_keyword_ids: ["22222222-2222-2222-2222-222222222222"],
      started_at: "2026-05-07T01:00:00.000Z",
    });

    expect(Object.values(useGlobalTaskCenterStore.getState().tasks)).toHaveLength(1);

    useGlobalTaskCenterStore.getState().applyBatchEvent({
      schema_version: "1",
      phase: "batch-ended",
      batch_id: "11111111-1111-1111-1111-111111111111",
      platform: "douyin",
      stop_reason: "all-completed",
      started_at: "2026-05-07T01:00:00.000Z",
      ended_at: "2026-05-07T01:10:00.000Z",
      executed_keyword_ids: ["22222222-2222-2222-2222-222222222222"],
      cancelled_keyword_ids: [],
    });

    expect(Object.values(useGlobalTaskCenterStore.getState().tasks)).toHaveLength(0);
  });

  it("folds sample progress into an active blogger analyze task", () => {
    const bloggerId = "33333333-3333-4333-8333-333333333333";

    useGlobalTaskCenterStore.getState().applyBloggerEvent({
      schema_version: "1",
      phase: "analyze-started",
      blogger_id: bloggerId,
      started_at: "2026-05-07T02:00:00.000Z",
      sample_required: true,
    });
    useGlobalTaskCenterStore.getState().applyBloggerEvent({
      schema_version: "1",
      phase: "sample-started",
      blogger_id: bloggerId,
      started_at: "2026-05-07T02:00:01.000Z",
    });
    useGlobalTaskCenterStore.getState().applyBloggerEvent({
      schema_version: "1",
      phase: "sample-progress",
      blogger_id: bloggerId,
      scroll_count: 15,
      loaded_count: 28,
    });

    const state = useGlobalTaskCenterStore.getState();
    expect(state.tasks[bloggerAnalyzeTaskKey(bloggerId)]?.detail).toContain("已发现 28 条作品");
    expect(state.tasks[bloggerSampleTaskKey(bloggerId)]).toBeUndefined();
  });
});
