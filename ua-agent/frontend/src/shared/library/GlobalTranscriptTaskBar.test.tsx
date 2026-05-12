import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalTranscriptTaskBar } from "./GlobalTranscriptTaskBar";
import { useTranscriptTaskStore } from "./useTranscriptTaskStore";

describe("GlobalTranscriptTaskBar", () => {
  beforeEach(() => {
    (window as unknown as { api: Window["api"] }).api = {
      transcript: {
        extract: vi.fn(),
        onProgress: vi.fn(() => 1),
        offProgress: vi.fn(),
      },
    } as unknown as Window["api"];
    act(() => {
      useTranscriptTaskStore.setState({ task: null });
    });
  });

  afterEach(() => {
    act(() => {
      useTranscriptTaskStore.setState({ task: null });
    });
    vi.restoreAllMocks();
  });

  it("renders the running task globally", () => {
    render(<GlobalTranscriptTaskBar />);

    act(() => {
      useTranscriptTaskStore.setState({
        task: {
          postId: "post-1",
          sourceName: "作者 A",
          status: "running",
          stage: "transcribing",
          percent: 62,
          startedAt: "2026-05-06T00:00:00.000Z",
          message: "转写中 62%",
          error: null,
          transcribedAt: null,
        },
      });
    });

    expect(screen.getByTestId("global-transcript-task-bar")).toHaveTextContent("语音转文本进行中");
    expect(screen.getByText("作者 A · 转写中 62%")).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
  });

  it("allows dismissing a finished task", () => {
    render(<GlobalTranscriptTaskBar />);

    act(() => {
      useTranscriptTaskStore.setState({
        task: {
          postId: "post-1",
          sourceName: "作者 A",
          status: "success",
          stage: "transcribing",
          percent: 100,
          startedAt: "2026-05-06T00:00:00.000Z",
          message: "语音转文本已完成",
          error: null,
          transcribedAt: "2026-05-06T00:01:00.000Z",
        },
      });
    });
    fireEvent.click(screen.getByLabelText("关闭语音转文本任务状态"));

    expect(useTranscriptTaskStore.getState().task).toBeNull();
  });
});
