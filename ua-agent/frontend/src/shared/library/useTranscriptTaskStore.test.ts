import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useGlobalTaskCenterStore } from "@/shared/tasks/store";

import { useTranscriptTaskStore } from "./useTranscriptTaskStore";

describe("useTranscriptTaskStore", () => {
  beforeEach(() => {
    (window as unknown as { api: Window["api"] }).api = {
      transcript: {
        extract: vi.fn(),
        onProgress: vi.fn(() => 1),
        offProgress: vi.fn(),
      },
    } as unknown as Window["api"];
    useTranscriptTaskStore.setState({ task: null });
    useGlobalTaskCenterStore.getState().reset();
  });

  afterEach(() => {
    useTranscriptTaskStore.setState({ task: null });
    useGlobalTaskCenterStore.getState().reset();
    vi.restoreAllMocks();
  });

  it("stores a successful extraction as a global completed task", async () => {
    vi.mocked(window.api.transcript.extract).mockResolvedValue({
      schema_version: "1",
      ok: true,
      post_id: "post-1",
      transcript: "hello world",
      transcribed_at: "2026-05-06T00:00:00.000Z",
      language: "zh",
      duration_s: 12,
    });

    const result = await useTranscriptTaskStore.getState().runExtraction({
      postId: "post-1",
      shareUrl: "https://example.com/video",
      platform: "xiaohongshu",
      sourceName: "作者 A",
    });

    expect(result.ok).toBe(true);
    expect(useTranscriptTaskStore.getState().task).toMatchObject({
      postId: "post-1",
      sourceName: "作者 A",
      status: "success",
      percent: 100,
      message: "语音转文本已完成",
    });
    expect(useGlobalTaskCenterStore.getState().tasks).toEqual({});
    expect(window.api.transcript.extract).toHaveBeenCalledWith({
      post_id: "post-1",
      share_url: "https://example.com/video",
      platform: "xiaohongshu",
    });
  });

  it("restores the previous task snapshot when the backend reports busy", async () => {
    useTranscriptTaskStore.setState({
      task: {
        postId: "old-post",
        sourceName: "旧任务",
        status: "failed",
        stage: "transcribing",
        percent: 88,
        startedAt: "2026-05-06T00:00:00.000Z",
        message: "语音转文本失败",
        error: "旧错误",
        transcribedAt: null,
      },
    });

    vi.mocked(window.api.transcript.extract).mockResolvedValue({
      schema_version: "1",
      ok: false,
      error: {
        code: "TRANSCRIPT_BUSY",
        message: "已有语音转文本任务处理中，请稍后再试",
      },
    });

    const result = await useTranscriptTaskStore.getState().runExtraction({
      postId: "new-post",
      shareUrl: "https://example.com/video",
      platform: "douyin",
      sourceName: "作者 B",
    });

    expect(result.ok).toBe(false);
    expect(useTranscriptTaskStore.getState().task).toMatchObject({
      postId: "old-post",
      sourceName: "旧任务",
      status: "failed",
      error: "旧错误",
    });
  });
});
