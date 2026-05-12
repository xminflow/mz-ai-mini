import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { KeywordRow } from "@/shared/contracts/keyword/keyword-list";

import { KeywordsList } from "../keywords/KeywordsList";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

function renderWithProvider(ui: JSX.Element): ReturnType<typeof render> {
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

function row(text: string, position: number, id?: string): KeywordRow {
  return {
    id: id ?? `00000000-0000-0000-0000-${String(position).padStart(12, "0")}`,
    platform: "douyin",
    text,
    position,
    enabled: true,
    target_cap: 10,
    health_cap: 500,
    metric_filter_mode: "none",
    min_like_follower_ratio: 0,
    publish_time_range: "all",
    author_follower_count_op: null,
    author_follower_count_value: null,
    like_count_op: null,
    like_count_value: null,
    created_at: "2026-05-03T00:00:00.000Z",
    updated_at: "2026-05-03T00:00:00.000Z",
  };
}

describe("KeywordsList", () => {
  it("renders the empty-state guidance when the list is empty", async () => {
    mockApi.list.mockResolvedValue({ schema_version: "1", ok: true, keywords: [] });
    renderWithProvider(<KeywordsList />);
    await waitFor(() => {
      expect(screen.getByTestId("keywords-empty")).toBeInTheDocument();
    });
  });

  it("renders one row per keyword", async () => {
    mockApi.list.mockResolvedValue({
      schema_version: "1",
      ok: true,
      keywords: [row("前端", 0), row("副业", 1), row("短视频带货", 2)],
    });
    renderWithProvider(<KeywordsList />);
    await waitFor(() => {
      expect(screen.getAllByTestId("keyword-row")).toHaveLength(3);
    });
    expect(screen.getByText("前端")).toBeInTheDocument();
    expect(screen.getByText("副业")).toBeInTheDocument();
    expect(screen.getByText("短视频带货")).toBeInTheDocument();
  });

  it("renders an explicit error state when keyword:list fails", async () => {
    mockApi.list.mockResolvedValue({
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: "internal contract violation" },
    });
    renderWithProvider(<KeywordsList />);
    await waitFor(() => {
      expect(screen.getByTestId("keywords-load-error")).toBeInTheDocument();
    });
    expect(screen.getByText("关键词列表加载失败")).toBeInTheDocument();
    expect(screen.getByText("internal contract violation")).toBeInTheDocument();
  });

  it("disables 开始采集 when not ready", async () => {
    mockApi.list.mockResolvedValue({
      schema_version: "1",
      ok: true,
      keywords: [row("前端", 0)],
    });
    renderWithProvider(<KeywordsList isReady={false} notReadyReason="浏览器未安装" />);
    await waitFor(() => {
      expect(screen.getByTestId("start-batch-button")).toBeDisabled();
    });
  });

  it("opens the add dialog when the 添加 button is clicked", async () => {
    mockApi.list.mockResolvedValue({ schema_version: "1", ok: true, keywords: [] });
    renderWithProvider(<KeywordsList />);
    await waitFor(() => {
      expect(screen.getByTestId("add-keyword-button")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("add-keyword-button"));
    await waitFor(() => {
      expect(screen.getByTestId("keyword-edit-input")).toBeInTheDocument();
    });
  });
});
