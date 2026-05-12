import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GlobalTaskCenter } from "./GlobalTaskCenter";
import { useGlobalTaskCenterStore } from "./store";

describe("GlobalTaskCenter", () => {
  beforeEach(() => {
    (window as unknown as { api: Window["api"] }).api = {
      keyword: {
        batchStop: vi.fn(),
      },
      blogger: {
        analyzeCancel: vi.fn(),
      },
    } as unknown as Window["api"];
    useGlobalTaskCenterStore.getState().reset();
  });

  afterEach(() => {
    useGlobalTaskCenterStore.getState().reset();
    vi.restoreAllMocks();
  });

  it("shows running tasks from the shared store", () => {
    act(() => {
      useGlobalTaskCenterStore.setState({
        tasks: {
          "transcript:post-1": {
            key: "transcript:post-1",
            kind: "transcript",
            entityId: "post-1",
            title: "语音转文本",
            subtitle: "作者 A",
            detail: "转写中 62%",
            startedAt: "2026-05-07T03:00:00.000Z",
            progressPercent: 62,
            stopAction: null,
          },
          "blogger-analyze:blogger-1": {
            key: "blogger-analyze:blogger-1",
            kind: "blogger-analyze",
            entityId: "blogger-1",
            title: "博主拆解",
            subtitle: "博主 12345678",
            detail: "生成拆解报告",
            startedAt: "2026-05-07T03:01:00.000Z",
            progressPercent: 95,
            stopAction: { type: "blogger-analyze", bloggerId: "blogger-1" },
          },
        },
      });
    });

    render(<GlobalTaskCenter />);

    act(() => {
      fireEvent.click(screen.getByLabelText("打开任务中心"));
    });

    expect(screen.getByText("语音转文本")).toBeInTheDocument();
    expect(screen.getByText("作者 A")).toBeInTheDocument();
    expect(screen.getByText("博主拆解")).toBeInTheDocument();
    expect(screen.getByTestId("global-task-stop-blogger-analyze:blogger-1")).toBeInTheDocument();
  });
});
