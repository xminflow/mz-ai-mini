import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AgentAuthGate } from "../AgentAuthGate";

function renderGate() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AgentAuthGate>
        <div>APP_READY</div>
      </AgentAuthGate>
    </QueryClientProvider>,
  );
}

describe("AgentAuthGate", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    Object.defineProperty(window, "api", {
      configurable: true,
      value: {
        agentAuth: {
          getState: vi.fn(),
          requestEmailLoginCode: vi.fn(),
          verifyEmailLoginCode: vi.fn(),
          logout: vi.fn(),
        },
      },
    });
    window.api.agentAuth.getState = vi.fn().mockResolvedValue({
      schema_version: "1",
      ok: true,
      state: { authenticated: false, reason: "missing_session" },
    });
    window.api.agentAuth.requestEmailLoginCode = vi.fn().mockResolvedValue({
      schema_version: "1",
      ok: true,
      challenge: {
        login_challenge_id: "9001",
        expires_at: "2026-05-13T10:10:00Z",
        cooldown_seconds: 60,
      },
    });
    window.api.agentAuth.verifyEmailLoginCode = vi.fn().mockResolvedValue({
      schema_version: "1",
      ok: true,
      state: {
        authenticated: true,
        account: {
          account_id: "1",
          username: "agent_1",
          email: "demo@example.com",
          status: "active",
          created_at: "2026-05-13T10:00:00Z",
        },
        access_token_expires_at: "2026-05-13T11:00:00Z",
        refresh_token_expires_at: "2026-06-12T10:00:00Z",
      },
    });
    window.api.agentAuth.logout = vi.fn();
  });

  it("shows email login card when unauthenticated", async () => {
    renderGate();

    expect(await screen.findByText(/邮箱/)).toBeInTheDocument();
    expect(screen.queryByText("APP_READY")).not.toBeInTheDocument();
  });

  it("renders app when already authenticated", async () => {
    window.api.agentAuth.getState = vi.fn().mockResolvedValue({
      schema_version: "1",
      ok: true,
      state: {
        authenticated: true,
        account: {
          account_id: "1",
          username: "agent_1",
          email: "demo@example.com",
          status: "active",
          created_at: "2026-05-13T10:00:00Z",
        },
        access_token_expires_at: "2026-05-13T11:00:00Z",
        refresh_token_expires_at: "2026-06-12T10:00:00Z",
      },
    });

    renderGate();

    expect(await screen.findByText("APP_READY")).toBeInTheDocument();
  });

  it("requests email code and verifies login", async () => {
    renderGate();

    fireEvent.change(await screen.findByPlaceholderText("name@example.com"), {
      target: { value: "demo@example.com" },
    });
    fireEvent.click(screen.getByText("发送验证码"));

    await waitFor(() => {
      expect(window.api.agentAuth.requestEmailLoginCode).toHaveBeenCalledWith("demo@example.com");
    });

    fireEvent.change(screen.getByPlaceholderText("6 位数字"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByText("登录"));

    await waitFor(() => {
      expect(window.api.agentAuth.verifyEmailLoginCode).toHaveBeenCalledWith("9001", "123456");
    });
  });

  it("prefills the last used email from localStorage", async () => {
    window.localStorage.setItem("agent-auth:last-used-email", "saved@example.com");

    renderGate();

    expect(await screen.findByDisplayValue("saved@example.com")).toBeInTheDocument();
  });

  it("stores the last used email only after requesting a code successfully", async () => {
    renderGate();

    fireEvent.change(await screen.findByPlaceholderText("name@example.com"), {
      target: { value: "demo@example.com" },
    });
    expect(window.localStorage.getItem("agent-auth:last-used-email")).toBeNull();

    fireEvent.click(screen.getByText("发送验证码"));

    await waitFor(() => {
      expect(window.localStorage.getItem("agent-auth:last-used-email")).toBe("demo@example.com");
    });
  });
});
