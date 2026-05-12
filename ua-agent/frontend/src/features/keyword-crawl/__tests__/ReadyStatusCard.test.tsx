import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SessionStatusResult } from "@/shared/contracts/keyword/session-status";

import { ReadyStatusCard } from "../ready-status/ReadyStatusCard";

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

function status(prereqs: Partial<{
  browser_installed: boolean;
  session_running: boolean;
  douyin_reachable: "reachable" | "unreachable" | "blocked_by_anti_bot" | "unknown";
  signed_in: "signed_in" | "signed_out" | "unknown";
}> = {}): SessionStatusResult {
  return {
    schema_version: "1",
    ok: true,
    prereqs: {
      browser_installed: prereqs.browser_installed ?? false,
      session_running: prereqs.session_running ?? false,
      douyin_reachable: prereqs.douyin_reachable ?? "unknown",
      signed_in: prereqs.signed_in ?? "unknown",
    },
  };
}

describe("ReadyStatusCard", () => {
  it("renders the three rows", async () => {
    mockApi.sessionStatus.mockResolvedValue(status());
    renderWithProvider(<ReadyStatusCard />);
    await waitFor(() => {
      expect(screen.getByTestId("ready-status-row-浏览器")).toBeInTheDocument();
      expect(screen.getByTestId("ready-status-row-会话")).toBeInTheDocument();
      expect(screen.getByTestId("ready-status-row-抖音可达性")).toBeInTheDocument();
    });
  });

  it("uses non-color signaling (icon + text) per FR-039", async () => {
    mockApi.sessionStatus.mockResolvedValue(status({ browser_installed: true }));
    renderWithProvider(<ReadyStatusCard />);
    await waitFor(() => {
      expect(screen.getByTestId("ready-status-row-浏览器")).toHaveTextContent("已安装");
    });
    // verify the icon has an aria-label so screen readers don't depend on color
    const okIcons = screen.getAllByLabelText(/已就绪/);
    expect(okIcons.length).toBeGreaterThan(0);
  });

  it("shows 安装浏览器 button when browser is not installed", async () => {
    mockApi.sessionStatus.mockResolvedValue(status({ browser_installed: false }));
    renderWithProvider(<ReadyStatusCard />);
    await waitFor(() => {
      expect(screen.getByText("安装浏览器")).toBeInTheDocument();
    });
  });
});
