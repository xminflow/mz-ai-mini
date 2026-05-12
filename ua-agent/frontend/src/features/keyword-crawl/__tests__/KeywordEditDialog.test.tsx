import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KeywordEditDialog } from "../keywords/KeywordEditDialog";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderWithProvider(ui: JSX.Element) {
  const qc = makeQueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

interface MockApi {
  list: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  batchStart: ReturnType<typeof vi.fn>;
  batchStop: ReturnType<typeof vi.fn>;
  batchStatus: ReturnType<typeof vi.fn>;
  installBrowser: ReturnType<typeof vi.fn>;
  startSession: ReturnType<typeof vi.fn>;
  sessionStatus: ReturnType<typeof vi.fn>;
  resetSession: ReturnType<typeof vi.fn>;
  openLogsDir: ReturnType<typeof vi.fn>;
  onBatchEvent: ReturnType<typeof vi.fn>;
}

let mockApi: MockApi;

beforeEach(() => {
  mockApi = {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    batchStart: vi.fn(),
    batchStop: vi.fn(),
    batchStatus: vi.fn(),
    installBrowser: vi.fn(),
    startSession: vi.fn(),
    sessionStatus: vi.fn(),
    resetSession: vi.fn(),
    openLogsDir: vi.fn(),
    onBatchEvent: vi.fn(() => () => undefined),
  };
  (window as unknown as { api: { keyword: MockApi } }).api = { keyword: mockApi };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("KeywordEditDialog", () => {
  it("disables submit when the input is empty", () => {
    renderWithProvider(<KeywordEditDialog open={true} onOpenChange={() => undefined} />);
    expect(screen.getByTestId("keyword-edit-submit")).toBeDisabled();
  });

  it("rejects over-100-chars at submit time with validation message", () => {
    renderWithProvider(<KeywordEditDialog open={true} onOpenChange={() => undefined} />);
    const input = screen.getByTestId("keyword-edit-input") as HTMLInputElement;
    const longText = "a".repeat(101);
    fireEvent.change(input, { target: { value: longText } });
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByTestId("keyword-edit-error")).toHaveTextContent(/100 字/);
    expect(mockApi.create).not.toHaveBeenCalled();
  });

  it("calls window.api.keyword.create with submitted value and per-keyword settings", async () => {
    mockApi.create.mockResolvedValue({
      schema_version: "1",
      ok: true,
      keyword: {
        id: "00000000-0000-0000-0000-000000000000",
        platform: "douyin",
        text: "前端",
        position: 0,
        enabled: true,
        target_cap: 10,
        health_cap: 500,
        metric_filter_mode: "ratio",
        min_like_follower_ratio: 1,
        publish_time_range: "all",
        author_follower_count_op: null,
        author_follower_count_value: null,
        like_count_op: null,
        like_count_value: null,
        created_at: "2026-05-03T00:00:00.000Z",
        updated_at: "2026-05-03T00:00:00.000Z",
      },
    });
    renderWithProvider(<KeywordEditDialog open={true} onOpenChange={() => undefined} />);
    fireEvent.change(screen.getByTestId("keyword-edit-input"), { target: { value: "  前端  " } });
    fireEvent.click(screen.getByTestId("keyword-edit-submit"));
    await waitFor(() => {
      expect(mockApi.create).toHaveBeenCalledWith({
        text: "  前端  ",
        platform: "douyin",
        target_cap: 10,
        health_cap: 500,
        metric_filter_mode: "ratio",
        min_like_follower_ratio: 1,
        publish_time_range: "all",
        author_follower_count_op: null,
        author_follower_count_value: null,
        like_count_op: null,
        like_count_value: null,
      });
    });
  });

  it("submits author-metrics mode with threshold pairs", async () => {
    mockApi.create.mockResolvedValue({
      schema_version: "1",
      ok: true,
      keyword: {
        id: "00000000-0000-0000-0000-000000000001",
        platform: "douyin",
        text: "前端",
        position: 0,
        enabled: true,
        target_cap: 10,
        health_cap: 500,
        metric_filter_mode: "author_metrics",
        min_like_follower_ratio: 0,
        publish_time_range: "week",
        author_follower_count_op: "gte",
        author_follower_count_value: 1000,
        like_count_op: "lte",
        like_count_value: 5000,
        created_at: "2026-05-03T00:00:00.000Z",
        updated_at: "2026-05-03T00:00:00.000Z",
      },
    });
    renderWithProvider(<KeywordEditDialog open={true} onOpenChange={() => undefined} />);
    fireEvent.change(screen.getByTestId("keyword-edit-input"), { target: { value: "前端" } });
    fireEvent.click(screen.getByTestId("keyword-edit-mode-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("keyword-edit-mode-item-author_metrics")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("keyword-edit-mode-item-author_metrics"));
    fireEvent.click(screen.getByTestId("keyword-edit-time-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("keyword-edit-time-item-week")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("keyword-edit-time-item-week"));
    fireEvent.click(screen.getByTestId("keyword-edit-follower-op-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("keyword-edit-follower-op-item-gte")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("keyword-edit-follower-op-item-gte"));
    fireEvent.change(screen.getByTestId("keyword-edit-follower-value"), {
      target: { value: "1000" },
    });
    fireEvent.click(screen.getByTestId("keyword-edit-like-op-trigger"));
    await waitFor(() => {
      expect(screen.getByTestId("keyword-edit-like-op-item-lte")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("keyword-edit-like-op-item-lte"));
    fireEvent.change(screen.getByTestId("keyword-edit-like-value"), {
      target: { value: "5000" },
    });
    fireEvent.click(screen.getByTestId("keyword-edit-submit"));
    await waitFor(() => {
      expect(mockApi.create).toHaveBeenCalledWith({
        text: "前端",
        platform: "douyin",
        target_cap: 10,
        health_cap: 500,
        metric_filter_mode: "author_metrics",
        min_like_follower_ratio: 0,
        publish_time_range: "week",
        author_follower_count_op: "gte",
        author_follower_count_value: 1000,
        like_count_op: "lte",
        like_count_value: 5000,
      });
    });
  });
});
