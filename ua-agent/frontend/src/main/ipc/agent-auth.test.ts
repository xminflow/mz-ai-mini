import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  handle: vi.fn(),
  removeHandler: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  readAgentAuthSession: vi.fn(),
  clearAgentAuthSession: vi.fn(),
  saveAgentAuthSession: vi.fn(),
  toAuthenticatedState: vi.fn(),
  refreshRemoteAgentSession: vi.fn(),
}));

vi.mock("electron", () => ({
  ipcMain: {
    handle: mocks.handle,
    removeHandler: mocks.removeHandler,
  },
}));

vi.mock("electron-log/main", () => ({
  default: {
    info: mocks.info,
    warn: mocks.warn,
    error: vi.fn(),
  },
}));

vi.mock("../services/auth/session-store", () => ({
  readAgentAuthSession: mocks.readAgentAuthSession,
  clearAgentAuthSession: mocks.clearAgentAuthSession,
  saveAgentAuthSession: mocks.saveAgentAuthSession,
  toAuthenticatedState: mocks.toAuthenticatedState,
}));

vi.mock("../services/auth/remote", async () => {
  const actual = await vi.importActual<typeof import("../services/auth/remote")>(
    "../services/auth/remote",
  );
  return {
    ...actual,
    refreshRemoteAgentSession: mocks.refreshRemoteAgentSession,
    createRemoteWechatLoginSession: vi.fn(),
    exchangeRemoteWechatLoginSession: vi.fn(),
    getRemoteWechatLoginSessionStatus: vi.fn(),
    logoutRemoteAgentSession: vi.fn(),
    requestRemoteEmailLoginChallenge: vi.fn(),
    verifyRemoteEmailLoginChallenge: vi.fn(),
  };
});

import { __internal__ } from "./agent-auth";
import { RemoteAuthError } from "../services/auth/remote";

describe("agent-auth resolveState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("treats timezone-less timestamps as UTC", () => {
    const timestamp = __internal__.parseTimestamp("2026-05-14T10:00:00");
    expect(new Date(timestamp).toISOString()).toBe("2026-05-14T10:00:00.000Z");
  });

  it("keeps an unexpired local session when access token has no timezone suffix", async () => {
    const session = {
      account: {
        account_id: "1",
        username: "agent_1",
        email: "demo@example.com",
        status: "active" as const,
        created_at: "2026-05-13T10:00:00Z",
      },
      access_token: "access-1",
      access_token_expires_at: "2999-05-14T10:00:00",
      refresh_token: "refresh-1",
      refresh_token_expires_at: "2999-06-14T10:00:00",
    };
    mocks.readAgentAuthSession.mockResolvedValue(session);
    mocks.toAuthenticatedState.mockReturnValue({
      authenticated: true,
      account: session.account,
      access_token_expires_at: session.access_token_expires_at,
      refresh_token_expires_at: session.refresh_token_expires_at,
    });

    const result = await __internal__.resolveState();

    expect(mocks.refreshRemoteAgentSession).not.toHaveBeenCalled();
    expect(result).toEqual({
      schema_version: "1",
      ok: true,
      state: {
        authenticated: true,
        account: session.account,
        access_token_expires_at: session.access_token_expires_at,
        refresh_token_expires_at: session.refresh_token_expires_at,
      },
    });
  });

  it("clears the session when refresh token is explicitly expired upstream", async () => {
    const session = {
      account: {
        account_id: "1",
        username: "agent_1",
        email: "demo@example.com",
        status: "active" as const,
        created_at: "2026-05-13T10:00:00Z",
      },
      access_token: "access-1",
      access_token_expires_at: "2000-05-14T10:00:00Z",
      refresh_token: "refresh-1",
      refresh_token_expires_at: "2999-06-14T10:00:00Z",
    };
    mocks.readAgentAuthSession.mockResolvedValue(session);
    mocks.refreshRemoteAgentSession.mockRejectedValue(
      new RemoteAuthError("expired", {
        errorCode: "AGENT_AUTH.REFRESH_TOKEN_EXPIRED",
        httpStatus: 401,
      }),
    );

    const result = await __internal__.resolveState();

    expect(mocks.clearAgentAuthSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      schema_version: "1",
      ok: true,
      state: { authenticated: false, reason: "expired" },
    });
  });

  it("clears the session when refresh session is explicitly revoked upstream", async () => {
    const session = {
      account: {
        account_id: "1",
        username: "agent_1",
        email: "demo@example.com",
        status: "active" as const,
        created_at: "2026-05-13T10:00:00Z",
      },
      access_token: "access-1",
      access_token_expires_at: "2000-05-14T10:00:00Z",
      refresh_token: "refresh-1",
      refresh_token_expires_at: "2999-06-14T10:00:00Z",
    };
    mocks.readAgentAuthSession.mockResolvedValue(session);
    mocks.refreshRemoteAgentSession.mockRejectedValue(
      new RemoteAuthError("revoked", {
        errorCode: "AGENT_AUTH.SESSION_REVOKED",
        httpStatus: 401,
      }),
    );

    const result = await __internal__.resolveState();

    expect(mocks.clearAgentAuthSession).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      schema_version: "1",
      ok: true,
      state: { authenticated: false, reason: "revoked" },
    });
  });

  it("keeps the session when refresh fails transiently", async () => {
    const session = {
      account: {
        account_id: "1",
        username: "agent_1",
        email: "demo@example.com",
        status: "active" as const,
        created_at: "2026-05-13T10:00:00Z",
      },
      access_token: "access-1",
      access_token_expires_at: "2000-05-14T10:00:00Z",
      refresh_token: "refresh-1",
      refresh_token_expires_at: "2999-06-14T10:00:00Z",
    };
    mocks.readAgentAuthSession.mockResolvedValue(session);
    mocks.toAuthenticatedState.mockReturnValue({
      authenticated: true,
      account: session.account,
      access_token_expires_at: session.access_token_expires_at,
      refresh_token_expires_at: session.refresh_token_expires_at,
    });
    mocks.refreshRemoteAgentSession.mockRejectedValue(
      new RemoteAuthError("temporary upstream failure", {
        errorCode: "SYSTEM.INTERNAL_ERROR",
        httpStatus: 500,
      }),
    );

    const result = await __internal__.resolveState();

    expect(mocks.clearAgentAuthSession).not.toHaveBeenCalled();
    expect(mocks.warn).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      schema_version: "1",
      ok: true,
      state: {
        authenticated: true,
        account: session.account,
        access_token_expires_at: session.access_token_expires_at,
        refresh_token_expires_at: session.refresh_token_expires_at,
      },
    });
  });
});
