import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { BatchSnapshot } from "@/shared/contracts/keyword/batch-status";

import { BatchProgressCard } from "../batch/BatchProgressCard";

function snapshot(): BatchSnapshot {
  return {
    batch_id: "11111111-1111-1111-1111-111111111111",
    platform: "douyin",
    status: "running",
    stop_reason: null,
    started_at: "2026-05-03T12:00:00.000Z",
    ended_at: null,
    selected_keyword_ids: ["22222222-2222-2222-2222-222222222222"],
    runs: [
      {
        keyword_id: "22222222-2222-2222-2222-222222222222",
        platform: "douyin",
        keyword_text: "前端",
        position: 1,
        status: "running",
        stop_reason: null,
        started_at: "2026-05-03T12:00:01.000Z",
        ended_at: null,
        scanned_count: 12,
        captured_count: 7,
        duplicate_count: 3,
        error_count: 2,
        filtered_count: 4,
        representative_errors: [],
      },
    ],
    current_index: 0,
  };
}

describe("BatchProgressCard", () => {
  it("renders all five counts for the running keyword", () => {
    render(<BatchProgressCard batch={snapshot()} />);
    expect(screen.getByTestId("count-scanned")).toHaveTextContent("12");
    expect(screen.getByTestId("count-captured")).toHaveTextContent("7");
    expect(screen.getByTestId("count-duplicate")).toHaveTextContent("3");
    expect(screen.getByTestId("count-error")).toHaveTextContent("2");
    expect(screen.getByTestId("count-filtered")).toHaveTextContent("4");
    expect(screen.getByTestId("batch-progress-current")).toHaveTextContent("前端");
  });

  it("returns null when no batch is in flight", () => {
    const { container } = render(<BatchProgressCard batch={null} />);
    expect(container.firstChild).toBeNull();
  });
});
