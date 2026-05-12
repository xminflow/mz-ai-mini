import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ResetSessionDialog } from "../ready-status/ResetSessionDialog";

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

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderWithProvider(ui: JSX.Element) {
  const qc = makeQueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

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

describe("ResetSessionDialog", () => {
  it("renders the FR-021 confirmation copy", () => {
    renderWithProvider(<ResetSessionDialog open={true} onOpenChange={() => undefined} />);
    expect(
      screen.getByText(
        "该操作会同时清除抖音与小红书的登录态及 patchright 反爬指纹，但已采集素材会原样保留。",
      ),
    ).toBeInTheDocument();
  });

  it("calls window.api.keyword.resetSession when confirm is clicked", async () => {
    mockApi.resetSession.mockResolvedValue({
      schema_version: "1",
      ok: true,
      was_running: false,
      profile_existed: true,
    });
    renderWithProvider(<ResetSessionDialog open={true} onOpenChange={() => undefined} />);
    fireEvent.click(screen.getByText("确认清除"));
    await waitFor(() => {
      expect(mockApi.resetSession).toHaveBeenCalledTimes(1);
    });
  });
});
